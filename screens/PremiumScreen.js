import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PremiumScreen({ onClose, t }) {
  const LEMONSQUEEZY_CHECKOUT_URLS = {
    plus: process.env.EXPO_PUBLIC_LEMONSQUEEZY_PLUS_URL || '',
    pro: process.env.EXPO_PUBLIC_LEMONSQUEEZY_PRO_URL || '',
  };

  const experienceCards = [
    {
      id: 'chat',
      title: 'Sohbet',
      icon: 'chatbubble-ellipses',
      accent: '#10A37F',
      models: ['ChatGPT - GPT-4o', 'Gemini - Gemini 2.0 Flash'],
      description: 'Hızlı, doğal ve güçlü konuşma deneyimi ile daha akıllı yanıtlar alın.',
    },
    {
      id: 'image',
      title: 'Görsel',
      icon: 'image',
      accent: '#8B5CF6',
      models: ['ChatGPT - gpt-image-1', 'Gemini - Gemini 2.0 Flash Preview Image Generation'],
      description: 'Premium görsel üretim ve analiz akışı ile daha etkileyici sonuçlar oluşturun.',
    },
    {
      id: 'video',
      title: 'Video',
      icon: 'videocam',
      accent: '#EF4444',
      models: ['ChatGPT - Sora', 'Gemini - Veo 2'],
      description: 'Daha güçlü video üretimi ve fikir geliştirme akışı ile yaratıcı işleri hızlandırın.',
    },
    {
      id: 'music',
      title: 'Müzik',
      icon: 'musical-notes',
      accent: '#F59E0B',
      models: ['ChatGPT - GPT-4o Audio', 'Gemini - Lyria'],
      description: 'Ses ve müzik üretimi için daha premium kalite, daha hızlı keşif ve daha net yönlendirme.',
    },
  ];

  const planHighlights = {
    free: ['Temel sohbet erişimi', 'Standart hız', 'Sınırlı premium deneyim'],
    plus: ['Tüm premium deneyim kartlarına erişim', 'Daha akıllı model akışı', 'Öncelikli kalite ve hız'],
    pro: ['En güçlü üretim deneyimi', 'Gelişmiş yaratıcı akış', 'Öncelikli destek ve genişletilmiş erişim'],
  };

  const handleSubscribe = async (planId) => {
    if (planId === 'free') {
      Alert.alert(t.premium.alerts.infoTitle, t.premium.alerts.freePlanActive);
      return;
    }

    const checkoutUrl = LEMONSQUEEZY_CHECKOUT_URLS[planId];
    if (!checkoutUrl) {
      Alert.alert(
        t.premium.alerts.errorTitle,
        'Lemon Squeezy ödeme bağlantısı henüz yapılandırılmadı.'
      );
      return;
    }

    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
        return;
      }

      const supported = await Linking.canOpenURL(checkoutUrl);
      if (supported || checkoutUrl.startsWith('https://')) {
        await Linking.openURL(checkoutUrl);
      } else {
        Alert.alert(t.premium.alerts.errorTitle, t.premium.alerts.checkoutFailed);
      }
    } catch (error) {
      Alert.alert(t.premium.alerts.errorTitle, t.premium.alerts.genericError);
    }
  };

  const plans = [
    {
      id: 'free',
      name: t.premium.plans.free.name,
      price: '₺0',
      period: t.premium.plans.free.period,
      features: t.premium.plans.free.features,
      highlights: planHighlights.free,
      buttonText: t.premium.plans.free.buttonText,
      popular: false,
      accent: '#6B7280',
    },
    {
      id: 'plus',
      name: t.premium.plans.plus.name,
      price: '₺599',
      period: t.premium.plans.plus.period,
      features: t.premium.plans.plus.features,
      highlights: planHighlights.plus,
      buttonText: t.premium.plans.plus.buttonText,
      popular: true,
      accent: '#10A37F',
    },
    {
      id: 'pro',
      name: t.premium.plans.pro.name,
      price: '₺1.199',
      period: t.premium.plans.pro.period,
      features: t.premium.plans.pro.features,
      highlights: planHighlights.pro,
      buttonText: t.premium.plans.pro.buttonText,
      popular: false,
      accent: '#8B5CF6',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.premium.title}</Text>
        <View style={styles.iconButton} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.heroShell}>
          <View style={styles.heroGlowPrimary} />
          <View style={styles.heroGlowSecondary} />
          <View style={styles.heroCard}>
            <View style={styles.heroBadge}>
              <Ionicons name="sparkles" size={14} color="#10A37F" />
              <Text style={styles.heroBadgeText}>Premium AI Experience</Text>
            </View>
            <Text style={styles.heroTitle}>{t.premium.heroTitle}</Text>
            <Text style={styles.heroSubtitle}>{t.premium.heroSubtitle}</Text>

            <View style={styles.heroStatsRow}>
              <View style={styles.heroStatCard}>
                <Text style={styles.heroStatValue}>4</Text>
                <Text style={styles.heroStatLabel}>Premium Mod</Text>
              </View>
              <View style={styles.heroStatCard}>
                <Text style={styles.heroStatValue}>2</Text>
                <Text style={styles.heroStatLabel}>Amiral Model</Text>
              </View>
              <View style={styles.heroStatCard}>
                <Text style={styles.heroStatValue}>∞</Text>
                <Text style={styles.heroStatLabel}>Yaratıcılık</Text>
              </View>
            </View>
            <View style={styles.heroCtaRow}>
              <TouchableOpacity
                style={[styles.heroCtaButton, styles.heroPrimaryButton]}
                onPress={() => handleSubscribe('plus')}
              >
                <Text style={styles.heroPrimaryButtonText}>{t.premium.plans.plus.buttonText}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.heroCtaButton, styles.heroSecondaryButton]}
                onPress={() => handleSubscribe('pro')}
              >
                <Text style={styles.heroSecondaryButtonText}>{t.premium.plans.pro.buttonText}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Premium Deneyim Alanları</Text>
          <Text style={styles.sectionSubtitle}>
            ChatGPT ve Gemini’nin en güçlü tekil modelleriyle her üretim modunda daha rafine bir deneyim.
          </Text>
          <View style={styles.experienceGrid}>
            {experienceCards.map((item) => (
              <View
                key={item.id}
                style={[styles.experienceCard, { borderColor: item.accent + '55' }]}
              >
                <View style={[styles.experienceIconWrap, { backgroundColor: item.accent + '20' }]}>
                  <Ionicons name={item.icon} size={22} color={item.accent} />
                </View>
                <Text style={styles.experienceTitle}>{item.title}</Text>
                <Text style={styles.experienceDescription}>{item.description}</Text>
                <View style={styles.modelPills}>
                  {item.models.map((model) => (
                    <View key={model} style={styles.modelPill}>
                      <Text style={styles.modelPillText}>{model}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.valueCard}>
            <View style={styles.valueHeader}>
              <Ionicons name="diamond" size={20} color="#F59E0B" />
              <Text style={styles.valueTitle}>Neden Premium?</Text>
            </View>
            <Text style={styles.valueText}>
              Premium ile sadece daha fazla özellik değil, daha düzenli, daha estetik ve daha güçlü bir model
              deneyimi sunuluyor. Sohbetten görsele, videodan müziğe kadar her bölüm artık daha net odaklı bir
              premium akışa sahip.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Planlar</Text>
          <Text style={styles.sectionSubtitle}>
            İhtiyacına göre hızlı erişim, yaratıcı güç veya en üst düzey profesyonel deneyim seç.
          </Text>
          <View style={styles.plansContainer}>
            {plans.map((plan) => (
              <View
                key={plan.id}
                style={[
                  styles.planCard,
                  { borderColor: plan.popular ? plan.accent : '#313244' },
                  plan.popular && styles.popularCard,
                ]}
              >
                <View style={styles.planTopRow}>
                  <View>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <View style={styles.priceContainer}>
                      <Text style={styles.price}>{plan.price}</Text>
                      <Text style={styles.period}>{plan.period}</Text>
                    </View>
                  </View>
                  {plan.popular && (
                    <View style={[styles.popularBadge, { backgroundColor: plan.accent }]}>
                      <Text style={styles.popularText}>{t.premium.popular}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.highlightList}>
                  {plan.highlights.map((highlight) => (
                    <View key={highlight} style={styles.highlightItem}>
                      <Ionicons name="sparkles" size={16} color={plan.accent} />
                      <Text style={styles.highlightText}>{highlight}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.featuresContainer}>
                  {plan.features.map((feature) => (
                    <View key={feature} style={styles.featureItem}>
                      <Ionicons name="checkmark-circle" size={18} color={plan.accent} />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  style={[
                    styles.subscribeButton,
                    { backgroundColor: plan.id === 'free' ? 'transparent' : plan.accent },
                    plan.id === 'free' && styles.freeButton,
                  ]}
                  onPress={() => handleSubscribe(plan.id)}
                >
                  <Text
                    style={[
                      styles.subscribeButtonText,
                      plan.id === 'free' && styles.freeButtonText,
                    ]}
                  >
                    {plan.buttonText}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.trustCard}>
          <View style={styles.trustIconWrap}>
            <Ionicons name="shield-checkmark" size={28} color="#10A37F" />
          </View>
          <Text style={styles.guaranteeTitle}>{t.premium.guaranteeTitle}</Text>
          <Text style={styles.guaranteeText}>{t.premium.guaranteeText}</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t.premium.footerText}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070B14',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  heroShell: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  heroGlowPrimary: {
    position: 'absolute',
    top: 18,
    right: 20,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(16, 163, 127, 0.16)',
  },
  heroGlowSecondary: {
    position: 'absolute',
    top: 70,
    left: 8,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(139, 92, 246, 0.14)',
  },
  heroCard: {
    borderRadius: 28,
    padding: 24,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    overflow: 'hidden',
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 18,
  },
  heroBadgeText: {
    color: '#E5E7EB',
    fontSize: 12,
    fontWeight: '700',
  },
  heroTitle: {
    fontSize: 30,
    lineHeight: 38,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  heroSubtitle: {
    color: '#9CA3AF',
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 22,
  },
  heroStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  heroStatCard: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  heroStatValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  heroStatLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 18,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  sectionSubtitle: {
    color: '#94A3B8',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  experienceGrid: {
    gap: 14,
  },
  experienceCard: {
    backgroundColor: '#0F172A',
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
  },
  experienceIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  experienceTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  experienceDescription: {
    color: '#94A3B8',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 14,
  },
  modelPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modelPill: {
    backgroundColor: '#111827',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  modelPillText: {
    color: '#E5E7EB',
    fontSize: 12,
    fontWeight: '600',
  },
  valueCard: {
    backgroundColor: '#0B1220',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  valueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  valueTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  valueText: {
    color: '#94A3B8',
    fontSize: 14,
    lineHeight: 22,
  },
  plansContainer: {
    gap: 16,
    paddingBottom: 4,
  },
  planCard: {
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
  },
  popularCard: {
    shadowColor: '#10A37F',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  planTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  popularBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  planName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  price: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '800',
  },
  period: {
    color: '#94A3B8',
    fontSize: 15,
    marginLeft: 6,
    marginBottom: 5,
  },
  highlightList: {
    marginBottom: 14,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  highlightText: {
    color: '#E5E7EB',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  featuresContainer: {
    marginBottom: 18,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureText: {
    color: '#CBD5E1',
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  subscribeButton: {
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscribeButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  freeButton: {
    borderWidth: 1,
    borderColor: '#334155',
  },
  freeButtonText: {
    color: '#CBD5E1',
  },
  trustCard: {
    marginTop: 24,
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1E293B',
    alignItems: 'center',
  },
  trustIconWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(16, 163, 127, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  guaranteeTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  guaranteeText: {
    color: '#94A3B8',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 34,
    alignItems: 'center',
  },
  footerText: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});
