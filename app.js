const $=s=>document.querySelector(s), dlg=$('#dlg');
const CATS={Plastik:'#2f8f9d',Kertas:'#c58a3a',Kain:'#a0568c',Kayu:'#7a5230',UMKM:'#1d6b3e',Industri:'#5b6b7a',Lainnya:'#8a8f55'};
const ME='Rani (demo)';
let user=null, after=null, active=new Set(), query='';
let items=[
 {id:1,title:'Kardus bekas pindahan',cat:'Kertas',loc:'Tembalang',time:'Hari ini 16.00–19.00',owner:'Dimas',desc:'±20 kardus ukuran sedang, kondisi kering.'},
 {id:2,title:'Botol plastik PET bersih',cat:'Plastik',loc:'Banyumanik',time:'Besok pagi',owner:'Salsa',desc:'Sekitar 5 kg, label sudah dilepas.'},
 {id:3,title:'Sisa kain perca konveksi',cat:'Kain',loc:'Pedurungan',time:'Sabtu 10.00',owner:'Konveksi Sari',desc:'Aneka warna, cocok untuk kerajinan.'},
 {id:4,title:'Potongan kayu palet',cat:'Kayu',loc:'Gajahmungkur',time:'Hari ini 14.00–17.00',owner:'Bengkel Jati',desc:'6 palet, bisa dibongkar.'},
 {id:5,title:'Sisa kemasan produk UMKM',cat:'UMKM',loc:'Tembalang',time:'Minggu sore',owner:'Kopi Nusa',desc:'Pouch dan box cetak, belum terpakai.'},
 {id:6,title:'Koran dan majalah lama',cat:'Kertas',loc:'Candisari',time:'Besok 09.00',owner:ME,desc:'Satu kardus penuh.',mine:true}];
let reqs=[{id:1,item:'Koran dan majalah lama',who:'Bima',ok:false},{id:2,item:'Koran dan majalah lama',who:'Kopi Nusa',ok:false}];
let nid=7;

function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),2200)}
function modal(html){dlg.innerHTML='<button class="x" aria-label="Tutup" onclick="dlg.close()">×</button>'+html;if(!dlg.open)dlg.showModal()}
const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

function authUI(){$('#btnAuth').textContent=user?'Keluar ('+user.split(' ')[0]+')':'Login'}
function requireLogin(cb){if(user)return cb();after=cb;loginModal()}
function loginModal(){modal(`<h3>Login ke DipoRelove</h3><p>Prototipe: akun sudah dianggap terdaftar, cukup tekan Masuk.</p>
 <label>Email<input value="rani@students.undip.ac.id"></label><label>Kata sandi<input type="password" value="password"></label>
 <button class="btn" style="width:100%" id="go">Masuk</button>`);
 $('#go').onclick=()=>{user=ME;dlg.close();authUI();toast('Berhasil login');const f=after;after=null;f&&f()}}

$('#btnAuth').onclick=()=>user?(user=null,authUI(),route('home'),toast('Kamu sudah keluar')):loginModal();
$('#btnUpload').onclick=()=>requireLogin(()=>route('dashboard'));

function route(r){
 const want=r||(location.hash.includes('dashboard')?'dashboard':'home');
 if(want==='dashboard'&&!user){after=()=>route('dashboard');loginModal();return route('home')}
 history.replaceState(null,'','#/'+(want==='home'?'':want));
 $('#home').hidden=want!=='home';$('#dashboard').hidden=want!=='dashboard';
 document.querySelectorAll('nav a').forEach(a=>a.classList.toggle('on',a.dataset.r===want));
 scrollTo(0,0);
}
addEventListener('hashchange',()=>route());

function renderFilters(){
 $('#filters').innerHTML='<h3>Filter</h3>'+Object.keys(CATS).map(c=>`<label><input type="checkbox" value="${c}"> ${c}</label>`).join('');
 $('#filters').onchange=e=>{e.target.checked?active.add(e.target.value):active.delete(e.target.value);renderGrid()};
 $('#catSel').innerHTML=Object.keys(CATS).map(c=>`<option>${c}</option>`).join('');
}
function renderGrid(){
 const l=items.filter(i=>(!active.size||active.has(i.cat))&&(i.title+i.cat+i.loc).toLowerCase().includes(query));
 $('#grid').innerHTML=l.length?l.map(i=>`<article class="item"><div class="ph" style="background:${CATS[i.cat]}">${i.cat[0]}</div>
  <div class="b"><span class="tag">${i.cat}</span><h3>${esc(i.title)}</h3><small>${esc(i.loc)} · ${esc(i.time)}</small>
  <div class="row"><button class="btn ghost sm" data-d="${i.id}">Detail</button><button class="btn sm" data-t="${i.id}">Ambil</button></div></div></article>`).join('')
  :'<p class="empty">Belum ada item yang cocok. Coba ubah filter atau kata kunci.</p>';
}
$('#grid').onclick=e=>{const d=e.target.dataset.d,t=e.target.dataset.t;
 if(d)detail(+d);if(t)requireLogin(()=>take(+t))};
$('#q').oninput=e=>{query=e.target.value.toLowerCase();renderGrid()};

function detail(id){const i=items.find(x=>x.id===id);
 modal(`<h3>${esc(i.title)}</h3><div class="ph" style="background:${CATS[i.cat]};border-radius:10px;margin-bottom:10px">${i.cat[0]}</div>
 <p><span class="tag">${i.cat}</span><br>${esc(i.desc||'')}</p><p><small>Lokasi: ${esc(i.loc)}<br>Waktu: ${esc(i.time)}<br>Pemilik: ${esc(i.owner)}</small></p>
 <button class="btn" style="width:100%" onclick="requireLogin(()=>take(${id}))">Ambil item ini</button>`)}

function take(id){const i=items.find(x=>x.id===id);
 if(i.mine){toast('Ini item milikmu');return}
 modal(`<h3>Terhubung dengan ${esc(i.owner)}</h3><p><small>Permintaan ambil untuk "${esc(i.title)}" sudah dikirim. Sepakati waktu dan titik temu lewat chat.</small></p>
 <div class="chat" id="chat"><div class="msg">Halo, barangnya masih ada?</div></div>
 <form class="chatf" id="cf"><input id="ci" placeholder="Tulis pesan…" aria-label="Pesan" required><button class="btn sm">Kirim</button></form>`);
 const add=(t,me)=>{const m=document.createElement('div');m.className='msg'+(me?' me':'');m.textContent=t;$('#chat').append(m);$('#chat').scrollTop=1e5};
 $('#chat').firstChild.className='msg me';
 setTimeout(()=>add('Masih ada, silakan diambil sesuai waktu di listing ya.'),900);
 $('#cf').onsubmit=e=>{e.preventDefault();add($('#ci').value,1);$('#ci').value='';setTimeout(()=>add('Oke, siap!'),900)};
}

function renderDash(){
 $('#reqs').innerHTML=reqs.length?reqs.map(r=>`<li><span>${esc(r.who)}<small>ingin mengambil ${esc(r.item)}</small></span>
  ${r.ok?'<small>Disetujui</small>':`<button class="btn sm" data-a="${r.id}">Setujui</button>`}</li>`).join(''):'<li>Belum ada permintaan.</li>';
 const m=items.filter(i=>i.mine);
 $('#mine').innerHTML=m.length?m.map(i=>`<li><span>${esc(i.title)}<small>${i.cat} · ${esc(i.loc)}</small></span><button class="btn ghost sm" data-x="${i.id}">Hapus</button></li>`).join(''):'<li>Kamu belum mengunggah item.</li>';
}
$('#reqs').onclick=e=>{const a=e.target.dataset.a;if(a){reqs.find(r=>r.id==a).ok=true;renderDash();toast('Permintaan disetujui')}};
$('#mine').onclick=e=>{const x=e.target.dataset.x;if(x){items=items.filter(i=>i.id!=x);renderDash();renderGrid();toast('Item dihapus')}};
$('#upForm').onsubmit=e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.target));
 items.unshift({id:nid++,...f,owner:ME,mine:true});e.target.reset();renderDash();renderGrid();toast('Item berhasil diunggah')};

renderFilters();renderGrid();renderDash();authUI();route();
