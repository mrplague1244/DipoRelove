const $=s=>document.querySelector(s), dlg=$('#dlg');
const GROUPS={'Barang bekas mahasiswa':{'Buku & Alat Tulis':'#3b6fb6','Elektronik':'#4a4fa3','Furnitur Kos':'#8a5a3c','Perabot Dapur':'#c2603a','Pakaian':'#a0568c','Perlengkapan Kuliah':'#2f8f7d'},
 'Sampah & bahan daur ulang':{Plastik:'#2f8f9d',Kertas:'#c58a3a',Kain:'#7d6aa8',Kayu:'#7a5230',UMKM:'#1d6b3e',Industri:'#5b6b7a',Lainnya:'#8a8f55'}};
const CATS=Object.assign({},...Object.values(GROUPS));
const ME='Rani (demo)';
let sort='',user=null, after=null, active=new Set(), query='';
let items=[
 {id:1,price:15000,title:'Kardus bekas pindahan',cat:'Kertas',loc:'Tembalang',time:'Hari ini 16.00–19.00',owner:'Dimas',desc:'±20 kardus ukuran sedang, kondisi kering.'},
 {id:2,price:20000,title:'Botol plastik PET bersih',cat:'Plastik',loc:'Banyumanik',time:'Besok pagi',owner:'Salsa',desc:'Sekitar 5 kg, label sudah dilepas.'},
 {id:3,price:25000,title:'Sisa kain perca konveksi',cat:'Kain',loc:'Pedurungan',time:'Sabtu 10.00',owner:'Konveksi Sari',desc:'Aneka warna, cocok untuk kerajinan.'},
 {id:4,price:60000,title:'Potongan kayu palet',cat:'Kayu',loc:'Gajahmungkur',time:'Hari ini 14.00–17.00',owner:'Bengkel Jati',desc:'6 palet, bisa dibongkar.'},
 {id:5,price:30000,title:'Sisa kemasan produk UMKM',cat:'UMKM',loc:'Tembalang',time:'Minggu sore',owner:'Kopi Nusa',desc:'Pouch dan box cetak, belum terpakai.'},
 {id:7,price:120000,title:'Rak buku kayu bekas kos',cat:'Furnitur Kos',loc:'Tembalang',time:'Sabtu 13.00',owner:'Alvin',desc:'3 tingkat, masih kokoh. Ambil sendiri.'},
 {id:8,price:45000,title:'Buku kuliah Akuntansi Dasar',cat:'Buku & Alat Tulis',loc:'Undip Pleburan',time:'Hari ini 15.00',owner:'Nadia',desc:'Edisi lama, ada coretan pensil.'},
 {id:9,price:85000,title:'Rice cooker mini',cat:'Perabot Dapur',loc:'Banyumanik',time:'Minggu pagi',owner:'Fajar',desc:'Masih menyala, kapasitas 0,6 L.'},
 {id:10,price:50000,title:'Kipas angin meja',cat:'Elektronik',loc:'Tembalang',time:'Besok sore',owner:'Tiara',desc:'Lulus kuliah, kipas masih normal.'},
 {id:6,price:10000,title:'Koran dan majalah lama',cat:'Kertas',loc:'Candisari',time:'Besok 09.00',owner:ME,desc:'Satu kardus penuh.',mine:true}];
let reqs=[{id:1,item:'Koran dan majalah lama',who:'Bima',ok:false},{id:2,item:'Koran dan majalah lama',who:'Kopi Nusa',ok:false}];
let nid=11;

const fmt=p=>p>0?'Rp'+p.toLocaleString('id-ID'):'Gratis';
const ph=(i,x='')=>i.img?`<img class="ph ${x}" src="${i.img}" alt="${esc(i.title)}">`:`<div class="ph ${x}" style="background:${CATS[i.cat]}">${i.cat[0]}</div>`;
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
 $('#filters').innerHTML='<h3>Filter</h3>'+Object.entries(GROUPS).map(([g,c])=>`<h4>${g}</h4>`+Object.keys(c).map(k=>`<label><input type="checkbox" value="${k}"> ${k}</label>`).join('')).join('')+'<h4>Urutkan</h4><select id="sort" aria-label="Urutkan"><option value="">Terbaru</option><option value="asc">Harga terendah</option><option value="desc">Harga tertinggi</option></select>';
 $('#filters').onchange=e=>{if(e.target.id==='sort')sort=e.target.value;else e.target.checked?active.add(e.target.value):active.delete(e.target.value);renderGrid()};
 $('#catSel').innerHTML=Object.entries(GROUPS).map(([g,c])=>`<optgroup label="${g}">`+Object.keys(c).map(k=>`<option>${k}</option>`).join('')+'</optgroup>').join('');
}
function renderGrid(){
 const l=items.filter(i=>(!active.size||active.has(i.cat))&&(i.title+i.cat+i.loc).toLowerCase().includes(query));
 if(sort)l.sort((a,b)=>sort==='asc'?a.price-b.price:b.price-a.price);
 $('#grid').innerHTML=l.length?l.map(i=>`<article class="item">${ph(i)}
  <div class="b"><div class="tags"><span class="tag">${i.cat}</span>${i.mine?'<span class="tag mine">Postinganmu</span>':''}${i.sold?'<span class="tag sold">Terjual</span>':''}</div><h3>${esc(i.title)}</h3><strong class="price">${fmt(i.price)}</strong><small>${esc(i.loc)} · ${esc(i.time)}</small>
  <div class="row"><button class="btn ghost sm" data-d="${i.id}">Detail</button><button class="btn sm" data-t="${i.id}"${i.sold?' disabled':''}>Beli</button></div></div></article>`).join('')
  :'<p class="empty">Belum ada item yang cocok. Coba ubah filter atau kata kunci.</p>';
}
$('#grid').onclick=e=>{const d=e.target.dataset.d,t=e.target.dataset.t;
 if(d)detail(+d);if(t)requireLogin(()=>take(+t))};
$('#q').oninput=e=>{query=e.target.value.toLowerCase();renderGrid()};

function detail(id){const i=items.find(x=>x.id===id);
 modal(`<h3>${esc(i.title)}</h3>${ph(i,'r')}
 <p class="price big">${fmt(i.price)}</p><p><span class="tag">${i.cat}</span><br>${esc(i.desc||'')}</p><p><small>Lokasi: ${esc(i.loc)}<br>Waktu: ${esc(i.time)}<br>Penjual: ${esc(i.owner)}</small></p>
 <button class="btn" style="width:100%" onclick="requireLogin(()=>take(${id}))">Beli barang ini</button>`)}

function take(id){const i=items.find(x=>x.id===id);
 if(i.mine){toast('Ini barang milikmu');return}
 if(i.sold){toast('Barang ini sudah terjual');return}
 modal(`<h3>Chat dengan ${esc(i.owner)}</h3><p><small>Permintaan beli "${esc(i.title)}" (${fmt(i.price)}) sudah dikirim. Sepakati harga, waktu, dan titik temu lewat chat.</small></p>
 <div class="chat" id="chat"><div class="msg">Halo, barangnya masih ada? Aku mau beli.</div></div>
 <form class="chatf" id="cf"><input id="ci" placeholder="Tulis pesan…" aria-label="Pesan" required><button class="btn sm">Kirim</button></form>`);
 const add=(t,me)=>{const m=document.createElement('div');m.className='msg'+(me?' me':'');m.textContent=t;$('#chat').append(m);$('#chat').scrollTop=1e5};
 $('#chat').firstChild.className='msg me';
 setTimeout(()=>add('Masih ada kak. Bisa ketemu sesuai waktu di listing ya.'),900);
 $('#cf').onsubmit=e=>{e.preventDefault();add($('#ci').value,1);$('#ci').value='';setTimeout(()=>add('Oke, siap!'),900)};
}

function renderDash(){
 $('#reqs').innerHTML=reqs.length?reqs.map(r=>`<li><span>${esc(r.who)}<small>ingin membeli ${esc(r.item)}</small></span>
  ${r.ok?'<small>Diterima</small>':`<button class="btn sm" data-a="${r.id}">Terima</button>`}</li>`).join(''):'<li>Belum ada permintaan.</li>';
 const m=items.filter(i=>i.mine);
 $('#mine').innerHTML=m.length?m.map(i=>`<li><span class="th">${i.img?`<img src="${i.img}" alt="">`:`<i style="background:${CATS[i.cat]}"></i>`}<span>${esc(i.title)}<small>${i.cat} · ${fmt(i.price)}${i.sold?' · Terjual':''}</small></span></span><span class="row2"><button class="btn ghost sm" data-s="${i.id}">${i.sold?'Batal terjual':'Tandai terjual'}</button><button class="btn ghost sm" data-x="${i.id}">Hapus</button></span></li>`).join(''):'<li>Kamu belum mengunggah item.</li>';
}
$('#reqs').onclick=e=>{const a=e.target.dataset.a;if(a){reqs.find(r=>r.id==a).ok=true;renderDash();toast('Pembeli diterima')}};
$('#mine').onclick=e=>{const s=e.target.dataset.s,x=e.target.dataset.x;if(s){const it=items.find(i=>i.id==s);it.sold=!it.sold;renderDash();renderGrid();toast(it.sold?'Ditandai terjual':'Dikembalikan ke dijual')}if(x){items=items.filter(i=>i.id!=x);renderDash();renderGrid();toast('Barang dihapus')}};
let img='';
$('#photo').onchange=e=>{const f=e.target.files[0];
 if(!f)return clr();
 if(!f.type.startsWith('image/')||f.size>5e6){e.target.value='';clr();return toast('Pilih file gambar maksimal 5 MB')}
 img=URL.createObjectURL(f);$('#prev').src=img;$('#prev').hidden=false};
function clr(){img='';$('#prev').hidden=true;$('#prev').removeAttribute('src')}
$('#upForm').onsubmit=e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.target));delete f.photo;f.price=Math.max(0,+f.price||0);
 items.unshift({id:nid++,...f,img,owner:ME,mine:true});e.target.reset();clr();renderDash();renderGrid();route('home');setTimeout(()=>$('#grid').scrollIntoView({behavior:'smooth'}),50);toast('Barang berhasil diposting dan tampil di Beranda')};

renderFilters();renderGrid();renderDash();authUI();route();
