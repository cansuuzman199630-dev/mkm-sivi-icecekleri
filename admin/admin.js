'use strict';
const $=id=>document.getElementById(id);
const conf=window.MKM_CONFIG||{};
const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const show=(id,yes)=>$(id).hidden=!yes;
const msg=(id,s,err=false)=>{ $(id).textContent=s;$(id).classList.toggle('error',err)};
let db,products=[],editing=null;
async function init(){
 if(!conf.supabaseUrl||!conf.supabaseAnonKey||!window.supabase){show('setup',true);return;}
 db=window.supabase.createClient(conf.supabaseUrl,conf.supabaseAnonKey,{auth:{autoRefreshToken:true,persistSession:true}});
 db.auth.onAuthStateChange((event,session)=>{setTimeout(()=>updateAuth(session),0)});
 const {data:{session}}=await db.auth.getSession();await updateAuth(session);
}
async function isAdmin(user){if(!user)return false;const {data,error}=await db.from('admin_users').select('user_id').eq('user_id',user.id).maybeSingle();return !!data&&!error}
async function updateAuth(session){const ok=await isAdmin(session?.user);show('login',!ok);show('dashboard',ok);show('logout',ok);show('setup',false);if(ok)await load();else if(session?.user)msg('loginMessage','Bu hesap yönetici olarak yetkilendirilmemiş.',true)}
$('loginForm').onsubmit=async e=>{e.preventDefault();msg('loginMessage','Giriş yapılıyor...');const {error}=await db.auth.signInWithPassword({email:$('email').value,password:$('password').value});if(error)msg('loginMessage','Giriş başarısız: '+error.message,true)};
$('logout').onclick=async()=>{await db.auth.signOut();location.reload()};
async function load(){const {data,error}=await db.from('products').select('*').order('sort_order').order('name');if(error){msg('status','Ürünler yüklenemedi: '+error.message,true);return}products=data;render()}
function render(){ $('items').innerHTML=products.map(p=>`<tr><td>${p.image_url?`<img src="${escape(p.image_url)}" alt="">`:'—'}</td><td><strong>${escape(p.name)}</strong><br><small>${escape(p.group)}</small></td><td>${p.price==null?'—':Number(p.price).toLocaleString('tr-TR',{style:'currency',currency:'TRY'})}</td><td>${p.stock??'—'}</td><td>${p.active?'Yayında':'Gizli'}</td><td><button data-edit="${escape(p.id)}">Düzenle</button></td></tr>`).join(''); }
$('items').onclick=e=>{const b=e.target.closest('[data-edit]');if(b)openEdit(products.find(p=>p.id===b.dataset.edit))};
$('newProduct').onclick=()=>openEdit(null);
function openEdit(p){editing=p||null;$('dialogTitle').textContent=p?'Ürünü düzenle':'Yeni ürün ekle';$('name').value=p?.name||'';$('group').value=p?.group||'pet';$('description').value=p?.desc||'';$('price').value=p?.price??'';$('stock').value=p?.stock??'';$('sort').value=p?.sort_order??0;$('active').checked=p?.active??true;$('image').value='';$('preview').innerHTML=p?.image_url?`<img src="${escape(p.image_url)}" alt="Mevcut görsel">`:'';show('deleteProduct',!!p);msg('editMessage','');$('editor').showModal()}
$('closeDialog').onclick=()=>$('editor').close();
$('image').onchange=()=>{const file=$('image').files[0];if(file){if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024){msg('editMessage','Yalnızca 5 MB altı JPG, PNG veya WEBP yükleyin.',true);$('image').value='';return}$('preview').innerHTML='Yeni görsel seçildi: '+escape(file.name)}};
$('productForm').onsubmit=async e=>{e.preventDefault();const button=$('saveProduct');button.disabled=true;msg('editMessage','Kaydediliyor...');try{
 const price=$('price').value,stock=$('stock').value;
 const payload={name:$('name').value.trim(),group:$('group').value,desc:$('description').value.trim(),price:price===''?null:Number(price),stock:stock===''?null:Number(stock),sort_order:Number($('sort').value)||0,active:$('active').checked};
 if(!payload.name||payload.price<0||payload.stock<0|| (payload.stock!=null&&!Number.isInteger(payload.stock)))throw Error('Ürün, fiyat veya stok bilgisi geçersiz.');
 const id=editing?.id||crypto.randomUUID();payload.id=id;payload.image_url=editing?.image_url||null;
 const file=$('image').files[0];if(file){if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024)throw Error('Görsel JPG/PNG/WEBP ve en fazla 5 MB olabilir.');const ext=({'image/jpeg':'jpg','image/png':'png','image/webp':'webp'})[file.type];const path=`${id}/${crypto.randomUUID()}.${ext}`;const {error:uploadErr}=await db.storage.from('product-images').upload(path,file,{contentType:file.type,upsert:false});if(uploadErr)throw uploadErr;payload.image_url=db.storage.from('product-images').getPublicUrl(path).data.publicUrl;}
 const {error}=await db.from('products').upsert(payload);if(error)throw error;
 $('editor').close();msg('status','Ürün başarıyla kaydedildi.');await load();
 }catch(err){msg('editMessage','Kaydedilemedi: '+err.message,true)}finally{button.disabled=false}};
$('deleteProduct').onclick=async()=>{if(!editing||!confirm('Bu ürün kalıcı olarak silinsin mi?'))return;const {error}=await db.from('products').delete().eq('id',editing.id);if(error){msg('editMessage','Silinemedi: '+error.message,true);return}$('editor').close();msg('status','Ürün silindi.');await load()};
init();
