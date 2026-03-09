export const translations = {
  tr: {
    appName: 'sainat',
    headerTitle: 'sainat',
    inputPlaceholder: 'Mesajınızı yazın...',
    sidebar: {
      newChat: 'Yeni sohbet',
      today: 'Bugün',
      upgrade: "Premium'a Yükselt",
      settings: 'Ayarlar',
    },
    modelMenu: {
      title: 'Konuş',
      aiModels: {
        deepseek: 'DeepSeek',
        gemini: 'Gemini',
        chatgpt: 'ChatGPT',
      },
      mediaTypes: {
        image: 'Görüntü',
        video: 'Video',
        music: 'Müzik',
      },
    },
    premium: {
      title: 'sainat Premium',
      heroTitle: 'Sınırları Kaldırın',
      heroSubtitle: 'Daha akıllı, daha hızlı, daha yaratıcı yapay zeka deneyimi',
      popular: 'En Popüler',
      guaranteeTitle: '7 Gün Para İade Garantisi',
      guaranteeText: 'Memnun kalmazsanız, 7 gün içinde tam para iadesi alın.',
      footerText: 'Abonelikler otomatik olarak yenilenir. İstediğiniz zaman iptal edebilirsiniz.',
      alerts: {
        infoTitle: 'Bilgi',
        freePlanActive: 'Ücretsiz plan zaten aktif.',
        errorTitle: 'Hata',
        checkoutFailed: 'Ödeme sayfası açılamadı.',
        genericError: 'Bir sorun oluştu. Lütfen tekrar deneyin.',
      },
      plans: {
        free: {
          name: 'Ücretsiz',
          period: '/ay',
          buttonText: 'Mevcut Plan',
          features: ['Sınırsız mesaj', 'Standart model erişimi', 'Temel destek'],
        },
        plus: {
          name: 'sainat Plus',
          period: '/ay',
          buttonText: "Plus'a Yükselt",
          features: ['GPT-4 erişimi', 'DALL-E görsel oluşturma', 'Gözatma özelliği', 'Öncelikli erişim', 'Özel temalar', 'Daha hızlı yanıtlar'],
        },
        pro: {
          name: 'sainat Pro',
          period: '/ay',
          buttonText: "Pro'ya Yükselt",
          features: ['Tüm Plus özellikleri', 'O1 & O1-mini erişimi', 'Sınırsız GPT-4', 'Gelişmiş analiz araçları', 'API erişimi', '7/24 öncelikli destek'],
        },
      },
    },
    chat: {
      mockResponses: [
        'Anladım! Size bu konuda nasıl yardımcı olabilirim?',
        'Bu ilginç bir soru. Daha fazla detay verebilir misiniz?',
        'Size yardımcı olmaktan mutluluk duyarım!',
        'Bu konuda araştırma yapmam gerekiyor. Biraz bekleyin...',
        'Harika! Devam edelim.',
        'Anlıyorum, başka ne öğrenmek istersiniz?',
        'Bu oldukça karmaşık bir konu. Basitleştirmeye çalışayım.',
        'Evet, bu mümkün! İşte önerilerim...',
      ],
    },
  },
  en: {
    appName: 'sainat',
    headerTitle: 'sainat',
    inputPlaceholder: 'Type your message...',
    sidebar: {
      newChat: 'New chat',
      today: 'Today',
      upgrade: 'Upgrade to Premium',
      settings: 'Settings',
    },
    modelMenu: {
      title: 'Talk',
      aiModels: {
        deepseek: 'DeepSeek',
        gemini: 'Gemini',
        chatgpt: 'ChatGPT',
      },
      mediaTypes: {
        image: 'Image',
        video: 'Video',
        music: 'Music',
      },
    },
    premium: {
      title: 'sainat Premium',
      heroTitle: 'Unlock the Limits',
      heroSubtitle: 'A smarter, faster, and more creative AI experience',
      popular: 'Most Popular',
      guaranteeTitle: '7-Day Money-Back Guarantee',
      guaranteeText: 'If you are not satisfied, get a full refund within 7 days.',
      footerText: 'Subscriptions renew automatically. You can cancel anytime.',
      alerts: {
        infoTitle: 'Info',
        freePlanActive: 'The free plan is already active.',
        errorTitle: 'Error',
        checkoutFailed: 'The payment page could not be opened.',
        genericError: 'Something went wrong. Please try again.',
      },
      plans: {
        free: {
          name: 'Free',
          period: '/month',
          buttonText: 'Current Plan',
          features: ['Unlimited messages', 'Standard model access', 'Basic support'],
        },
        plus: {
          name: 'sainat Plus',
          period: '/month',
          buttonText: 'Upgrade to Plus',
          features: ['GPT-4 access', 'DALL-E image generation', 'Browsing feature', 'Priority access', 'Custom themes', 'Faster responses'],
        },
        pro: {
          name: 'sainat Pro',
          period: '/month',
          buttonText: 'Upgrade to Pro',
          features: ['All Plus features', 'O1 & O1-mini access', 'Unlimited GPT-4', 'Advanced analysis tools', 'API access', '24/7 priority support'],
        },
      },
    },
    chat: {
      mockResponses: [
        'I understand! How can I help you with this?',
        'That is an interesting question. Can you share more details?',
        'I would be happy to help you!',
        'I need to look into this. Please wait a moment...',
        'Great! Let us continue.',
        'I understand, what else would you like to learn?',
        'This is quite a complex topic. Let me simplify it.',
        'Yes, this is possible! Here are my suggestions...',
      ],
    },
  },
};

export const getTranslations = (language = 'tr') => translations[language] || translations.tr;
