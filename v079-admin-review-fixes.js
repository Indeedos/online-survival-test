// v0.7.9 — admin review reliability fixes
// Human-readable multi-select answers + robust screenshot/hotspot reconstruction.
(function(){
  const API='https://api.survival.indeedos.cc';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let timer=null;

  function findTask(q){
    try{return Array.isArray(Q)?Q.find(x=>x&&x.q===q)||null:null}catch{return null}
  }
  function indexes(value){
    if(Number.isInteger(value))return [value];
    if(Array.isArray(value)&&value.every(Number.isInteger))return value;
    if(value&&typeof value==='object'){
      if(Number.isInteger(value.choice))return [value.choice];
      if(Number.isInteger(value.selected))return [value.selected];
      if(Array.isArray(value.selected)&&value.selected.every(Number.isInteger))return value.selected;
      if(Array.isArray(value.choices)&&value.choices.every(Number.isInteger))return value.choices;
    }
    return null;
  }
  function readable(value,task){
    const idx=indexes(value);
    if(idx&&Array.isArray(task?.o))return idx.map(n=>task.o[n]??`Antwort ${n+1}`).join(' · ');
    if(typeof value==='string')return value.trim()||'—';
    if(value&&typeof value==='object'){
      if(typeof value.free==='string')return value.free.trim()||'—';
      if(Array.isArray(value.marks))return `${value.marks.length} Markierung${value.marks.length===1?'':'en'}`;
    }
    return null;
  }
  function inside(mark,r,pad=1){
    return +mark.x>=r.x-pad&&+mark.x<=r.x+r.w+pad&&+mark.y>=r.y-pad&&+mark.y<=r.y+r.h+pad;
  }
  function markLabel(task,mark){
    const region=(task?.v?.regions||[]).find(r=>inside(mark,r));
    return region?.label||`Freie Stelle bei ${Math.round(+mark.x)}% / ${Math.round(+mark.y)}%`;
  }
  function hotspotHtml(task,value){
    if(!task?.v?.src||!Array.isArray(value?.marks))return '';
    const marks=value.marks.filter(m=>Number.isFinite(+m.x)&&Number.isFinite(+m.y));
    const expected=(task.v.regions||[]).filter(r=>r.correct);
    return `<section class="admin-visual-review"><div class="admin-visual-title"><b>Screenshot-Auswertung</b><span>${marks.length} Markierung${marks.length===1?'':'en'} des Kindes</span></div><div class="admin-shot-review"><img src="${esc(task.v.src)}" alt="${esc(task.v.alt||'Screenshot-Aufgabe')}">${expected.map(r=>`<span class="admin-expected-box" style="left:${r.x}%;top:${r.y}%;width:${r.w}%;height:${r.h}%" title="Erwartet: ${esc(r.label||'relevanter Bereich')}"></span>`).join('')}${marks.map((m,n)=>`<span class="admin-user-mark" style="left:${+m.x}%;top:${+m.y}%" title="Markierung ${n+1}: ${esc(markLabel(task,m))}">${n+1}</span>`).join('')}</div><div class="admin-visual-legend"><span><i class="user"></i>Markierung des Kindes</span><span><i class="expected"></i>Erwarteter Bereich</span></div>${marks.length?`<div class="admin-mark-list">${marks.map((m,n)=>`<span><b>${n+1}</b>${esc(markLabel(task,m))}</span>`).join('')}</div>`:'<p class="admin-visual-empty">Keine Stelle markiert.</p>'}</section>`;
  }
  function patchRow(row,payload){
    if(!row||!payload)return;
    const q=row.querySelector('.admin-answer-head b')?.textContent?.trim();
    const map=payload.answersByQuestion||{};
    if(!q||!Object.prototype.hasOwnProperty.call(map,q))return;
    const task=findTask(q),value=map[q];

    // v0.7.0 did not understand the {choices:[...]} shape used by multi-select tasks.
    // Replace raw JSON with the actual option labels the child selected.
    const text=readable(value,task);
    const answered=row.querySelector('.admin-answer-body > div:first-child p');
    if(text&&answered)answered.textContent=text;

    // Reconstruct screenshot tasks directly from the saved click coordinates.
    // Do not depend on the old renderer's task-type gate; marks + screenshot metadata are sufficient.
    if(Array.isArray(value?.marks)&&task?.v?.src&&Array.isArray(task?.v?.regions)){
      row.querySelector('.admin-visual-review')?.remove();
      const html=hotspotHtml(task,value);
      if(html)row.insertAdjacentHTML('beforeend',html);
    }
  }
  function patchRows(root,payload){
    if(!root||!payload)return;
    root.querySelectorAll('.admin-answer-row').forEach(row=>patchRow(row,payload));
  }
  async function api(path){
    const r=await fetch(API+path,{credentials:'include',headers:{'Content-Type':'application/json'}});
    if(!r.ok)throw new Error('Admin-Daten nicht erreichbar');
    return r.json();
  }
  async function enhance(){
    const admin=document.querySelector('#adminMini');
    if(!admin||admin.classList.contains('hidden'))return;
    let out;try{out=await api('/api/admin/users')}catch{return}
    const users=out.users||[];
    admin.querySelectorAll('.admin-profile-card').forEach(card=>{
      const name=card.querySelector('.admin-profile-name b')?.textContent?.trim();
      const user=users.find(u=>u.display_name===name);
      if(!user)return;
      const detail=card.querySelector('.admin-profile-detail');
      if(!detail)return;
      [...detail.querySelectorAll('.admin-answer-row')].filter(r=>!r.closest('.admin-run-review')).forEach(r=>patchRow(r,user.payload));
      const review=detail.querySelector('.admin-run-review');
      const sel=card.querySelector('.admin-run-select');
      if(review&&sel)patchRows(review,user.attempts?.[+sel.value]?.payload||null);
    });
  }

  const admin=document.querySelector('#adminMini');
  if(admin)new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(enhance,90)}).observe(admin,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  document.addEventListener('change',e=>{if(e.target.matches('.admin-run-select'))setTimeout(enhance,60)});
  document.addEventListener('click',e=>{if(e.target.closest('.admin-refresh,.profile-chip'))setTimeout(enhance,300)});
  setTimeout(enhance,650);
})();
