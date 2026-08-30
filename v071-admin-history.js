// v0.8.0 — admin manual-review guidance + archived run history without duplicate current run
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
  function isManualTask(task){return !!task&&(task.t==='free'||task.manual)}
  function taskPrompt(task){return isManualTask(task)&&typeof task.s==='string'?task.s.trim():''}
  function addPromptToCurrentRow(row,task){
    const text=taskPrompt(task);
    if(!text||row.querySelector('.admin-question-prompt'))return;
    const head=row.querySelector('.admin-answer-head');
    if(!head)return;
    const box=document.createElement('div');
    box.className='admin-question-prompt';
    box.innerHTML=`<small>Aufgabenstellung</small><p>${escHtml(text)}</p>`;
    head.after(box);
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
  function addGuidanceToCurrentRows(root){
    root.querySelectorAll('.admin-answer-row').forEach(row=>{
      if(row.closest('.admin-run-review'))return;
      const q=row.querySelector('.admin-answer-head b')?.textContent?.trim();
      if(!q)return;
      const task=findTask(q);
      addPromptToCurrentRow(row,task);
      if(row.querySelector('.admin-manual-guide'))return;
      const stateEl=row.querySelector('.admin-answer-state.review');
      if(!stateEl)return;
      const body=row.querySelector('.admin-answer-body');
      if(!body)return;
      const guide=manualGuide(task);
      const box=document.createElement('div');
      box.className='admin-manual-guide';
      box.innerHTML=`<small>${escHtml(guide.title)}</small><p>${escHtml(guide.text)}</p>`;
      body.appendChild(box);
    });
  }
  function fmtDate(v){try{return new Date(v).toLocaleString('de-DE')}catch{return v||'–'}}
  function runLabel(run,index){
    const p=run.payload||{}, done=p.completed?'Abgeschlossen':'In Arbeit';
    return `Durchlauf ${index+1} · ${done} · ${fmtDate(run.updated_at)}`;
  }
  function sameRun(a,b){
    if(!a||!b)return false;
    if(a._runId&&b._runId)return a._runId===b._runId;
    return a.savedAt&&b.savedAt&&a.savedAt===b.savedAt;
  }
  function attachHistory(card,user){
    const detail=card.querySelector('.admin-profile-detail');
    if(!detail||detail.querySelector('.admin-run-history'))return;
    // The normal Detailprüfung below already renders the active/current payload.
    // Only show genuinely older attempts here, otherwise every question appears twice.
    const current=user?.payload||null;
    const runs=(user?.attempts||[]).filter(r=>!sameRun(r?.payload,current)).slice(0,3);
    if(!runs.length)return;
    const wrap=document.createElement('section');
    wrap.className='admin-run-history admin-run-history-archive';
    wrap.innerHTML=`<div class="admin-run-history-head"><div><span class="admin-kicker">FRÜHERE DURCHLÄUFE</span><h4>Archivierte Sitzungen</h4></div><label>Nachprüfen <select class="admin-run-select">${runs.map((r,i)=>`<option value="${i}">${escHtml(runLabel(r,i))}</option>`).join('')}</select></label></div><div class="admin-run-review"></div>`;
    const sel=wrap.querySelector('.admin-run-select'),review=wrap.querySelector('.admin-run-review');
    const draw=()=>{
      const run=runs[+sel.value];
      const p=run?.payload||{};
      const count=Object.keys(p.answersByQuestion||{}).length;
      review.innerHTML=`<div class="admin-history-summary"><b>${count} Antworten</b><span>${p.age?p.age+' Jahre · ':''}${p.completed?'Abgeschlossen':'Nicht abgeschlossen'} · frühere Sitzung</span></div><p class="admin-archive-note">Für die vollständige Einzelprüfung früherer Sitzungen wird die archivierte Detailansicht verwendet; der aktuelle Durchlauf steht unten in der normalen Detailprüfung.</p>`;
    };
    sel.addEventListener('change',draw);draw();
    const answerSection=detail.querySelector('.admin-answer-section');
    if(answerSection)detail.insertBefore(wrap,answerSection);else detail.appendChild(wrap);
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
