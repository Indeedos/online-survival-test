// v0.4 Eltern-/Lehrer-Modus
const EDUCATOR_NOTES={
 'Fremde Personen & Grooming':'Achte besonders auf Muster: schneller Vertrauensaufbau, Isolation, Geheimhaltung, Geschenke mit Gegenleistung, Schuldgefühl, Wechsel in private Kanäle, persönliche Bilder und heimliche Treffen. Ziel ist nicht „Fremde sind böse“, sondern Grenzen und Unsicherheit kompetent zu handhaben.',
 'Cybermobbing & Gruppendruck':'Besprecht aktive und passive Rollen. Nicht mitmachen ist wichtig; je nach Belastung kann zusätzlich Unterstützung, Dokumentation und erwachsene Hilfe nötig sein.',
 'Chats & Social Engineering':'Prüfe, ob das Kind emotionale Manipulation erkennt: Dringlichkeit, Autorität, Schuld, Freundschaftsbeweis und Angst vor Verlust.',
 'Notfälle & Hilfe holen':'Kernziel: Das Kind soll wissen, dass es nach Fehlern Hilfe holen darf. Keine Bestrafungslogik daraus machen.',
 'Datenschutz & Standort':'Nicht nur einzelne Daten betrachten, sondern Kombinationen aus Schule, Routine, Verein, Bildern, Standort und Freundeskreis.',
 'Praxisfälle':'Freitext und Simulationen gemeinsam durchgehen. Entscheidend ist die Begründung, nicht nur der Punktewert.'
};
let educatorAge=13;
$$('.role').forEach(b=>b.onclick=()=>{$$('.role').forEach(x=>x.classList.toggle('active',x===b));const edu=b.dataset.role==='educator';$('#childStart').classList.toggle('hidden',edu);$('#educatorStart').classList.toggle('hidden',!edu)});
$$('.educator-open').forEach(b=>b.onclick=()=>openEducator(+b.dataset.educatorAge));
$('#educatorBack').onclick=()=>{$('#educatorPanel').classList.add('hidden');$('#start').classList.remove('hidden')};
$('#educatorPrint').onclick=()=>window.print();
$('#educatorAge').onchange=e=>{educatorAge=+e.target.value;renderEducator()};
$('#educatorCategory').onchange=renderEducator;
$('#reviewBtn').onclick=()=>{openEducator(age,true)};
function openEducator(a,fromResult=false){educatorAge=a;$('#start').classList.add('hidden');$('#quiz').classList.add('hidden');$('#result').classList.add('hidden');$('#educatorPanel').classList.remove('hidden');$('#educatorAge').value=String(a);buildEducatorCategories();renderEducator(fromResult);scrollTo(0,0)}
function buildEducatorCategories(){const sel=$('#educatorCategory');const cur=sel.value;const cats=[...new Set(Q.filter(x=>x.a<=educatorAge).map(x=>x.c))];sel.innerHTML='<option value="all">Alle Bereiche</option>'+cats.map(c=>`<option>${esc(c)}</option>`).join('');if([...sel.options].some(o=>o.value===cur))sel.value=cur}
function correctText(x){if(x.t==='free')return 'Offene Gesprächsaufgabe – anhand der Begründung auswerten.';if(x.t==='branch')return 'Verzweigte Simulation – Verlauf und Begründungen gemeinsam ansehen.';return (x.k||[]).map(k=>x.o[k]).join(' · ')}
function renderEducator(fromResult=false){buildEducatorCategories();const cat=$('#educatorCategory').value;const qs=Q.filter(x=>x.a<=educatorAge&&(cat==='all'||x.c===cat));const risky=qs.filter(x=>x.rf?.length||x.c==='Fremde Personen & Grooming'||x.t==='branch').length;$('#educatorTitle').textContent=`Auswertungsleitfaden · ${educatorAge} Jahre`;
 $('#educatorSummary').innerHTML=`<div class="edu-stat"><strong>${qs.length}</strong><span>Aufgaben im Filter</span></div><div class="edu-stat"><strong>${risky}</strong><span>besonders relevante Safety-Aufgaben</span></div><div class="edu-stat"><strong>${qs.filter(x=>x.t==='branch').length}</strong><span>verzweigte Simulationen</span></div><div class="edu-note"><strong>Wichtig:</strong> Der Test ist ein Gesprächswerkzeug, keine diagnostische Prüfung. Bei Grooming/Erpressung sollte die Botschaft immer sein: Kontakt stoppen oder begrenzen, Beweise sichern, nicht weiter nachgeben und eine geeignete Vertrauensperson einbeziehen.</div>`;
 const groups=[...new Set(qs.map(x=>x.c))];$('#educatorGuide').innerHTML=groups.map(c=>{const arr=qs.filter(x=>x.c===c);return `<section class="edu-group"><h2>${esc(c)}</h2>${EDUCATOR_NOTES[c]?`<p class="edu-category-note">${esc(EDUCATOR_NOTES[c])}</p>`:''}${arr.map((x,n)=>`<details class="edu-item"><summary><span>${esc(x.d)}</span>${esc(x.q)}</summary><div class="edu-answer"><strong>Erwartete Kernantwort:</strong><p>${esc(correctText(x))}</p>${x.edu?`<p class="edu-insight"><strong>Pädagogischer Fokus:</strong> ${esc(x.edu)}</p>`:''}${x.rf?.length?`<p class="edu-warning"><strong>Kritische Fehlentscheidungen:</strong> ${x.rf.map(k=>esc(x.o[k])).join(' · ')}</p>`:''}${x.t==='free'?'<p><strong>Gesprächsimpuls:</strong> Nach Warnzeichen, Begründung, konkreter Handlung und „Wen würdest du um Hilfe bitten?“ fragen.</p>':''}${x.t==='branch'?'<p><strong>Gesprächsimpuls:</strong> Nicht nur Endpunkt betrachten. Fragt, an welcher Nachricht sich die Einschätzung geändert hat und warum.</p>':''}</div></details>`).join('')}</section>`}).join('');
}
