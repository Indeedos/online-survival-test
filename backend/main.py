import json, os, secrets, sqlite3, hashlib, uuid
from datetime import datetime, timedelta, timezone
from typing import Any

from argon2 import PasswordHasher
from fastapi import FastAPI, HTTPException, Request, Response, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

DB_PATH=os.getenv('DB_PATH','/data/survival.db')
FRONTEND_ORIGIN=os.getenv('FRONTEND_ORIGIN','https://survival.indeedos.cc')
COOKIE_NAME='ost_session'
SESSION_DAYS=int(os.getenv('SESSION_DAYS','30'))
ph=PasswordHasher()
app=FastAPI(title='Online Survival Test API', docs_url=None, redoc_url=None)
app.add_middleware(CORSMiddleware,allow_origins=[FRONTEND_ORIGIN],allow_credentials=True,allow_methods=['GET','POST','PUT','DELETE','OPTIONS'],allow_headers=['Content-Type'])

def db():
    con=sqlite3.connect(DB_PATH)
    con.row_factory=sqlite3.Row
    return con

def now(): return datetime.now(timezone.utc)
def iso(dt=None): return (dt or now()).isoformat()
def token_hash(t): return hashlib.sha256(t.encode()).hexdigest()

def init_db():
    os.makedirs(os.path.dirname(DB_PATH) or '.',exist_ok=True)
    with db() as con:
        con.executescript('''
        CREATE TABLE IF NOT EXISTS users(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          display_name TEXT NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL CHECK(role IN ('student','admin')),
          created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS sessions(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          token_hash TEXT UNIQUE NOT NULL,
          expires_at TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS progress(
          user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
          payload TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS attempts(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          run_id TEXT NOT NULL,
          payload TEXT NOT NULL,
          started_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          completed_at TEXT,
          UNIQUE(user_id,run_id)
        );
        CREATE INDEX IF NOT EXISTS idx_attempts_user_updated ON attempts(user_id,updated_at DESC);
        ''')
        con.commit()

def seed_user(username, display_name, password, role):
    if not password: return
    with db() as con:
        if con.execute('SELECT 1 FROM users WHERE username=?',(username,)).fetchone(): return
        con.execute('INSERT INTO users(username,display_name,password_hash,role,created_at) VALUES(?,?,?,?,?)',(username,display_name,ph.hash(password),role,iso()))
        con.commit()

def seed_from_env():
    seed_user(os.getenv('STUDENT1_USER','schwester1'),os.getenv('STUDENT1_NAME','Schwester 1'),os.getenv('STUDENT1_PASSWORD',''),'student')
    seed_user(os.getenv('STUDENT2_USER','schwester2'),os.getenv('STUDENT2_NAME','Schwester 2'),os.getenv('STUDENT2_PASSWORD',''),'student')
    seed_user(os.getenv('ADMIN_USER','admin'),os.getenv('ADMIN_NAME','Admin'),os.getenv('ADMIN_PASSWORD',''),'admin')

@app.on_event('startup')
def startup():
    init_db(); seed_from_env()

class LoginIn(BaseModel):
    username:str=Field(min_length=1,max_length=64)
    password:str=Field(min_length=1,max_length=256)
class ProgressIn(BaseModel):
    payload:dict[str,Any]

def current_user(request:Request):
    token=request.cookies.get(COOKIE_NAME)
    if not token: raise HTTPException(401,'Nicht angemeldet')
    with db() as con:
        row=con.execute('''SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>?''',(token_hash(token),iso())).fetchone()
    if not row: raise HTTPException(401,'Sitzung abgelaufen')
    return dict(row)

def admin_user(user=Depends(current_user)):
    if user['role']!='admin': raise HTTPException(403,'Admin erforderlich')
    return user

def answer_count(payload):
    return len((payload or {}).get('answersByQuestion') or {})

def is_new_run(previous, incoming):
    if not previous: return True
    if previous.get('age') != incoming.get('age'): return True
    if previous.get('completed') and not incoming.get('completed'): return True
    prev_count=answer_count(previous); new_count=answer_count(incoming)
    if prev_count >= 3 and new_count < prev_count: return True
    return False

def prune_attempts(con,user_id):
    con.execute('''DELETE FROM attempts WHERE user_id=? AND id NOT IN (
      SELECT id FROM attempts WHERE user_id=? ORDER BY updated_at DESC,id DESC LIMIT 3
    )''',(user_id,user_id))

@app.get('/health')
def health(): return {'ok':True}

@app.get('/api/profiles')
def profiles():
    with db() as con:
        rows=con.execute("SELECT username,display_name FROM users WHERE role='student' ORDER BY id").fetchall()
    return {'profiles':[dict(r) for r in rows]}

@app.post('/api/login')
def login(data:LoginIn,response:Response):
    with db() as con:
        user=con.execute('SELECT * FROM users WHERE username=?',(data.username,)).fetchone()
        if not user: raise HTTPException(401,'Login fehlgeschlagen')
        try: ph.verify(user['password_hash'],data.password)
        except Exception: raise HTTPException(401,'Login fehlgeschlagen')
        raw=secrets.token_urlsafe(32); expires=now()+timedelta(days=SESSION_DAYS)
        con.execute('DELETE FROM sessions WHERE user_id=? OR expires_at<=?',(user['id'],iso()))
        con.execute('INSERT INTO sessions(user_id,token_hash,expires_at,created_at) VALUES(?,?,?,?)',(user['id'],token_hash(raw),iso(expires),iso()))
        con.commit()
    response.set_cookie(COOKIE_NAME,raw,httponly=True,secure=True,samesite='lax',max_age=SESSION_DAYS*86400,path='/')
    return {'user':{'username':user['username'],'display_name':user['display_name'],'role':user['role']}}

@app.post('/api/logout')
def logout(request:Request,response:Response):
    token=request.cookies.get(COOKIE_NAME)
    if token:
        with db() as con:
            con.execute('DELETE FROM sessions WHERE token_hash=?',(token_hash(token),)); con.commit()
    response.delete_cookie(COOKIE_NAME,path='/')
    return {'ok':True}

@app.get('/api/me')
def me(user=Depends(current_user)):
    return {'user':{'username':user['username'],'display_name':user['display_name'],'role':user['role']}}

@app.get('/api/progress')
def get_progress(user=Depends(current_user)):
    with db() as con:
        row=con.execute('SELECT payload,updated_at FROM progress WHERE user_id=?',(user['id'],)).fetchone()
    return {'payload':json.loads(row['payload']) if row else None,'updated_at':row['updated_at'] if row else None}

@app.put('/api/progress')
def put_progress(data:ProgressIn,user=Depends(current_user)):
    if user['role']!='student': raise HTTPException(403,'Nur Lernprofile speichern Testfortschritt')
    incoming=dict(data.payload)
    ts=iso()
    with db() as con:
        old=con.execute('SELECT payload FROM progress WHERE user_id=?',(user['id'],)).fetchone()
        previous=json.loads(old['payload']) if old else None
        run_id=str(uuid.uuid4()) if is_new_run(previous,incoming) else (previous.get('_runId') or str(uuid.uuid4()))
        incoming['_runId']=run_id
        raw=json.dumps(incoming,ensure_ascii=False,separators=(',',':'))
        if len(raw.encode())>2_000_000: raise HTTPException(413,'Fortschritt zu groß')
        started_at=(previous or {}).get('_runStartedAt') if not is_new_run(previous,incoming) else None
        started_at=started_at or ts
        incoming['_runStartedAt']=started_at
        raw=json.dumps(incoming,ensure_ascii=False,separators=(',',':'))
        completed_at=ts if incoming.get('completed') else None
        con.execute('INSERT INTO progress(user_id,payload,updated_at) VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at',(user['id'],raw,ts))
        con.execute('''INSERT INTO attempts(user_id,run_id,payload,started_at,updated_at,completed_at)
          VALUES(?,?,?,?,?,?)
          ON CONFLICT(user_id,run_id) DO UPDATE SET
            payload=excluded.payload,
            updated_at=excluded.updated_at,
            completed_at=CASE WHEN excluded.completed_at IS NOT NULL THEN excluded.completed_at ELSE attempts.completed_at END''',
          (user['id'],run_id,raw,started_at,ts,completed_at))
        prune_attempts(con,user['id'])
        con.commit()
    return {'ok':True,'updated_at':ts,'run_id':run_id}

@app.delete('/api/progress')
def clear_progress(user=Depends(current_user)):
    if user['role']!='student': raise HTTPException(403,'Nur Lernprofile')
    with db() as con:
        con.execute('DELETE FROM progress WHERE user_id=?',(user['id'],)); con.commit()
    return {'ok':True}

@app.get('/api/admin/users')
def admin_users(user=Depends(admin_user)):
    with db() as con:
        rows=con.execute("""SELECT u.id,u.username,u.display_name,p.updated_at,p.payload FROM users u LEFT JOIN progress p ON p.user_id=u.id WHERE u.role='student' ORDER BY u.id""").fetchall()
        out=[]
        for r in rows:
            payload=json.loads(r['payload']) if r['payload'] else None
            attempts_rows=con.execute('''SELECT id,run_id,payload,started_at,updated_at,completed_at FROM attempts WHERE user_id=? ORDER BY updated_at DESC,id DESC LIMIT 3''',(r['id'],)).fetchall()
            attempts=[]
            for a in attempts_rows:
                attempts.append({'id':a['id'],'run_id':a['run_id'],'started_at':a['started_at'],'updated_at':a['updated_at'],'completed_at':a['completed_at'],'payload':json.loads(a['payload'])})
            out.append({'id':r['id'],'username':r['username'],'display_name':r['display_name'],'updated_at':r['updated_at'],'payload':payload,'attempts':attempts})
    return {'users':out}
