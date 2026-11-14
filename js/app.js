// Logika game Pecah Masalah. Kelas Tailwind dikumpulkan di objek K (di bawah),
// karena tampilan dibuat oleh JavaScript. Bank soal ada di js/soal.js.

/* ===== PENGATURAN ===== */
const API_URL="https://script.google.com/macros/s/AKfycbwzOwpU-Ol-9dQPLjjiiUZ10nu2_fxv-91_-3-MFgmP1Q1rAE7ZVZHJ2EE_hbgxWGN7/exec";   // URL Web App dari Apps Script
const BADGES=["Pemecah","Pengelompok","Penyusun","Pemeriksa","Perancang"];

/* ===== KELAS TAILWIND ===== */
const K={
 card:"bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 my-3",
 ok:"bg-white dark:bg-slate-800 border border-green-600 rounded-xl p-4 my-3",
 no:"bg-white dark:bg-slate-800 border border-red-500 rounded-xl p-4 my-3 anim-sh",
 btn:"min-h-[44px] px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 disabled:opacity-40",
 pr:"min-h-[44px] px-4 py-2 rounded-lg border border-blue-600 bg-blue-600 text-white disabled:opacity-40",
 chip:"block w-full text-left my-1.5 min-h-[44px] px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 disabled:opacity-40",
 on:" ring-2 ring-blue-600",
 bub:"rounded-xl px-3 py-2 text-sm bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700",
 mut:"text-sm text-slate-500 dark:text-slate-400"
};

/* ===== PENYIMPANAN & PENGIRIMAN ===== */
const $=document.getElementById("app");
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const store=(k,v)=>{try{if(v===undefined)return JSON.parse(localStorage.getItem(k));localStorage.setItem(k,JSON.stringify(v))}catch(_){return null}};
const P=store("pm_p")||{kode:"",h:{}};
let S={v:P.kode?"map":"login"},kirimBerjalan=false;
const online=()=>API_URL.startsWith("http");
function kirim(d){
  if(!online())return;
  store("pm_q",[...(store("pm_q")||[]),{...d,waktu:new Date().toISOString()}]);
  flush();
}
async function flush(){
  if(kirimBerjalan)return;kirimBerjalan=true;
  const q=store("pm_q")||[];store("pm_q",[]);
  for(const d of q){
    try{await fetch(API_URL,{method:"POST",mode:"no-cors",body:JSON.stringify(d)})}
    catch(_){store("pm_q",[...(store("pm_q")||[]),d])}
  }
  kirimBerjalan=false;
}
async function muatPeringkat(){
  S={v:"rank",rank:null};draw();
  try{const r=await fetch(API_URL+"?aksi=peringkat");S.rank=await r.json()}catch(_){S.rank=[]}
  draw();
}

/* ===== SUARA, CONFETTI, DAN DRAG & DROP ===== */
let mute=store("pm_snd")==="off",AC=null,supClick=false,D=null;
function nada(f,d,t,tipe){
  if(mute)return;
  try{
    AC=AC||new(window.AudioContext||window.webkitAudioContext)();
    const o=AC.createOscillator(),g=AC.createGain(),s=AC.currentTime+(t||0);
    o.type=tipe||"sine";o.frequency.value=f;
    g.gain.setValueAtTime(.12,s);g.gain.exponentialRampToValueAtTime(.001,s+d);
    o.connect(g);g.connect(AC.destination);o.start(s);o.stop(s+d);
  }catch(_){}
}
const bunyi={
  tap:()=>nada(440,.05),
  ok:()=>{nada(660,.1);nada(880,.15,.1)},
  no:()=>nada(180,.25,0,"sawtooth"),
  win:()=>[523,659,784,1047].forEach((f,i)=>nada(f,.18,i*.12)),
  lose:()=>[392,330,262].forEach((f,i)=>nada(f,.25,i*.18,"triangle"))
};
function confetti(n){
  if(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  const w=document.createElement("div"),w2=["#2563eb","#f59e0b","#16a34a","#ef4444","#a855f7","#06b6d4"];
  w.className="confetti";w.setAttribute("aria-hidden","true");
  for(let i=0;i<n;i++){
    const e=document.createElement("i");
    e.style.left=Math.random()*100+"%";
    e.style.background=w2[i%w2.length];
    e.style.animationDelay=Math.random()*.35+"s";
    e.style.setProperty("--dx",Math.round(Math.random()*160-80)+"px");
    w.appendChild(e);
  }
  document.body.appendChild(w);setTimeout(()=>w.remove(),2600);
}
// Seret kartu: ketuk biasa tetap berfungsi (gerakan di bawah 8 px dianggap ketukan).
function targetDi(x,y){const e=document.elementFromPoint(x,y);return e?e.closest("[data-drop]"):null}
function bersih(){document.querySelectorAll(".over").forEach(e=>e.classList.remove("over"))}
$.addEventListener("pointerdown",ev=>{
  const el=ev.target.closest("[data-drag]");
  if(!el||S.v!=="play"||S.lock||ev.button>0)return;
  D={el,x:ev.clientX,y:ev.clientY,go:false};
});
window.addEventListener("pointermove",ev=>{
  if(!D)return;
  const dx=ev.clientX-D.x,dy=ev.clientY-D.y;
  if(!D.go){if(Math.hypot(dx,dy)<8)return;D.go=true;D.el.classList.add("dragging")}
  D.el.style.transform=`translate(${dx}px,${dy}px)`;
  bersih();const t=targetDi(ev.clientX,ev.clientY);if(t)t.classList.add("over");
});
window.addEventListener("pointerup",ev=>{
  if(!D)return;
  const d=D;D=null;bersih();
  if(!d.go)return;
  supClick=true;setTimeout(()=>{supClick=false},0);
  const t=targetDi(ev.clientX,ev.clientY),i=+d.el.dataset.i;
  if(t&&S.v==="play"&&!S.lock){
    if(d.el.dataset.drag==="card"&&t.dataset.drop==="grp"){S.m[i]=+t.dataset.i;S.cur=null;bunyi.tap()}
    else if(d.el.dataset.drag==="ord"&&t.dataset.drop==="ord"&&!S.seq.includes(i)){S.seq.push(i);bunyi.tap()}
  }
  draw();
});
window.addEventListener("pointercancel",()=>{if(D){D=null;bersih();draw()}});

/* ===== LOGIKA GAME ===== */
const IK=["🔍","🗂️","🔢","🛠️","🌳"];
const PEMBUKA=["Ayo pecahkan masalahnya!","Robi siap membantu. Pikirkan baik-baik ya!","Pecah jadi bagian kecil, pasti bisa!"];
const acak=n=>{const a=[...Array(n).keys()];for(let i=n-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const Q=()=>STAGES[S.s].qs[S.q];
function rq(){const q=Q();Object.assign(S,{mas:{e:"🤖",t:PEMBUKA[Math.floor(Math.random()*PEMBUKA.length)]},sel:[],m:{},cur:null,seq:[],att:0,fb:"",ok:false,lock:false,t0:Date.now(),o:acak(q.t==="choice"?q.o.length:q.c.length)})}
const siap=q=>q.t==="choice"?S.sel.length===1:q.t==="pick"?S.sel.length===q.a.length:q.t==="group"?Object.keys(S.m).length===q.c.length:S.seq.length===q.c.length;
const benar=q=>q.t==="choice"?S.sel[0]===q.a:q.t==="pick"?q.a.every(x=>S.sel.includes(x)):q.t==="group"?q.c.every((c,i)=>S.m[i]===c[1]):q.r.every(([a,b])=>S.seq.indexOf(a)<S.seq.indexOf(b));
const xp=()=>Object.values(P.h).reduce((a,h)=>a+h.xp,0);
const bintang=n=>"★".repeat(n)+"☆".repeat(3-n);
const buka=i=>i===0||(P.h[i-1]&&P.h[i-1].b>=1);

function periksa(q){
  S.att++;const b=benar(q);
  if(b){S.combo++;if(S.combo>=2)S.bonus+=S.combo-1}else S.combo=0;
  if(b||S.att>=3){
    S.lock=true;S.ok=b;const sk=b?[1,.5,.25][S.att-1]:0;S.sk.push(sk);
    S.fb=(b?"Tepat! ":"Belum tepat. ")+q.k;
    if(b){bunyi.ok();confetti(S.combo>=3?45:22);S.mas=S.combo>=3?{e:"🔥",t:`Combo x${S.combo}! Kamu hebat!`}:{e:"🤩",t:"Tepat sekali!"}}
    else{S.hp=Math.max(0,S.hp-1);bunyi.no();S.mas={e:"🥹",t:"Tidak apa-apa. Baca penjelasannya, lalu lanjut."}}
    kirim({tipe:"log",kode:P.kode,tahap:S.s+1,soal:S.q+1,tp:"1.1",benar:b?1:0,percobaan:S.att,detik:Math.round((Date.now()-S.t0)/1000)});
  }else{
    bunyi.no();S.mas={e:"🤔",t:"Hampir! Coba lagi, kamu pasti bisa."};
    S.fb=S.att===2?"Belum tepat. Petunjuk: "+q.k:"Belum tepat, coba lagi.";
    if(q.t==="order")S.seq=[];
  }
}
function lanjut(){
  const st=STAGES[S.s];
  if(S.q+1<st.qs.length){
    if(S.hp<=0){S.v="habis";bunyi.lose();return}
    S.q++;rq();return
  }
  const n=st.qs.length,sum=S.sk.reduce((a,b)=>a+b,0),pct=Math.round(sum/n*100),b=pct>=100?3:pct>=80?2:pct>=60?1:0,x=Math.round(sum*10)+S.bonus;
  if(b){bunyi.win();confetti(70)}else bunyi.lose();
  if(!P.h[S.s]||pct>P.h[S.s].p)P.h[S.s]={p:pct,b,xp:x};
  store("pm_p",P);
  kirim({tipe:"skor",kode:P.kode,tahap:S.s+1,tp:"1.1",persen:pct,bintang:b,xp:x});
  S.v="hasil";S.r={pct,b,xp:x,bonus:S.bonus};
}

/* ===== TAMPILAN ===== */
const mascot=(e,t)=>`<div class="flex items-center gap-3 my-2"><div class="text-4xl mascot" aria-hidden="true">${e}</div><div class="${K.bub}">${esc(t)}</div></div>`;
const sndBtn=()=>`<button class="${K.btn} !min-h-[36px] !px-3" data-a="snd" aria-label="${mute?"Nyalakan suara":"Matikan suara"}">${mute?"🔇":"🔊"}</button>`;
function vLogin(){return `<div class="${K.card}"><h1 class="text-2xl font-semibold mb-2">Pecah Masalah</h1>${mascot("🤖","Halo! Aku Robi. Yuk jadi Pemecah Masalah!")}<p class="mb-3">Latihan memecah masalah besar menjadi langkah-langkah kecil. Ada ${STAGES.length} tahap.</p><label for="kode" class="${K.mut}">Masukkan nama lengkap)</label><input id="kode" maxlength="10" autocomplete="off" class="w-full my-2 p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800">${S.err?'<p class="text-red-600 dark:text-red-400 mb-2">Kode belum sesuai. Gunakan 2–10 huruf atau angka.</p>':""}<button class="${K.pr}" data-a="start">Mulai</button></div>`}

function vMap(){
  const lencana=BADGES.filter((_,i)=>P.h[i]&&P.h[i].b>=1);
  return `<div class="${K.card}"><div class="flex justify-between items-center"><span><b>Kode: ${esc(P.kode)}</b> · ⭐ XP: ${xp()}</span>${sndBtn()}</div>${mascot("🤖",xp()?"Lanjutkan petualanganmu!":"Pilih Tahap 1 untuk mulai.")}<div class="mt-2 flex flex-wrap gap-1.5">${lencana.length?lencana.map(b=>`<span class="px-2.5 py-0.5 rounded-full text-sm bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100">${esc(b)}</span>`).join(""):`<span class="${K.mut}">Lencana akan muncul di sini.</span>`}</div></div>`
  +STAGES.map((s,i)=>{const h=P.h[i],b=buka(i);return `<button class="${K.chip}" data-a="go" data-i="${i}" ${b?"":"disabled"}><b>${b?IK[i]||"🎯":"🔒"} ${i+1}. ${esc(s.n)}</b><span class="float-right text-amber-500 tracking-widest">${bintang(h?h.b:0)}</span><br><span class="${K.mut}">${b?esc(s.info):"Terkunci: raih minimal 1 bintang di tahap sebelumnya."}</span></button>`}).join("")
  +`<div class="mt-3 flex gap-2">${online()?`<button class="${K.btn}" data-a="rank">Peringkat</button>`:""}<button class="${K.btn}" data-a="keluar">Ganti kode</button></div>`;
}

function vRank(){
  const r=S.rank;
  return `<div class="${K.card}"><h2 class="text-xl font-semibold mb-2">Peringkat XP</h2>${r===null?"<p>Memuat…</p>":r.length?`<ol class="pl-5 list-decimal">${r.map(x=>`<li class="${x.kode===P.kode?"font-semibold":""}">${esc(x.kode)}: ${x.xp} XP</li>`).join("")}</ol>`:`<p class="${K.mut}">Belum ada data atau koneksi gagal.</p>`}</div><button class="${K.pr}" data-a="map">Kembali ke peta</button>`;
}

function vPlay(){
  const q=Q(),st=STAGES[S.s],n=st.qs.length;
  let h=`<div class="flex justify-between items-center mb-2"><span aria-label="Nyawa ${S.hp} dari 3">${"❤️".repeat(S.hp)+"🖤".repeat(3-S.hp)}</span><span class="font-semibold text-amber-600 dark:text-amber-400">${S.combo>=2?"🔥 Combo x"+S.combo:""}</span>${sndBtn()}</div>${mascot(S.mas.e,S.mas.t)}<div class="h-2 bg-slate-200 dark:bg-slate-700 rounded overflow-hidden"><i class="block h-full bg-blue-600 transition-all" style="width:${S.q/n*100}%"></i></div><p class="${K.mut} my-2">Tahap ${S.s+1}: ${esc(st.n)} · Alat: ${esc(st.alat)} · ${q.f?"Refleksi":`Soal ${S.q+1}/${n}`}</p><div class="${K.card}"><p class="mb-2">${esc(q.p)}</p>`;
  if(q.t==="choice")h+=S.o.map(i=>`<button class="${K.chip}${S.sel[0]===i?K.on:""}" data-a="sel" data-i="${i}">${esc(q.o[i])}</button>`).join("");
  if(q.t==="pick")h+=`<p class="${K.mut}">Pilih ${q.a.length}.</p>`+S.o.map(i=>`<button class="${K.chip}${S.sel.includes(i)?K.on:""}" data-a="sel" data-i="${i}">${esc(q.c[i])}</button>`).join("");
  if(q.t==="group")h+=`<p class="${K.mut}">Seret kartu ke kotak tujuannya (atau ketuk kartu, lalu ketuk kotaknya). Ketuk kartu di dalam kotak untuk membatalkan.</p>`
    +S.o.filter(i=>S.m[i]===undefined).map(i=>`<button class="${K.chip} drg${S.cur===i?K.on:""}" data-a="card" data-drag="card" data-i="${i}">${esc(q.c[i][0])}</button>`).join("")
    +q.g.map((g,gi)=>`<div class="drop border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-2 my-2 min-h-[56px] cursor-pointer" data-a="grp" data-drop="grp" data-i="${gi}"><h4 class="${K.mut}">${esc(g)}</h4>${S.o.filter(i=>S.m[i]===gi).map(i=>`<span class="inline-block m-1 px-2.5 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-sm" data-a="un" data-i="${i}">${esc(q.c[i][0])} ✕</span>`).join("")}</div>`).join("");
  if(q.t==="order")h+=`<p class="${K.mut}">Seret atau ketuk langkah sesuai urutan pengerjaan.</p>`
    +S.o.filter(i=>!S.seq.includes(i)).map(i=>`<button class="${K.chip} drg" data-a="ord" data-drag="ord" data-i="${i}">${esc(q.c[i])}</button>`).join("")
    +`<ol class="drop my-2 pl-9 pr-2 py-2 list-decimal border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl min-h-[56px]" data-a="ordzone" data-drop="ord">${S.seq.length?S.seq.map(i=>`<li>${esc(q.c[i])}</li>`).join(""):`<li class="list-none ${K.mut}">Taruh langkah di sini</li>`}</ol>`+(S.seq.length&&!S.lock?`<button class="${K.btn}" data-a="undo">Ulangi urutan</button>`:"");
  h+=`</div>`;
  if(S.fb)h+=`<div class="${S.ok?K.ok:K.no}" role="status">${esc(S.fb)}</div>`;
  h+=S.lock?`<button class="${K.pr}" data-a="next">Lanjut</button>`:`<button class="${K.pr}" data-a="cek" ${siap(q)?"":"disabled"}>Periksa</button>`;
  return h+` <button class="${K.btn}" data-a="map">Kembali ke peta</button>`;
}

function vHasil(){
  const r=S.r;
  return `<div class="${K.card} text-center"><h2 class="text-xl font-semibold mb-2">Tahap ${S.s+1} selesai</h2><div>${[0,1,2].map(i=>`<span class="inline-block text-5xl text-amber-500 anim-pop" style="animation-delay:${i*.15}s;opacity:${i<r.b?1:.25}">★</span>`).join("")}</div><p class="my-2">Skor ${r.pct}% · +${r.xp} XP${r.bonus?` (bonus combo +${r.bonus})`:""}</p><p class="mb-3">${r.b?"Tahap berikutnya terbuka.":"Raih minimal 60% untuk membuka tahap berikutnya. Coba lagi!"}</p><button class="${K.btn}" data-a="go" data-i="${S.s}">Ulangi tahap</button> <button class="${K.pr}" data-a="map">Ke peta</button></div>`;
}

function vHabis(){
  return `<div class="${K.card} text-center"><div class="text-6xl mascot" aria-hidden="true">🥹</div><h2 class="text-xl font-semibold my-2">Energi habis!</h2><p class="mb-3">Tidak apa-apa. Salah itu bagian dari belajar. Robi yakin kamu bisa di percobaan berikutnya.</p><button class="${K.pr}" data-a="go" data-i="${S.s}">Coba lagi</button> <button class="${K.btn}" data-a="map">Ke peta</button></div>`;
}

function draw(){$.innerHTML={login:vLogin,map:vMap,play:vPlay,hasil:vHasil,rank:vRank,habis:vHabis}[S.v]()}

$.addEventListener("click",ev=>{
  if(supClick){supClick=false;return}
  const el=ev.target.closest("[data-a]");if(!el||el.disabled)return;
  const a=el.dataset.a,i=+el.dataset.i,q=S.v==="play"?Q():null;
  if(["sel","card","grp","ord","un","undo","go"].includes(a))bunyi.tap();
  if(a==="snd"){mute=!mute;store("pm_snd",mute?"off":"on")}
  else if(a==="start"){const k=document.getElementById("kode").value.trim();if(!/^[A-Za-z0-9-]{2,10}$/.test(k)){S.err=1;return draw()}P.kode=k;store("pm_p",P);S={v:"map"}}
  else if(a==="keluar"){P.kode="";P.h={};store("pm_p",P);S={v:"login"}}
  else if(a==="rank")return muatPeringkat();
  else if(a==="go"){S={v:"play",s:i,q:0,sk:[],hp:3,combo:0,bonus:0};rq()}
  else if(a==="map")S={v:"map"};
  else if(a==="cek")periksa(q);
  else if(a==="next")lanjut();
  else if(q&&!S.lock){
    if(a==="sel")S.sel=q.t==="pick"?(S.sel.includes(i)?S.sel.filter(x=>x!==i):S.sel.length<q.a.length?[...S.sel,i]:S.sel):[i];
    else if(a==="card")S.cur=i;
    else if(a==="grp"){if(S.cur!==null){S.m[S.cur]=i;S.cur=null}}
    else if(a==="un")delete S.m[i];
    else if(a==="ord")S.seq.push(i);
    else if(a==="undo")S.seq=[];
  }
  draw();
  if(["go","next","map","start"].includes(a))window.scrollTo(0,0);
});

draw();flush();
