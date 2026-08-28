// v0.6.3 — interactive concept shell, reminders, settings and answer gating
(function(){
  const ICONS={
    'Accounts & Passwörter':'▣','Phishing & Scams':'◇','Fremde Personen & Grooming':'♙','Chats & Social Engineering':'▱',
    'Social Media & Privatsphäre':'◎','Datenschutz & Standort':'◎','Fake News, KI & Deepfakes':'◈','Cybermobbing & Gruppendruck':'♧',
    'Geld, Shops & Käufe':'▤','Geld, Shops & In-App-Käufe':'▤','Notfälle & Hilfe holen':'◉','Recht & Verantwortung':'♖','Praxisfälle':'⌁',
    'Downloads, Mods & Malware':'⬡'
  };
  const SIDE={
    'Fremde Personen & Grooming':['Langsamer Vertrauensaufbau','Grooming beginnt oft freundlich. Entscheidend ist, ob jemand Nähe aufbaut, Grenzen testet, Geheimhaltung verlangt oder dich von anderen wegzieht.'],
    'Chats & Social Engineering':['Manipulation im Chat','Nicht Technik, sondern Vertrauen, Eile, Schuldgefühl oder Autorität sind oft der eigentliche Angriff.'],
    'Social Media & Privatsphäre':['Infos zusammendenken','Einzelne Posts wirken harmlos. Zusammen können Ort, Schule, Routinen und Abwesenheiten sehr viel verraten.'],
    'Datenschutz & Standort':['Infos zusammendenken','Einzelne Posts wirken harmlos. Zusammen können Ort, Schule, Routinen und Abwesenheiten sehr viel verraten.'],
    'Fake News, KI & Deepfakes':['Plausibel ist nicht gleich echt','Bilder, Stimmen und Videos können überzeugend wirken. Quelle, Kontext und unabhängige Bestätigung sind stärker als Bauchgefühl.'],
    'Cybermobbing & Gruppendruck':['Grenzen gelten auch in Gruppen','Viele Mitmachende machen eine Grenzüberschreitung nicht harmloser. Nicht weiterleiten, Betroffene stärken, Hilfe holen.'],
    'Accounts & Passwörter':['Konten sind miteinander verbunden','Wer dein E-Mail-Konto oder ein wiederverwendetes Passwort übernimmt, kann oft weitere Konten zurücksetzen.'],
    'Phishing & Scams':['Druck ist ein Warnsignal','Betrug will oft, dass du schnell klickst, bevor du unabhängig prüfst. Öffne den echten Dienst selbst.'],
    'Geld, Shops & Käufe':['Kaufdruck erkennen','Knappheit und Zeitdruck sollen kritisches Prüfen verkürzen. Preis, Anbieter und Zahlungsweg unabhängig prüfen.'],
    'Geld, Shops & In-App-Käufe':['Kaufdruck erkennen','Knappheit und Zeitdruck sollen kritisches Prüfen verkürzen. Preis, Anbieter und Zahlungsweg unabhängig prüfen.'],
    'Notfälle & Hilfe holen':['Früh Hilfe holen','Bei Erpressung, Account-Verlust oder Drohungen schafft frühe Unterstützung mehr sichere Handlungsmöglichkeiten.'],
    'Recht & Verantwortung':['Online hat reale Folgen','Weiterleiten, Bloßstellen und Veröffentlichen kann anderen real schaden. Einwilligung und Privatsphäre zählen.'],
    'Praxisfälle':['Muster statt Einzelzeichen','Echte Situationen enthalten mehrere Signale gleichzeitig. Stoppen, prüfen, Schaden begrenzen und eine zweite Person einbeziehen.']
  };
  const esc2=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const remembered=window.__remembered=window.__remembered||new Set();
  const settings=Object.assign({showGuidance:true,showMicroTip:true},(()=>{try{return JSON.parse(localStorage.getItem('ost-settings')||'{}')}catch{return {}}})());

  function current(){ return (typeof items!=='undefined' && items[i]) ? items[i] : null; }
  function answerFor(idx){ return typeof answers!=='undefined' ? answers[idx] : undefined; }
  function isAnswered(idx, live=false){
    const x=(typeof items!=='undefined')?items[idx]:null; if(!x)return false;
    const a=answerFor(idx);
    if(x.t==='branch') return !!a?.branch?.done;
    if(live && idx===i){
      if(x.t==='free') return !!document.querySelector('#freeAnswer')?.value.trim();
      if(x.t==='multi') return document.querySelectorAll('input[name="q"]:checked').length>0;
      if(x.t==='hotspot') return (document.querySelector('#hotspotFreeLayer')?._marks||[]).length>0;
      if(x.t==='imagegrid'){
        const people=x.v?.people||[], chosen=new Set([...document.querySelectorAll('.classify.selected')].map(b=>b.dataset.pid));
        return people.length>0 && people.every(p=>chosen.has(p.id));
      }
      return !!document.querySelector('input[name="q"]:checked');
    }
    if(x.t==='free') return !!a?.free?.trim();
    if(x.t==='multi') return !!a?.choices?.length;
    if(x.t==='hotspot') return !!a?.marks?.length;
    if(x.t==='imagegrid'){
      const people=x.v?.people||[], map=a?.imagegrid||{};
      return people.length>0 && people.every(p=>map[p.id]);
    }
    return a?.choice!=null;
  }
  function countAnswered(cat){
    if(typeof items==='undefined') return [0,0];
    let total=0,done=0; items.forEach((x,idx)=>{if(x.c===cat){total++; if(isAnswered(idx))done++;}}); return [done,total];
  }
  function reminderCount(cat){
    let n=0; remembered.forEach(idx=>{if(items?.[idx]?.c===cat)n++;}); return n;
  }
  function nextTargetForCategory(cat){
    const idxs=items.map((x,idx)=>x.c===cat?idx:-1).filter(idx=>idx>=0);
    return idxs.find(idx=>remembered.has(idx)) ?? idxs.find(idx=>!isAnswered(idx)) ?? idxs[0];
  }
  function goTo(idx){
    if(!Number.isInteger(idx)||idx<0||idx>=items.length)return;
    try{save()}catch{}
    i=idx; render(); window.scrollTo({top:0,behavior:'smooth'});
  }
  function updateNav(){
    const x=current(), nav=document.getElementById('categoryNav'); if(!x||!nav)return;
    const cats=[]; items.forEach(q=>{if(!cats.includes(q.c))cats.push(q.c)});
    nav.innerHTML=cats.map(cat=>{const [done,total]=countAnswered(cat), remind=reminderCount(cat);return `<button type="button" class="category-row ${cat===x.c?'active':''} ${remind?'has-reminder':''}" data-category="${esc2(cat)}"><span class="category-icon">${ICONS[cat]||'◇'}</span><span class="category-name">${esc2(cat)}</span>${remind?`<span class="category-reminder" title="${remind} gemerkt">${remind}</span>`:''}<span class="category-count">${done}/${total}</span></button>`}).join('');
    nav.querySelectorAll('[data-category]').forEach(b=>b.onclick=()=>goTo(nextTargetForCategory(b.dataset.category)));
  }
  function applySettings(){
    document.body.classList.toggle('hide-guidance',!settings.showGuidance);
    document.body.classList.toggle('hide-micro-tip',!settings.showMicroTip);
    try{localStorage.setItem('ost-settings',JSON.stringify(settings))}catch{}
  }
  function updateNextState(){
    const btn=document.getElementById('nextBtn'); if(!btn||!current())return;
    const allowed=isAnswered(i,true)||remembered.has(i);
    btn.disabled=!allowed;
    btn.title=allowed?'':'Beantworte die Frage oder merke sie für später.';
    btn.setAttribute('aria-disabled',String(!allowed));
  }
  function updateShell(){
    const x=current(); if(!x)return;
    const pct=Math.round(((i+1)/items.length)*100);
    const qp=document.getElementById('progressPercent'); if(qp)qp.textContent=pct+'%';
    const qn=document.getElementById('questionNumber'); if(qn)qn.textContent=`Frage ${i+1} von ${items.length}`;
    const [done,total]=countAnswered(x.c);
    const cpt=document.getElementById('categoryProgressText'); if(cpt)cpt.textContent=`${done} / ${total}`;
    const cpb=document.getElementById('categoryProgressBar'); if(cpb)cpb.style.width=((done/Math.max(1,total))*100)+'%';
    const side=SIDE[x.c]||['Sicher entscheiden','Achte auf Kontext, Druck, Grenzen und darauf, wie du Informationen unabhängig prüfen kannst.'];
    const st=document.getElementById('scenarioSideTitle'), ss=document.getElementById('scenarioSideText'); if(st)st.textContent=side[0]; if(ss)ss.textContent=side[1];
    const mt=document.getElementById('microTipText'); if(mt){const g=document.getElementById('guidanceWhy');mt.textContent='Tipp: '+(g?.textContent||'Achte auf Muster und entscheide nicht unter Druck.');}
    updateNav();
    const rem=document.getElementById('rememberQuestion'); if(rem)rem.checked=remembered.has(i);
    const mc=document.getElementById('markedCount'); if(mc)mc.textContent=`Merkliste (${remembered.size})`;
    updateNextState(); applySettings();
  }
  function ensureModal(){
    if(document.getElementById('appModal'))return document.getElementById('appModal');
    const el=document.createElement('div');el.id='appModal';el.className='app-modal hidden';el.innerHTML='<div class="app-modal-backdrop" data-close-modal></div><section class="app-modal-card" role="dialog" aria-modal="true"><button class="modal-close" type="button" data-close-modal aria-label="Schließen">×</button><div id="appModalBody"></div></section>';
    document.body.appendChild(el); el.querySelectorAll('[data-close-modal]').forEach(b=>b.onclick=closeModal); return el;
  }
  function closeModal(){document.getElementById('appModal')?.classList.add('hidden');}
  function openRemembered(){
    const modal=ensureModal(), body=modal.querySelector('#appModalBody');
    const list=[...remembered].sort((a,b)=>a-b);
    body.innerHTML=`<div class="modal-kicker">MERKLISTE</div><h2>Für später gemerkt</h2><p class="modal-copy">Hier findest du Fragen, die du bewusst übersprungen oder zum erneuten Prüfen markiert hast.</p>${list.length?`<div class="remembered-list">${list.map(idx=>`<button type="button" data-go="${idx}"><span><small>${esc2(items[idx]?.c||'')}</small><b>Frage ${idx+1}: ${esc2(items[idx]?.q||'')}</b></span><em>${isAnswered(idx)?'beantwortet · gemerkt':'noch offen'}</em></button>`).join('')}</div>`:'<div class="empty-state">Noch keine Frage gemerkt.</div>'}`;
    body.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{closeModal();goTo(+b.dataset.go)}); modal.classList.remove('hidden');
  }
  function openSettings(){
    const modal=ensureModal(),body=modal.querySelector('#appModalBody');
    body.innerHTML=`<div class="modal-kicker">EINSTELLUNGEN</div><h2>Darstellung</h2><p class="modal-copy">Passe nur die Hilfsdarstellung an. Fragen und Bewertung bleiben unverändert.</p><label class="setting-row"><span><b>Leitlinien rechts anzeigen</b><small>Kontextuelle Sicherheitsregeln zur aktuellen Kategorie.</small></span><input type="checkbox" data-setting="showGuidance" ${settings.showGuidance?'checked':''}></label><label class="setting-row"><span><b>Micro-Tipps anzeigen</b><small>Kurzer Hinweis unter der Aufgabenkarte.</small></span><input type="checkbox" data-setting="showMicroTip" ${settings.showMicroTip?'checked':''}></label>`;
    body.querySelectorAll('[data-setting]').forEach(c=>c.onchange=()=>{settings[c.dataset.setting]=c.checked;applySettings()}); modal.classList.remove('hidden');
  }

  document.addEventListener('change',e=>{
    if(e.target?.id==='rememberQuestion'){
      e.target.checked?remembered.add(i):remembered.delete(i); updateShell();
    }
    if(e.target?.matches('input[name="q"], #freeAnswer, .confidence')) setTimeout(updateNextState,0);
  });
  document.addEventListener('input',e=>{if(e.target?.id==='freeAnswer')updateNextState();});
  document.addEventListener('click',e=>{
    if(e.target.closest?.('.classify,[data-branch-choice],.branch-continue,.hotspot-free-layer,.free-mark'))setTimeout(updateNextState,0);
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});

  const previousRender=render;
  render=function(){ previousRender(); updateShell(); };

  // Replace the permissive legacy Next handler: Weiter only after an answer or explicit bookmark.
  const next=document.getElementById('nextBtn');
  if(next) next.onclick=()=>{
    if(!(isAnswered(i,true)||remembered.has(i))){updateNextState();return;}
    save();
    if(i<items.length-1){i++;render()}else finish();
  };
  const marked=document.getElementById('markedButton'); if(marked)marked.onclick=openRemembered;
  const settingsBtn=document.getElementById('settingsButton'); if(settingsBtn)settingsBtn.onclick=openSettings;
  applySettings();
  if(document.getElementById('quiz')&&!document.getElementById('quiz').classList.contains('hidden')) updateShell();
})();
