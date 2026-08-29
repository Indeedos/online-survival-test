// v0.7.0 — persistent profiles + detailed admin analysis dashboard
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
  function clearAccountView(){
    remoteProgress=null;
    adminMini.classList.add('hidden');
    adminMini.innerHTML='';
  }
  function setAccount(user){
    account=user||null;
    if(!user||user.role!=='admin'){
      adminMini.classList.add('hidden');
      adminMini.innerHTML='';
    }
    current.textContent=user?`${user.display_name} · ${user.role==='admin'?'Admin':'Profil'}`:'Nicht angemeldet';
    dot.className='sync-dot'+(user?' saved':'');
    setStatus(user?(user.role==='admin'?'Adminmodus · Fortschritte einsehbar':'Angemeldet · Fortschritt wird automatisch gespeichert'):'Gastmodus · Fortschritt bleibt nur lokal während dieser Sitzung',user?'ok':'');
  }

  function loginModal(username,displayName){
    const bg=document.createElement('div'); bg.className='login-modal-backdrop';
    bg.innerHTML=`<form class="login-modal"><h3>${esc(displayName||username)}</h3><p>Mit diesem Profil anmelden.</p><label>Benutzername<input name="username" autocomplete="username" value="${esc(username||'')}"></label><label>Passwort / PIN<input name="password" type="password" autocomplete="current-password" autofocus></label><div class="login-error"></div><div class="login-actions"><button type="button" class="secondary" data-cancel>Abbrechen</button><button type="submit">Anmelden</button></div></form>`;
    document.body.appendChild(bg); const form=bg.querySelector('form'),err=bg.querySelector('.login-error');
    bg.querySelector('[data-cancel]').onclick=()=>bg.remove();
    form.onsubmit=async e=>{
      e.preventDefault();err.textContent='';const fd=new FormData(form);
      try{
        const out=await api('/api/login',{method:'POST',body:JSON.stringify({username:fd.get('username'),password:fd.get('password')})});
        clearAccountView();
        setAccount(out.user);
        bg.remove();
        if(out.user.role==='student')await loadProgress();
        if(out.user.role==='admin')await renderAdmin();
      }catch(ex){err.textContent=ex.message}
    };
  }

  async function loadProfiles(){
    try{
      const out=await api('/api/profiles');
      (out.profiles||[]).forEach(p=>{const b=document.createElement('button');b.type='button';b.className='profile-chip';b.textContent=p.display_name;b.onclick=()=>loginModal(p.username,p.display_name);grid.insertBefore(b,grid.lastElementChild)});
      const admin=document.createElement('button');admin.type='button';admin.className='profile-chip';admin.textContent='Admin';admin.onclick=()=>loginModal('admin','Admin');grid.insertBefore(admin,grid.lastElementChild);
      try{const me=await api('/api/me');clearAccountView();setAccount(me.user);if(me.user.role==='student')await loadProgress();if(me.user.role==='admin')await renderAdmin()}catch{}
    }catch{setStatus('Profil-Server noch nicht erreichbar · Gastmodus funktioniert weiterhin','warn')}
  }
  grid.querySelector('[data-guest]').onclick=async()=>{if(account){try{await api('/api/logout',{method:'POST'})}catch{}}clearAccountView();account=null;setAccount(null)};

  function snapshot(){
    if(typeof items==='undefined'||!items?.length)return null;
    const byQuestion={};
    items.forEach((x,idx)=>{if(answers?.[idx]!=null)byQuestion[x.q]=answers[idx]});
    return {schema:2,age,totalQuestions:items.length,currentQuestion:items[i]?.q||null,answersByQuestion:byQuestion,remembered:[...(window.__remembered||[])].map(idx=>items[idx]?.q).filter(Boolean),completed:!document.querySelector('#result')?.classList.contains('hidden'),savedAt:new Date().toISOString()};
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

  function findTask(q){
    try{return (typeof Q!=='undefined'&&Array.isArray(Q))?Q.find(x=>x&&x.q===q)||null:null}catch{return null}
  }
  function answerIndexes(value){
    if(Number.isInteger(value))return [value];
    if(Array.isArray(value)&&value.every(Number.isInteger))return value;
    if(value&&typeof value==='object'){
      if(Number.isInteger(value.selected))return [value.selected];
      if(Array.isArray(value.selected)&&value.selected.every(Number.isInteger))return value.selected;
      if(Number.isInteger(value.choice))return [value.choice];
    }
    return null;
  }
  function readableAnswer(value,task){
    const idx=answerIndexes(value);
    if(idx&&task?.o)return idx.map(n=>task.o[n]??`Antwort ${n+1}`).join(' · ');
    if(typeof value==='string')return value.trim()||'—';
    if(typeof value==='number'||typeof value==='boolean')return String(value);
    if(Array.isArray(value))return value.map(v=>typeof v==='object'?JSON.stringify(v):String(v)).join(' · ');
    if(value&&typeof value==='object'){
      if(Array.isArray(value.path))return value.path.map(v=>typeof v==='object'?(v.label||v.text||JSON.stringify(v)):String(v)).join(' → ');
      if(Array.isArray(value.marks))return `${value.marks.length} Markierung${value.marks.length===1?'':'en'}`;
      if(Number.isFinite(value.x)&&Number.isFinite(value.y))return `Markierung bei ${Math.round(value.x)} / ${Math.round(value.y)}`;
      return JSON.stringify(value);
    }
    return '—';
  }
  function expectedAnswer(task){
    if(!task?.o||!Array.isArray(task.k))return null;
    return task.k.map(n=>task.o[n]??`Antwort ${n+1}`).join(' · ');
  }
  function answerState(value,task){
    const got=answerIndexes(value);
    if(!got||!Array.isArray(task?.k))return {kind:'review',label:'Prüfen'};
    const a=[...got].sort((x,y)=>x-y),b=[...task.k].sort((x,y)=>x-y);
    const correct=a.length===b.length&&a.every((v,n)=>v===b[n]);
    const red=Array.isArray(task.rf)&&a.some(v=>task.rf.includes(v));
    return {kind:red?'danger':(correct?'correct':'wrong'),label:red?'Red Flag':(correct?'Richtig':'Falsch')};
  }
  function analysePayload(payload){
    const remembered=new Set(payload?.remembered||[]);
    const rows=Object.entries(payload?.answersByQuestion||{}).map(([q,value],idx)=>{
      const task=findTask(q),state=answerState(value,task);
      return {q,value,idx,task,state,remembered:remembered.has(q),category:task?.c||'Spezialaufgaben'};
    });
    const totals={correct:0,wrong:0,danger:0,review:0};
    const categories={};
    rows.forEach(r=>{
      totals[r.state.kind]=(totals[r.state.kind]||0)+1;
      if(!categories[r.category])categories[r.category]={answered:0,correct:0,wrong:0,danger:0,review:0};
      categories[r.category].answered++;
      categories[r.category][r.state.kind]=(categories[r.category][r.state.kind]||0)+1;
    });
    return {rows,totals,categories,remembered};
  }
  function renderCategorySummary(analysis){
    const entries=Object.entries(analysis.categories);
    if(!entries.length)return '';
    return `<section class="admin-section"><div class="admin-section-title"><div><span class="admin-kicker">KOMPETENZBEREICHE</span><h4>Kategorie-Auswertung</h4></div><small>Bewertung nur dort automatisch, wo ein eindeutiger Lösungsschlüssel vorliegt.</small></div><div class="admin-category-grid">${entries.map(([name,s])=>{
      const auto=s.correct+s.wrong+s.danger,score=auto?Math.round(s.correct/auto*100):null;
      return `<div class="admin-category-card"><div class="admin-category-top"><b>${esc(name)}</b><strong>${score==null?'–':score+'%'}</strong></div><div class="admin-category-bar"><i style="width:${score||0}%"></i></div><div class="admin-category-counts"><span class="ok">${s.correct} richtig</span><span class="bad">${s.wrong} falsch</span><span class="critical">${s.danger} kritisch</span>${s.review?`<span>${s.review} prüfen</span>`:''}</div></div>`;
    }).join('')}</div></section>`;
  }
  function renderRedFlagSummary(analysis){
    const flags=analysis.rows.filter(r=>r.state.kind==='danger');
    if(!flags.length)return `<section class="admin-redflag-summary clear"><div><span class="admin-kicker">RED FLAGS</span><b>Keine automatisch erkannten kritischen Antworten</b></div><span class="admin-redflag-count">0</span></section>`;
    return `<section class="admin-redflag-summary"><div class="admin-redflag-heading"><div><span class="admin-kicker">RED FLAGS</span><b>${flags.length} kritische Entscheidung${flags.length===1?'':'en'} genauer besprechen</b></div><span class="admin-redflag-count">${flags.length}</span></div><div class="admin-redflag-list">${flags.map(r=>`<div><strong>${esc(r.q)}</strong><span>${esc(readableAnswer(r.value,r.task))}</span></div>`).join('')}</div></section>`;
  }
  function renderOverviewStats(analysis,payload){
    const t=analysis.totals;
    return `<div class="admin-analysis-stats"><div><strong>${t.correct}</strong><span>Richtig</span></div><div><strong>${t.wrong}</strong><span>Falsch</span></div><div class="critical"><strong>${t.danger}</strong><span>Red Flags</span></div><div><strong>${t.review}</strong><span>Manuell prüfen</span></div><div><strong>${payload?.remembered?.length||0}</strong><span>Merkliste</span></div></div>`;
  }
  function renderAnswerRows(payload,analysis){
    const rows=analysis?.rows||[];
    if(!rows.length)return '<div class="admin-empty">Noch keine Antworten gespeichert.</div>';
    return rows.map(r=>{
      const expected=expectedAnswer(r.task);
      return `<article class="admin-answer-row" data-state="${r.state.kind}" data-remembered="${r.remembered?'1':'0'}"><div class="admin-answer-head"><span class="admin-qno">${r.idx+1}</span><div><div class="admin-answer-meta">${esc(r.category)}${r.task?.d?` · ${esc(r.task.d)}`:''}${r.remembered?' · <span class="remembered-label">Merkliste</span>':''}</div><b>${esc(r.q)}</b></div><span class="admin-answer-state ${r.state.kind}">${r.state.label}</span></div><div class="admin-answer-body"><div><small>Geantwortet</small><p>${esc(readableAnswer(r.value,r.task))}</p></div>${expected?`<div><small>Erwartet</small><p>${esc(expected)}</p></div>`:''}</div></article>`;
    }).join('');
  }
  function renderFilters(analysis){
    const t=analysis.totals,remembered=analysis.rows.filter(r=>r.remembered).length;
    return `<div class="admin-answer-toolbar"><div><span class="admin-kicker">ANTWORTEN</span><h4>Detailprüfung</h4></div><div class="admin-filter-group" role="group" aria-label="Antworten filtern"><button type="button" class="admin-filter active" data-filter="all">Alle <b>${analysis.rows.length}</b></button><button type="button" class="admin-filter" data-filter="wrong">Falsch <b>${t.wrong}</b></button><button type="button" class="admin-filter critical" data-filter="danger">Kritisch <b>${t.danger}</b></button><button type="button" class="admin-filter" data-filter="review">Prüfen <b>${t.review}</b></button><button type="button" class="admin-filter" data-filter="remembered">Merkliste <b>${remembered}</b></button></div></div><div class="admin-filter-empty hidden">Für diesen Filter gibt es aktuell keine Antworten.</div>`;
  }
  function bindProfileFilters(root){
    root.querySelectorAll('.admin-profile-detail').forEach(detail=>{
      detail.querySelectorAll('.admin-filter').forEach(btn=>btn.addEventListener('click',()=>{
        const filter=btn.dataset.filter;
        detail.querySelectorAll('.admin-filter').forEach(b=>b.classList.toggle('active',b===btn));
        let visible=0;
        detail.querySelectorAll('.admin-answer-row').forEach(row=>{
          const show=filter==='all'||(filter==='remembered'?row.dataset.remembered==='1':row.dataset.state===filter);
          row.classList.toggle('hidden',!show);if(show)visible++;
        });
        detail.querySelector('.admin-filter-empty')?.classList.toggle('hidden',visible!==0);
      }));
    });
  }
  async function renderAdmin(){
    if(!account||account.role!=='admin')return;
    try{
      const out=await api('/api/admin/users');
      if(!account||account.role!=='admin')return;
      const users=out.users||[];
      const started=users.filter(u=>u.payload).length,finished=users.filter(u=>u.payload?.completed).length,allFlags=users.reduce((n,u)=>n+analysePayload(u.payload).totals.danger,0);
      adminMini.classList.remove('hidden');
      adminMini.innerHTML=`<div class="admin-dashboard-head"><div><span class="admin-kicker">ADMIN-DASHBOARD</span><h3>Lernfortschritt & Auswertung</h3><p>Profile öffnen, um Kompetenzbereiche, kritische Entscheidungen und einzelne Antworten zu prüfen.</p></div><button type="button" class="secondary admin-refresh">Aktualisieren</button></div><div class="admin-global-stats"><div><strong>${started}/${users.length}</strong><span>gestartet</span></div><div><strong>${finished}</strong><span>abgeschlossen</span></div><div class="critical"><strong>${allFlags}</strong><span>Red Flags gesamt</span></div></div><div class="admin-profile-list">${users.map(u=>{
        const p=u.payload||null,analysis=analysePayload(p),answered=analysis.rows.length,total=p?.totalQuestions||90,percent=total?Math.min(100,Math.round(answered/total*100)):0,remembered=p?.remembered?.length||0;
        return `<details class="admin-profile-card"><summary><div class="admin-profile-main"><div class="admin-profile-name"><b>${esc(u.display_name)}</b><span>${p?`${p.age||'–'} Jahre`:'Noch nicht gestartet'}</span></div><div class="admin-progress-line"><i style="width:${percent}%"></i></div><div class="admin-profile-stats"><strong>${answered} / ${total}</strong><span>${percent}%</span>${p?.completed?'<em class="done">Abgeschlossen</em>':'<em>In Arbeit</em>'}${analysis.totals.danger?`<em class="danger">${analysis.totals.danger} Red Flag${analysis.totals.danger===1?'':'s'}</em>`:''}</div><small>${u.updated_at?'Zuletzt gespeichert: '+new Date(u.updated_at).toLocaleString('de-DE'):'Noch kein gespeicherter Fortschritt'}${remembered?` · ${remembered} auf Merkliste`:''}</small></div><span class="admin-chevron">⌄</span></summary><div class="admin-profile-detail">${p?.currentQuestion?`<div class="admin-current-q"><small>Aktuelle Position</small><b>${esc(p.currentQuestion)}</b></div>`:''}${p?renderOverviewStats(analysis,p):''}${p?renderCategorySummary(analysis):''}${p?renderRedFlagSummary(analysis):''}<section class="admin-section admin-answer-section">${renderFilters(analysis)}<div class="admin-answer-list">${renderAnswerRows(p,analysis)}</div></section></div></details>`;
      }).join('')}</div>`;
      adminMini.querySelector('.admin-refresh')?.addEventListener('click',renderAdmin);
      bindProfileFilters(adminMini);
    }catch(ex){adminMini.classList.remove('hidden');adminMini.innerHTML=`<div class="admin-empty">Admin-Daten konnten nicht geladen werden: ${esc(ex.message||'Unbekannter Fehler')}</div>`}
  }

  document.addEventListener('click',e=>{if(e.target.closest('.mode[data-age]'))setTimeout(restoreAfterStart,0);if(e.target.closest('#nextBtn,#prevBtn,[data-branch-choice],.branch-continue'))setTimeout(queueSave,30)});
  document.addEventListener('change',e=>{if(e.target.matches('input,select,textarea'))queueSave()});
  document.addEventListener('input',e=>{if(e.target.matches('textarea,input[type="range"]'))queueSave()});
  const oldSave=window.save;if(typeof oldSave==='function')window.save=function(){const r=oldSave.apply(this,arguments);queueSave();return r};
  const oldFinish=window.finish;if(typeof oldFinish==='function')window.finish=function(){const r=oldFinish.apply(this,arguments);queueSave();return r};
  loadProfiles();
})();
