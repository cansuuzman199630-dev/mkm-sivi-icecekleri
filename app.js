const products=[
{id:'pet033',name:'0,33 L PET Su',group:'pet',groupLabel:'PET Şişe',desc:'Pratik küçük boy şişe.',shape:''},
{id:'pet05',name:'0,5 L PET Su',group:'pet',groupLabel:'PET Şişe',desc:'Günlük kullanım ve hareketli yaşam.',shape:''},
{id:'pet1',name:'1 L PET Su',group:'pet',groupLabel:'PET Şişe',desc:'Günlük su ihtiyacına uygun boy.',shape:''},
{id:'pet15',name:'1,5 L PET Su',group:'pet',groupLabel:'PET Şişe',desc:'Ev ve ofis için ideal hacim.',shape:''},
{id:'pet5',name:'5 L PET Su',group:'pet',groupLabel:'PET Şişe',desc:'Aile boyu kullanım seçeneği.',shape:'big'},
{id:'dam19',name:'19 L Damacana',group:'damacana',groupLabel:'Damacana',desc:'Ev ve iş yerleri için büyük hacim.',shape:'big'},
{id:'bardak180',name:'180 ml Bardak Su',group:'bardak',groupLabel:'Bardak Su',desc:'Tek kullanımlık bardak ambalaj.',shape:'cup'},
{id:'bardak250',name:'250 ml Bardak Su',group:'bardak',groupLabel:'Bardak Su',desc:'Pratik bardak ambalaj.',shape:'cup'},
{id:'cam033',name:'0,33 L Cam Şişe',group:'cam',groupLabel:'Cam Şişe',desc:'Sofralar için cam ambalaj.',shape:'glass'},
{id:'cam075',name:'0,75 L Cam Şişe',group:'cam',groupLabel:'Cam Şişe',desc:'Sofralar için büyük cam şişe.',shape:'glass'}
];
const byId=id=>document.getElementById(id);
let cart={};try{cart=JSON.parse(localStorage.getItem('mkmCart')||'{}')||{}}catch(e){cart={}}
function persist(){localStorage.setItem('mkmCart',JSON.stringify(cart));renderCart()}
function renderProducts(filter='all'){byId('productGrid').innerHTML=products.filter(p=>filter==='all'||p.group===filter).map(p=>`<article class="product-card"><div class="product-art"><span class="product-tag">${p.groupLabel}</span><div class="bottle-shape ${p.shape}" aria-hidden="true"></div></div><div class="product-detail"><small>BUZDAĞI DOĞAL MİNERALLİ SU</small><h3>${p.name}</h3><p>${p.desc}</p><button class="add" data-add="${p.id}">+ Sipariş Listeme Ekle</button></div></article>`).join('')}
function renderCart(){let entries=Object.entries(cart).filter(([id,q])=>q>0&&products.some(p=>p.id===id));let count=entries.reduce((s,[id,q])=>s+q,0);byId('cartCount').textContent=count;byId('cartLines').innerHTML=entries.length?entries.map(([id,q])=>{const p=products.find(x=>x.id===id);return `<div class="cart-line"><div><b>${p.name}</b><small>${p.groupLabel}</small></div><div class="qty"><button data-qty="${id}" data-delta="-1" aria-label="Bir azalt">−</button><span>${q}</span><button data-qty="${id}" data-delta="1" aria-label="Bir artır">+</button></div></div>`}).join(''):'<p class="cart-empty">Sepetiniz henüz boş.<br>Ürünler bölümünden ürün ekleyebilirsiniz.</p>'}
function openCart(){byId('cartDrawer').classList.add('open');byId('cartDrawer').setAttribute('aria-hidden','false');byId('scrim').hidden=false;document.body.style.overflow='hidden'}
function closeCart(){byId('cartDrawer').classList.remove('open');byId('cartDrawer').setAttribute('aria-hidden','true');byId('scrim').hidden=true;document.body.style.overflow=''}
function orderText(){const entries=Object.entries(cart).filter(([id,q])=>q>0);return 'MKM GROUP - SİPARİŞ TALEP LİSTESİ\n\n'+(entries.length?entries.map(([id,q])=>`${products.find(p=>p.id===id).name} — ${q} adet`).join('\n'):'Liste boş')+'\n\nNot: Bu liste sipariş onayı değildir. Fiyat, stok ve teslimat ayrıca görüşülmelidir.'}
function showState(t){byId('copyState').textContent=t;}
document.addEventListener('click',async e=>{const add=e.target.closest('[data-add]');if(add){const id=add.dataset.add;cart[id]=(cart[id]||0)+1;persist();openCart()}const qty=e.target.closest('[data-qty]');if(qty){const id=qty.dataset.qty;cart[id]=Math.max(0,(cart[id]||0)+Number(qty.dataset.delta));if(!cart[id])delete cart[id];persist()}});
document.querySelectorAll('.filter').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.filter').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderProducts(b.dataset.filter)}));
byId('cartToggle').addEventListener('click',openCart);byId('ctaCart').addEventListener('click',openCart);byId('cartClose').addEventListener('click',closeCart);byId('scrim').addEventListener('click',closeCart);document.addEventListener('keydown',e=>{if(e.key==='Escape')closeCart()});
byId('copyOrder').addEventListener('click',async()=>{if(!Object.keys(cart).length){showState('Önce ürün ekleyin.');return}try{await navigator.clipboard.writeText(orderText());showState('Sipariş listesi kopyalandı.')}catch(e){showState('Kopyalama desteklenmiyor; TXT indirmeyi kullanın.')}});
byId('downloadOrder').addEventListener('click',()=>{const b=new Blob([orderText()],{type:'text/plain;charset=utf-8'});const a=document.createElement('a');const u=URL.createObjectURL(b);a.href=u;a.download='mkm-siparis-listesi.txt';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);showState('Liste dosyası oluşturuldu.')});
byId('menuToggle').addEventListener('click',()=>byId('navigation').classList.toggle('open'));document.querySelectorAll('#navigation a').forEach(a=>a.addEventListener('click',()=>byId('navigation').classList.remove('open')));byId('year').textContent=new Date().getFullYear();renderProducts();renderCart();
