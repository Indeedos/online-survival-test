// v0.5.8 — wording fixes, answer-order randomization, richer review.
(function(){
  function shuffle(arr){
    for(let n=arr.length-1;n>0;n--){
      const j=Math.floor(Math.random()*(n+1));
      [arr[n],arr[j]]=[arr[j],arr[n]];
    }
    return arr;
  }

  // Randomize answer positions for every normal single/multiple-choice question.
  // Correct/red-flag indices are remapped so scoring stays identical.
  Q.forEach(x=>{
    if(!Array.isArray(x.o) || x.o.length<2 || x._answersRandomized) return;
    const order=shuffle(x.o.map((_,idx)=>idx));
    const pos=new Map(order.map((oldIdx,newIdx)=>[oldIdx,newIdx]));
    x.o=order.map(oldIdx=>x.o[oldIdx]);
    if(Array.isArray(x.k)) x.k=x.k.map(oldIdx=>pos.get(oldIdx));
    if(Array.isArray(x.rf)) x.rf=x.rf.map(oldIdx=>pos.get(oldIdx));
    x._answersRandomized=true;
  });

  // The branching simulations carry points in each choice itself, so choices can
  // be shuffled directly without changing their meaning or scoring.
  if(typeof BRANCH_SCENARIOS!=='undefined'){
    Object.values(BRANCH_SCENARIOS).forEach(s=>{
      Object.values(s.steps||{}).forEach(node=>{
        if(Array.isArray(node.choices) && node.choices.length>1 && !node._answersRandomized){
          shuffle(node.choices);
          node._answersRandomized=true;
        }
      });
    });
  }


  const FREE_MODEL_SOLUTIONS={
    'Fall: Verdächtige Nachricht': `<ul><li>Den SMS-Code <b>nicht weitergeben</b>; solche Codes können Logins, Passwort-Resets oder 2FA bestätigen.</li><li>Dem Chat nicht blind vertrauen, auch wenn Name und Profilbild zum Freund passen.</li><li>Den Freund über einen <b>anderen bekannten Kanal</b> kontaktieren, z. B. anrufen oder persönlich fragen.</li><li>Falls der Code zu einem eigenen Konto gehört: Konto/Sicherheitsmeldungen prüfen und bei Verdacht Passwort bzw. Sitzungen absichern.</li><li>Bei Unsicherheit eine erwachsene Vertrauensperson hinzuziehen.</li></ul>`,
    'Fall: Fremde Person im Game': `<ul><li>Erkennen, dass Alter und Identität von „Luca13“ online <b>nicht verifiziert</b> sind.</li><li>Schule, Stundenplan, Adresse, regelmäßige Orte und andere persönliche Informationen <b>nicht nennen</b>.</li><li>Kein privates Treffen allein vereinbaren.</li><li>Auf Druck, Geheimhaltung, Wechsel in private Chats oder immer persönlichere Fragen achten.</li><li>Grenze setzen und bei unangenehmem Verhalten Kontakt beenden/blockieren/melden.</li><li>Wenn ein Treffen überhaupt erwogen wird: vorher Eltern/Vertrauensperson einbeziehen und niemals heimlich oder allein treffen.</li></ul>`,
    'Fall: Virales Gerücht': `<ul><li>Das Video zunächst <b>nicht weiterleiten</b>.</li><li>Prüfen, wer die Behauptung veröffentlicht hat und ob konkrete Quellen genannt werden.</li><li>Die offizielle Website bzw. offiziellen Kanäle der betroffenen App prüfen.</li><li>Nach unabhängigen, seriösen Berichten über dieselbe Behauptung suchen.</li><li>Datum, Kontext und mögliche alte/geschnittene Inhalte prüfen.</li><li>Fehlen belastbare Bestätigungen, die Behauptung nicht als Tatsache behandeln.</li></ul>`,
    'Fall: Account-Kompromittierung': `<ol><li>Von einem vertrauenswürdigen Gerät aus das <b>E-Mail-Passwort sofort ändern</b>.</li><li>Andere aktive Sitzungen/Geräte abmelden und Recovery-E-Mail/-Telefon sowie Weiterleitungsregeln prüfen.</li><li>2FA aktivieren bzw. neu absichern und unbekannte Methoden entfernen.</li><li>Weil das Passwort wiederverwendet wurde, bei den drei anderen Diensten jeweils <b>ein neues, einzigartiges Passwort</b> setzen.</li><li>Konten auf verdächtige Änderungen/Nachrichten prüfen und Betroffene ggf. warnen.</li><li>Bei Problemen Support bzw. eine Vertrauensperson einbeziehen.</li></ol>`,
    'Fall: Sextortion / Erpressung': `<ul><li><b>Nicht zahlen</b> und kein weiteres Bild/Material senden; Forderungen können sonst weitergehen.</li><li>Kontakt möglichst nicht weiter verhandeln und nicht zurückdrohen.</li><li>Beweise sichern: Nachrichten, Nutzername, Profil, Forderungen und relevante Zeitpunkte dokumentieren, ohne das intime Bild unnötig weiterzuverbreiten.</li><li>Account blockieren und auf der Plattform melden, nachdem wichtige Beweise gesichert sind.</li><li>Sofort eine vertrauenswürdige erwachsene Person einbeziehen; bei Minderjährigen besonders wichtig.</li><li>Je nach Situation Polizei/Beratungsstelle/Plattformhilfe einschalten. Bei unmittelbarer Gefahr sofort Hilfe holen.</li></ul>`,
    'Fall: Deepfake-Stimme': `<ul><li>Keinen SMS-Code nennen und keine dringende Aktion allein wegen der vertrauten Stimme ausführen.</li><li>Anruf beenden und die Person über eine <b>bereits bekannte Telefonnummer</b> selbst zurückrufen.</li><li>Alternativ über einen zweiten bekannten Kanal oder eine weitere vertraute Person verifizieren.</li><li>Eine Information/Absprache prüfen, die nicht aus dem verdächtigen Anruf stammt.</li><li>Die angezeigte Rufnummer und die Stimme nicht als Identitätsbeweis behandeln.</li></ul>`,
    'Fall: Langsamer Vertrauensaufbau': `<ul><li>Einzelne Dinge wie gemeinsames Spielen, Zuhören oder ein kleines In-Game-Geschenk können für sich genommen harmlos sein.</li><li>Warnsignale sind die <b>Kombination und Entwicklung</b>: starke Bindung/Komplimente, persönliche Probleme ausfragen, Geschenke, Wechsel in privaten Chat, Eltern als Hindernis darstellen, Geheimhaltung und anschließend ein privates Foto verlangen.</li><li>Kein privates Bild schicken und keine weiteren persönlichen Informationen preisgeben.</li><li>Chat/Profil und relevante Nachrichten als Beleg sichern.</li><li>Kontakt begrenzen bzw. blockieren/melden und eine erwachsene Vertrauensperson einbeziehen.</li><li>Nicht versuchen, die Identität durch ein Treffen allein zu „testen“.</li></ul>`,
    'Fall: Freundschaft oder Druck?': `<ul><li>Normales Nachfragen kann okay sein, aber wiederholtes „Warum antwortest du nicht?“ oder Kontrolle darüber, mit wem man spielt, kann <b>Besitzanspruch und Druck</b> zeigen.</li><li>„Wenn wir echte Freunde sind, gibst du mir deine Nummer“ verknüpft Freundschaft mit einer Gegenleistung und ist emotionaler Druck.</li><li>Eine klare Grenze formulieren, z. B. dass man seine Nummer nicht geben möchte und nicht immer sofort antwortet.</li><li>Die Reaktion auf diese Grenze beobachten: Respekt ist gut; Schuldgefühle, Drohen oder weiterer Druck sind Warnzeichen.</li><li>Bei anhaltendem Druck Kontakt reduzieren/blockieren und Hilfe holen.</li></ul>`,
    'Visueller Praxisfall · Vertrauensaufbau in 6 Schritten': `<ul><li>Gemeinsames Spielen und lockerer Smalltalk können harmlos sein; auch einzelne Komplimente beweisen noch nichts.</li><li>Die Einschätzung sollte sich ändern, wenn gezielt Verletzlichkeit/Probleme abgefragt werden und der Kontakt in einen privateren Kanal verlagert wird.</li><li>Deutliche Warnzeichen sind <b>Geheimhaltung vor den Eltern</b> und anschließend die Bitte um ein persönliches Bild.</li><li>Entscheidend ist das Muster des schrittweisen Vertrauensaufbaus und der zunehmenden Isolation/Privatisierung.</li><li>Kein Bild senden, Belege sichern, Kontakt stoppen/blockieren/melden und eine erwachsene Vertrauensperson informieren.</li></ul>`,
    'Visueller Praxisfall · Profil + Chat zusammen denken': `<ul><li>Aus dem Profil lassen sich Alter, Schule, Hobby/Ort, die ungefähre Uhrzeit einer regelmäßigen Parkrunde und die Abwesenheit der Mutter kombinieren.</li><li>Dadurch kann die andere Person vorhersagen, <b>wo und wann</b> die Person wahrscheinlich anzutreffen ist und möglicherweise ohne Eltern unterwegs ist.</li><li>Solche Posts/Profilangaben entfernen oder weniger konkret machen und Privatsphäre-Einstellungen prüfen.</li><li>Auf die Orts-/Zeitfrage nicht eingehen und keine weiteren Routinen bestätigen.</li><li>Bei verdächtigem Verhalten blockieren/melden und einer Vertrauensperson Bescheid sagen.</li></ul>`
  };

  function optionText(x,idx){
    return Number.isInteger(idx) && x.o?.[idx]!=null ? x.o[idx] : 'Keine Antwort';
  }
  function expectedOptions(x){
    return (x.k||[]).map(n=>optionText(x,n));
  }
  function questionPoints(x,a){
    if(x.t==='branch'){
      const st=a?.branch; return st?.max?Math.round(x.p*(st.score/st.max)):0;
    }
    if(x.t==='hotspot') return hotspotPoints(x,a);
    if(x.t==='imagegrid') return imageGridPoints(x,a);
    if(x.manual) return a?.free?.length>=120?Math.round(x.p*.75):a?.free?.length>=70?Math.round(x.p*.55):a?.free?.length>=30?Math.round(x.p*.3):0;
    if(x.t==='multi') return multiPoints(x,a);
    return a?.choice!=null && x.k?.includes(a.choice) ? x.p : 0;
  }
  function answerStatus(x,a){
    if(x.t==='free') return a?.free?.trim()?'answered':'unanswered';
    return questionPoints(x,a)>=x.p?'correct':questionPoints(x,a)>0?'partial':'wrong';
  }
  function statusLabel(st){
    return st==='correct'?'Richtig':st==='partial'?'Teilweise':st==='answered'?'Bearbeitet':'Noch nicht richtig';
  }

  function markLabel(x,m){
    const r=(x.v?.regions||[]).find(r=>markInsideRegion(m,r));
    if(r) return r.label;
    return `Freie Stelle bei ${Math.round(m.x)}% / ${Math.round(m.y)}%`;
  }
  function hotspotPreview(x,a){
    const marks=a?.marks||[];
    const expected=(x.v?.regions||[]).filter(r=>r.correct);
    return `<div class="review-shot-wrap">
      <img src="${esc(x.v.src)}" alt="${esc(x.v.alt||'Screenshot-Aufgabe')}">
      ${expected.map(r=>`<span class="review-expected-box" style="left:${r.x}%;top:${r.y}%;width:${r.w}%;height:${r.h}%" title="Erwartet: ${esc(r.label)}"></span>`).join('')}
      ${marks.map((m,n)=>`<span class="review-user-mark" style="left:${m.x}%;top:${m.y}%" title="Deine Markierung ${n+1}">${n+1}</span>`).join('')}
    </div><div class="review-legend"><span><i class="legend-dot user"></i>Deine Markierung</span><span><i class="legend-box expected"></i>Erwarteter Bereich</span></div>`;
  }

  function branchReview(x,a){
    const st=a?.branch, scenario=BRANCH_SCENARIOS?.[x.scenarioId];
    if(!st?.history?.length || !scenario) return '<p>Keine Entscheidungen gespeichert.</p>';
    return `<div class="branch-review-list">${st.history.map((h,n)=>{
      const node=scenario.steps[h.node];
      const choices=node?.choices||[];
      const max=choices.length?Math.max(...choices.map(c=>c[2])):h.points;
      const best=choices.filter(c=>c[2]===max).map(c=>c[0]);
      return `<div class="branch-review-step ${h.points===max?'ok':'needs-review'}"><strong>${n+1}. Deine Entscheidung:</strong><p>${esc(h.choice)}</p><p><b>Einordnung:</b> ${esc(h.feedback)}</p>${h.points===max?'':`<p><b>Erwartet/stärker:</b> ${best.map(esc).join(' / ')}</p>`}</div>`;
    }).join('')}</div>`;
  }

  function imageGridReview(x,a){
    const map=a?.imagegrid||{}, conf=a?.confidence||{};
    const byId=Object.fromEntries((x.v.people||[]).map(p=>[p.id,p]));
    const order=(x.v._order||x.v.people.map(p=>p.id)).filter(id=>byId[id]);
    return `<div class="imagegrid-review">${order.map((id,n)=>{
      const p=byId[id], chosen=map[id];
      const chosenText=chosen==='real'?'Echte Fotografie':chosen==='ai'?'KI-generiert':'Keine Antwort';
      const expected=p.kind==='real'?'Echte Fotografie':'KI-generiert';
      const ok=chosen===p.kind;
      return `<div class="imagegrid-review-row ${ok?'ok':'needs-review'}"><strong>Bild ${n+1}</strong><span>Deine Antwort: ${esc(chosenText)}</span><span>Erwartet: ${esc(expected)}</span><span>Sicherheit: ${Number.isFinite(+conf[id])?Math.round(+conf[id])+'%':'–'}</span></div>`;
    }).join('')}</div>`;
  }

  function questionDetail(x,a,idx){
    const pts=questionPoints(x,a), st=answerStatus(x,a);
    let body='';
    if(x.t==='hotspot'){
      const assess=hotspotAssessment(x,a);
      const marked=(a?.marks||[]).map(m=>markLabel(x,m));
      body=`${hotspotPreview(x,a)}<p><b>Deine Markierungen:</b> ${marked.length?marked.map(esc).join(' · '):'Keine'}</p><p><b>Erwartet:</b> ${assess.correct.map(r=>esc(r.label)).join(' · ')}</p>`;
    } else if(x.t==='branch'){
      body=branchReview(x,a);
    } else if(x.t==='imagegrid'){
      body=imageGridReview(x,a);
    } else if(x.t==='free'){
      const model=FREE_MODEL_SOLUTIONS[x.q]||`<p>Eine gute Antwort benennt die wichtigsten Risiken, begründet die Einschätzung und beschreibt konkrete sichere nächste Schritte.</p>`;
      body=`<p><b>Deine Antwort:</b></p><blockquote>${esc(a?.free||'Keine Antwort')}</blockquote><div class="model-solution"><p><b>Musterlösung · wichtige Punkte:</b></p>${model}</div>${x.edu?`<p class="review-edu-hint"><b>Gesprächshinweis:</b> ${esc(x.edu)}</p>`:''}`;
    } else if(x.t==='multi'){
      const chosen=(a?.choices||[]).map(n=>optionText(x,n));
      body=`<p><b>Deine Auswahl:</b> ${chosen.length?chosen.map(esc).join(' · '):'Keine Antwort'}</p><p><b>Erwartet:</b> ${expectedOptions(x).map(esc).join(' · ')}</p>`;
    } else {
      body=`<p><b>Deine Antwort:</b> ${esc(optionText(x,a?.choice))}</p><p><b>Erwartet:</b> ${expectedOptions(x).map(esc).join(' / ')}</p>`;
    }
    return `<details class="answer-review ${st}" ${st==='wrong'||st==='partial'?'open':''}><summary><span>${idx+1}. ${esc(x.q)}</span><b>${statusLabel(st)} · ${pts}/${x.p} P.</b></summary><div class="answer-review-body"><small>${esc(x.c)} · ${esc(x.d)}</small>${body}</div></details>`;
  }

  function renderDetailedReview(){
    const result=$('#result'); if(!result || !items.length) return;
    result.querySelectorAll('.detailed-answer-review').forEach(e=>e.remove());
    const article=document.createElement('article');
    article.className='card detailed-answer-review';
    article.innerHTML=`<h2>Deine Antworten im Detail</h2><p class="review-intro">Hier siehst du genau, was du ausgewählt oder markiert hast und was bei der automatischen Auswertung erwartet wurde. Falsche und teilweise richtige Antworten sind aufgeklappt.</p><div class="answer-review-list">${items.map((x,idx)=>questionDetail(x,answers[idx],idx)).join('')}</div>`;
    const hint=result.querySelector('.card.educator');
    result.insertBefore(article,hint||null);
  }

  const oldFinish=finish;
  finish=function(){
    oldFinish();
    renderDetailedReview();
  };
})();
