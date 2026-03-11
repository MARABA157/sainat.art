# 🚀 EAS Update - Sabit Expo URL'i

## ⚠️ expo:// URL'leri Hakkında Bilgi

**Ücretsiz Expo tunnel'ları geçicidir.** Her `npx expo start --tunnel` komutunda yeni URL oluşturulur.

## ✅ Sabit exp:// URL İçin EAS Update

### 1. EAS CLI Kurulumu
```bash
npm install -g eas-cli
```

### 2. EAS Hesabına Giriş
```bash
eas login
```

### 3. Proje Yapılandırması
eas.json dosyası oluştur:

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {}
  },
  "submit": {
    "production": {}
  },
  "update": {
    "default": {
      "branch": "main"
    }
  }
}
```

### 4. EAS Build Oluştur (Development Client)

```bash
# Android için
eas build --profile development --platform android

# iOS için  
eas build --profile development --platform ios
```

**Bu işlem ~15-20 dakika sürer.**

### 5. QR Kod ile İndirme
Build tamamlandığında:
- Expo dashboard'da QR kod görünecek
- QR kodu tarayıp `.apk` dosyasını indirin
- Telefona yükleyin

### 6. Sabit URL Kullanımı

Artık uygulamanızda şu sabit URL'ler kullanılabilir:

```
exps://u.expo.dev/[PROJECT-ID]?channel-name=main
```

## 🎯 Alternatif: Kendi Uygulamanızı Oluşturun

EAS Build ile `.apk` oluşturup telefona yükleyin:

```bash
eas build --profile preview --platform android
```

Bu size:
- ✅ Sabit uygulama ikonu
- ✅ Her zaman açılabilir
- ✅ exp:// yerine doğrudan uygulama
- ✅ Play Store'a yüklenebilir

## 📱 Expo Go Limitasyonu

**Maalesef Expo Go uygulamasında sabit exp:// URL mümkün değil.**

Sebebi:
1. Expo Go geliştirme ortamıdır
2. Tunnel URL'leri güvenlik için geçicidir
3. Her oturumda yeni URL oluşturulur

## 🔧 Geçici Çözüm: Ngrok Paid

Eğer gerçekten sabit exp:// URL istiyorsanız:

1. ngrok hesabı oluştur: https://ngrok.com
2. Reserved domain al (örn: `sainat-ai.ngrok.io`)
3. Kendi bilgisayarınızda sürekli çalıştırın

```bash
ngrok http 8081 --domain=sainat-ai.ngrok.io
```

Sonra:
```
exp://sainat-ai.ngrok.io
```

**Ama bu sizin bilgisayarınızı 7/24 açık tutmanızı gerektirir.**

## ✅ Önerilen Akış

| İhtiyaç | Çözüm | Sabit URL |
|---------|-------|-----------|
| Expo Go + Sabit URL | ❌ Mümkün değil (ücretsiz) | - |
| Kendi uygulaman | ✅ EAS Build | exp:// veya doğrudan app |
| Web erişimi | ✅ Netlify | https://xxx.netlify.app |
| 7/24 açık | ✅ ngrok paid | exp://sabit.ngrok.io |

## 🌟 En Pratik Çözüm

**EAS Build kullanın:**
```bash
eas build --profile preview --platform android
```

- APK dosyası oluşur
- Telefona yükleyin
- Her zaman açılır
- Expo Go gerekmez
- Sabit ikon ve isim

**Bu en yakın çözümdür exp:// yerine.**
