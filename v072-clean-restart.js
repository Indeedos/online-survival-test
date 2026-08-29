// v0.7.2 — clean student restart: archive completed run, clear active progress, then reload
(function(){
  const API='https://api.survival.indeedos.cc';
  const btn=document.querySelector('#restartBtn');
  if(!btn)return;
  const original=btn.onclick;
  let busy=false;

  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  async function api(path,opts={}){
    const r=await fetch(API+path,{...opts,credentials:'include',headers:{'Content-Type':'application/json',...(opts.headers||{})}});
    if(!r.ok){let msg='Serverfehler';try{msg=(await r.json()).detail||msg}catch{};throw new Error(msg)}
    return r.status===204?null:r.json();
  }
  async function isStudent(){
    try{return (await api('/api/me')).user?.role==='student'}catch{return false}
  }
  async function waitForCompletedSave(){
    // finish() queues the account autosave with a short debounce. Wait until the
    // server confirms the completed payload so the attempt history is guaranteed
    // to contain this run before active progress is cleared.
    for(let n=0;n<10;n++){
      try{
        const out=await api('/api/progress');
        if(out?.payload?.completed)return true;
      }catch{}
      await sleep(250);
    }
    return false;
  }
  function runOriginal(ev){
    if(typeof original==='function')return original.call(btn,ev);
    location.reload();
  }

  btn.onclick=async function(ev){
    if(busy)return;
    const student=await isStudent();
    if(!student)return runOriginal(ev);

    ev?.preventDefault?.();
    busy=true;
    const oldText=btn.textContent;
    btn.disabled=true;
    btn.textContent='Neuen Durchlauf vorbereiten …';
    try{
      const saved=await waitForCompletedSave();
      if(!saved)throw new Error('Der abgeschlossene Durchlauf konnte noch nicht sicher gespeichert werden. Bitte kurz warten und erneut versuchen.');
      await api('/api/progress',{method:'DELETE'});
      // Reload is intentional: it also discards the in-memory remoteProgress from
      // v068, so selecting the same age cannot restore the just-finished answers.
      location.reload();
    }catch(ex){
      busy=false;
      btn.disabled=false;
      btn.textContent=oldText;
      alert(ex?.message||'Neustart konnte nicht vorbereitet werden.');
    }
  };
})();
