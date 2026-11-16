# MKM Sıvı İçecekleri — Admin Paneli Kurulum

Bu sürüm GitHub + Render Static Site ile çalışır. Site adresine `/admin/` ekleyerek yönetim paneline girilebilir.

## Kurulum (bir kez)
1. https://supabase.com/dashboard adresinden yeni bir Supabase projesi oluşturun.
2. Supabase > SQL Editor > New query ekranında `supabase-schema.sql` dosyasının içeriğini çalıştırın.
3. Supabase > Authentication > Users bölümünde **Add user** ile yönetici e-posta adresi ve güçlü bir parola oluşturun; otomatik e-posta doğrulama seçeneği varsa kullanıcıyı doğrulayın.
4. Bu kullanıcının Supabase Authentication Users ekranındaki **User UID** değerini kopyalayın. SQL Editor'da aşağıdaki sorguyu UID'yi değiştirerek çalıştırın:
   `insert into public.admin_users(user_id) values ('GERCEK-ADMIN-USER-UUID');`
5. Supabase > Project Settings > API Keys (arayüze göre Connect > API Keys) bölümünden **Project URL** ve **publishable/anon key** bilgisini bulun. `config.js` dosyasındaki `supabaseUrl` ve `supabaseAnonKey` alanlarına ekleyin. `service_role` veya `secret` anahtarını **ASLA** eklemeyin.
6. `config.js` dahil değişen dosyaların tamamını GitHub deponuza yükleyin. Render otomatik deploy'u açıksa yayınlanır.
7. `https://SITENIZ.onrender.com/admin/` adresine girin ve yönetici e-postası/parolanızla giriş yapın. Ürün ekleme, görsel yükleme, fiyat/stok düzenleme ve silme işlemleri burada yapılır.

## Bilinmesi gerekenler
- Ürün verileri Supabase PostgreSQL'de, görseller Supabase Storage `product-images` bucket'ında saklanır. Normal katalog herkese açık, veri değiştirme sadece `admin_users` listesinde bulunan oturumlara açık olacak şekilde RLS politikalarıyla sınırlandırılmıştır.
- Siteyi yalnızca GitHub Pages/Render Static Site üzerinde çalıştırmak, kendi başına güvenli ve kalıcı bir admin veritabanı sağlamaz. Bu nedenle Supabase kurulumu zorunludur.
- Supabase kurulumu bitene kadar mevcut katalog örnek ürünlerle çalışmayı sürdürür. `config.js` doldurulduktan sonra veritabanındaki kayıtlar gösterilir.
- Bu sürümde yalnızca **ürün kataloğu** yönetilir; ana sayfa metinleri, kampanyalar, sipariş alma ve ödeme paneli henüz dahil değildir.
- Gerçek sipariş/ödeme sistemi aktif değildir. Vergi, tüketici, KVKK ve ödeme altyapısı gereklilikleri ayrı ele alınmalıdır.
- Güvenlik için Supabase panelinde kullanıcı hesaplarını yönetip güçlü parola ve mümkünse MFA kullanın. Ürün görsellerinin herkese açık dosyalar olduğunu unutmayın.
- Satışa uygun ürünleri, fiyatları ve stokları MKM tarafından doğrulamadan yayınlamayın.
