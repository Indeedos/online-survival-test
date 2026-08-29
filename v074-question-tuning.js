// v0.7.4 — remove overly specific core questions + clearer wording
// Runs before v058 answer randomization, so k/rf remapping remains unchanged.
(function(){
  const remove=new Set([
    'Eine Webseite zeigt ein Schloss-Symbol und HTTPS. Ist sie deshalb sicher?',
    'Welche Domain ist am ehesten verdächtig, wenn du dich bei Discord anmelden willst?',
    'Eine QR-Code-Karte verspricht gratis WLAN und öffnet eine Login-Seite. Was ist die sicherste Vorgehensweise?',
    'Eine Taschenlampen-App verlangt Zugriff auf Kontakte, Mikrofon und Standort. Was ist sinnvoll?',
    'Welche Datei kann besonders riskant sein?',
    'Was ist bei ZIP-Dateien wichtig?'
  ]);
  for(let n=Q.length-1;n>=0;n--){if(remove.has(Q[n]?.q))Q.splice(n,1)}

  function task(oldQ){return Q.find(x=>x?.q===oldQ)}
  function rename(oldQ,newQ){const x=task(oldQ);if(x)x.q=newQ;return x}
  function replaceOption(x,oldText,newText){
    if(!x||!Array.isArray(x.o))return;
    const idx=x.o.indexOf(oldText);
    if(idx>=0)x.o[idx]=newText;
  }

  rename(
    'Wenn du selbst nichts Beleidigendes schreibst, aber beleidigende Posts likest und weiterleitest, bist du völlig unbeteiligt.',
    'Wenn du selber nicht beleidigst, aber beleidigende Posts likest und weiterleitest, bist du unschuldig.'
  );
  rename(
    'Warum kann „Lösch einfach alles“ bei Cybermobbing problematisch sein?',
    'Warum sollte man Verläufe bei Cybermobbing nicht einfach löschen?'
  );
  const robux=task('Ein YouTube-Video verlinkt ein Programm für „Free Robux“. Was ist am sichersten?');
  replaceOption(robux,'Nur aus vertrauenswürdiger Quelle laden und Datei/Quelle prüfen; unbekannte EXE eher nicht ausführen','Nur aus vertrauenswürdiger Quelle laden und Datei/Quelle prüfen; unbekannte Programme nicht einfach starten');
  rename(
    'Ein Shop bietet eine Konsole für 90 % weniger als überall sonst. Was ist sinnvoll?',
    'Ein Shop bietet eine Konsole viel günstiger an, als überall sonst. Was ist sinnvoll?'
  );
  rename(
    'Jemand bietet dir an, deinen Gaming-Account gegen Geld „zu boosten“, braucht aber Login und 2FA. Was ist die beste Entscheidung?',
    'Jemand bietet dir an, für deinen Roblox-Account in einem Spiel für dich zu spielen, braucht aber dein Passwort und deinen Authentifizierungs-Code. Was ist die beste Entscheidung?'
  );
  rename(
    'Ein Account wurde übernommen. Welche Reihenfolge ist sinnvoll?',
    'Dein Account wurde übernommen/gehackt/geklaut. Welche Reihenfolge ist sinnvoll?'
  );
  rename(
    'Darfst du ein peinliches Foto eines Mitschülers einfach posten, wenn du es selbst gemacht hast?',
    'Darfst du ein peinliches Foto eines Mitschülers einfach öffentlich posten oder versenden, wenn du es selbst aufgenommen hast?'
  );
  const friendAccount=task('Welche Aussage ist richtig?');
  replaceOption(friendAccount,'Accounts von Freunden können übernommen werden','Accounts von Freunden könnten gestohlen worden sein.');
})();
