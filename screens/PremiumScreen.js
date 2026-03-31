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

  const planHighlights = {
    free: ['Günlük kullanım için temel erişim', 'Standart hız', 'Temel destek'],
    plus: ['Daha hızlı ve güçlü kullanım', 'Öncelikli erişim', 'Premium tema ve araçlar'],
    pro: ['En yüksek limitler', 'Gelişmiş araçlar', 'Öncelikli destek'],
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
        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Ionicons name="sparkles" size={14} color="#10A37F" />
            <Text style={styles.heroBadgeText}>Premium</Text>
          </View>
          <Text style={styles.heroTitle}>{t.premium.heroTitle}</Text>
          <Text style={styles.heroSubtitle}>{t.premium.heroSubtitle}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Planlar</Text>
          <Text style={styles.sectionSubtitle}>
            Sana uygun planı seç ve devam et.
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

                <View style={styles.featuresContainer}>
                  {plan.highlights.concat(plan.features).map((feature) => (
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
  heroCard: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 22,
    padding: 20,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    marginBottom: 14,
  },
  heroBadgeText: {
    color: '#E5E7EB',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 8,
  },
  heroTitle: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  heroSubtitle: {
    color: '#9CA3AF',
    fontSize: 14,
    lineHeight: 21,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  sectionSubtitle: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 14,
  },
  plansContainer: {
    gap: 12,
    paddingBottom: 8,
  },
  planCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
  },
  popularCard: {
    shadowColor: '#10A37F',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  planTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  popularBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  planName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  price: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
  },
  period: {
    color: '#94A3B8',
    fontSize: 14,
    marginLeft: 6,
    marginBottom: 5,
  },
  featuresContainer: {
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
  },
  featureText: {
    color: '#CBD5E1',
    fontSize: 13,
    marginLeft: 10,
    flex: 1,
    lineHeight: 19,
  },
  subscribeButton: {
    paddingVertical: 14,
    borderRadius: 14,
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
    marginTop: 18,
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
    alignItems: 'center',
  },
  guaranteeTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
  },
  guaranteeText: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 28,
    alignItems: 'center',
  },
  footerText: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});
