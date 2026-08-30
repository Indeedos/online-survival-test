// v0.8.1 — persist semantic answer identity so randomized option order cannot corrupt restores/reviews
(function(){
  const dirty=new Set();

  function canonical(task){return Array.isArray(task?._integrityCanonical)?task._integrityCanonical:[]}
  function currentIds(task){
    const pool=canonical(task),used=new Set();
    return (task?.o||[]).map(text=>{
      const hit=pool.find((x,n)=>!used.has(n)&&x.text===String(text));
      if(!hit)return null;
      used.add(pool.indexOf(hit));
      return hit.id;
    });
  }
  function selectedIndexes(task,a){
    if(task?.t==='multi')return Array.isArray(a?.choices)?a.choices.filter(Number.isInteger):[];
    return Number.isInteger(a?.choice)?[a.choice]:[];
  }
  function integrityFor(task,a){
    if(!task||!Array.isArray(task.o)||!a)return null;
    const ids=currentIds(task),selected=selectedIndexes(task,a);
    const selectedIds=selected.map(i=>ids[i]).filter(Boolean);
    const selectedTexts=selected.map(i=>task.o[i]).filter(v=>v!=null).map(String);
    const byId=new Map(canonical(task).map(x=>[x.id,x.text]));
    const expectedIds=[...(task._integrityCorrectIds||[])];
    const redFlagIds=[...(task._integrityRedFlagIds||[])];
    return {v:1,selectedIds,selectedTexts,expectedIds,expectedTexts:expectedIds.map(id=>byId.get(id)).filter(Boolean),redFlagIds,redFlagTexts:redFlagIds.map(id=>byId.get(id)).filter(Boolean),optionOrderIds:ids.filter(Boolean),optionOrderTexts:(task.o||[]).map(String),savedAt:new Date().toISOString()};
  }
  function enrich(task,a){const meta=integrityFor(task,a);if(meta)a._integrity=meta}
  function remap(task,a){
    const meta=a?._integrity;if(!task||!a||meta?.v!==1||!Array.isArray(meta.selectedIds))return;
    const ids=currentIds(task),mapped=meta.selectedIds.map(id=>ids.indexOf(id)).filter(i=>i>=0);
    if(task.t==='multi')a.choices=mapped;else a.choice=mapped.length?mapped[0]:null;
  }
  function isChoiceTask(task){return !!task&&Array.isArray(task.o)&&task.o.length>0&&task.t!=='free'&&task.t!=='hotspot'&&task.t!=='imagegrid'&&task.t!=='branch'}

  document.addEventListener('change',e=>{
    if(!e.target?.matches?.('#answers input[name="q"]')||typeof i!=='number')return;
    dirty.add(i);
    // Capture the changed DOM selection immediately. This is intentionally deferred
    // until the quiz's own change handlers have finished, then save() both writes the
    // answer object and attaches semantic metadata before the account autosave fires.
    setTimeout(()=>{try{if(typeof window.save==='function')window.save()}catch{}},0);
  },true);

  if(typeof window.render==='function'){
    const previousRender=window.render;
    window.render=function(){try{const task=items?.[i],a=answers?.[i];if(isChoiceTask(task)&&a?._integrity)remap(task,a)}catch{}return previousRender.apply(this,arguments)};
  }

  if(typeof window.save==='function'){
    const previousSave=window.save;
    window.save=function(){
      const idx=typeof i==='number'?i:null,task=idx!=null?items?.[idx]:null,before=idx!=null?answers?.[idx]:null;
      const hadIntegrity=!!before?._integrity,wasLegacy=!!before&&isChoiceTask(task)&&!hadIntegrity,userChanged=idx!=null&&dirty.has(idx);
      const result=previousSave.apply(this,arguments);
      try{
        if(idx!=null&&isChoiceTask(task)){
          if(wasLegacy&&!userChanged)answers[idx]=before;else enrich(task,answers?.[idx]);
          dirty.delete(idx);
        }
      }catch{}
      return result;
    };
  }

  window.__answerIntegrity={currentIds,remap,isChoiceTask,enrich,state(task,value){
    if(!isChoiceTask(task))return null;const meta=value?._integrity;
    if(meta?.v!==1)return {kind:'review',label:'Nicht verifizierbar',legacy:true};
    const chosen=[...(meta.selectedIds||[])].sort(),expected=[...(meta.expectedIds||[])].sort();
    const correct=chosen.length===expected.length&&chosen.every((v,n)=>v===expected[n]),red=(meta.redFlagIds||[]).some(id=>chosen.includes(id));
    return {kind:red?'danger':correct?'correct':'wrong',label:red?'Red Flag':correct?'Richtig':'Falsch',legacy:false};
  },selectedText(value){const meta=value?._integrity;return meta?.v===1&&Array.isArray(meta.selectedTexts)?meta.selectedTexts.join(' · '):null},expectedText(value){const meta=value?._integrity;return meta?.v===1&&Array.isArray(meta.expectedTexts)?meta.expectedTexts.join(' · '):null}};
})();
