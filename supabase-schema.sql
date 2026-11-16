-- Bu dosyayı Supabase > SQL Editor içinde bir kez çalıştırın.
create table if not exists public.admin_users (
 user_id uuid primary key references auth.users(id) on delete cascade
);
create table if not exists public.products (
 id text primary key,
 name text not null check (char_length(name) between 1 and 100),
 "group" text not null check ("group" in ('pet','damacana','bardak','cam')),
 "desc" text not null default '',
 price numeric(12,2) check(price >= 0),
 stock integer check(stock >= 0),
 active boolean not null default true,
 sort_order integer not null default 0,
 image_url text,
 created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
alter table public.products enable row level security;
-- Bir kullanıcının sadece kendi yöneticilik kaydını okuyabilmesi.
drop policy if exists "Read own admin membership" on public.admin_users;
create policy "Read own admin membership" on public.admin_users for select to authenticated using(user_id = (select auth.uid()));
-- Katalog herkese açık, yönetim işlemleri sadece admin_users içindeki hesaplara açık.
drop policy if exists "Public active catalog" on public.products;
create policy "Public active catalog" on public.products for select to anon using(active = true);
drop policy if exists "Admin read all products" on public.products;
create policy "Admin read all products" on public.products for select to authenticated using(exists(select 1 from public.admin_users a where a.user_id=(select auth.uid())));
drop policy if exists "Admin insert products" on public.products;
create policy "Admin insert products" on public.products for insert to authenticated with check(exists(select 1 from public.admin_users a where a.user_id=(select auth.uid())));
drop policy if exists "Admin update products" on public.products;
create policy "Admin update products" on public.products for update to authenticated using(exists(select 1 from public.admin_users a where a.user_id=(select auth.uid()))) with check(exists(select 1 from public.admin_users a where a.user_id=(select auth.uid())));
drop policy if exists "Admin delete products" on public.products;
create policy "Admin delete products" on public.products for delete to authenticated using(exists(select 1 from public.admin_users a where a.user_id=(select auth.uid())));
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('product-images','product-images',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=true,file_size_limit=5242880,allowed_mime_types=array['image/jpeg','image/png','image/webp'];
drop policy if exists "Admin upload product images" on storage.objects;
create policy "Admin upload product images" on storage.objects for insert to authenticated with check(bucket_id='product-images' and exists(select 1 from public.admin_users a where a.user_id=(select auth.uid())));
-- Başlangıç kataloğu: şirket satış uygunluğunu ve fiyatları ayrıca doğrulamalıdır.
insert into public.products(id,name,"group","desc",sort_order) values
('pet033','0,33 L PET Su','pet','Pratik küçük boy şişe.',1),
('pet05','0,5 L PET Su','pet','Günlük kullanım ve hareketli yaşam.',2),
('pet1','1 L PET Su','pet','Günlük su ihtiyacına uygun boy.',3),
('pet15','1,5 L PET Su','pet','Ev ve ofis için ideal hacim.',4),
('pet5','5 L PET Su','pet','Aile boyu kullanım seçeneği.',5),
('dam19','19 L Damacana','damacana','Ev ve iş yerleri için büyük hacim.',6),
('bardak180','180 ml Bardak Su','bardak','Tek kullanımlık bardak ambalaj.',7),
('bardak250','250 ml Bardak Su','bardak','Pratik bardak ambalaj.',8),
('cam033','0,33 L Cam Şişe','cam','Sofralar için cam ambalaj.',9),
('cam075','0,75 L Cam Şişe','cam','Sofralar için büyük cam şişe.',10)
on conflict(id) do nothing;
-- ÖNEMLİ: SQL Editor > Authentication > Users bölümünden admin kullanıcıyı oluşturun,
-- sonra aşağıdaki komutta kullanıcı UUID'sini kullanarak SQL Editor'da çalıştırın:
-- insert into public.admin_users(user_id) values ('BURAYA-ADMIN-KULLANICISININ-UUID-DEGERI');
