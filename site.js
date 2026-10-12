(function(){
 const $=id=>document.getElementById(id);
 const cl=(v,a,b)=>Math.min(b,Math.max(a,v));

 // mobile menu
 const btn=document.querySelector('.menu-btn'),nav=$('nav');
 if(btn&&nav){
  const close=()=>{btn.setAttribute('aria-expanded','false');nav.classList.remove('open')};
  btn.addEventListener('click',()=>{const o=btn.getAttribute('aria-expanded')==='true';btn.setAttribute('aria-expanded',String(!o));nav.classList.toggle('open',!o)});
  nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){close();btn.focus()}});
 }

 // demo forms (nothing is sent)
 document.querySelectorAll('form[data-demo]').forEach(f=>{
  const done=$(f.dataset.done);
  f.addEventListener('submit',e=>{
   e.preventDefault();let first=null;
   f.querySelectorAll('input,select,textarea').forEach(el=>{
    const v=el.value.trim();let bad=el.required&&!v;
    if(el.type==='email'&&v&&!/^\S+@\S+\.\S+$/.test(v))bad=true;
    const fl=el.closest('.field');if(fl)fl.classList.toggle('err',bad);
    el.setAttribute('aria-invalid',bad?'true':'false');
    if(bad&&!first)first=el;
   });
   if(first){first.focus();return}
   f.hidden=true;done.hidden=false;done.focus();
  });
  done.querySelector('.restart').addEventListener('click',()=>{f.reset();f.querySelectorAll('.err').forEach(x=>x.classList.remove('err'));f.hidden=false;done.hidden=true;f.querySelector('input').focus()});
 });

 // cinematic scroll (install page)
 const track=$('cineTrack');
 if(track){
  const scrub=$('scrub');
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce)document.body.classList.add('reduced');
  const shell=$('c-shell'),water=$('c-waterRect'),surface=$('c-surface'),cable=$('c-cable'),rig=$('c-rig'),hook=$('c-hook'),r1=$('c-r1'),r2=$('c-r2'),backfill=$('c-backfill'),finish=$('c-finish'),label=$('c-label');
  const chap=[...document.querySelectorAll('#chapters li')];
  const seg=(p,a,b)=>cl((p-a)/(b-a),0,1);
  const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
  const labels=['01  EXCAVATED AND GRADED','02  LIFTED IN BY CRANE','03  SET, LEVELED, BACKFILLED','04  FILLED AND FINISHED'];
  function render(p){
   const lower=ease(seg(p,.08,.48));
   const dy=-250*(1-lower);
   shell.setAttribute('transform','translate(0 '+dy+')');
   const release=seg(p,.5,.6);
   const hookY=310+dy-release*200;
   cable.setAttribute('y2',hookY);
   hook.setAttribute('y',hookY-2);
   r1.setAttribute('y1',hookY+10);r2.setAttribute('y1',hookY+10);
   r1.setAttribute('y2',380+dy);r2.setAttribute('y2',380+dy);
   r1.style.opacity=r2.style.opacity=String(1-release);
   backfill.setAttribute('opacity',seg(p,.52,.62));
   const fill=ease(seg(p,.62,.9));
   const h=fill*(530-392);
   water.setAttribute('y',530-h);water.setAttribute('height',h);
   surface.setAttribute('opacity',fill>.98?1:0);
   finish.setAttribute('opacity',seg(p,.86,.98));
   const fade=1-.7*seg(p,.86,.98);$('c-crane').style.opacity=fade;cable.style.opacity=rig.style.opacity=fade;
   const c=p<.08?0:p<.5?1:p<.62?2:3;
   label.textContent=labels[c];
   chap.forEach((li,i)=>li.classList.toggle('on',i<=c));
  }
  let ticking=false;
  function onScroll(){
   if(reduce||ticking)return;ticking=true;
   requestAnimationFrame(()=>{
    const r=track.getBoundingClientRect();const total=r.height-window.innerHeight;
    const p=cl(-r.top/total,0,1);render(p);scrub.value=Math.round(p*100);ticking=false;
   });
  }
  window.addEventListener('scroll',onScroll,{passive:true});
  scrub.addEventListener('input',()=>{
   const p=scrub.value/100;
   if(reduce){render(p);return}
   const r=track.getBoundingClientRect();const top=window.scrollY+r.top;const total=r.height-window.innerHeight;
   window.scrollTo({top:top+p*total,behavior:'auto'});render(p);
  });
  if(reduce){render(1);scrub.value=100}else onScroll();
 }

 // shell size picker (services page)
 const plan=$('plan');
 if(plan){
  const len=$('len'),lenOut=$('lenOut');
  const SH={
   rect:{min:24,max:40,w:L=>Math.max(12,Math.round(L*.44)),area:.97,depth:4.75,name:'Rectangle'},
   roman:{min:24,max:40,w:L=>Math.max(12,Math.round(L*.42)),area:.9,depth:4.75,name:'Roman end'},
   free:{min:24,max:40,w:L=>Math.max(12,Math.round(L*.45)),area:.78,depth:4.6,name:'Freeform'},
   plunge:{min:10,max:16,w:L=>Math.round(L*.6),area:.97,depth:5,name:'Plunge'}
  };
  function shapePath(k,x,y,w,h){
   if(k==='rect'||k==='plunge'){const r=Math.min(w,h)*.08;return `M${x+r} ${y}H${x+w-r}Q${x+w} ${y} ${x+w} ${y+r}V${y+h-r}Q${x+w} ${y+h} ${x+w-r} ${y+h}H${x+r}Q${x} ${y+h} ${x} ${y+h-r}V${y+r}Q${x} ${y} ${x+r} ${y}Z`}
   if(k==='roman'){const e=h*.32;return `M${x+e} ${y}H${x+w-e}A${e} ${h/2} 0 0 1 ${x+w-e} ${y+h}H${x+e}A${e} ${h/2} 0 0 1 ${x+e} ${y}Z`}
   return `M${x+w*.08} ${y+h*.55}C${x} ${y+h*.15} ${x+w*.25} ${y-h*.02} ${x+w*.45} ${y+h*.12}S${x+w*.7} ${y+h*.22} ${x+w*.85} ${y+h*.08}S${x+w*1.02} ${y+h*.4} ${x+w*.94} ${y+h*.72}S${x+w*.68} ${y+h*1.02} ${x+w*.48} ${y+h*.88}S${x+w*.24} ${y+h*.9} ${x+w*.14} ${y+h*.86}S${x+w*.1} ${y+h*.7} ${x+w*.08} ${y+h*.55}Z`;
  }
  function drawPlan(){
   const k=document.querySelector('input[name=shape]:checked').value,s=SH[k];
   if(+len.min!==s.min||+len.max!==s.max){len.min=s.min;len.max=s.max;len.value=cl(+len.value,s.min,s.max);if(k==='plunge')len.value=14;else if(+len.value<24)len.value=32}
   const L=+len.value,W=s.w(L);
   lenOut.textContent=L+' ft';
   const ft=10,ox=40,oy=30;
   let g='<rect width="480" height="280" fill="#fbf8f2"/>';
   for(let i=0;i<=44;i+=2)g+=`<line x1="${ox+i*ft}" y1="${oy}" x2="${ox+i*ft}" y2="${oy+220}" stroke="#e7ddcc" stroke-width="${i%10===0?1.2:.6}"/>`;
   for(let j=0;j<=22;j+=2)g+=`<line x1="${ox}" y1="${oy+j*ft}" x2="${ox+440}" y2="${oy+j*ft}" stroke="#e7ddcc" stroke-width="${j%10===0?1.2:.6}"/>`;
   const w=L*ft,h=W*ft,x=ox+(440-w)/2,y=oy+(220-h)/2;
   g+=`<path d="${shapePath(k,x-8,y-8,w+16,h+16)}" fill="#efe3cc" stroke="#cdb995"/>`;
   g+=`<path d="${shapePath(k,x,y,w,h)}" fill="#7cc3e3" stroke="#0a3350" stroke-width="2"/>`;
   g+=`<path d="M${x+w*.2} ${y+h*.4}q14 -5 28 0t28 0" stroke="#dff1f8" stroke-width="2" fill="none"/><path d="M${x+w*.55} ${y+h*.62}q14 -5 28 0t28 0" stroke="#dff1f8" stroke-width="2" fill="none"/>`;
   g+=`<g stroke="#0a3350" stroke-width="1"><line x1="${x}" y1="${y+h+22}" x2="${x+w}" y2="${y+h+22}"/><line x1="${x}" y1="${y+h+16}" x2="${x}" y2="${y+h+28}"/><line x1="${x+w}" y1="${y+h+16}" x2="${x+w}" y2="${y+h+28}"/></g>`;
   g+=`<text x="${x+w/2}" y="${Math.min(274,y+h+40)}" text-anchor="middle" font-family="Albert Sans,system-ui,sans-serif" font-size="13" font-weight="700" fill="#0a3350">${L} ft</text>`;
   g+=`<text x="${ox}" y="20" font-family="Albert Sans,system-ui,sans-serif" font-size="11" letter-spacing="1.5" font-weight="700" fill="#4c5a64">TOP VIEW  ·  1 SQUARE = 2 FT  ·  ${s.name.toUpperCase()}</text>`;
   plan.innerHTML=g;
   const area=Math.round(L*W*s.area);
   const gal=Math.round(area*s.depth*7.48/100)*100;
   $('stSize').textContent=L+' x '+W+' ft';
   $('stArea').textContent=area.toLocaleString()+' sq ft';
   $('stGal').textContent=gal.toLocaleString()+' gal';
  }
  document.querySelectorAll('input[name=shape]').forEach(r=>r.addEventListener('change',drawPlan));
  len.addEventListener('input',drawPlan);
  drawPlan();
 }
})();
