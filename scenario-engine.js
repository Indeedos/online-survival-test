// v0.4 – branching scenario engine. Fictional situations; no data leaves the browser.
const BRANCH_SCENARIOS = {
  groomingTrust: {
    title:'Simulation · Vertrauen, Grenzen & Grooming', person:'Kai_13', category:'Fremde Personen & Grooming',
    intro:'Du kennst Kai aus einem Multiplayer-Spiel. Die Simulation reagiert auf deine Entscheidungen. Es geht nicht darum, jede Bekanntschaft als gefährlich zu sehen, sondern Muster, Druck und Grenzen zu erkennen.',
    steps:{
      start:{messages:[['Kai_13','gg 😄 war nice mit dir'],['Kai_13','Spielst du morgen wieder?']], prompt:'Was antwortest du?', choices:[
        ['Klar, vermutlich schon 🙂','hobby',2,'Unproblematischer Smalltalk – ohne private Daten.'],
        ['Ja! Ich heiße übrigens Leon, bin 13 und wohne in der Nähe vom Stadtpark.','overshare',0,'Zu viele persönliche Angaben sind für den Gesprächszweck nicht nötig.'],
        ['Wer bist du genau? Schick Ausweis.','hobby',1,'Vorsicht ist okay, aber ein Ausweisfoto wäre selbst kein verlässlicher oder angemessener Identitätsnachweis.'] ]},
      hobby:{messages:[['Kai_13','same 😄 du bist echt entspannter als die meisten'],['Kai_13','Mit dir kann man irgendwie über alles reden. Stress zuhause manchmal?']],prompt:'Wie gehst du damit um?',choices:[
        ['Bisschen Smalltalk okay, aber private Probleme behalte ich erstmal für mich.','privateMove',3,'Gute Grenze: freundlich bleiben, ohne schnell verletzliche Informationen preiszugeben.'],
        ['Ja, ziemlich. Meine Eltern streiten oft und ich bin dann meistens allein.','privateMoveRisk',0,'Das kann echte Verletzlichkeit offenlegen, bevor du weißt, wer die Person ist.'],
        ['Ich erzähle absichtlich etwas Falsches, um Kai zu testen.','privateMove',1,'Falsche Angaben schützen zwar Details, sind aber kein zuverlässiger Sicherheitstest.'] ]},
      overshare:{messages:[['Kai_13','Ahh nice, Stadtpark kenn ich 👀'],['Kai_13','Welche Schule bist du? Vielleicht hab ich dich schon gesehen.']],prompt:'Was jetzt?',choices:[
        ['Schule nicht nennen und erstmal keine weiteren Ortsinfos geben.','privateMove',3,'Du begrenzt den Informationsfluss, nachdem bereits einiges bekannt ist.'],
        ['Nur den Schulnamen, keine Klasse.','privateMoveRisk',0,'Der Schulname kann zusammen mit anderen Angaben bereits sehr konkret sein.'],
        ['Ich frage erst nach seiner Schule und sage meine dann auch.','privateMoveRisk',0,'Gegenseitiges Teilen macht eine unbekannte Identität nicht automatisch sicher.'] ]},
      privateMove:{messages:[['Kai_13','Hier nerven Mods manchmal. Hast du Snap?'],['Kai_13','Da können wir entspannter reden. Musst deinen Eltern ja nicht alles erzählen 😅']],prompt:'Wie bewertest du das?',choices:[
        ['Ich bleibe erstmal hier. Wechsel + Geheimhaltung zusammen finde ich auffällig.','gift',4,'Du erkennst das Muster statt nur einen einzelnen Satz zu bewerten.'],
        ['Snap ist okay, solange ich keine Bilder sende.','giftRisk',1,'Ein Plattformwechsel ist nicht automatisch gefährlich, aber zusammen mit Geheimhaltung steigt das Risiko.'],
        ['Ich gebe meine Nummer; Telefon ist privater und damit sicherer.','giftRisk',0,'Mehr direkte Kontaktdaten erhöhen eher die Erreichbarkeit und den Informationsgewinn.'] ]},
      privateMoveRisk:{messages:[['Kai_13','Danke, dass du mir sowas erzählst ❤️'],['Kai_13','Hier lesen manchmal Mods. Lass auf Snap weiterreden – da bleibt das unter uns.']],prompt:'Was tust du?',choices:[
        ['Ich stoppe das persönliche Gespräch, teile keine weiteren Kontaktdaten und bespreche das mit einer Vertrauensperson.','gift',4,'Starke Reaktion: Grenze + Unterstützung.'],
        ['Ich wechsle, aber lösche Chats regelmäßig.','giftRisk',0,'Löschen beseitigt das Grundproblem nicht und kann Beweise vernichten.'],
        ['Ich wechsle, solange Kai nett bleibt.','giftRisk',0,'Nettigkeit ist keine Sicherheitsgarantie.'] ]},
      gift:{messages:[['Kai_13','Hab dir übrigens 15€ Game-Guthaben geschickt 🙂'],['Kai_13','Einfach so. Du bedeutest mir halt was.']],prompt:'Was ist die beste Haltung?',choices:[
        ['Danke sagen ist okay, aber ich schulde dafür keinerlei persönlichen Gefallen.','photo',4,'Geschenke dürfen nie zur Verpflichtung für Nähe, Bilder oder Geheimnisse werden.'],
        ['Dann sollte ich zumindest einen kleinen Gefallen zurückgeben.','photoPressure',0,'Genau dieses Schuldgefühl kann ausgenutzt werden.'],
        ['Wenn das Guthaben echt ist, beweist es, dass Kai vertrauenswürdig ist.','photoPressure',0,'Ein Geschenk beweist weder Alter noch Absicht.'] ]},
      giftRisk:{messages:[['Kai_13','Hab dir Guthaben geholt 😌'],['Kai_13','Jetzt weißt du ja, dass ich es ernst meine.']],prompt:'Wie reagierst du?',choices:[
        ['Ich mache klar, dass ein Geschenk keine Gegenleistung bedeutet.','photo',4,'Das setzt eine klare Grenze.'],
        ['Ich frage, was Kai dafür möchte.','photoPressure',1,'Damit öffnest du eine Verhandlung über Gegenleistungen.'],
        ['Ich schicke auch ein Geschenk zurück, dann sind wir quitt.','photoPressure',1,'Das löst Manipulationsdruck nicht zuverlässig.'] ]},
      photo:{messages:[['Kai_13','Kannst du mir ein Bild schicken, das sonst keiner hat?'],['Kai_13','Nur Gesicht reicht. Einmal ansehen, speicher ich eh nicht.']],prompt:'Was tust du?',choices:[
        ['Nein. Ich muss keine privaten Bilder schicken und „einmal ansehen“ verhindert Kopien nicht sicher.','meet',5,'Du erkennst Kontrollverlust nach dem Versenden.'],
        ['Nur ein normales Gesichtsfoto, weil das nicht intim ist.','photoPressure',1,'Auch harmlose Bilder können für Identität, Druck oder weitere Grenztests genutzt werden.'],
        ['Nur wenn Kai zuerst eins schickt.','photoPressure',0,'Gegenseitigkeit bestätigt Identität nicht und macht das Teilen nicht sicher.'] ]},
      photoPressure:{messages:[['Kai_13','Wow okay. Nach allem was ich für dich gemacht hab?'],['Kai_13','Wenn du mir vertraust, beweis es einfach.']],prompt:'Welche Reaktion ist am stärksten?',choices:[
        ['Ich bleibe bei Nein. Vertrauen muss ich nicht durch Bilder beweisen. Bei weiterem Druck hole ich Hilfe.','meet',5,'Klare Grenze, Manipulation erkannt, Hilfeoption vorhanden.'],
        ['Ich schicke etwas Harmloses, damit Kai nicht sauer ist.','meetRisk',0,'Nachgeben unter Schuld- oder Beziehungsdruck verstärkt das Muster.'],
        ['Ich entschuldige mich lange, damit die Freundschaft nicht kaputtgeht.','meetRisk',1,'Du darfst Grenzen setzen, ohne sie rechtfertigen zu müssen.'] ]},
      meet:{messages:[['Kai_13','Okay schon gut 😅'],['Kai_13','Dann lass wenigstens mal treffen? Einkaufszentrum, da sind Leute. Aber sag zuhause nichts, sonst wirds kompliziert.']],prompt:'Was ist die sicherste Entscheidung?',choices:[
        ['Nicht heimlich treffen. Vertrauensperson einbeziehen und Situation gemeinsam prüfen.','endSafe',5,'Öffentlichkeit allein macht ein Treffen mit unbekannter Identität nicht sicher.'],
        ['Einkaufszentrum ist öffentlich, also kann ich allein hingehen.','endRisk',0,'Öffentlicher Ort reduziert manche Risiken, ersetzt aber keine Einbeziehung einer Vertrauensperson.'],
        ['Ich nehme einen Freund mit, sage Erwachsenen aber nichts.','endRisk',1,'Besser als allein, aber Geheimhaltung bleibt ein starkes Warnsignal.'] ]},
      meetRisk:{messages:[['Kai_13','Bitte echt niemandem sagen. Sonst darf ich bestimmt auch nicht kommen.'],['Kai_13','Wenn du absagst, lösche ich dich.']],prompt:'Was jetzt?',choices:[
        ['Absagen, nicht allein hingehen, Verlauf sichern und einer Vertrauensperson zeigen.','endSafe',5,'Du priorisierst Sicherheit über Druck und Geheimhaltung.'],
        ['Hingehen, damit Kai mich nicht löscht.','endRisk2',0,'Beziehungsdruck ist kein Grund, eine riskante Situation einzugehen.'],
        ['Treffpunkt kurzfristig ändern und schauen, wie Kai reagiert.','endRisk2',1,'Ein Test ersetzt keine sichere Planung und Identitätsprüfung.'] ]},
      endRisk:{messages:[['Kai_13','Perfekt. Komm einfach allein, sonst ist es awkward.'],['Kai_13','Und lösch unseren Chat vorher kurz.']],prompt:'Letzte Entscheidung',choices:[
        ['Nicht hingehen, nichts löschen, Unterstützung holen.','endSafe',5,'Mehrere klare Warnsignale: Isolation, Geheimhaltung und Beweise löschen.'],
        ['Chat löschen, aber Screenshot vom Treffpunkt behalten.','endRisk2',0,'Beweise löschen ist problematisch; das Treffen bleibt riskant.'],
        ['Nur kurz hingehen und in Sichtweite anderer bleiben.','endRisk2',0,'Die grundlegenden Warnsignale bleiben bestehen.'] ]},
      endRisk2:{messages:[['System','Die Simulation endet hier.']],prompt:'Was nimmst du aus dem Verlauf mit?',choices:[['Ich würde spätestens jetzt eine erwachsene Vertrauensperson einbeziehen.','endSafe',4,'Hilfe holen ist besonders wichtig, wenn Druck, Geheimhaltung oder Treffen zusammenkommen.'],['Ich würde versuchen, das alleine zu klären.','endSafe',0,'Gerade bei eskalierendem Druck ist Unterstützung sinnvoll.']]},
      endSafe:{end:true}
    }
  },
  groupPressure:{
    title:'Simulation · Gruppenchat, Grenzen & Mobbing',person:'Klassenchat',category:'Cybermobbing & Gruppendruck',intro:'Ein Klassenchat kippt langsam. Du entscheidest, wie du reagierst.',
    steps:{
      start:{messages:[['Mia','Habt ihr das Referat von Ben gesehen 😭'],['Tom','💀💀💀'],['Lena','war schon bisschen wild haha']],prompt:'Was tust du?',choices:[['Ich mache nicht beim Lächerlichmachen mit.','escalate',3,'Du verstärkst die Situation nicht.'],['Ich schicke nur ein 😂, das ist ja nicht wirklich Mobbing.','escalateRisk',0,'Reaktionen können Gruppendruck und Bloßstellung verstärken.'],['Ich leite es an einen anderen Chat weiter.','escalateRisk',0,'Weiterverbreiten vergrößert die Bloßstellung.']]},
      escalate:{messages:[['Tom','Hab beim Referat ein peinliches Foto von Ben gemacht 😂'],['Mia','post mal'],['Ben','Leute hört bitte auf']],prompt:'Wie reagierst du?',choices:[['Ich schreibe, dass Ben klar Stopp gesagt hat und wir den Screenshot nicht weiterteilen sollten.','dm',4,'Du respektierst eine klare Grenze und wirkst gegen Gruppendruck.'],['Ich sage gar nichts; ich bin ja nicht beteiligt.','dm',1,'Nicht mitmachen ist besser als verstärken, aber Unterstützung kann wichtig sein.'],['Ich frage Ben privat, ob wir wenigstens intern lachen dürfen.','dm',1,'Das verschiebt die Verantwortung auf die betroffene Person.']]},
      escalateRisk:{messages:[['Tom','Hier 😂'],['Mia','HAHA'],['Ben','Bitte löschen. Ernsthaft.']],prompt:'Was jetzt?',choices:[['Ich höre auf, lösche eigene Weiterleitungen/Reaktionen soweit möglich und unterstütze Ben.','dm',4,'Korrigieren ist auch nach einem Fehler möglich.'],['Jetzt ist es eh zu spät, also mache ich weiter.','dmRisk',0,'Ein früher Fehler ist kein Grund, weiter Schaden zu verursachen.'],['Ich sage Ben, er soll nicht so empfindlich sein.','dmRisk',0,'Das entwertet seine Grenze.']]},
      dm:{messages:[['Ben (privat)','Danke. Ich will morgen eigentlich gar nicht in die Schule. Bitte sag keinem Erwachsenen was.']],prompt:'Wie antwortest du?',choices:[['Ich nehme ihn ernst und erkläre, dass wir bei ernstem Druck Hilfe holen können – möglichst gemeinsam.','endSafe',5,'Unterstützung bedeutet nicht, gefährliche Situationen geheim zu halten.'],['Ich verspreche absolute Geheimhaltung.','dmRisk',1,'Bei deutlicher Belastung kann Hilfe wichtiger sein als ein Geheimversprechen.'],['Ich poste die Nachricht im Klassenchat, damit alle sehen wie schlimm es ist.','dmRisk',0,'Private Hilferufe sollten nicht öffentlich gemacht werden.']]},
      dmRisk:{messages:[['Ben','Bitte wirklich niemandem sagen. Ich pack das nicht mehr.']],prompt:'Was ist jetzt wichtig?',choices:[['Bei so deutlicher Belastung Unterstützung durch eine geeignete erwachsene Person organisieren und bei unmittelbarer Gefahr sofort Hilfe holen.','endSafe',5,'Sicherheit geht vor Geheimhaltung.'],['Nur schreiben, dass morgen bestimmt alles besser ist.','endSafe',1,'Zuwendung hilft, ersetzt bei ernster Belastung aber nicht unbedingt Unterstützung.']]},
      endSafe:{end:true}
    }
  }
};

Q.push(
 {a:11,c:'Praxisfälle',d:'Simulation',q:'Interaktive Simulation · Online-Bekanntschaft',t:'branch',scenarioId:'groomingTrust',p:30},
 {a:11,c:'Praxisfälle',d:'Simulation',q:'Interaktive Simulation · Klassenchat',t:'branch',scenarioId:'groupPressure',p:17}
);

const _baseRender=render, _baseSave=save, _baseFinish=finish;
function branchState(idx,x){if(!answers[idx]||!answers[idx].branch)answers[idx]={branch:{node:'start',score:0,max:0,history:[],done:false}};return answers[idx].branch}
function renderBranch(x){
 const s=BRANCH_SCENARIOS[x.scenarioId], st=branchState(i,x), node=s.steps[st.node];
 $('#categoryTitle').textContent=x.c;$('#categoryTag').textContent=x.c;$('#difficulty').textContent=x.d;$('#questionText').textContent=s.title;
 $('#progressText').textContent=`${i+1} / ${items.length}`;$('#progressBar').style.width=((i+1)/items.length*100)+'%';
 $('#scenario').classList.remove('hidden');$('#scenario').textContent=s.intro;$('#visual').classList.add('hidden');$('#answers').innerHTML='';$('#freeWrap').classList.add('hidden');
 const stage=$('#branchStage');stage.classList.remove('hidden');
 if(node.end||st.done){stage.innerHTML=`<div class="branch-complete"><h3>Simulation abgeschlossen</h3><p>Du hast ${st.score} von ${Math.max(1,st.max)} Entscheidungspunkten erreicht.</p><div class="branch-history">${st.history.map(h=>`<div><strong>${esc(h.choice)}</strong><span>${esc(h.feedback)}</span></div>`).join('')}</div></div>`;$('#nextBtn').disabled=false;return;}
 stage.innerHTML=`<div class="branch-chat"><div class="branch-chat-head"><span class="avatar">${esc(s.person[0])}</span><div><strong>${esc(s.person)}</strong><small>Simulierter Chat</small></div></div><div class="chat-body">${node.messages.map(m=>`<div class="msg them"><small>${esc(m[0])}</small><span>${esc(m[1])}</span></div>`).join('')}</div></div><h4>${esc(node.prompt)}</h4><div class="branch-choices">${node.choices.map((c,n)=>`<button type="button" data-branch-choice="${n}">${esc(c[0])}</button>`).join('')}</div><div id="branchFeedback" class="branch-feedback hidden"></div><div class="branch-counter">Entscheidung ${st.history.length+1}</div>`;
 $('#nextBtn').disabled=true;
 $$('[data-branch-choice]').forEach(b=>b.onclick=()=>chooseBranch(+b.dataset.branchChoice,x,s,node,st));
}
function chooseBranch(n,x,s,node,st){
 const c=node.choices[n]; st.score+=c[2]; st.max+=Math.max(...node.choices.map(z=>z[2])); st.history.push({node:st.node,choice:c[0],points:c[2],feedback:c[3]}); st.node=c[1];
 const fb=$('#branchFeedback');fb.classList.remove('hidden');fb.innerHTML=`<strong>Einordnung:</strong> ${esc(c[3])}`;
 $$('[data-branch-choice]').forEach(b=>b.disabled=true);
 const next=s.steps[st.node]; const cont=document.createElement('button');cont.className='branch-continue';cont.textContent=next?.end?'Simulation abschließen':'Chat fortsetzen';cont.onclick=()=>{if(next?.end)st.done=true;renderBranch(x)};fb.appendChild(cont);
}
render=function(){const x=items[i];$('#branchStage').classList.add('hidden');$('#nextBtn').disabled=false;if(x?.t==='branch')return renderBranch(x);return _baseRender()}
save=function(){const x=items[i];if(x?.t==='branch')return;return _baseSave()}
finish=function(){
 save();$('#quiz').classList.add('hidden');$('#result').classList.remove('hidden');let got=0,max=0,rf=[],cats={};
 items.forEach((x,idx)=>{max+=x.p;cats[x.c]??={g:0,m:0};cats[x.c].m+=x.p;const a=answers[idx];let pts=0;
  if(x.t==='branch'){const st=a?.branch;if(st?.max)pts=Math.round(x.p*(st.score/st.max)); if(st?.history?.some(h=>h.points===0)&&x.scenarioId==='groomingTrust')rf.push(`${x.c}: In der Simulation wurden riskante Druck-/Privatsphäre-Entscheidungen gewählt.`)}
  else if(x.manual){pts=a?.free?.length>=120?Math.round(x.p*.75):a?.free?.length>=70?Math.round(x.p*.55):a?.free?.length>=30?Math.round(x.p*.3):0}
  else if(x.t==='multi'){pts=multiPoints(x,a);if(x.rf&&(a?.choices||[]).some(c=>x.rf.includes(c)))rf.push(`${x.c}: ${x.q}`)}
  else if(a?.choice!=null){if(x.k.includes(a.choice))pts=x.p;else if(x.rf?.includes(a.choice))rf.push(`${x.c}: ${x.q}`)}
  got+=pts;cats[x.c].g+=pts});
 const pct=Math.round(got/max*100);$('#scoreTitle').textContent=`${pct}% · ${level(pct)}`;$('#scoreIntro').textContent=`Automatisch bewertet: ${got} von ${max} Punkten. Simulationen werden anhand der getroffenen Entscheidungen gewichtet. Freitext-Aufgaben bleiben Gesprächsaufgaben.`;
 $('#categoryScores').innerHTML=Object.entries(cats).map(([k,v])=>{const p=Math.round(v.g/v.m*100);return `<div class="score-row"><strong>${esc(k)}</strong><div class="meter"><i style="width:${p}%"></i></div><span>${p}%</span></div>`}).join('');
 $('#redFlags').innerHTML=rf.length?`<h2>Kritische Red Flags</h2>${rf.map(x=>`<div class="flag">${esc(x)}</div>`).join('')}`:'<h2>Keine kritischen Red Flags erkannt</h2><p>Schwache Kategorien, Freitext-Begründungen und Entscheidungen innerhalb der Simulationen trotzdem gemeinsam ansehen.</p>';scrollTo(0,0)
}
