// v0.8.0 — stable option identities captured before v058 randomizes answer order
(function(){
  function hash(input){
    let h=2166136261;
    const s=String(input??'');
    for(let n=0;n<s.length;n++){h^=s.charCodeAt(n);h=Math.imul(h,16777619)}
    return (h>>>0).toString(36);
  }
  if(!Array.isArray(window.Q))return;
  Q.forEach(task=>{
    if(!task||!Array.isArray(task.o)||task.o.length<2)return;
    const seen=new Map();
    task._integrityCanonical=task.o.map((text,index)=>{
      const key=String(text);
      const occurrence=seen.get(key)||0;seen.set(key,occurrence+1);
      return {id:`q${hash(task.q)}-o${hash(key)}-${occurrence}`,text:key,index};
    });
    task._integrityCorrectIds=(task.k||[]).map(i=>task._integrityCanonical[i]?.id).filter(Boolean);
    task._integrityRedFlagIds=(task.rf||[]).map(i=>task._integrityCanonical[i]?.id).filter(Boolean);
  });
})();
