// v0.8.0 — integrity-aware admin evaluation and unambiguous run archive
(function(){
  const API='https://api.survival.indeedos.cc';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let timer=null;

  async function api(path){
    const r=await fetch(API+path,{credentials:'include',headers:{'Content-Type':'application/json'}});
    if(!r.ok)throw new Error('Admin-Daten nicht erreichbar');
    return r.json();
  }
  function taskFor(q){try{return Array.isArray(Q)?Q.find(x=>x?.q===q)||null:null}catch{return null}}
  function choiceTask(task){return !!task&&Array.isArray(task.o)&&task.o.length>0&&task.t!=='free'&&task.t!=='hotspot'&&task.t!=='imagegrid'&&task.t!=='branch'}
  function choiceState(task,value){
    if(!choiceTask(task))return null;
    const meta=value?._integrity;
    if(meta?.v!==1||!Array.isArray(meta.selectedIds)||!Array.isArray(meta.expectedIds))return {kind:'review',label:'Nicht verifizierbar',legacy:true};
    const a=[...meta.selectedIds].sort(),b=[...meta.expectedIds].sort();
    const correct=a.length===b.length&&a.every((v,n)=>v===b[n]);
    const red=(meta.redFlagIds||[]).some(id=>a.includes(id));
    return {kind:red?'danger':correct?'correct':'wrong',label:red?'Red Flag':correct?'Richtig':'Falsch',legacy:false};
  }
  function stateFor(task,value){
    const choice=choiceState(task,value);if(choice)return choice;
    if(task?.t==='imagegrid'&&value?.imagegrid&&Array.isArray(task.v?.people)){
      const people=task.v.people,answered=people.filter(p=>value.imagegrid[p.id]).length;
      if(!answered)return {kind:'review',label:'Prüfen',legacy:false};
      const correct=people.filter(p=>value.imagegrid[p.id]===p.kind).length;
      return {kind:correct===people.length?'correct':'wrong',label:correct===people.length?'Richtig':'Falsch',legacy:false};
    }
    return {kind:'review',label:'Prüfen',legacy:false};
  }
  function selectedText(task,value){
    const meta=value?._integrity;
    if(choiceTask(task)){
      if(meta?.v===1&&Array.isArray(meta.selectedTexts))return meta.selectedTexts.join(' · ')||'—';
      const raw=Array.isArray(value?.choices)?`Indizes ${value.choices.join(', ')}`:Number.isInteger(value?.choice)?`Index ${value.choice}`:'numerische Auswahl';
      return `Legacy-Antwort (${raw}) – ursprüngliche zufällige Antwortreihenfolge wurde nicht gespeichert.`;
    }
    if(typeof value?.free==='string')return value.free.trim()||'—';
    if(Array.isArray(value?.marks))return `${value.marks.length} Markierung${value.marks.length===1?'':'en'}`;
    if(value?.branch?.history)return value.branch.history.map(v=>v.choice||v.label||v.text||'Entscheidung').join(' → ');
    if(value?.imagegrid)return 'Bildklassifikationen gespeichert';
    return value==null?'—':typeof value==='string'?value:JSON.stringify(value);
  }
  function expectedText(task,value){
    if(!choiceTask(task))return null;
    const meta=value?._integrity;
    return meta?.v===1&&Array.isArray(meta.expectedTexts)?meta.expectedTexts.join(' · '):'Für diesen Legacy-Datensatz nicht zuverlässig rekonstruierbar.';
  }
  function analyse(payload){
    const rows=Object.entries(payload?.answersByQuestion||{}).map(([q,value],idx)=>{
      const task=taskFor(q),state=stateFor(task,value);
      return {q,value,idx,task,state,category:task?.c||'Spezialaufgaben'};
    });
    const totals={correct:0,wrong:0,danger:0,review:0};
    const categories={};
    rows.forEach(r=>{
      totals[r.state.kind]=(totals[r.state.kind]||0)+1;
      const c=categories[r.category]||(categories[r.category]={correct:0,wrong:0,danger:0,review:0});
      c[r.state.kind]=(c[r.state.kind]||0)+1;
    });
    return {rows,totals,categories};
  }
  function setState(row,state){
    row.dataset.state=state.kind;
    const badge=row.querySelector('.admin-answer-state');
    if(badge){badge.className=`admin-answer-state ${state.kind}`;badge.textContent=state.label}
  }
  function patchRow(row,payload){
    const q=row.querySelector('.admin-answer-head b')?.textContent?.trim();
    if(!q)return;
    const value=payload?.answersByQuestion?.[q],task=taskFor(q);
    if(value==null||!choiceTask(task))return;
    const state=choiceState(task,value);setState(row,state);
    const boxes=row.querySelectorAll('.admin-answer-body > div');
    const answered=boxes[0]?.querySelector('p');if(answered)answered.textContent=selectedText(task,value);
    let expected=boxes[1];
    if(!expected){expected=document.createElement('div');expected.innerHTML='<small>Erwartet</small><p></p>';row.querySelector('.admin-answer-body')?.appendChild(expected)}
    const p=expected?.querySelector('p');if(p)p.textContent=expectedText(task,value)||'—';
    row.querySelector('.admin-integrity-warning')?.remove();
    if(state.legacy){
      const note=document.createElement('div');note.className='admin-integrity-warning';
      note.textContent='Dieser Datensatz stammt aus einer älteren Version. Gespeichert wurde nur der Zahlenindex; wegen der damals zufälligen Antwortreihenfolge wäre eine Zuordnung zu einem Antworttext spekulativ. Deshalb wird diese Antwort nicht als richtig, falsch oder Red Flag gewertet.';
      row.appendChild(note);
    }
  }
  function patchCategories(detail,analysis){
    detail.querySelectorAll('.admin-category-card').forEach(card=>{
      const name=card.querySelector('.admin-category-top b')?.textContent?.trim();
      const s=analysis.categories[name];if(!s)return;
      const auto=s.correct+s.wrong+s.danger,score=auto?Math.round(s.correct/auto*100):null;
      const scoreEl=card.querySelector('.admin-category-top strong');if(scoreEl)scoreEl.textContent=score==null?'–':score+'%';
      const bar=card.querySelector('.admin-category-bar i');if(bar)bar.style.width=(score||0)+'%';
      const counts=card.querySelector('.admin-category-counts');
      if(counts)counts.innerHTML=`<span class="ok">${s.correct} richtig</span><span class="bad">${s.wrong} falsch</span><span class="critical">${s.danger} kritisch</span>${s.review?`<span>${s.review} prüfen</span>`:''}`;
    });
  }
  function patchCurrentCard(card,user){
    const payload=user?.payload;if(!payload)return;
    const detail=card.querySelector('.admin-profile-detail');if(!detail)return;
    detail.querySelectorAll('.admin-answer-row').forEach(row=>{if(!row.closest('.admin-run-review'))patchRow(row,payload)});
    const a=analyse(payload),t=a.totals;
    const stats=detail.querySelector('.admin-analysis-stats');
    if(stats){const vals=[t.correct,t.wrong,t.danger,t.review,payload?.remembered?.length||0];[...stats.children].forEach((box,n)=>{const strong=box.querySelector('strong');if(strong&&vals[n]!=null)strong.textContent=vals[n]})}
    patchCategories(detail,a);
    const red=detail.querySelector('.admin-redflag-summary');
    if(red){
      const flags=a.rows.filter(r=>r.state.kind==='danger');
      red.className=`admin-redflag-summary${flags.length?'':' clear'}`;
      red.innerHTML=flags.length?`<div class="admin-redflag-heading"><div><span class="admin-kicker">RED FLAGS</span><b>${flags.length} verifizierte kritische Entscheidung${flags.length===1?'':'en'} genauer besprechen</b></div><span class="admin-redflag-count">${flags.length}</span></div><div class="admin-redflag-list">${flags.map(r=>`<div><strong>${esc(r.q)}</strong><span>${esc(selectedText(r.task,r.value))}</span></div>`).join('')}</div>`:`<div><span class="admin-kicker">RED FLAGS</span><b>Keine verifizierten kritischen Choice-Antworten</b></div><span class="admin-redflag-count">0</span>`;
    }
    const profileStats=card.querySelector('.admin-profile-stats');
    let danger=profileStats?.querySelector('em.danger');
    if(t.danger){if(!danger){danger=document.createElement('em');danger.className='danger';profileStats?.appendChild(danger)}danger.textContent=`${t.danger} Red Flag${t.danger===1?'':'s'}`}
    else danger?.remove();
    const filters=detail.querySelectorAll('.admin-filter');
    filters.forEach(btn=>{const key=btn.dataset.filter,b=btn.querySelector('b');if(!b)return;if(key==='wrong')b.textContent=t.wrong;if(key==='danger')b.textContent=t.danger;if(key==='review')b.textContent=t.review});
  }
  function fmt(v){try{return new Date(v).toLocaleString('de-DE')}catch{return v||'–'}}
  function archiveRow(q,value,idx){
    const task=taskFor(q),state=stateFor(task,value),exp=expectedText(task,value);
    return `<article class="admin-answer-row admin-history-answer" data-state="${state.kind}"><div class="admin-answer-head"><span class="admin-qno">${idx+1}</span><div><div class="admin-answer-meta">${esc(task?.c||'Aufgabe')}${task?.d?' · '+esc(task.d):''}</div><b>${esc(q)}</b></div><span class="admin-answer-state ${state.kind}">${esc(state.label)}</span></div><div class="admin-answer-body"><div><small>Geantwortet</small><p>${esc(selectedText(task,value))}</p></div>${exp?`<div><small>Erwartet</small><p>${esc(exp)}</p></div>`:''}</div>${state.legacy?'<div class="admin-integrity-warning">Legacy-Datensatz: Die ursprüngliche zufällige Antwortreihenfolge fehlt. Keine automatische Bewertung dieser Choice-Antwort.</div>':''}</article>`;
  }
  function rebuildArchive(card,user){
    const detail=card.querySelector('.admin-profile-detail');if(!detail)return;
    detail.querySelector('.admin-run-history')?.remove();
    const currentId=user?.current_run_id||user?.payload?._runId;
    const runs=(user?.attempts||[]).filter(r=>!r.is_current&&r.run_id!==currentId&&r?.payload?._runId!==currentId).slice(0,3);
    if(!runs.length)return;
    const wrap=document.createElement('section');wrap.className='admin-run-history admin-run-history-archive';
    wrap.innerHTML=`<div class="admin-run-history-head"><div><span class="admin-kicker">FRÜHERE DURCHLÄUFE</span><h4>Archivierte Sitzungen</h4></div><label>Nachprüfen <select class="admin-run-select">${runs.map((r,n)=>`<option value="${esc(r.run_id)}">${n+1}. ${r.payload?.completed?'Abgeschlossen':'In Arbeit'} · ${esc(fmt(r.updated_at))}</option>`).join('')}</select></label></div><div class="admin-run-review"></div>`;
    const sel=wrap.querySelector('select'),review=wrap.querySelector('.admin-run-review');
    const draw=()=>{
      const run=runs.find(r=>r.run_id===sel.value);if(!run)return;
      const p=run.payload||{},entries=Object.entries(p.answersByQuestion||{}),a=analyse(p);
      review.innerHTML=`<div class="admin-history-summary"><b>${entries.length} Antworten</b><span>${p.age?p.age+' Jahre · ':''}${p.completed?'Abgeschlossen':'Nicht abgeschlossen'} · ${esc(fmt(run.updated_at))}</span></div><div class="admin-archive-integrity"><b>${a.totals.correct+a.totals.wrong+a.totals.danger} automatisch verifizierbar</b><span>${a.totals.review} Aufgaben manuell/Legacy prüfen</span></div><div class="admin-history-answers">${entries.map(([q,v],n)=>archiveRow(q,v,n)).join('')}</div>`;
    };
    sel.addEventListener('change',draw);draw();
    const answerSection=detail.querySelector('.admin-answer-section');
    if(answerSection)detail.insertBefore(wrap,answerSection);else detail.appendChild(wrap);
  }
  async function enhance(){
    const admin=document.querySelector('#adminMini');if(!admin||admin.classList.contains('hidden'))return;
    let out;try{out=await api('/api/admin/users')}catch{return}
    const users=out.users||[];
    let globalDanger=0;
    admin.querySelectorAll('.admin-profile-card').forEach(card=>{
      const name=card.querySelector('.admin-profile-name b')?.textContent?.trim();
      const user=users.find(u=>u.display_name===name);if(!user)return;
      const a=analyse(user.payload);globalDanger+=a.totals.danger;
      patchCurrentCard(card,user);rebuildArchive(card,user);
    });
    const global=admin.querySelector('.admin-global-stats .critical strong');if(global)global.textContent=globalDanger;
  }
  const admin=document.querySelector('#adminMini');
  if(admin)new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(enhance,140)}).observe(admin,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  document.addEventListener('click',e=>{if(e.target.closest('.admin-refresh,.profile-chip'))setTimeout(enhance,380)});
  setTimeout(enhance,900);
})();
