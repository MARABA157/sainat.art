# 🚀 Sainat AI - Netlify Deployment Guide

## 🌐 Sabit .netlify.app Adresi İçin Deployment

### 📋 Gereksinimler
- Netlify hesabı (ücretsiz): https://app.netlify.com/signup
- GitHub hesabı (opsiyonel ama önerilir)

---

## 🎯 Yöntem 1: Drag & Drop (En Kolay)

### 1. Web Build Oluştur
```bash
cd C:\Users\acer\CascadeProjects\sainat.art\sainat-mobile
npx expo export -p web
```

### 2. Netlify'de Deploy
1. https://app.netlify.com/drop adresine git
2. `dist` klasörünü sürükle-bırak
3. **Sabit URL al:** `https://sainat-ai-XXXX.netlify.app`

---

## 🎯 Yöntem 2: Netlify CLI (Önerilen)

### 1. Netlify CLI Kurulumu
```bash
npm install -g netlify-cli
```

### 2. Login
```bash
netlify login
```
Tarayıcıda açılacak, Netlify hesabına giriş yap.

### 3. Site Bağlama
```bash
cd C:\Users\acer\CascadeProjects\sainat.art\sainat-mobile
netlify sites:create --name sainat-ai
```

### 4. Build ve Deploy
```bash
npx expo export -p web
netlify deploy --prod --dir=dist
```

**Sabit URL:** `https://sainat-ai.netlify.app`

---

## 🎯 Yöntem 3: GitHub + Netlify (Otomatik)

### 1. GitHub'a Yükle
```bash
cd C:\Users\acer\CascadeProjects\sainat.art\sainat-mobile
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/KULLANICIADIN/sainat-ai.git
git push -u origin main
```

### 2. Netlify'de Import
1. https://app.netlify.com adresine git
2. "Add new site" → "Import an existing project"
3. GitHub bağla, repo seç
4. Build settings:
   - **Build command:** `npx expo export -p web`
   - **Publish directory:** `dist`
5. Deploy

**Her push'ta otomatik deploy!**

---

## 📱 Expo Go'da Kullanım

### Web URL ile Açma:
Netlify URL'si Expo Go'da doğrudan çalışmaz ama şu yöntemler var:

#### 1. **WebView Kullan**
Tarayıcıdan aç: `https://sainat-ai.netlify.app`

#### 2. **Expo Web Build Kullan**
```bash
# Expo web build oluştur
npx expo export -p web

# Netlify'e deploy et (yukarıdaki adımlar)
```

#### 3. **En İyi Yöntem: EAS Build**
Expo Go ile çalışan sabit uygulama için:
```bash
npx eas build --profile preview --platform android
npx eas build --profile preview --platform ios
```

---

## 🔧 Alternatif: Expo Dev Client

Expo Go yerine kendi uygulamanızı oluşturun:

```bash
# EAS Build ile kendi uygulamanızı oluştur
npx eas build --profile development --platform android
```

Bu size `.apk` dosyası verir, telefonunuza yükleyip her zaman kullanabilirsiniz.

---

## ✅ Sonuç

| Yöntem | Sabit URL | Expo Go | Kolaylık |
|--------|-----------|---------|----------|
| Netlify Drag&Drop | ✅ | ❌ (Web) | ⭐⭐⭐⭐⭐ |
| Netlify CLI | ✅ | ❌ (Web) | ⭐⭐⭐⭐ |
| GitHub+Netlify | ✅ | ❌ (Web) | ⭐⭐⭐ |
| EAS Build | ✅ | ✅ | ⭐⭐⭐ |

**Öneri:** Netlify CLI ile web versiyonu deploy et, tarayıcıdan kullan.

---

## 🌐 Web Sitesi Özellikleri
- ✅ AI Sohbet
- ✅ Dosya Dönüştürme
- ✅ Google Auth
- ✅ Responsive Tasarım
- ✅ Her yerden erişim

**Hazır olduğunda `https://sainat-ai.netlify.app` adresinden erişilebilir!**
