// v0.6.1 — full concept application shell
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
    'Accounts & Passwörter':['Konten sind miteinander verbunden','Wer dein E-Mail-Konto oder einen Wiederverwendungs-Passwort übernimmt, kann oft weitere Konten zurücksetzen.'],
    'Phishing & Scams':['Druck ist ein Warnsignal','Betrug will oft, dass du schnell klickst, bevor du unabhängig prüfst. Öffne den echten Dienst selbst.'],
    'Geld, Shops & Käufe':['Kaufdruck erkennen','Knappheit und Zeitdruck sollen kritisches Prüfen verkürzen. Preis, Anbieter und Zahlungsweg unabhängig prüfen.'],
    'Geld, Shops & In-App-Käufe':['Kaufdruck erkennen','Knappheit und Zeitdruck sollen kritisches Prüfen verkürzen. Preis, Anbieter und Zahlungsweg unabhängig prüfen.'],
    'Notfälle & Hilfe holen':['Früh Hilfe holen','Bei Erpressung, Account-Verlust oder Drohungen schafft frühe Unterstützung mehr sichere Handlungsmöglichkeiten.'],
    'Recht & Verantwortung':['Online hat reale Folgen','Weiterleiten, Bloßstellen und Veröffentlichen kann anderen real schaden. Einwilligung und Privatsphäre zählen.'],
    'Praxisfälle':['Muster statt Einzelzeichen','Echte Situationen enthalten mehrere Signale gleichzeitig. Stoppen, prüfen, Schaden begrenzen und eine zweite Person einbeziehen.']
  };
  const esc2=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  function current(){ return (typeof items!=='undefined' && items[i]) ? items[i] : null; }
  function countAnswered(cat){
    if(typeof items==='undefined'||typeof answers==='undefined') return [0,0];
    let total=0,done=0;
    items.forEach((x,idx)=>{if(x.c===cat){total++; if(answers[idx]!==undefined)done++;}});
    return [done,total];
  }
  function updateNav(){
    const x=current(), nav=document.getElementById('categoryNav'); if(!x||!nav)return;
    const cats=[]; items.forEach(q=>{if(!cats.includes(q.c))cats.push(q.c)});
    nav.innerHTML=cats.map(cat=>{const [done,total]=countAnswered(cat);return `<div class="category-row ${cat===x.c?'active':''}"><span class="category-icon">${ICONS[cat]||'◇'}</span><span class="category-name">${esc2(cat)}</span><span class="category-count">${done}/${total}</span></div>`}).join('');
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
    const rem=document.getElementById('rememberQuestion'); if(rem){rem.checked=!!(window.__remembered&&window.__remembered.has(i));}
    const mc=document.getElementById('markedCount'); if(mc)mc.textContent=`Merkliste (${window.__remembered?window.__remembered.size:0})`;
  }
  window.__remembered=window.__remembered||new Set();
  document.addEventListener('change',e=>{if(e.target?.id==='rememberQuestion'){e.target.checked?window.__remembered.add(i):window.__remembered.delete(i);updateShell();}});
  const previousRender=render; render=function(){ previousRender(); updateShell(); };
  if(document.getElementById('quiz')&&!document.getElementById('quiz').classList.contains('hidden')) updateShell();
})();