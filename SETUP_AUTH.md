# Google OAuth ve Supabase Kurulum Rehberi

Bu rehber, sainat mobil uygulamasında Google OAuth entegrasyonu ve profil sistemi için gerekli adımları içerir.

## 📋 Gereksinimler

- Supabase hesabı (ücretsiz)
- Google Cloud Console hesabı
- Expo hesabı

## 🚀 Kurulum Adımları

### 1. Paketleri Yükleyin

```bash
npm install
```

veya

```bash
npm install @supabase/supabase-js @react-native-async-storage/async-storage expo-auth-session expo-crypto expo-web-browser react-native-url-polyfill
```

### 2. Supabase Projesi Oluşturun

1. [Supabase](https://supabase.com) hesabınıza giriş yapın
2. "New Project" butonuna tıklayın
3. Proje adı, veritabanı şifresi ve bölge seçin
4. Projeniz hazır olana kadar bekleyin

### 3. Supabase Ayarları

1. Supabase Dashboard'da **Settings > API** bölümüne gidin
2. Aşağıdaki bilgileri kopyalayın:
   - `Project URL` (örn: `https://xxxxx.supabase.co`)
   - `anon public` key

### 4. Google OAuth Yapılandırması

#### A. Google Cloud Console'da OAuth Client Oluşturun

1. [Google Cloud Console](https://console.cloud.google.com) açın
2. Yeni bir proje oluşturun veya mevcut projeyi seçin
3. **APIs & Services > Credentials** bölümüne gidin
4. **Create Credentials > OAuth 2.0 Client ID** seçin
5. Application type olarak **Web application** seçin
6. **Authorized redirect URIs** kısmına şunu ekleyin:
   ```
   https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
   ```
7. Client ID ve Client Secret'ı kaydedin

#### B. Supabase'de Google Provider'ı Aktifleştirin

1. Supabase Dashboard'da **Authentication > Providers** bölümüne gidin
2. **Google** provider'ını bulun ve **Enable** edin
3. Google Cloud Console'dan aldığınız:
   - Client ID
   - Client Secret
   
   bilgilerini girin
4. **Save** butonuna tıklayın

### 5. Ortam Değişkenlerini Ayarlayın

1. Proje kök dizininde `.env` dosyası oluşturun:

```bash
cp .env.example .env
```

2. `.env` dosyasını açın ve Supabase bilgilerinizi girin:

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 6. Expo Scheme Yapılandırması

`app.json` dosyanızda scheme ekleyin (zaten varsa atlayın):

```json
{
  "expo": {
    "scheme": "sainat",
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [
            {
              "scheme": "sainat"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

### 7. Uygulamayı Başlatın

```bash
npm start
```

## 🎯 Kullanım

### Giriş Yapma

1. Sağ üstteki **"Oturum Aç"** butonuna tıklayın
2. Google hesabınızı seçin
3. İzinleri onaylayın
4. Otomatik olarak giriş yapılacak

### Profil Sayfası

Giriş yaptıktan sonra:

- **Header'da**: Profil avatarınız görünür (tıklayarak profil sayfasına gidebilirsiniz)
- **Sidebar'da**: "Profil" menü öğesi görünür

Profil sayfasında:
- ✅ Hesap bilgileriniz
- ✅ Tercihler (dil, bildirimler, tema)
- ✅ Kullanım istatistikleri
- ✅ Destek ve yardım linkleri
- ✅ Çıkış yapma

## 🔧 Sorun Giderme

### "Invalid redirect URI" Hatası

- Google Cloud Console'da redirect URI'yi doğru girdiğinizden emin olun
- Supabase Project URL'inizin doğru olduğunu kontrol edin

### "Session not found" Hatası

- AsyncStorage'ın düzgün çalıştığından emin olun
- Uygulamayı yeniden başlatın

### Google Sign-In Açılmıyor

- `expo-web-browser` paketinin yüklü olduğundan emin olun
- Expo Go kullanıyorsanız, development build oluşturmanız gerekebilir

## 📱 Test Etme

### iOS Simulator
```bash
npm run ios
```

### Android Emulator
```bash
npm run android
```

### Web
```bash
npm run web
```

## 🔐 Güvenlik Notları

- `.env` dosyasını asla git'e commit etmeyin
- Production'da environment variables'ları güvenli bir şekilde yönetin
- Supabase RLS (Row Level Security) politikalarını ayarlayın

## 📚 Ek Kaynaklar

- [Supabase Auth Dokümantasyonu](https://supabase.com/docs/guides/auth)
- [Expo Auth Session](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)

## 💡 İpuçları

1. **Development**: Test için kendi Google hesabınızı kullanın
2. **Production**: OAuth consent screen'i publish edin
3. **Debugging**: Supabase Dashboard > Auth > Users bölümünden kullanıcıları görüntüleyin
