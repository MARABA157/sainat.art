# Sainat AI Mobile

Sainat AI için Expo tabanlı mobil ve web uygulaması.

## Teknolojiler

- Expo SDK 55
- React 19
- React Native 0.83
- React Native Web
- Supabase

## Proje Konumu

```text
c:\Users\acer\CascadeProjects\sainat.art\sainat-mobile\
```

## Kurulum

Bağımlılıkları yüklemek için:

```bash
npm install
```

## Çalıştırma Komutları

```bash
# Genel Expo geliştirme sunucusu
npm start

# localhost:19000 üzerinde başlat
npm run start:local

# Port kontrolü ile otomatik başlat
npm run start:auto

# Android
npm run android

# Android localhost:19000
npm run android:local

# iOS
npm run ios

# Web
npm run web

# Web localhost:19006
npm run web:local
```

## Expo Go ile Kullanım

### Mobil

- Bilgisayarda geliştirme sunucusunu başlatın
- Terminalde görünen QR kodu Expo Go ile okutun
- Uygulama telefonda açılır

### Tunnel

```bash
npx expo start --tunnel
```

- Terminalde oluşan `exp://...` adresi Expo Go içine manuel de girilebilir
- Tunnel bağlantıları geliştirme amaçlıdır, kalıcı sabit URL garantisi vermez

## Uygulama Özellikleri

- AI sohbet arayüzü
- Dosya dönüştürme
- Google ile giriş
- Test kullanıcı girişi
- Tema ve arayüz seçenekleri
- Web ve mobil desteği

## Proje Yapısı

```text
sainat-mobile/
├── App.js
├── index.js
├── app.json
├── assets/
├── components/
├── config/
├── contexts/
├── hooks/
├── locales/
├── public/
├── screens/
├── scripts/
├── src/
└── utils/
```

## Google OAuth ve Supabase Kurulumu

### Gereksinimler

- Supabase hesabı
- Google Cloud Console hesabı

### Ortam Değişkenleri

Kök dizinde `.env` dosyası oluşturun:

```bash
cp .env.example .env
```

İçeriğe gerekli anahtarları girin:

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Supabase

- Supabase dashboard içinde bir proje oluşturun
- `Settings > API` altında:
  - `Project URL`
  - `anon public key`
  değerlerini alın

### Google OAuth

- Google Cloud Console içinde OAuth client oluşturun
- Redirect URI olarak şu yapıyı ekleyin:

```text
https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
```

- Supabase `Authentication > Providers > Google` kısmında Google provider'ını etkinleştirin
- Client ID ve Client Secret bilgilerini girin

## Auth Sorun Giderme

### Invalid redirect URI

- Google Cloud Console içindeki redirect URI ile Supabase callback adresinin birebir eşleştiğini kontrol edin

### Session not found

- Ortam değişkenlerini kontrol edin
- Uygulamayı yeniden başlatın

### Google Sign-In açılmıyor

- Tarayıcı yönlendirmesini ve Supabase ayarlarını kontrol edin
- Gerekirse geliştirme sunucusunu yeniden başlatın

## Web ve Netlify Deploy

Web çıktısı almak için:

```bash
npx expo export -p web
```

Netlify için temel akış:

- Publish dizini: `dist`
- SPA yönlendirmesi: `index.html`

İsterseniz şu yollarla deploy edebilirsiniz:

- Drag & Drop
- Netlify CLI
- GitHub entegrasyonu

### Netlify CLI örneği

```bash
npm install -g netlify-cli
netlify login
npx expo export -p web
netlify deploy --prod --dir=dist
```

## Kalıcı Erişim Notu

- Ücretsiz Expo tunnel bağlantıları kalıcı sabit adres vermez
- Geliştirme için tunnel kullanılabilir
- Kalıcı web erişimi için Netlify gibi statik deploy tercih edilmelidir

## Güvenlik Notları

- `.env` dosyasını repoya göndermeyin
- Üretim ortamında environment variable yönetimini ayrı yapın
- Supabase RLS politikalarını yapılandırın

## Geliştirme Notları

- Ana Expo girişleri `index.js` ve `App.js`
- Uygulama ekranları `screens/` altında
- Ortak arayüz parçaları `components/` altında
- Yardımcı araçlar `utils/` altında

## Özet

Bu proje Expo tabanlı bir Sainat AI uygulamasıdır. Çalıştırma, auth kurulumu, Expo Go kullanımı ve web deploy bilgileri bu tek rehber dosyada birleştirilmiştir.
