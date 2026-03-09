# sainat-mobile

sainat.art için React Native mobil uygulaması.

## Teknolojiler

- React Native
- Expo SDK 55
- React 19

## Başlangıç

Gerekli bağımlılıklar zaten kuruludur. Aşağıdaki komutlarla uygulamayı çalıştırabilirsiniz:

```bash
# Metro bundler'ı başlat
npm start

# Android emülatöründe çalıştır
npm run android

# iOS simülatöründe çalıştır (macOS gerekli)
npm run ios

# Web tarayıcısında çalıştır
npm run web
```

## Proje Yapısı

```
sainat-mobile/
├── App.js              # Ana uygulama bileşeni
├── app.json            # Expo yapılandırması
├── assets/             # Görseller ve ikonlar
├── index.js            # Giriş noktası
└── package.json        # Bağımlılıklar
```

## Geliştirme

1. `App.js` dosyasını düzenleyerek uygulamanızı geliştirmeye başlayın
2. Yeni ekranlar için `screens/` klasörü oluşturun
3. Ortak bileşenler için `components/` klasörü oluşturun

## Yayınlama

Expo Application Services (EAS) ile yayınlama için:

```bash
npm install -g eas-cli
eas login
eas build
```

## Klasör Hiyerarşisi

Uygulama şu anda şu konumda:
```
c:\Users\acer\CascadeProjects\sainat.art\sainat-mobile\
```

Mobil uygulama geliştirme için bu klasörde çalışın.
