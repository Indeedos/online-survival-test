// v0.6.7 — bring branching simulations into the messenger visual system
(function(){
  const safe=s=>typeof esc==='function'?esc(s):String(s??'');
  const initial=name=>(String(name||'?').trim()[0]||'?').toUpperCase();

  function branchMessenger(s,node){
    const isGroup=s.person==='Klassenchat';
    const avatar=isGroup?'#':initial(s.person);
    const status=isGroup?'Gruppenchat · Simulation':'Simulierter Chat';
    const messages=(node.messages||[]).map(m=>{
      const sender=m[0]||s.person;
      const showSender=isGroup || sender!==s.person;
      return `<div class="msgapp-row theirs">${showSender?`<small>${safe(sender)}</small>`:''}<div class="msgapp-bubble">${safe(m[1])}</div></div>`;
    }).join('');
    return `<div class="msgapp-shot branch-msgapp"><div class="msgapp-head"><div class="msgapp-avatar">${safe(avatar)}</div><div class="msgapp-person"><strong>${safe(s.person)}</strong><span>${safe(status)}</span></div><div class="msgapp-actions" aria-hidden="true"><span>⌕</span><span>⋮</span></div></div><div class="msgapp-thread">${messages}</div></div>`;
  }

  renderBranch=function(x){
    const s=BRANCH_SCENARIOS[x.scenarioId], st=branchState(i,x), node=s.steps[st.node];
    $('#categoryTitle').textContent=x.c;$('#categoryTag').textContent=x.c;$('#difficulty').textContent=x.d;$('#questionText').textContent=s.title;
    $('#progressText').textContent=`${i+1} / ${items.length}`;$('#progressBar').style.width=((i+1)/items.length*100)+'%';
    $('#scenario').classList.remove('hidden');$('#scenario').textContent=s.intro;$('#visual').classList.add('hidden');$('#answers').innerHTML='';$('#freeWrap').classList.add('hidden');
    const stage=$('#branchStage');stage.classList.remove('hidden');
    if(node.end||st.done){stage.innerHTML=`<div class="branch-complete"><h3>Simulation abgeschlossen</h3><p>Du hast ${st.score} von ${Math.max(1,st.max)} Entscheidungspunkten erreicht.</p><div class="branch-history">${st.history.map(h=>`<div><strong>${safe(h.choice)}</strong><span>${safe(h.feedback)}</span></div>`).join('')}</div></div>`;$('#nextBtn').disabled=false;return;}
    stage.innerHTML=`${branchMessenger(s,node)}<h4>${safe(node.prompt)}</h4><div class="branch-choices">${node.choices.map((c,n)=>`<button type="button" data-branch-choice="${n}">${safe(c[0])}</button>`).join('')}</div><div id="branchFeedback" class="branch-feedback hidden"></div>`;
    $('#nextBtn').disabled=true;
    $$('[data-branch-choice]').forEach(b=>b.onclick=()=>chooseBranch(+b.dataset.branchChoice,x,s,node,st));
  };
})();
