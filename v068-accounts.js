// v0.6.8 — optional persistent profiles backed by api.survival.indeedos.cc
(function(){
  const API='https://api.survival.indeedos.cc';
  let account=null, remoteProgress=null, saveTimer=null, restoring=false;
  const start=document.querySelector('#start');
  if(!start)return;

  const panel=document.createElement('div');
  panel.className='account-panel';
  panel.innerHTML=`<div class="account-panel-head"><div><strong>Profil & Fortschritt</strong><div class="account-status" id="accountStatus">Gastmodus · Fortschritt bleibt nur lokal während dieser Sitzung</div></div><div class="account-current"><span class="sync-dot" id="syncDot"></span><span id="accountCurrent">Nicht angemeldet</span></div></div><div class="profile-grid" id="profileGrid"><button type="button" class="profile-chip guest" data-guest>Als Gast fortfahren</button></div><div id="adminMini" class="admin-mini hidden"></div>`;
  const roleSwitch=start.querySelector('.role-switch');
  start.insertBefore(panel,roleSwitch);
  const status=panel.querySelector('#accountStatus'), current=panel.querySelector('#accountCurrent'), dot=panel.querySelector('#syncDot'), grid=panel.querySelector('#profileGrid'), adminMini=panel.querySelector('#adminMini');

  async function api(path,opts={}){
    const r=await fetch(API+path,{...opts,credentials:'include',headers:{'Content-Type':'application/json',...(opts.headers||{})}});
    if(!r.ok){let msg='Serverfehler';try{msg=(await r.json()).detail||msg}catch{};throw new Error(msg)}
    return r.status===204?null:r.json();
  }
  function setStatus(text,kind=''){status.textContent=text;status.className='account-status '+kind}
  function setAccount(user){account=user||null;current.textContent=user?`${user.display_name} · ${user.role==='admin'?'Admin':'Profil'}`:'Nicht angemeldet';dot.className='sync-dot'+(user?' saved':'');setStatus(user?(user.role==='admin'?'Adminmodus · Fortschritte einsehbar':'Angemeldet · Fortschritt wird automatisch gespeichert'):'Gastmodus · Fortschritt bleibt nur lokal während dieser Sitzung',user?'ok':'')}

  function loginModal(username,displayName){
    const bg=document.createElement('div'); bg.className='login-modal-backdrop';
    bg.innerHTML=`<form class="login-modal"><h3>${esc(displayName||username)}</h3><p>Mit diesem Profil anmelden.</p><label>Benutzername<input name="username" autocomplete="username" value="${esc(username||'')}"></label><label>Passwort / PIN<input name="password" type="password" autocomplete="current-password" autofocus></label><div class="login-error"></div><div class="login-actions"><button type="button" class="secondary" data-cancel>Abbrechen</button><button type="submit">Anmelden</button></div></form>`;
    document.body.appendChild(bg); const form=bg.querySelector('form'),err=bg.querySelector('.login-error');
    bg.querySelector('[data-cancel]').onclick=()=>bg.remove();
    form.onsubmit=async e=>{e.preventDefault();err.textContent='';const fd=new FormData(form);try{const out=await api('/api/login',{method:'POST',body:JSON.stringify({username:fd.get('username'),password:fd.get('password')})});setAccount(out.user);bg.remove();await loadProgress();if(out.user.role==='admin')await renderAdmin()}catch(ex){err.textContent=ex.message}};
  }

  async function loadProfiles(){
    try{
      const out=await api('/api/profiles');
      (out.profiles||[]).forEach(p=>{const b=document.createElement('button');b.type='button';b.className='profile-chip';b.textContent=p.display_name;b.onclick=()=>loginModal(p.username,p.display_name);grid.insertBefore(b,grid.lastElementChild)});
      const admin=document.createElement('button');admin.type='button';admin.className='profile-chip';admin.textContent='Admin';admin.onclick=()=>loginModal('admin','Admin');grid.insertBefore(admin,grid.lastElementChild);
      try{const me=await api('/api/me');setAccount(me.user);await loadProgress();if(me.user.role==='admin')await renderAdmin()}catch{}
    }catch{setStatus('Profil-Server noch nicht erreichbar · Gastmodus funktioniert weiterhin','warn')}
  }
  grid.querySelector('[data-guest]').onclick=async()=>{if(account){try{await api('/api/logout',{method:'POST'})}catch{}}account=null;remoteProgress=null;setAccount(null);adminMini.classList.add('hidden')};

  function snapshot(){
    if(typeof items==='undefined'||!items?.length)return null;
    const byQuestion={};
    items.forEach((x,idx)=>{if(answers?.[idx]!=null)byQuestion[x.q]=answers[idx]});
    return {schema:1,age,currentQuestion:items[i]?.q||null,answersByQuestion:byQuestion,remembered:[...(window.__remembered||[])].map(idx=>items[idx]?.q).filter(Boolean),completed:!document.querySelector('#result')?.classList.contains('hidden'),savedAt:new Date().toISOString()};
  }
  async function pushProgress(){
    if(restoring||!account||account.role!=='student')return;
    const payload=snapshot();if(!payload)return;
    dot.className='sync-dot saving';
    try{await api('/api/progress',{method:'PUT',body:JSON.stringify({payload})});dot.className='sync-dot saved';setStatus('Angemeldet · Fortschritt automatisch gespeichert','ok')}catch{dot.className='sync-dot';setStatus('Speichern fehlgeschlagen · Verbindung prüfen','warn')}
  }
  function queueSave(){clearTimeout(saveTimer);saveTimer=setTimeout(pushProgress,350)}
  async function loadProgress(){
    if(!account||account.role!=='student')return;
    try{const out=await api('/api/progress');remoteProgress=out.payload||null;if(remoteProgress)setStatus('Gespeicherter Fortschritt gefunden · beim Start wird er fortgesetzt','ok')}catch{}
  }
  function restoreAfterStart(){
    if(!remoteProgress||remoteProgress.age!==age||typeof items==='undefined'||!items.length)return;
    restoring=true;
    try{
      const map=remoteProgress.answersByQuestion||{};
      items.forEach((x,idx)=>{if(Object.prototype.hasOwnProperty.call(map,x.q))answers[idx]=map[x.q]});
      if(window.__remembered){window.__remembered.clear();(remoteProgress.remembered||[]).forEach(q=>{const idx=items.findIndex(x=>x.q===q);if(idx>=0)window.__remembered.add(idx)})}
      const target=items.findIndex(x=>x.q===remoteProgress.currentQuestion);if(target>=0)i=target;
      if(typeof render==='function')render();
      const qz=document.querySelector('.question-zone');if(qz&&!qz.querySelector('.resume-banner')){const b=document.createElement('div');b.className='resume-banner';b.textContent=`Fortschritt von ${account.display_name} wiederhergestellt.`;qz.insertBefore(b,qz.firstChild);setTimeout(()=>b.remove(),4500)}
    }finally{restoring=false}
  }
  async function renderAdmin(){
    if(!account||account.role!=='admin')return;
    try{const out=await api('/api/admin/users');adminMini.classList.remove('hidden');adminMini.innerHTML='<strong>Fortschritte</strong>'+out.users.map(u=>{const p=u.payload;const answered=p?Object.keys(p.answersByQuestion||{}).length:0;return `<div class="admin-user-row"><b>${esc(u.display_name)}</b><span>${answered} beantwortet</span><small>${u.updated_at?'Zuletzt gespeichert: '+new Date(u.updated_at).toLocaleString('de-DE'):'Noch kein gespeicherter Fortschritt'}</small></div>`}).join('')}catch{}
  }

  document.addEventListener('click',e=>{if(e.target.closest('.mode[data-age]'))setTimeout(restoreAfterStart,0);if(e.target.closest('#nextBtn,#prevBtn,[data-branch-choice],.branch-continue'))setTimeout(queueSave,30)});
  document.addEventListener('change',e=>{if(e.target.matches('input,select,textarea'))queueSave()});
  document.addEventListener('input',e=>{if(e.target.matches('textarea,input[type="range"]'))queueSave()});
  const oldSave=window.save;if(typeof oldSave==='function')window.save=function(){const r=oldSave.apply(this,arguments);queueSave();return r};
  const oldFinish=window.finish;if(typeof oldFinish==='function')window.finish=function(){const r=oldFinish.apply(this,arguments);queueSave();return r};
  loadProfiles();
})();
