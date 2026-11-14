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

/* ===== LOGIKA GAME ===== */
const acak=n=>{const a=[...Array(n).keys()];for(let i=n-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const Q=()=>STAGES[S.s].qs[S.q];
function rq(){const q=Q();Object.assign(S,{sel:[],m:{},cur:null,seq:[],att:0,fb:"",ok:false,lock:false,t0:Date.now(),o:acak(q.t==="choice"?q.o.length:q.c.length)})}
const siap=q=>q.t==="choice"?S.sel.length===1:q.t==="pick"?S.sel.length===q.a.length:q.t==="group"?Object.keys(S.m).length===q.c.length:S.seq.length===q.c.length;
const benar=q=>q.t==="choice"?S.sel[0]===q.a:q.t==="pick"?q.a.every(x=>S.sel.includes(x)):q.t==="group"?q.c.every((c,i)=>S.m[i]===c[1]):q.r.every(([a,b])=>S.seq.indexOf(a)<S.seq.indexOf(b));
const xp=()=>Object.values(P.h).reduce((a,h)=>a+h.xp,0);
const bintang=n=>"★".repeat(n)+"☆".repeat(3-n);
const buka=i=>i===0||(P.h[i-1]&&P.h[i-1].b>=1);

function periksa(q){
  S.att++;const b=benar(q);
  if(b||S.att>=3){
    S.lock=true;S.ok=b;const sk=b?[1,.5,.25][S.att-1]:0;S.sk.push(sk);
    S.fb=(b?"Tepat! ":"Belum tepat. ")+q.k;
    kirim({tipe:"log",kode:P.kode,tahap:S.s+1,soal:S.q+1,tp:"1.1",benar:b?1:0,percobaan:S.att,detik:Math.round((Date.now()-S.t0)/1000)});
  }else{
    S.fb=S.att===2?"Belum tepat. Petunjuk: "+q.k:"Belum tepat, coba lagi.";
    if(q.t==="order")S.seq=[];
  }
}
function lanjut(){
  const st=STAGES[S.s];
  if(S.q+1<st.qs.length){S.q++;rq();return}
  const n=st.qs.length,sum=S.sk.reduce((a,b)=>a+b,0),pct=Math.round(sum/n*100),b=pct>=100?3:pct>=80?2:pct>=60?1:0,x=Math.round(sum*10);
  if(!P.h[S.s]||pct>P.h[S.s].p)P.h[S.s]={p:pct,b,xp:x};
  store("pm_p",P);
  kirim({tipe:"skor",kode:P.kode,tahap:S.s+1,tp:"1.1",persen:pct,bintang:b,xp:x});
  S.v="hasil";S.r={pct,b,xp:x};
}

/* ===== TAMPILAN ===== */
function vLogin(){return `<div class="${K.card}"><h1 class="text-2xl font-semibold mb-2">Pecah Masalah</h1><p class="mb-3">Latihan memecah masalah besar menjadi langkah-langkah kecil. Ada ${STAGES.length} tahap.</p><label for="kode" class="${K.mut}">Kode siswa dari gurumu (2–10 huruf atau angka, jangan pakai nama lengkap)</label><input id="kode" maxlength="10" autocomplete="off" class="w-full my-2 p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800">${S.err?'<p class="text-red-600 dark:text-red-400 mb-2">Kode belum sesuai. Gunakan 2–10 huruf atau angka.</p>':""}<button class="${K.pr}" data-a="start">Mulai</button></div>`}

function vMap(){
  const lencana=BADGES.filter((_,i)=>P.h[i]&&P.h[i].b>=1);
  return `<div class="${K.card}"><b>Kode: ${esc(P.kode)}</b> · XP: ${xp()}<div class="mt-2 flex flex-wrap gap-1.5">${lencana.length?lencana.map(b=>`<span class="px-2.5 py-0.5 rounded-full text-sm bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100">${esc(b)}</span>`).join(""):`<span class="${K.mut}">Lencana akan muncul di sini.</span>`}</div></div>`
  +STAGES.map((s,i)=>{const h=P.h[i],b=buka(i);return `<button class="${K.chip}" data-a="go" data-i="${i}" ${b?"":"disabled"}><b>${i+1}. ${esc(s.n)}</b><span class="float-right text-amber-500 tracking-widest">${bintang(h?h.b:0)}</span><br><span class="${K.mut}">${b?esc(s.info):"Terkunci: raih minimal 1 bintang di tahap sebelumnya."}</span></button>`}).join("")
  +`<div class="mt-3 flex gap-2">${online()?`<button class="${K.btn}" data-a="rank">Peringkat</button>`:""}<button class="${K.btn}" data-a="keluar">Ganti kode</button></div>`;
}

function vRank(){
  const r=S.rank;
  return `<div class="${K.card}"><h2 class="text-xl font-semibold mb-2">Peringkat XP</h2>${r===null?"<p>Memuat…</p>":r.length?`<ol class="pl-5 list-decimal">${r.map(x=>`<li class="${x.kode===P.kode?"font-semibold":""}">${esc(x.kode)}: ${x.xp} XP</li>`).join("")}</ol>`:`<p class="${K.mut}">Belum ada data atau koneksi gagal.</p>`}</div><button class="${K.pr}" data-a="map">Kembali ke peta</button>`;
}

function vPlay(){
  const q=Q(),st=STAGES[S.s],n=st.qs.length;
  let h=`<div class="h-2 bg-slate-200 dark:bg-slate-700 rounded overflow-hidden"><i class="block h-full bg-blue-600 transition-all" style="width:${S.q/n*100}%"></i></div><p class="${K.mut} my-2">Tahap ${S.s+1}: ${esc(st.n)} · Alat: ${esc(st.alat)} · ${q.f?"Refleksi":`Soal ${S.q+1}/${n}`}</p><div class="${K.card}"><p class="mb-2">${esc(q.p)}</p>`;
  if(q.t==="choice")h+=S.o.map(i=>`<button class="${K.chip}${S.sel[0]===i?K.on:""}" data-a="sel" data-i="${i}">${esc(q.o[i])}</button>`).join("");
  if(q.t==="pick")h+=`<p class="${K.mut}">Pilih ${q.a.length}.</p>`+S.o.map(i=>`<button class="${K.chip}${S.sel.includes(i)?K.on:""}" data-a="sel" data-i="${i}">${esc(q.c[i])}</button>`).join("");
  if(q.t==="group")h+=`<p class="${K.mut}">Ketuk kartu, lalu ketuk kotak tujuannya. Ketuk kartu di dalam kotak untuk membatalkan.</p>`
    +S.o.filter(i=>S.m[i]===undefined).map(i=>`<button class="${K.chip}${S.cur===i?K.on:""}" data-a="card" data-i="${i}">${esc(q.c[i][0])}</button>`).join("")
    +q.g.map((g,gi)=>`<div class="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-2 my-2 min-h-[56px] cursor-pointer" data-a="grp" data-i="${gi}"><h4 class="${K.mut}">${esc(g)}</h4>${S.o.filter(i=>S.m[i]===gi).map(i=>`<span class="inline-block m-1 px-2.5 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-sm" data-a="un" data-i="${i}">${esc(q.c[i][0])} ✕</span>`).join("")}</div>`).join("");
  if(q.t==="order")h+=`<p class="${K.mut}">Ketuk langkah sesuai urutan pengerjaan.</p>`
    +S.o.filter(i=>!S.seq.includes(i)).map(i=>`<button class="${K.chip}" data-a="ord" data-i="${i}">${esc(q.c[i])}</button>`).join("")
    +`<ol class="my-2 pl-5 list-decimal">${S.seq.map(i=>`<li>${esc(q.c[i])}</li>`).join("")}</ol>`+(S.seq.length&&!S.lock?`<button class="${K.btn}" data-a="undo">Ulangi urutan</button>`:"");
  h+=`</div>`;
  if(S.fb)h+=`<div class="${S.ok?K.ok:K.no}" role="status">${esc(S.fb)}</div>`;
  h+=S.lock?`<button class="${K.pr}" data-a="next">Lanjut</button>`:`<button class="${K.pr}" data-a="cek" ${siap(q)?"":"disabled"}>Periksa</button>`;
  return h+` <button class="${K.btn}" data-a="map">Kembali ke peta</button>`;
}

function vHasil(){
  const r=S.r;
  return `<div class="${K.card} text-center"><h2 class="text-xl font-semibold mb-2">Tahap ${S.s+1} selesai</h2><div>${[0,1,2].map(i=>`<span class="inline-block text-5xl text-amber-500 anim-pop" style="animation-delay:${i*.15}s;opacity:${i<r.b?1:.25}">★</span>`).join("")}</div><p class="my-2">Skor ${r.pct}% · +${r.xp} XP</p><p class="mb-3">${r.b?"Tahap berikutnya terbuka.":"Raih minimal 60% untuk membuka tahap berikutnya. Coba lagi!"}</p><button class="${K.btn}" data-a="go" data-i="${S.s}">Ulangi tahap</button> <button class="${K.pr}" data-a="map">Ke peta</button></div>`;
}

function draw(){$.innerHTML={login:vLogin,map:vMap,play:vPlay,hasil:vHasil,rank:vRank}[S.v]()}

$.addEventListener("click",ev=>{
  const el=ev.target.closest("[data-a]");if(!el||el.disabled)return;
  const a=el.dataset.a,i=+el.dataset.i,q=S.v==="play"?Q():null;
  if(a==="start"){const k=document.getElementById("kode").value.trim();if(!/^[A-Za-z0-9-]{2,10}$/.test(k)){S.err=1;return draw()}P.kode=k;store("pm_p",P);S={v:"map"}}
  else if(a==="keluar"){P.kode="";P.h={};store("pm_p",P);S={v:"login"}}
  else if(a==="rank")return muatPeringkat();
  else if(a==="go"){S={v:"play",s:i,q:0,sk:[]};rq()}
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
