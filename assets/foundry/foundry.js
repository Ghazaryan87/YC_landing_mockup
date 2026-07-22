const $=id=>document.getElementById(id), qa=(s,c)=>[...(c||document).querySelectorAll(s)];
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer=matchMedia('(hover:hover) and (pointer:fine)').matches;
$('yr').textContent=new Date().getFullYear();


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

/* count-up */
const cio=new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting)return;cio.unobserve(e.target);
  const el=e.target,end=parseFloat(el.dataset.count),suf=el.dataset.suffix||'',dec=end%1?1:0;
  if(reduce){el.innerHTML=end.toFixed(dec)+'<em>'+suf+'</em>';return}
  const t0=performance.now();
  (function tick(t){const p=Math.min((t-t0)/1400,1),v=end*(1-Math.pow(1-p,3));
    el.textContent=v.toFixed(dec);if(p<1)requestAnimationFrame(tick);
    else el.innerHTML=end.toFixed(dec)+'<em>'+suf+'</em>'})(t0);
}),{threshold:.5});
qa('[data-count]').forEach(el=>cio.observe(el));

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

/* pillar accordion */
const pillars=qa('.pillar');
let pillarIdx=0,pillarTouched=false;
function setPillar(i){pillarIdx=i;pillars.forEach((p,j)=>{p.classList.toggle('on',i===j);p.setAttribute('aria-expanded',i===j)})}
pillars.forEach((p,i)=>{
  p.addEventListener('click',()=>{pillarTouched=true;setPillar(i)});
  if(finePointer)p.addEventListener('mouseenter',()=>{pillarTouched=true;setPillar(i)});
});
if(pillars.length&&!reduce){
  setInterval(()=>{if(!pillarTouched&&document.querySelector('.why .pillars')?.getBoundingClientRect().top<innerHeight)setPillar((pillarIdx+1)%pillars.length)},4800);
}

/* core cell grid */
const fg=$('fcoreGrid');
if(fg){for(let i=0;i<25;i++){const c=document.createElement('i');
  c.style.animationDelay=(1.05+(((i%5)+Math.floor(i/5))*0.06))+'s';fg.appendChild(c)}}

/* marquee build */
const TOOLS=[
 ['Dt','#1496FF','Dynatrace','Premier Partner',1],['OT','#F5A800','OpenTelemetry','Vendor-neutral'],
 ['Pr','#E6522C','Prometheus','Metrics'],['Gf','#F46800','Grafana','Dashboards'],
 ['An','#CC785C','Anthropic','Claude family'],['Oa','#10A37F','OpenAI','GPT · embeddings'],
 ['LC','#1C3C3C','LangChain','Orchestration'],['LG','#2D2E5F','LangGraph','Stateful agents'],
 ['Wv','#FA0050','Weaviate','Hybrid search'],['Pc','#1C1C1C','Pinecone','Managed vectors'],
 ['pg','#336791','pgvector','Postgres ANN'],['GR','#7B2D8B','GraphRAG','Multi-hop reasoning'],
 ['Lf','#3A3A3A','LangFuse','Tracing & evals'],['Az','#7C3AED','Arize','ML observability'],
 ['PL','#6366F1','PromptLayer','Prompt versioning'],['Ml','#0194E2','MLflow','Model lifecycle']
];
function tcardHTML([lg,bg,name,desc,feat]){
  return `<div class="tcard${feat?' tcard--feat':''}"><span class="tcard__logo" style="background:${bg}">${lg}</span><div><b>${name}</b><span>${desc}</span></div></div>`;
}
const half1=TOOLS.filter((_,i)=>i%2===0),half2=TOOLS.filter((_,i)=>i%2===1);
if($('marq1'))$('marq1').firstElementChild.innerHTML=half1.map(tcardHTML).join('')+half1.map(tcardHTML).join('');
if($('marq2'))$('marq2').firstElementChild.innerHTML=half2.map(tcardHTML).join('')+half2.map(tcardHTML).join('');

/* FAQ */
qa('.fitem').forEach(it=>{
  const q=it.querySelector('.fq'),a=it.querySelector('.fa');
  q.addEventListener('click',()=>{
    const open=it.classList.contains('open');
    qa('.fitem.open').forEach(o=>{o.classList.remove('open');o.querySelector('.fa').style.maxHeight=0;o.querySelector('.fq').setAttribute('aria-expanded','false')});
    if(!open){it.classList.add('open');a.style.maxHeight=a.scrollHeight+'px';q.setAttribute('aria-expanded','true')}
  });
});

/* Pavilion tabs */
qa('.ptab').forEach(t=>t.addEventListener('click',()=>{
  qa('.ptab').forEach(x=>{x.classList.remove('on');x.setAttribute('aria-selected','false')});
  qa('.ppanel').forEach(x=>x.classList.remove('on'));
  t.classList.add('on');t.setAttribute('aria-selected','true');
  $('p-'+t.dataset.p).classList.add('on');
  if(t.dataset.p==='anom')drawAnom();
}));

/* RAG demo */
const DOCS=[
 {t:'Trace sampling strategies in production',s:'Head-based vs tail-based sampling, and when adaptive sampling preserves rare error traces.',k:'trace sampling production traces adaptive error'},
 {t:'Reducing LLM inference cost at scale',s:'Prompt caching, model routing, and batching cut inference spend by 40–70% in most deployments.',k:'llm cost inference reduce cache routing spend'},
 {t:'Grounding RAG answers in access controls',s:'Retrieval must respect RBAC — documents a user cannot read must never reach the context window.',k:'rag retrieval access control rbac grounding documents'},
 {t:'Anomaly detection on business KPIs',s:'Seasonality-aware models flag genuine deviations in transaction volume without alert fatigue.',k:'anomaly detection kpi seasonality alert business'},
 {t:'Agent guardrails and audit logging',s:'Every tool call is logged with inputs, outputs, and approval state for compliance review.',k:'agent guardrails audit log compliance tool approval'},
 {t:'Drift monitoring for deployed models',s:'Statistical drift detection on input distributions catches degradation before users notice.',k:'drift monitoring model production degradation distribution'},
 {t:'OpenTelemetry for LLM applications',s:'Spans for each model call capture latency, token usage, and cost as first-class telemetry.',k:'opentelemetry llm spans latency tokens telemetry observability'},
 {t:'Designing SLOs for AI services',s:'Quality SLOs (grounded-answer rate) sit alongside latency and availability targets.',k:'slo ai quality latency availability error budget service'}
];
async function ragRun(){
  const q=$('ragQ').value.trim().toLowerCase();if(!q)return;
  const sEls=qa('#ragPipe .pipe__s');sEls.forEach(s=>s.classList.remove('lit'));
  $('ragDocs').innerHTML='';$('ragAns').textContent='';
  for(const s of sEls){s.classList.add('lit');await delay(reduce?0:340)}
  const toks=q.split(/\W+/).filter(w=>w.length>2);
  const scored=DOCS.map(d=>({d,sc:toks.reduce((a,t)=>a+(d.k.includes(t)?2:0)+(d.t.toLowerCase().includes(t)?3:0),0)})).sort((a,b)=>b.sc-a.sc).slice(0,3);
  const hits=scored.filter(x=>x.sc>0);const use=hits.length?hits:scored;
  $('ragDocs').innerHTML=use.map((x,i)=>`<div class="rdoc"><b>${x.d.t}<em>${(0.94-i*0.13).toFixed(2)} rel</em></b><span>${x.d.s}</span></div>`).join('');
  const ans=hits.length
    ?`Based on ${use.length} retrieved documents: ${use[0].d.s} In production, this answer would be synthesised by an LLM citing each source — here it's assembled from the top-ranked snippets.`
    :`No strong matches in the mock knowledge base — a production system would fall back to broader retrieval or ask a clarifying question. Try keywords like “latency”, “RAG”, “cost”, or “drift”.`;
  const el=$('ragAns');let i=0;
  if(reduce){el.textContent=ans;return}
  (function tw(){el.textContent=ans.slice(0,i+=3);if(i<ans.length)setTimeout(tw,12)})();
}
$('ragGo').addEventListener('click',ragRun);
$('ragQ').addEventListener('keydown',e=>{if(e.key==='Enter')ragRun()});

/* Agent demo */
const TASKS={
 latency:[
  ['think','Reading the alert','p99 latency on checkout-api rose from 130ms → 510ms at 14:02.'],
  ['tool','query_metrics(service="checkout-api", window="30m")','Latency spike correlates with deploy #4821 at 13:58.'],
  ['tool','get_traces(service="checkout-api", slowest=5)','4 of 5 slow traces blocked on inventory-db connection pool.'],
  ['think','Forming hypothesis','Deploy #4821 reduced pool size from 50 → 10 in config. High confidence.'],
  ['tool','create_incident(severity="P2", assignee="platform-team")','Incident INC-2291 created with full evidence attached.'],
  ['done','Root cause identified','Connection pool misconfiguration in deploy #4821. Rollback recommended. 6 tool calls, no human input required.']
 ],
 onboard:[
  ['think','Inspecting the new source','SharePoint library “Policy-Docs” — 1,240 documents, 3 formats.'],
  ['tool','crawl_source(connector="sharepoint", path="/Policy-Docs")','1,238 readable · 2 corrupted files quarantined.'],
  ['tool','chunk_and_embed(strategy="semantic", model="embed-v3")','9,412 chunks embedded and indexed with ACL metadata.'],
  ['tool','run_eval_suite(golden_set="policy-qa-50")','Grounded-answer rate 94% · 0 access-control violations.'],
  ['done','Source live in RAG','Policy-Docs is queryable, ACL-aware, and passing evals. Continuous re-sync scheduled nightly.']
 ]
};
let agentBusy=false;
$('agentGo').addEventListener('click',async()=>{
  if(agentBusy)return;agentBusy=true;
  const steps=TASKS[$('agentTask').value],log=$('agentLog');
  log.innerHTML='';let t=0,c=0;
  for(const[kind,title,body]of steps){
    const ic=kind==='think'?'◦':kind==='tool'?'ƒ':'✓';
    log.insertAdjacentHTML('beforeend',`<div class="astep astep--${kind}"><span class="astep__ico">${ic}</span><div class="astep__body"><b>${title}</b><span>${body}</span></div></div>`);
    log.scrollTop=log.scrollHeight;
    t+=reduce?0:(0.8+Math.random()*0.9);c+=kind==='tool'?0.004+Math.random()*0.006:0.001;
    $('agentT').textContent=t.toFixed(1)+'s';$('agentC').textContent='$'+c.toFixed(3);
    await delay(reduce?0:900);
  }
  agentBusy=false;
});

/* Anomaly demo */
const SERIES=(()=>{const a=[];for(let i=0;i<120;i++){let v=60+Math.sin(i/9)*14+Math.sin(i/3.1)*5+(Math.sin(i*7.3)*4);
  if(i===34||i===35)v+=46;if(i===78)v+=38;if(i===79)v+=52;if(i===100)v+=30;a.push(v)}return a})();
function drawAnom(){
  const c=$('anomCanvas');if(!c.offsetParent)return;
  const dpr=devicePixelRatio||1;c.width=c.offsetWidth*dpr;c.height=240*dpr;
  const x=c.getContext('2d');x.scale(dpr,dpr);
  const w=c.offsetWidth,h=240,n=SERIES.length;
  const mn=Math.min(...SERIES),mx=Math.max(...SERIES),pad=18;
  const X=i=>pad+i/(n-1)*(w-2*pad),Y=v=>h-pad-(v-mn)/(mx-mn)*(h-2*pad);
  const sens=+$('anomSens').value;
  const mean=SERIES.reduce((a,b)=>a+b)/n;
  const sd=Math.sqrt(SERIES.reduce((a,b)=>a+(b-mean)**2,0)/n);
  const thr=mean+sd*(2.6-sens*0.18);
  x.clearRect(0,0,w,h);
  x.strokeStyle='rgba(155,160,255,.18)';x.setLineDash([5,5]);x.beginPath();x.moveTo(pad,Y(thr));x.lineTo(w-pad,Y(thr));x.stroke();x.setLineDash([]);
  x.fillStyle='rgba(155,160,255,.55)';x.font='11px IBM Plex Sans';x.fillText('threshold',w-pad-58,Y(thr)-6);
  x.strokeStyle='#9BA0FF';x.lineWidth=1.6;x.beginPath();
  SERIES.forEach((v,i)=>i?x.lineTo(X(i),Y(v)):x.moveTo(X(i),Y(v)));x.stroke();
  x.lineTo(X(n-1),h-pad);x.lineTo(X(0),h-pad);x.closePath();x.fillStyle='rgba(94,99,242,.10)';x.fill();
  let count=0;
  SERIES.forEach((v,i)=>{if(v>thr){count++;x.beginPath();x.arc(X(i),Y(v),4,0,7);x.fillStyle='#F0716B';x.fill();
    x.beginPath();x.arc(X(i),Y(v),8,0,7);x.strokeStyle='rgba(240,113,107,.35)';x.lineWidth=1.5;x.stroke()}});
  $('anomN').textContent=count;
}
$('anomSens').addEventListener('input',()=>{$('anomSensV').textContent=$('anomSens').value;drawAnom()});
addEventListener('resize',drawAnom);

/* Chat demo */
const ROUTES=[
 {k:['latency','slow','spike','p99'],n:'latency-investigation',a:'Latency on checkout-api is elevated (p99 510ms vs 130ms baseline) since deploy #4821 at 13:58. Top hypothesis: connection-pool change. In production I would pull the live traces and propose a rollback with evidence attached.'},
 {k:['cost','spend','token','cheap','reduce'],n:'cost-optimisation',a:'Three levers typically cut LLM spend 40–70%: prompt caching on repeated context, routing simple queries to smaller models, and batching embeddings. In production I would rank these by your actual token telemetry.'},
 {k:['anomaly','anomalies','alert','detected'],n:'anomaly-report',a:'In the last hour: 2 anomalies — a transaction-volume dip (warning, auto-resolved) and an error-rate spike on auth-service (critical, under investigation). In production this comes straight from the live detection pipeline.'},
 {k:['deploy','release','rollback','version'],n:'deployment-status',a:'Latest deploy #4821 (checkout-api) is flagged: correlated latency regression. Previous stable is #4818. In production I could initiate a guarded rollback pending your approval.'}
];
function chatSend(text){
  const q=text.trim();if(!q)return;
  const m=$('chatMsgs');
  m.insertAdjacentHTML('beforeend',`<div class="cmsg cmsg--me"></div>`);m.lastElementChild.textContent=q;
  const low=q.toLowerCase();let best=null,bs=0;
  ROUTES.forEach(r=>{const s=r.k.reduce((a,k)=>a+(low.includes(k)?1:0),0);if(s>bs){bs=s;best=r}});
  const route=best||{n:'generic-assist',a:'I can help with latency, LLM cost, anomalies, and deployments in this mock. A production copilot would answer from your live telemetry, with citations.'};
  $('chatRoute').innerHTML=`<div class="route">Matched template: <b>${route.n}</b></div><div class="route">Confidence: <b>${best?Math.min(60+bs*15,95):28}%</b></div><div class="route">Keywords hit: <b>${bs}</b></div>`;
  m.insertAdjacentHTML('beforeend',`<div class="cmsg cmsg--ai"></div>`);
  const el=m.lastElementChild,words=route.a.split(' ');let i=0;
  m.scrollTop=m.scrollHeight;
  if(reduce){el.textContent=route.a;return}
  (function st(){el.textContent=words.slice(0,++i).join(' ');m.scrollTop=m.scrollHeight;if(i<words.length)setTimeout(st,34)})();
}
$('chatGo').addEventListener('click',()=>{chatSend($('chatIn').value);$('chatIn').value=''});
$('chatIn').addEventListener('keydown',e=>{if(e.key==='Enter'){chatSend($('chatIn').value);$('chatIn').value=''}});
qa('.qchip').forEach(c=>c.addEventListener('click',()=>chatSend(c.dataset.q)));

/* contact form */
$('cform').addEventListener('submit',e=>{
  e.preventDefault();let ok=true;
  const f=[['cfn','cfnE',v=>v.trim().length>1],['cfe','cfeE',v=>/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)],['cfm','cfmE',v=>v.trim().length>5]];
  f.forEach(([i,er,t])=>{const v=$(i).value,bad=!t(v);$(er).style.display=bad?'block':'none';if(bad)ok=false});
  if(ok){$('cfok').style.display='block';$('cform').reset();setTimeout(()=>$('cfok').style.display='none',6000)}
});
/* capability cards -> pavilion deep links */
qa('[data-pav]').forEach(a=>a.addEventListener('click',()=>{
  const t=document.querySelector(`.ptab[data-p="${a.dataset.pav}"]`);if(t)t.click();
}));
drawAnom();
