// v0.6.6 — messenger-style visual simulations
(function(){
  const previous=window.renderVisual;
  const safe=s=>typeof esc==='function'?esc(s):String(s??'');
  const initial=name=>(String(name||'?').trim()[0]||'?').toUpperCase();
  const header=(name,status='online',group=false)=>`<div class="msgapp-head"><div class="msgapp-avatar">${safe(group?'#':initial(name))}</div><div class="msgapp-person"><strong>${safe(name)}</strong><span><i></i>${safe(status||'online')}</span></div><div class="msgapp-actions" aria-hidden="true"><span>⌕</span><span>⋮</span></div></div>`;
  const bubbles=messages=>`<div class="msgapp-thread">${(messages||[]).map(m=>{const mine=m[0]==='me';return `<div class="msgapp-row ${mine?'mine':'theirs'}">${!mine?`<small>${safe(m[0])}</small>`:''}<div class="msgapp-bubble">${safe(m[1])}</div></div>`}).join('')}</div>`;

  window.renderVisual=function(v){
    if(!v || !['chat','group','voice','support'].includes(v.type)) return previous(v);
    const el=document.querySelector('#visual');
    el.innerHTML=''; el.classList.remove('hidden');

    if(v.type==='chat'){
      el.innerHTML=`<div class="msgapp-shot">${header(v.person||v.title||'Kontakt',v.status||'online')}${bubbles(v.messages)}</div>`;
      return;
    }
    if(v.type==='group'){
      el.innerHTML=`<div class="msgapp-shot">${header(v.title||'Gruppenchat','Gruppe',true)}${bubbles(v.messages)}</div>`;
      return;
    }
    if(v.type==='support'){
      el.innerHTML=`<div class="msgapp-shot support-shot">${header(v.brand||'Support','verifiziertes Support-Profil')}${bubbles(v.messages)}</div>`;
      return;
    }
    if(v.type==='voice'){
      const name=v.from||'Kontakt';
      el.innerHTML=`<div class="msgapp-shot voice-shot">${header(name,'zuletzt online')}
        <div class="voice-thread"><div class="voice-card"><div class="voice-top"><span class="voice-play" aria-hidden="true">▶</span><div class="voice-wave" aria-hidden="true">${Array.from({length:28},(_,n)=>`<i style="--h:${[35,55,25,72,43,82,32,61,48,76,38,66,29,58,84,41,69,34,74,52,28,63,46,79,37,57,31,68][n]}%"></i>`).join('')}</div></div><div class="voice-meta"><span>${safe(v.duration||'0:17')}</span><span>Sprachnachricht</span></div></div><div class="voice-transcript">${safe(v.text||'')}</div></div>
      </div>`;
    }
  };
})();
