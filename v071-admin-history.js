// v0.7.1 — admin manual-review guidance + last-three run history
(function(){
  const API='https://api.survival.indeedos.cc';
  const escHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let refreshTimer=null;

  async function api(path){
    const r=await fetch(API+path,{credentials:'include',headers:{'Content-Type':'application/json'}});
    if(!r.ok) throw new Error('Admin-Daten nicht erreichbar');
    return r.json();
  }
  function findTask(q){
    try{return Array.isArray(Q)?Q.find(x=>x&&x.q===q)||null:null}catch{return null}
  }
  function answerIndexes(value){
    if(Number.isInteger(value))return [value];
    if(Array.isArray(value)&&value.every(Number.isInteger))return value;
    if(value&&typeof value==='object'){
      if(Number.isInteger(value.choice))return [value.choice];
      if(Number.isInteger(value.selected))return [value.selected];
      if(Array.isArray(value.selected)&&value.selected.every(Number.isInteger))return value.selected;
      if(Array.isArray(value.choices)&&value.choices.every(Number.isInteger))return value.choices;
    }
    return null;
  }
  function readable(value,task){
    const idx=answerIndexes(value);
    if(idx&&task?.o)return idx.map(n=>task.o[n]??`Antwort ${n+1}`).join(' · ');
    if(typeof value==='string')return value.trim()||'—';
    if(typeof value==='number'||typeof value==='boolean')return String(value);
    if(value&&typeof value==='object'){
      if(typeof value.free==='string')return value.free.trim()||'—';
      if(Array.isArray(value.path))return value.path.map(v=>typeof v==='object'?(v.label||v.text||JSON.stringify(v)):String(v)).join(' → ');
      if(value.branch?.history)return value.branch.history.map(v=>v.label||v.text||v.choice||'Entscheidung').join(' → ');
      if(Array.isArray(value.marks))return `${value.marks.length} Markierung${value.marks.length===1?'':'en'}`;
      return JSON.stringify(value);
    }
    return Array.isArray(value)?value.join(' · '):'—';
  }
  function state(value,task){
    const got=answerIndexes(value);
    if(!got||!Array.isArray(task?.k))return {kind:'review',label:'Prüfen'};
    const a=[...got].sort((x,y)=>x-y),b=[...task.k].sort((x,y)=>x-y);
    const correct=a.length===b.length&&a.every((v,n)=>v===b[n]);
    const red=Array.isArray(task.rf)&&a.some(v=>task.rf.includes(v));
    return {kind:red?'danger':(correct?'correct':'wrong'),label:red?'Red Flag':(correct?'Richtig':'Falsch')};
  }
  function manualGuide(task){
    if(!task)return {title:'Prüfhinweis',text:'Antwort gemeinsam anhand der Aufgabenstellung und Begründung prüfen.'};
    if(task.edu)return {title:'Musterlösung / pädagogischer Fokus',text:task.edu};
    if(task.t==='hotspot'&&Array.isArray(task.v?.regions)){
      const labels=task.v.regions.filter(r=>r.correct).map(r=>r.label).filter(Boolean);
      if(labels.length)return {title:'Erwartete Warnzeichen',text:labels.join(' · ')};
    }
    if(task.t==='branch')return {title:'Erwarteter Prüfweg',text:'Nicht nur den Endpunkt bewerten: Verlauf, gewählte Grenzen, Umgang mit Druck/Privatsphäre und den Zeitpunkt betrachten, an dem Hilfe geholt oder der Kontakt beendet wird.'};
    if(task.t==='free'||task.manual)return {title:'Musterlösung / Prüfkriterien',text:'Auf konkrete Warnzeichen, nachvollziehbare Begründung, sichere nächste Schritte, Beweissicherung bzw. Grenzen und das Einbeziehen einer geeigneten Vertrauensperson achten.'};
    if(task.v?.type==='imagegrid')return {title:'Prüfhinweis',text:'Entscheidungen einzeln prüfen und besonders auf die Begründung achten; visuelle Sicherheit allein ist kein verlässlicher Echtheitsnachweis.'};
    return {title:'Prüfhinweis',text:'Antwort gemeinsam anhand der Aufgabenstellung und vorhandenen Warnzeichen prüfen.'};
  }
  function expected(task){
    if(task?.o&&Array.isArray(task.k))return task.k.map(n=>task.o[n]??`Antwort ${n+1}`).join(' · ');
    return null;
  }
  function fmtDate(v){try{return new Date(v).toLocaleString('de-DE')}catch{return v||'–'}}
  function runLabel(run,index){
    const p=run.payload||{}, done=p.completed?'Abgeschlossen':'In Arbeit';
    return `Durchlauf ${index+1} · ${done} · ${fmtDate(run.updated_at)}`;
  }
  function renderRun(payload){
    const entries=Object.entries(payload?.answersByQuestion||{});
    if(!entries.length)return '<div class="admin-empty">In diesem Durchlauf sind keine Antworten gespeichert.</div>';
    return `<div class="admin-history-summary"><b>${entries.length} Antworten</b><span>${payload?.age?payload.age+' Jahre · ':''}${payload?.completed?'Abgeschlossen':'Nicht abgeschlossen'}</span></div><div class="admin-history-answers">${entries.map(([q,value],idx)=>{
      const task=findTask(q),st=state(value,task),exp=expected(task),guide=manualGuide(task);
      return `<article class="admin-answer-row admin-history-answer" data-state="${st.kind}"><div class="admin-answer-head"><span class="admin-qno">${idx+1}</span><div><div class="admin-answer-meta">${escHtml(task?.c||'Aufgabe')}${task?.d?' · '+escHtml(task.d):''}</div><b>${escHtml(q)}</b></div><span class="admin-answer-state ${st.kind}">${st.label}</span></div><div class="admin-answer-body"><div><small>Geantwortet</small><p>${escHtml(readable(value,task))}</p></div>${exp?`<div><small>Erwartet</small><p>${escHtml(exp)}</p></div>`:`<div class="admin-manual-guide"><small>${escHtml(guide.title)}</small><p>${escHtml(guide.text)}</p></div>`}</div></article>`;
    }).join('')}</div>`;
  }
  function addGuidanceToCurrentRows(root){
    root.querySelectorAll('.admin-answer-row').forEach(row=>{
      if(row.querySelector('.admin-manual-guide'))return;
      const stateEl=row.querySelector('.admin-answer-state.review');
      if(!stateEl)return;
      const q=row.querySelector('.admin-answer-head b')?.textContent?.trim();
      if(!q)return;
      const guide=manualGuide(findTask(q));
      const body=row.querySelector('.admin-answer-body');
      if(!body)return;
      const box=document.createElement('div');
      box.className='admin-manual-guide';
      box.innerHTML=`<small>${escHtml(guide.title)}</small><p>${escHtml(guide.text)}</p>`;
      body.appendChild(box);
    });
  }
  function attachHistory(card,user){
    const detail=card.querySelector('.admin-profile-detail');
    if(!detail||detail.querySelector('.admin-run-history'))return;
    const runs=(user.attempts||[]).slice(0,3);
    const wrap=document.createElement('section');
    wrap.className='admin-run-history';
    if(!runs.length){wrap.innerHTML='<div class="admin-run-history-head"><div><span class="admin-kicker">DURCHLÄUFE</span><h4>Verlauf</h4></div><small>Noch kein archivierter Durchlauf.</small></div>';detail.prepend(wrap);return}
    wrap.innerHTML=`<div class="admin-run-history-head"><div><span class="admin-kicker">DURCHLÄUFE</span><h4>Letzte 3 Sitzungen</h4></div><label>Nachprüfen <select class="admin-run-select">${runs.map((r,i)=>`<option value="${i}">${escHtml(runLabel(r,i))}</option>`).join('')}</select></label></div><div class="admin-run-review"></div>`;
    const sel=wrap.querySelector('.admin-run-select'),review=wrap.querySelector('.admin-run-review');
    const draw=()=>{review.innerHTML=renderRun(runs[+sel.value]?.payload||null)};
    sel.addEventListener('change',draw);draw();detail.prepend(wrap);
  }
  async function enhance(){
    const admin=document.querySelector('#adminMini');
    if(!admin||admin.classList.contains('hidden'))return;
    addGuidanceToCurrentRows(admin);
    let out;try{out=await api('/api/admin/users')}catch{return}
    const users=out.users||[];
    admin.querySelectorAll('.admin-profile-card').forEach(card=>{
      const name=card.querySelector('.admin-profile-name b')?.textContent?.trim();
      const user=users.find(u=>u.display_name===name);
      if(user)attachHistory(card,user);
    });
  }
  const observer=new MutationObserver(()=>{clearTimeout(refreshTimer);refreshTimer=setTimeout(enhance,80)});
  const panel=document.querySelector('#adminMini');
  if(panel)observer.observe(panel,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  document.addEventListener('click',e=>{if(e.target.closest('.admin-refresh,.profile-chip'))setTimeout(enhance,350)});
  setTimeout(enhance,600);
})();
