// v0.6.4 presentation polish
(function(){
  const prevVisual=window.renderVisual;
  window.renderVisual=function(v){
    if(v?.type==='timeline'){
      const el=document.querySelector('#visual');
      el.classList.remove('hidden');
      const label={low:'niedrig',mid:'beobachten',high:'Warnsignal',critical:'kritisch'};
      el.innerHTML=`<div class="visual-timeline"><div class="visual-timeline-head">Verlauf der Online-Bekanntschaft</div>${(v.steps||[]).map(s=>`<div class="visual-timeline-step ${s[2]||''}"><span class="num">${esc(s[0])}</span><span class="txt">${esc(s[1])}</span><span class="risk">${esc(label[s[2]]||s[2]||'')}</span></div>`).join('')}</div>`;
      return;
    }
    return prevVisual(v);
  };

  const prevRender=window.render;
  window.render=function(){
    prevRender();
    document.querySelectorAll('.branch-counter').forEach(e=>e.remove());
  };
})();
