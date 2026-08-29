// v0.7.6 — current question totals + require every question before completion
(function(){
  function taskCountForAge(a){
    try{return Array.isArray(Q)&&Number.isFinite(+a)?Q.filter(x=>x&&+x.a<=+a).length:0}catch{return 0}
  }
  function defaultTotal(){
    // A profile without progress has no stored age yet. The dashboard previously
    // fell back to the legacy hard-coded 90. Show the current full/Advanced test
    // total until a run supplies its actual age.
    return taskCountForAge(13)||0;
  }
  function answered(idx){
    const x=items?.[idx],a=answers?.[idx];
    if(!x)return false;
    if(x.t==='branch')return !!a?.branch?.done;
    if(x.t==='free')return !!a?.free?.trim();
    if(x.t==='multi')return !!a?.choices?.length;
    if(x.t==='hotspot')return !!a?.marks?.length;
    if(x.t==='imagegrid'){
      const people=x.v?.people||[],map=a?.imagegrid||{};
      return people.length>0&&people.every(p=>map[p.id]);
    }
    return a?.choice!=null;
  }
  function showCompletionNotice(open){
    document.querySelector('.completion-blocker')?.remove();
    const zone=document.querySelector('.question-zone');
    if(!zone)return;
    const box=document.createElement('div');
    box.className='completion-blocker';
    box.innerHTML=`<strong>Noch ${open.length} ${open.length===1?'Frage':'Fragen'} offen</strong><span>Bevor der Test ausgewertet wird, müssen wirklich alle Fragen beantwortet sein. Du wurdest zur ersten offenen Frage geführt.</span>`;
    zone.insertBefore(box,zone.firstChild);
    setTimeout(()=>box.remove(),7000);
  }

  if(typeof window.finish==='function'){
    const previousFinish=window.finish;
    window.finish=function(){
      try{save()}catch{}
      const open=[];
      for(let n=0;n<(items?.length||0);n++)if(!answered(n))open.push(n);
      if(open.length){
        i=open[0];
        if(typeof render==='function')render();
        showCompletionNotice(open);
        window.scrollTo({top:0,behavior:'smooth'});
        return;
      }
      return previousFinish.apply(this,arguments);
    };
  }

  function fixAdminTotals(){
    const root=document.querySelector('#adminMini');
    if(!root||root.classList.contains('hidden'))return;
    root.querySelectorAll('.admin-profile-card').forEach(card=>{
      const ageText=card.querySelector('.admin-profile-name span')?.textContent||'';
      const match=ageText.match(/(11|13)\s*Jahre/);
      const total=match?taskCountForAge(+match[1]):defaultTotal();
      if(!total)return;
      const stats=card.querySelector('.admin-profile-stats');
      const progress=stats?.querySelector('strong');
      if(!progress)return;
      const m=progress.textContent.match(/(\d+)\s*\/\s*\d+/);
      if(!m)return;
      const done=Math.min(+m[1],total),pct=Math.min(100,Math.round(done/total*100));
      progress.textContent=`${done} / ${total}`;
      const pctEl=stats.querySelector('span');if(pctEl)pctEl.textContent=pct+'%';
      const bar=card.querySelector('.admin-progress-line i');if(bar)bar.style.width=pct+'%';
    });
  }
  let timer=null;
  const admin=document.querySelector('#adminMini');
  if(admin)new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(fixAdminTotals,60)}).observe(admin,{childList:true,subtree:true});
  document.addEventListener('click',e=>{if(e.target.closest?.('.admin-refresh,.profile-chip'))setTimeout(fixAdminTotals,350)});
  setTimeout(fixAdminTotals,700);
})();
