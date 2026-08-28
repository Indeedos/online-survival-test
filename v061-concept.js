// v0.6.1 concept sidebar + category progress
(function(){
function esc2(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function iconFor(c){const m={'Accounts & Passwörter':'A','Phishing & Scams':'P','Fremde Personen & Grooming':'G','Chats & Social Engineering':'C','Social Media & Privatsphäre':'S','Fake News, KI & Deepfakes':'KI','Cybermobbing & Gruppendruck':'M','Geld, Shops & Käufe':'€','Notfälle & Hilfe holen':'!','Recht & Verantwortung':'§','Praxisfälle':'↗'};return m[c]||'•';}
function ensureSidebar(){const quiz=document.querySelector('#quiz');if(!quiz||document.querySelector('#conceptSidebar'))return;const aside=document.createElement('aside');aside.id='conceptSidebar';aside.className='concept-sidebar';quiz.insertBefore(aside,quiz.querySelector('.question-card'));}
function updateSidebar(){ensureSidebar();const side=document.querySelector('#conceptSidebar');if(!side||!window.items||!items.length)return;const cats=[];items.forEach((x,idx)=>{let e=cats.find(v=>v.c===x.c);if(!e){e={c:x.c,total:0,done:0};cats.push(e)}e.total++;if(idx<i)e.done++;});const current=items[i]?.c;side.innerHTML='<h3>Bereiche</h3>'+cats.map(e=>`<div class="concept-cat ${e.c===current?'active':''}"><span class="cat-ico">${esc2(iconFor(e.c))}</span><span>${esc2(e.c)}</span><span class="cat-count">${e.done}/${e.total}</span></div>`).join('')+'<div class="sidebar-foot"><b>🧭 Dein Test läuft automatisch</b>Du kannst Fragen markieren und später zurückkommen. Entscheidend ist nicht Tempo, sondern ob du Warnsignale begründen kannst.</div>';}
const oldRender=window.render;window.render=function(){oldRender();updateSidebar();};
ensureSidebar();
})();
