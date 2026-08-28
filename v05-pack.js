// v0.5 — real rendered screenshot tasks + hotspot marking + session review
Q.push(
  {a:11,c:'Datenschutz & Standort',d:'Screenshot-Lab',q:'Screenshot-Aufgabe: Markiere ALLE Stellen, durch die eine fremde Person unnötig viel über Linas Alltag oder Aufenthaltsort ableiten kann.',t:'hotspot',p:10,o:[],v:{type:'hotspot',src:'assets/screenshots/profile-risk.png',alt:'Simuliertes öffentliches Social-Media-Profil von Lina',hint:'Klicke direkt auf die verdächtigen Angaben oder Beiträge.',regions:[
    {id:'school',label:'Schulname',x:2.5,y:25.4,w:48,h:3.7,correct:true},
    {id:'bus',label:'Regelmäßige Buszeit + Haltestelle',x:2.5,y:28.9,w:55,h:3.8,correct:true},
    {id:'live',label:'Aktueller Ort + genaue Uhrzeit',x:0,y:52.1,w:33.2,h:21.4,correct:true},
    {id:'routine',label:'Regelmäßige Trainingstage',x:33.5,y:52.1,w:33.1,h:21.4,correct:true},
    {id:'alone',label:'Eltern übers Wochenende weg',x:66.9,y:52.1,w:33.1,h:21.4,correct:true},
    {id:'shoes',label:'Neue Schuhe',x:0,y:73.7,w:33.2,h:21.3,correct:false},
    {id:'song',label:'Lieblingssong',x:66.9,y:73.7,w:33.1,h:21.3,correct:false}
  ]},edu:'Wichtig ist die Kombination: Schule + Routine + konkrete Orte + Abwesenheit zuhause. Einzelne harmlose Angaben können gemeinsam ein sehr genaues Bewegungsprofil ergeben.'},

  {a:11,c:'Fremde Personen & Grooming',d:'Screenshot-Lab',q:'Screenshot-Aufgabe: Markiere die Nachrichten, die zusammen auf problematischen Vertrauensaufbau oder Grooming hindeuten.',t:'hotspot',p:12,o:[],rfHotspot:true,v:{type:'hotspot',src:'assets/screenshots/grooming-chat.png',alt:'Simulierter Chat mit einer Online-Bekanntschaft',hint:'Nicht jede nette Nachricht ist automatisch gefährlich. Suche nach dem Muster.',regions:[
    {id:'compliment',label:'„Du bist reifer als die anderen“ – exklusives Aufwerten',x:3.3,y:25.4,w:69.5,h:4.6,correct:true},
    {id:'private',label:'Schneller Einstieg in private Probleme zuhause',x:3.3,y:30.6,w:69.5,h:7.1,correct:true},
    {id:'parents',label:'Eltern als Hindernis darstellen',x:3.3,y:43.8,w:69.5,h:7.1,correct:true},
    {id:'switch',label:'Wechsel in privateren Kanal wegen Moderation',x:3.3,y:51.4,w:69.5,h:4.9,correct:true},
    {id:'gift',label:'Geschenk mit Forderung nach Bild verbinden',x:3.3,y:56.8,w:69.5,h:7.2,correct:true},
    {id:'secrecy',label:'Geheimhaltung gegenüber Eltern verlangen',x:3.3,y:64.5,w:69.5,h:7.3,correct:true},
    {id:'thanks',label:'„haha danke“',x:26.4,y:20.0,w:69.5,h:4.8,correct:false}
  ]},edu:'Nicht ein einzelner Satz entscheidet. Besonders relevant ist die Kette aus Aufwertung, persönlicher Nähe, Abwertung/Umgehung von Eltern oder Moderation, Geschenken, Gegenleistung und Geheimhaltung.'},

  {a:11,c:'Cybermobbing & Gruppendruck',d:'Screenshot-Lab',q:'Screenshot-Aufgabe: Markiere ALLE Stellen, an denen eine klare Grenze missachtet oder Gruppendruck verstärkt wird.',t:'hotspot',p:10,o:[],v:{type:'hotspot',src:'assets/screenshots/group-pressure.png',alt:'Simulierter Klassenchat',hint:'Achte darauf, wer Nein sagt und was danach passiert.',regions:[
    {id:'miaNo',label:'Mia setzt eine Grenze („will nicht“)',x:73.33,y:22.23,w:23.33,h:4.12,correct:false,context:true},
    {id:'pressure1',label:'Mias Nein wird kleingeredet',x:3.33,y:28.85,w:51.44,h:4.12,correct:true},
    {id:'pressure2',label:'Vertrauen wird als Druckmittel benutzt',x:3.33,y:35.47,w:45.33,h:4.12,correct:true},
    {id:'benNo',label:'Ben setzt eine Grenze („bitte nicht schicken“)',x:72.0,y:48.72,w:24.67,h:4.12,correct:false,context:true},
    {id:'share',label:'Tom schickt das Bild trotz Bens ausdrücklichem Nein',x:3.33,y:55.34,w:55.56,h:11.49,correct:true},
    {id:'tooLate',label:'„zu spät“ – Bens Grenze wird nach dem Senden abgetan',x:3.33,y:69.32,w:23.33,h:4.12,correct:true},
    {id:'encourage',label:'„schick schick schick“ – Weiterverbreitung wird angefeuert',x:3.33,y:75.95,w:25.11,h:4.12,correct:true},
    {id:'support',label:'Lea fordert Löschen und respektiert Bens Nein',x:54.0,y:82.57,w:42.67,h:4.12,correct:false,context:true}
  ]},edu:'Die „Nein“-Nachrichten selbst sind wichtige Kontexthinweise, aber keine Fehlhandlung. Bewertet wird, ob das Kind erkennt, dass die anschließenden Reaktionen die Grenze missachten bzw. den Schaden vergrößern.'},

  {a:13,c:'Fremde Personen & Grooming',d:'Expert',q:'Nach dem Screenshot-Fall: Welche Aussage beschreibt das Muster am besten?',v:{type:'image',src:'assets/screenshots/grooming-chat.png',alt:'Simulierter Chat mit schrittweisem Vertrauensaufbau'},o:[
    'Das Problem beginnt erst bei der Bitte um ein Bild; alles davor ist für die Einschätzung bedeutungslos.',
    'Kein einzelner früher Satz beweist Grooming. Die Kombination aus besonderer Nähe, privaten Problemen, Umgehung von Eltern/Moderation, Geschenk, Gegenleistung und Geheimhaltung macht den Verlauf zunehmend riskant.',
    'Wer ein echtes Geschenk kauft, ist wahrscheinlich auch wirklich im angegebenen Alter.',
    'Der Wechsel zu einem privaten Messenger ist grundsätzlich gefährlich, auch bei Freunden aus der Schule.'
  ],k:[1],p:7,rf:[0,2]},

  {a:13,c:'Praxisfälle',d:'Expert',q:'Screenshot-Fall: Du hast zwei Warnzeichen zunächst übersehen. Was ist jetzt die beste Denkweise?',s:'Du bemerkst erst später, dass eine Online-Bekanntschaft dich Schritt für Schritt zu mehr Privatheit und Geheimhaltung gedrängt hat. Du hast bereits persönliche Dinge erzählt, aber noch keine Bilder oder Adresse geschickt.',o:[
    'Ich habe schon zu viel erzählt, jetzt bringt Hilfe holen nichts mehr.',
    'Ich muss erst beweisen, dass die Person wirklich gefährlich ist, bevor ich Grenzen setzen darf.',
    'Ich kann die Situation jederzeit neu bewerten: keine weiteren privaten Infos, Verlauf sichern, Kontakt begrenzen/beenden und eine Vertrauensperson einbeziehen.',
    'Ich sollte freundlich weiterschreiben, damit die Person nicht merkt, dass ich misstrauisch bin.'
  ],k:[2],p:7,rf:[0,3],edu:'Ein Kernziel ist „Kurskorrektur“: Kinder sollen wissen, dass sie auch nach früheren Fehlentscheidungen jederzeit stoppen und Hilfe holen dürfen.'}
);

const _v05BaseVisual = renderVisual;
renderVisual = function(v){
  const el=$('#visual');
  if(!v || (v.type!=='hotspot' && v.type!=='image')) return _v05BaseVisual(v);
  el.innerHTML=''; el.classList.remove('hidden');
  if(v.type==='image'){
    el.innerHTML=`<figure class="real-shot"><img src="${esc(v.src)}" alt="${esc(v.alt||'Simulierter Screenshot')}"><figcaption>Simulierter Screenshot · alle Personen und Accounts sind fiktiv</figcaption></figure>`;
    return;
  }

  // v0.5.2: The whole screenshot is selectable. Solution rectangles are never
  // rendered and therefore cannot reveal which places are valid answers.
  const saved=(answers[i]?.marks||[]).map(m=>({x:+m.x,y:+m.y})).filter(m=>Number.isFinite(m.x)&&Number.isFinite(m.y));
  el.innerHTML=`<div class="hotspot-instruction"><strong>Screenshot-Lab</strong><span>${esc(v.hint||'Markiere alle relevanten Stellen direkt im Bild.')}</span><span id="hotspotCount">${saved.length} markiert</span></div>
    <div class="hotspot-free-wrap" id="hotspotFreeWrap">
      <img src="${esc(v.src)}" alt="${esc(v.alt||'Simulierter Screenshot')}" draggable="false">
      <div class="hotspot-free-layer" id="hotspotFreeLayer" aria-label="Screenshot: beliebige Stellen können markiert werden"></div>
    </div>
    <div class="shot-caption">Der komplette Screenshot ist markierbar. Klicke/tippe auf eine Stelle, um sie zu markieren. Klicke auf eine Markierung, um sie wieder zu entfernen.</div>`;

  const layer=$('#hotspotFreeLayer');
  const marks=[...saved];
  const updateCount=()=>{const c=$('#hotspotCount');if(c)c.textContent=`${marks.length} markiert`;};
  const draw=()=>{
    layer.innerHTML='';
    marks.forEach((m,idx)=>{
      const b=document.createElement('button');
      b.type='button'; b.className='free-mark'; b.dataset.markIndex=String(idx);
      b.style.left=`${m.x}%`; b.style.top=`${m.y}%`;
      b.setAttribute('aria-label',`Markierung ${idx+1} entfernen`);
      b.title='Markierung entfernen';
      b.addEventListener('click',ev=>{ev.stopPropagation(); marks.splice(idx,1); draw(); updateCount();});
      layer.appendChild(b);
    });
    layer._marks=marks;
  };
  layer.addEventListener('click',ev=>{
    if(ev.target.closest('.free-mark')) return;
    const r=layer.getBoundingClientRect();
    if(!r.width||!r.height) return;
    const x=Math.max(0,Math.min(100,(ev.clientX-r.left)/r.width*100));
    const y=Math.max(0,Math.min(100,(ev.clientY-r.top)/r.height*100));
    marks.push({x:+x.toFixed(3),y:+y.toFixed(3)});
    draw(); updateCount();
  });
  draw();
};

const _v05BaseSave = save;
save = function(){
  const x=items[i];
  if(x?.t==='hotspot'){
    const layer=$('#hotspotFreeLayer');
    answers[i]={marks:(layer?._marks||[]).map(m=>({x:m.x,y:m.y}))};
    return;
  }
  return _v05BaseSave();
};

function markInsideRegion(mark,r,pad=1.0){
  return mark.x>=r.x-pad && mark.x<=r.x+r.w+pad && mark.y>=r.y-pad && mark.y<=r.y+r.h+pad;
}
function hotspotAssessment(x,a){
  // Backward compatibility for sessions saved by v0.5/v0.5.1.
  if(a?.hotspots && !a?.marks){
    const selected=new Set(a.hotspots||[]);
    const correct=x.v.regions.filter(r=>r.correct);
    const wrong=x.v.regions.filter(r=>!r.correct);
    const hit=correct.filter(r=>selected.has(r.id));
    const falseRegions=wrong.filter(r=>selected.has(r.id));
    return {correct,hit,missed:correct.filter(r=>!selected.has(r.id)),falseCount:falseRegions.length,falseLabels:falseRegions.map(r=>r.label),marks:[]};
  }
  const marks=a?.marks||[];
  const correct=x.v.regions.filter(r=>r.correct);
  const allRegions=x.v.regions||[];
  const hit=correct.filter(r=>marks.some(m=>markInsideRegion(m,r)));
  const missed=correct.filter(r=>!marks.some(m=>markInsideRegion(m,r)));
  // Every click is allowed. For scoring, a click outside every correct target is a
  // false mark. Multiple clicks in the same non-correct labelled area count once;
  // free-space clicks are grouped conservatively to avoid accidental double penalties.
  const falseRegionIds=new Set(); let freeFalse=0;
  marks.forEach(m=>{
    if(correct.some(r=>markInsideRegion(m,r))) return;
    const nonCorrect=allRegions.find(r=>!r.correct && markInsideRegion(m,r));
    if(nonCorrect) falseRegionIds.add(nonCorrect.id);
    else freeFalse++;
  });
  const falseRegions=allRegions.filter(r=>falseRegionIds.has(r.id));
  return {correct,hit,missed,falseCount:falseRegions.length+Math.min(freeFalse,3),falseLabels:[...falseRegions.map(r=>r.label),...(freeFalse?[`${freeFalse} weitere Markierung(en) außerhalb relevanter Bereiche`]:[])],marks};
}
function hotspotPoints(x,a){
  const z=hotspotAssessment(x,a);
  if(!(a?.marks?.length||a?.hotspots?.length)) return 0;
  const ratio=Math.max(0,(z.hit.length-z.falseCount)/Math.max(1,z.correct.length));
  return Math.round(x.p*ratio);
}

finish = function(){
  save(); $('#quiz').classList.add('hidden'); $('#result').classList.remove('hidden'); let got=0,max=0,rf=[],cats={};
  items.forEach((x,idx)=>{max+=x.p; cats[x.c]??={g:0,m:0}; cats[x.c].m+=x.p; const a=answers[idx]; let pts=0;
    if(x.t==='branch'){
      const st=a?.branch; if(st?.max)pts=Math.round(x.p*(st.score/st.max));
      if(st?.history?.some(h=>h.points===0)&&x.scenarioId==='groomingTrust')rf.push(`${x.c}: In der Simulation wurden riskante Druck-/Privatsphäre-Entscheidungen gewählt.`);
    } else if(x.t==='hotspot'){
      pts=hotspotPoints(x,a); const assessment=hotspotAssessment(x,a);
      if(x.rfHotspot && assessment.missed.length>=2) rf.push(`${x.c}: Im Screenshot wurden mehrere zentrale Warnzeichen übersehen.`);
    } else if(x.manual){pts=a?.free?.length>=120?Math.round(x.p*.75):a?.free?.length>=70?Math.round(x.p*.55):a?.free?.length>=30?Math.round(x.p*.3):0}
    else if(x.t==='multi'){pts=multiPoints(x,a);if(x.rf&&(a?.choices||[]).some(c=>x.rf.includes(c)))rf.push(`${x.c}: ${x.q}`)}
    else if(a?.choice!=null){if(x.k.includes(a.choice))pts=x.p;else if(x.rf?.includes(a.choice))rf.push(`${x.c}: ${x.q}`)}
    got+=pts;cats[x.c].g+=pts;
  });
  const pct=Math.round(got/max*100); $('#scoreTitle').textContent=`${pct}% · ${level(pct)}`; $('#scoreIntro').textContent=`Automatisch bewertet: ${got} von ${max} Punkten. Screenshot-Labs bewerten erkannte und fälschlich markierte Stellen. Simulationen werden anhand der Entscheidungen gewichtet; Freitext bleibt eine Gesprächsaufgabe.`;
  $('#categoryScores').innerHTML=Object.entries(cats).map(([k,v])=>{const p=Math.round(v.g/v.m*100);return `<div class="score-row"><strong>${esc(k)}</strong><div class="meter"><i style="width:${p}%;--score:${p}%"></i></div><span>${p}%</span></div>`}).join('');
  $('#redFlags').innerHTML=rf.length?`<h2>Kritische Red Flags</h2>${rf.map(x=>`<div class="flag">${esc(x)}</div>`).join('')}<p>Red Flags sind Gesprächsanlässe, keine Bestrafungspunkte. Entscheidend ist, die Situation anschließend gemeinsam zu verstehen.</p>`:'<h2>Keine kritischen Red Flags erkannt</h2><p>Schwache Kategorien, Screenshot-Markierungen, Freitext-Begründungen und Entscheidungen innerhalb der Simulationen trotzdem gemeinsam ansehen.</p>';
  scrollTo(0,0);
};

const _v05CorrectText = correctText;
correctText = function(x){
  if(x.t==='hotspot') return x.v.regions.filter(r=>r.correct).map(r=>r.label).join(' · ');
  return _v05CorrectText(x);
};

let v05SessionReview=false;
const _v05OpenEducator=openEducator;
openEducator=function(a,fromResult=false){v05SessionReview=!!fromResult; return _v05OpenEducator(a,fromResult)};
const _v05RenderEducator=renderEducator;
renderEducator=function(fromResult=false){
  _v05RenderEducator(fromResult);
  $$('.edu-extra-v05').forEach(e=>e.remove());
  // enrich hotspot entries with screenshot thumbnails
  $$('.edu-item').forEach((detail)=>{});
  if(!v05SessionReview || !items.length) return;
  const rows=[];
  items.forEach((x,idx)=>{
    const a=answers[idx]; if(!a)return;
    if(x.t==='hotspot'){
      const assessment=hotspotAssessment(x,a), missed=assessment.missed;
      rows.push(`<div class="session-row ${missed.length||assessment.falseCount?'needs-review':'ok'}"><div><strong>${esc(x.q)}</strong><small>${esc(x.c)}</small></div><div><b>${hotspotPoints(x,a)} / ${x.p} P.</b>${missed.length?`<p><strong>Übersehen:</strong> ${missed.map(r=>esc(r.label)).join(' · ')}</p>`:'<p>Alle Kern-Warnzeichen erkannt.</p>'}${assessment.falseCount?`<p><strong>Zu viel markiert:</strong> ${assessment.falseLabels.map(esc).join(' · ')}</p>`:''}</div></div>`);
    } else if(x.t==='branch'){
      const st=a.branch; if(st)rows.push(`<div class="session-row"><div><strong>${esc(x.q)}</strong><small>${esc(x.c)}</small></div><div><b>${st.score} / ${st.max||0} Entscheidungspunkte</b><p>${st.history.filter(h=>h.points===0).length} deutlich riskante Entscheidung(en) im Verlauf.</p></div></div>`);
    }
  });
  if(rows.length){
    const box=document.createElement('section'); box.className='edu-extra-v05 session-review'; box.innerHTML=`<h2>Aktuelle Testsession · Nachbesprechung</h2><p>Hier siehst du nicht nur den Gesamtwert, sondern welche Warnzeichen in visuellen Aufgaben erkannt oder übersehen wurden.</p>${rows.join('')}`; $('#educatorSummary').after(box);
  }
};
