// v0.7.3 — visual admin review for screenshot marks + AI/real image lab
(function(){
  const API='https://api.survival.indeedos.cc';
  const escHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let timer=null;

  // Persist the exact randomized image order for future runs so the admin can
  // reconstruct exactly what the student saw. Older runs fall back to stable IDs.
  if(typeof window.save==='function'){
    const previousSave=window.save;
    window.save=function(){
      const idx=typeof i==='number'?i:null;
      const task=idx!=null&&Array.isArray(items)?items[idx]:null;
      const result=previousSave.apply(this,arguments);
      if(task?.t==='imagegrid'&&idx!=null&&answers?.[idx]){
        answers[idx].imageOrder=[...(task.v?._order||task.v?.people?.map(p=>p.id)||[])];
      }
      return result;
    };
  }

  async function api(path){
    const r=await fetch(API+path,{credentials:'include',headers:{'Content-Type':'application/json'}});
    if(!r.ok)throw new Error('Admin-Daten nicht erreichbar');
    return r.json();
  }
  function findTask(q){
    try{return Array.isArray(Q)?Q.find(x=>x&&x.q===q)||null:null}catch{return null}
  }
  function inside(mark,r,pad=1){
    return mark.x>=r.x-pad&&mark.x<=r.x+r.w+pad&&mark.y>=r.y-pad&&mark.y<=r.y+r.h+pad;
  }
  function markLabel(task,mark){
    const region=(task?.v?.regions||[]).find(r=>inside(mark,r));
    return region?.label||`Freie Stelle bei ${Math.round(mark.x)}% / ${Math.round(mark.y)}%`;
  }
  function hotspotVisual(task,value){
    const marks=(value?.marks||[]).filter(m=>Number.isFinite(+m.x)&&Number.isFinite(+m.y));
    const expected=(task?.v?.regions||[]).filter(r=>r.correct);
    if(!task?.v?.src)return '';
    return `<section class="admin-visual-review"><div class="admin-visual-title"><b>Screenshot-Auswertung</b><span>${marks.length} Markierung${marks.length===1?'':'en'} des Kindes</span></div><div class="admin-shot-review"><img src="${escHtml(task.v.src)}" alt="${escHtml(task.v.alt||'Screenshot-Aufgabe')}">${expected.map(r=>`<span class="admin-expected-box" style="left:${r.x}%;top:${r.y}%;width:${r.w}%;height:${r.h}%" title="Erwartet: ${escHtml(r.label||'relevanter Bereich')}"></span>`).join('')}${marks.map((m,n)=>`<span class="admin-user-mark" style="left:${+m.x}%;top:${+m.y}%" title="Markierung ${n+1}: ${escHtml(markLabel(task,m))}">${n+1}</span>`).join('')}</div><div class="admin-visual-legend"><span><i class="user"></i>Markierung des Kindes</span><span><i class="expected"></i>Erwarteter Bereich</span></div>${marks.length?`<div class="admin-mark-list">${marks.map((m,n)=>`<span><b>${n+1}</b>${escHtml(markLabel(task,m))}</span>`).join('')}</div>`:'<p class="admin-visual-empty">Keine Stelle markiert.</p>'}</section>`;
  }
  function imageGridVisual(task,value){
    const people=task?.v?.people||[];
    if(!people.length)return '';
    const byId=Object.fromEntries(people.map(p=>[p.id,p]));
    const savedOrder=Array.isArray(value?.imageOrder)&&value.imageOrder.length?value.imageOrder:null;
    const order=(savedOrder||people.map(p=>p.id)).filter(id=>byId[id]);
    const chosen=value?.imagegrid||{},confidence=value?.confidence||{};
    return `<section class="admin-visual-review"><div class="admin-visual-title"><b>KI-/Echt-Bild-Lab</b><span>${savedOrder?'Original-Reihenfolge des Kindes':'Reihenfolge dieses älteren Laufs nicht gespeichert'}</span></div><div class="admin-imagegrid-review">${order.map((id,n)=>{
      const p=byId[id],pick=chosen[id];
      const pickText=pick==='real'?'Echte Fotografie':pick==='ai'?'KI-generiert':'Keine Antwort';
      const expected=p.kind==='real'?'Echte Fotografie':'KI-generiert';
      const ok=pick===p.kind;
      const conf=Number.isFinite(+confidence[id])?Math.round(+confidence[id])+'%':'–';
      return `<article class="admin-imagegrid-card ${ok?'ok':pick?'bad':'open'}"><div class="admin-imagegrid-img"><img src="${escHtml(p.src)}" alt="Porträt ${n+1}"></div><div class="admin-imagegrid-info"><strong>Bild ${n+1}</strong><span class="admin-child-pick">Kind: <b>${escHtml(pickText)}</b></span><span>Erwartet: ${escHtml(expected)}</span><span>Sicherheit: ${conf}</span></div></article>`;
    }).join('')}</div></section>`;
  }
  function visualFor(task,value){
    if(task?.t==='hotspot'&&Array.isArray(value?.marks))return hotspotVisual(task,value);
    if(task?.t==='imagegrid'&&value?.imagegrid)return imageGridVisual(task,value);
    return '';
  }
  function enhanceRows(container,payload){
    if(!container||!payload)return;
    const answersMap=payload.answersByQuestion||{};
    container.querySelectorAll('.admin-answer-row').forEach(row=>{
      if(row.querySelector('.admin-visual-review'))return;
      const q=row.querySelector('.admin-answer-head b')?.textContent?.trim();
      if(!q||!Object.prototype.hasOwnProperty.call(answersMap,q))return;
      const task=findTask(q),html=visualFor(task,answersMap[q]);
      if(!html)return;
      row.insertAdjacentHTML('beforeend',html);
    });
  }
  function selectedHistoryPayload(card,user){
    const sel=card.querySelector('.admin-run-select');
    if(!sel)return null;
    return user?.attempts?.[+sel.value]?.payload||null;
  }
  function enhanceCard(card,user){
    const detail=card.querySelector('.admin-profile-detail');
    if(!detail)return;
    // Current/active progress rows (outside archived run review).
    detail.querySelectorAll(':scope > .admin-answer-toolbar, :scope > .admin-answer-row');
    const currentRows=[...detail.querySelectorAll('.admin-answer-row')].filter(r=>!r.closest('.admin-run-review'));
    if(currentRows.length&&user?.payload){
      const holder=document.createElement('div');
      currentRows[0].parentNode?.insertBefore(holder,currentRows[0]);
      currentRows.forEach(r=>holder.appendChild(r));
      enhanceRows(holder,user.payload);
      while(holder.firstChild)holder.parentNode.insertBefore(holder.firstChild,holder);
      holder.remove();
    }
    const review=detail.querySelector('.admin-run-review');
    if(review)enhanceRows(review,selectedHistoryPayload(card,user));
  }
  async function enhance(){
    const admin=document.querySelector('#adminMini');
    if(!admin||admin.classList.contains('hidden'))return;
    let out;try{out=await api('/api/admin/users')}catch{return}
    const users=out.users||[];
    admin.querySelectorAll('.admin-profile-card').forEach(card=>{
      const name=card.querySelector('.admin-profile-name b')?.textContent?.trim();
      const user=users.find(u=>u.display_name===name);
      if(user)enhanceCard(card,user);
    });
  }
  const admin=document.querySelector('#adminMini');
  if(admin){
    new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(enhance,120)}).observe(admin,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  }
  document.addEventListener('change',e=>{if(e.target.matches('.admin-run-select'))setTimeout(enhance,40)});
  document.addEventListener('click',e=>{if(e.target.closest('.admin-refresh,.profile-chip'))setTimeout(enhance,350)});
  setTimeout(enhance,700);
})();
