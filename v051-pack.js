// v0.5.6 — Echtfoto-vs-KI-Lab
// Unterschiedliche Personen, vergleichbare Fotografie, randomisierte Reihenfolge,
// echte Pexels-Fotografien + lokale KI-Bilder, randomisiert, mit Lade-Gate und Sicherheitseinschätzung.
Q.push({
  a:11,
  c:'Fake News, KI & Deepfakes',
  d:'Expert · Bild-Lab',
  q:'Welche Porträts sind echte Fotografien – und welche wurden vollständig mit KI erzeugt?',
  t:'imagegrid',
  p:12,
  v:{
    type:'imagegrid',
    intro:'Bewerte jedes Bild einzeln. Die Personen sind absichtlich unterschiedlich – achte auf das Bild selbst, nicht auf Ähnlichkeiten zwischen Personen.',
    people:[
      {id:'r1',src:'https://images.pexels.com/photos/8941649/pexels-photo-8941649.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',kind:'real',credit:'Echte Fotografie · Pexels'},
      {id:'a1',src:'assets/people-v4/ai-01.jpg',kind:'ai',credit:'KI-generiert'},
      {id:'r2',src:'https://images.pexels.com/photos/19604289/pexels-photo-19604289.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',kind:'real',credit:'Echte Fotografie · Pexels'},
      {id:'a2',src:'assets/people-v4/ai-02.jpg',kind:'ai',credit:'KI-generiert'},
      {id:'r3',src:'https://images.pexels.com/photos/17664370/pexels-photo-17664370.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',kind:'real',credit:'Echte Fotografie · Pexels'},
      {id:'a3',src:'assets/people-v4/ai-03.jpg',kind:'ai',credit:'KI-generiert'}
    ]
  },
  edu:'Die Aufgabe soll keine „KI sieht immer komisch aus“-Regel vermitteln. Die Porträts zeigen unterschiedliche Personen unter vergleichbaren Alltags-Fotobedingungen. Besprecht besonders hochsichere Fehlurteile: Quellen, Ursprung und unabhängige Verifikation sind bei wichtigen Bildern stärker als visuelles Bauchgefühl.'
});

function shuffleCopy(arr){
  const out=[...arr];
  for(let n=out.length-1;n>0;n--){
    const j=Math.floor(Math.random()*(n+1));
    [out[n],out[j]]=[out[j],out[n]];
  }
  return out;
}
function imageGridPeople(v){
  if(!v._order) v._order=shuffleCopy(v.people.map(p=>p.id));
  const byId=Object.fromEntries(v.people.map(p=>[p.id,p]));
  return v._order.map(id=>byId[id]).filter(Boolean);
}

const _v051Visual=renderVisual;
renderVisual=function(v){
  if(!v || v.type!=='imagegrid') return _v051Visual(v);
  const el=$('#visual'); el.innerHTML=''; el.classList.remove('hidden');
  const saved=answers[i]?.imagegrid||{};
  const confidence=answers[i]?.confidence||{};
  const people=imageGridPeople(v);
  el.innerHTML=`
    <div class="imagegrid-head"><strong>🧠 KI-Bilder-Lab</strong><span>${esc(v.intro||'')}</span></div>
    <div class="people-grid">${people.map((p,n)=>{
      const conf=Number.isFinite(+confidence[p.id]) ? Math.max(50,Math.min(100,+confidence[p.id])) : 50;
      return `<article class="person-card" data-person="${esc(p.id)}">
        <div class="person-img-wrap"><img src="${esc(p.src)}" alt="Vergleichsporträt" loading="eager" decoding="async" draggable="false"></div>
        <div class="person-choice" role="group" aria-label="Porträt bewerten">
          <button type="button" class="classify real ${saved[p.id]==='real'?'selected':''}" data-pid="${esc(p.id)}" data-kind="real">Echte Fotografie</button>
          <button type="button" class="classify ai ${saved[p.id]==='ai'?'selected':''}" data-pid="${esc(p.id)}" data-kind="ai">KI-generiert</button>
        </div>
        <div class="confidence-wrap">
          <label for="conf-${esc(p.id)}">Wie sicher bist du? <output id="out-${esc(p.id)}">${conf}%</output></label>
          <div class="confidence-row"><span>50%</span><input id="conf-${esc(p.id)}" class="confidence" data-pid="${esc(p.id)}" type="range" min="50" max="100" step="5" value="${conf}"><span>100%</span></div>
        </div>
      </article>`;
    }).join('')}</div>
    <p class="imagegrid-note">Tipp: Moderne KI-Bilder können vollkommen plausibel wirken. Achte auf das Gesamtbild – Licht, Perspektive, Haare, Haut, Hintergrund und kleine Details – aber behandle keinen einzelnen Hinweis als Beweis.</p>
    <p class="imagegrid-source">Die echten Vergleichsfotos stammen aus eindeutig als frei nutzbar gekennzeichneten Pexels-Fotografien. Alle sechs Bilder werden vollständig vorgeladen und erst danach gemeinsam angezeigt, damit die Ladezeit keinen Hinweis liefert. Die Reihenfolge wird bei jedem neuen Testdurchlauf zufällig gemischt.</p>`;
  $$('.classify').forEach(b=>b.onclick=()=>{
    const pid=b.dataset.pid;
    $$(`.classify[data-pid="${pid}"]`).forEach(x=>x.classList.toggle('selected',x===b));
  });
  $$('.confidence').forEach(r=>r.addEventListener('input',()=>{
    const out=$(`#out-${r.dataset.pid}`); if(out)out.textContent=`${r.value}%`;
  }));
};

const _v051Save=save;
save=function(){
  const x=items[i];
  if(x?.t==='imagegrid'){
    const out={},confidence={};
    $$('.classify.selected').forEach(b=>out[b.dataset.pid]=b.dataset.kind);
    $$('.confidence').forEach(r=>confidence[r.dataset.pid]=+r.value);
    answers[i]={imagegrid:out,confidence};
    return;
  }
  return _v051Save();
};

function imageGridPoints(x,a){
  const map=a?.imagegrid||{};
  const people=x.v.people||[];
  if(!people.length) return 0;
  const correct=people.filter(p=>map[p.id]===p.kind).length;
  return Math.round(x.p*(correct/people.length));
}
function imageGridCalibration(x,a){
  const map=a?.imagegrid||{}, conf=a?.confidence||{};
  let answered=0,highWrong=0,confSum=0,correct=0;
  (x.v.people||[]).forEach(p=>{
    if(!map[p.id])return;
    answered++; const c=Math.max(50,Math.min(100,+conf[p.id]||50)); confSum+=c;
    if(map[p.id]===p.kind)correct++; else if(c>=85)highWrong++;
  });
  return {answered,correct,highWrong,avg:answered?Math.round(confSum/answered):0};
}

const _v051OldFinish=finish;
finish=function(){
  save();
  $('#quiz').classList.add('hidden'); $('#result').classList.remove('hidden');
  let got=0,max=0,rf=[],cats={},labNotes=[];
  items.forEach((x,idx)=>{
    max+=x.p; cats[x.c]??={g:0,m:0}; cats[x.c].m+=x.p;
    const a=answers[idx]; let pts=0;
    if(x.t==='branch'){
      const st=a?.branch; if(st?.max)pts=Math.round(x.p*(st.score/st.max));
      if(st?.history?.some(h=>h.points===0)&&x.scenarioId==='groomingTrust')rf.push(`${x.c}: In der Simulation wurden riskante Druck-/Privatsphäre-Entscheidungen gewählt.`);
    } else if(x.t==='hotspot'){
      pts=hotspotPoints(x,a); const correct=x.v.regions.filter(r=>r.correct); const hit=new Set(a?.hotspots||[]); const missed=correct.filter(r=>!hit.has(r.id));
      if(x.rfHotspot && missed.length>=2) rf.push(`${x.c}: Im Screenshot wurden mehrere zentrale Warnzeichen übersehen.`);
    } else if(x.t==='imagegrid'){
      pts=imageGridPoints(x,a);
      const cal=imageGridCalibration(x,a);
      if(cal.answered) labNotes.push(`KI-Bilder-Lab: ${cal.correct}/${cal.answered} richtig · Ø Sicherheit ${cal.avg}%${cal.highWrong?` · ${cal.highWrong} hochsichere Fehlentscheidung${cal.highWrong===1?'':'en'}`:''}`);
      if(cal.highWrong>=2) rf.push(`${x.c}: Mehrere KI-/Echt-Einschätzungen waren falsch, obwohl eine sehr hohe Sicherheit angegeben wurde.`);
    } else if(x.manual){
      pts=a?.free?.length>=120?Math.round(x.p*.75):a?.free?.length>=70?Math.round(x.p*.55):a?.free?.length>=30?Math.round(x.p*.3):0;
    } else if(x.t==='multi'){
      pts=multiPoints(x,a); if(x.rf&&(a?.choices||[]).some(c=>x.rf.includes(c)))rf.push(`${x.c}: ${x.q}`);
    } else if(a?.choice!=null){
      if(x.k.includes(a.choice))pts=x.p; else if(x.rf?.includes(a.choice))rf.push(`${x.c}: ${x.q}`);
    }
    got+=pts; cats[x.c].g+=pts;
  });
  const pct=Math.round(got/max*100);
  $('#scoreTitle').textContent=`${pct}% · ${level(pct)}`;
  $('#scoreIntro').textContent=`Automatisch bewertet: ${got} von ${max} Punkten. ${labNotes.join(' ')} Freitext-Aufgaben bleiben Gesprächsaufgaben.`;
  $('#categoryScores').innerHTML=Object.entries(cats).map(([k,v])=>{const p=Math.round(v.g/v.m*100);return `<div class="score-row"><strong>${esc(k)}</strong><div class="meter"><i style="width:${p}%;--score:${p}%"></i></div><span>${p}%</span></div>`}).join('');
  $('#redFlags').innerHTML=rf.length?`<h2>Kritische Red Flags</h2>${rf.map(x=>`<div class="flag">${esc(x)}</div>`).join('')}<p>Red Flags sind Gesprächsanlässe, keine Bestrafungspunkte.</p>`:'<h2>Keine kritischen Red Flags erkannt</h2><p>Schwache Kategorien, Screenshot-Markierungen, Bild-Labs, Freitext-Begründungen und Entscheidungen innerhalb der Simulationen sollten trotzdem gemeinsam angesehen werden.</p>';
  scrollTo(0,0);
};

const _v051CorrectText=correctText;
correctText=function(x){
  if(x.t==='imagegrid'){
    return x.v.people.map(p=>`${p.id.toUpperCase()}: ${p.kind==='real'?'echte Fotografie':'KI-generiert'}`).join(' · ');
  }
  return _v051CorrectText(x);
};

// Alle Bilder werden vor der Aufgabe vollständig geladen. So kann die Ladezeit nicht verraten,
// ob ein Bild lokal (KI) oder extern (echte Fotografie) ist.
(function preloadImageLab(){
  const sources=[
    'https://images.pexels.com/photos/8941649/pexels-photo-8941649.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
    'https://images.pexels.com/photos/19604289/pexels-photo-19604289.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
    'https://images.pexels.com/photos/17664370/pexels-photo-17664370.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
    'assets/people-v4/ai-01.jpg','assets/people-v4/ai-02.jpg','assets/people-v4/ai-03.jpg'
  ];
  window.__imageLabReady=false;
  Promise.all(sources.map(src=>new Promise(resolve=>{
    const im=new Image(); im.decoding='async';
    const done=()=>resolve(); im.onload=done; im.onerror=done; im.src=src;
    if(im.complete) done();
  }))).then(()=>{ window.__imageLabReady=true; });
})();
