const $=id=>document.getElementById(id), qa=(s,c)=>[...(c||document).querySelectorAll(s)];
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer=matchMedia('(hover:hover) and (pointer:fine)').matches;


/* scroll systems: progress bar, nav shrink, parallax */
const paraEls=qa('[data-para]');
const stWords=qa('#statement .rw');
let ticking=false;
function onScroll(){
  if(ticking)return;ticking=true;
  requestAnimationFrame(()=>{
    const y=scrollY,h=document.documentElement.scrollHeight-innerHeight;
    $('prog').style.width=(y/h*100)+'%';
    if(stWords.length){
      const r=$('statement').getBoundingClientRect();
      const p=Math.min(Math.max((innerHeight*0.86-r.top)/(r.height+innerHeight*0.30),0),1);
      const n=Math.round(p*stWords.length);
      stWords.forEach((wd,i)=>wd.classList.toggle('lit',i<n||reduce));
    }
    if(!reduce){paraEls.forEach(el=>{
      const r=el.getBoundingClientRect(),mid=r.top+r.height/2-innerHeight/2;
      el.style.transform=`translateY(${mid*-parseFloat(el.dataset.para)}px)`;
    })}
    ticking=false;
  });
}
addEventListener('scroll',onScroll,{passive:true});onScroll();

/* hero mouse parallax */
if(finePointer&&!reduce){
  const g1=document.querySelector('.hero__glow'),g2=document.querySelector('.hero__glow2');
  document.querySelector('.hero').addEventListener('mousemove',e=>{
    const cx=(e.clientX/innerWidth-.5),cy=(e.clientY/innerHeight-.5);
    g1.style.transform=`translateX(calc(-50% + ${cx*22}px)) translateY(${cy*16}px)`;
    g2.style.transform=`translate(${cx*-16}px,${cy*-12}px)`;
  });
}

/* reveal observers */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});
qa('.fade,.stag').forEach(el=>io.observe(el));
const pio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');pio.unobserve(e.target)}}),{threshold:.3});
if($('procGrid'))pio.observe($('procGrid'));

/* count-up: handled by assets/js/app.js's initCounters() for [data-count],
   loaded on this page for the ported method rail — avoids double-animating
   the same elements with two competing observers. */

/* spotlight + tilt */
if(finePointer&&!reduce){
  qa('.spot').forEach(c=>c.addEventListener('mousemove',e=>{
    const r=c.getBoundingClientRect();
    c.style.setProperty('--mx',(e.clientX-r.left)+'px');
    c.style.setProperty('--my',(e.clientY-r.top)+'px');
  }));
  qa('.tilt').forEach(c=>{
    c.addEventListener('mousemove',e=>{
      const r=c.getBoundingClientRect();
      const rx=((e.clientY-r.top)/r.height-.5)*-5,ry=((e.clientX-r.left)/r.width-.5)*5;
      c.style.transform=`perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-3px)`;
    });
    c.addEventListener('mouseleave',()=>{c.style.transform=''});
  });
}

/* core cell grid (inert unless the hero re-adds #fcoreGrid) */
const fg=$('fcoreGrid');
if(fg){for(let i=0;i<25;i++){const c=document.createElement('i');
  c.style.animationDelay=(1.05+(((i%5)+Math.floor(i/5))*0.06))+'s';fg.appendChild(c)}}

/* contact form */
if($('cform'))$('cform').addEventListener('submit',e=>{
  e.preventDefault();let ok=true;
  const f=[['cfn','cfnE',v=>v.trim().length>1],['cfe','cfeE',v=>/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)],['cfm','cfmE',v=>v.trim().length>5]];
  f.forEach(([i,er,t])=>{const v=$(i).value,bad=!t(v);$(er).style.display=bad?'block':'none';if(bad)ok=false});
  if(ok){$('cfok').style.display='block';$('cform').reset();setTimeout(()=>$('cfok').style.display='none',6000)}
});
