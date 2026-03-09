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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PremiumScreen({ onClose, t }) {
  // Lemonsqueezy Checkout URL'leri - kendi store ID'lerinizle değiştirin
  const LEMONSQUEEZY_CHECKOUT_URLS = {
    plus: 'https://sainat.lemonsqueezy.com/checkout/buy/plus-plan-id',
    pro: 'https://sainat.lemonsqueezy.com/checkout/buy/pro-plan-id',
  };

  const handleSubscribe = async (planId) => {
    if (planId === 'free') {
      Alert.alert(t.premium.alerts.infoTitle, t.premium.alerts.freePlanActive);
      return;
    }

    const checkoutUrl = LEMONSQUEEZY_CHECKOUT_URLS[planId];
    if (checkoutUrl) {
      try {
        const supported = await Linking.canOpenURL(checkoutUrl);
        if (supported) {
          await Linking.openURL(checkoutUrl);
        } else {
          Alert.alert(t.premium.alerts.errorTitle, t.premium.alerts.checkoutFailed);
        }
      } catch (error) {
        Alert.alert(t.premium.alerts.errorTitle, t.premium.alerts.genericError);
      }
    }
  };

  const plans = [
    {
      id: 'free',
      name: t.premium.plans.free.name,
      price: '₺0',
      period: t.premium.plans.free.period,
      features: t.premium.plans.free.features,
      buttonText: t.premium.plans.free.buttonText,
      popular: false,
    },
    {
      id: 'plus',
      name: t.premium.plans.plus.name,
      price: '₺599',
      period: t.premium.plans.plus.period,
      features: t.premium.plans.plus.features,
      buttonText: t.premium.plans.plus.buttonText,
      popular: true,
      checkoutUrl: LEMONSQUEEZY_CHECKOUT_URLS.plus,
    },
    {
      id: 'pro',
      name: t.premium.plans.pro.name,
      price: '₺1.199',
      period: t.premium.plans.pro.period,
      features: t.premium.plans.pro.features,
      buttonText: t.premium.plans.pro.buttonText,
      popular: false,
      checkoutUrl: LEMONSQUEEZY_CHECKOUT_URLS.pro,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.premium.title}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>{t.premium.heroTitle}</Text>
          <Text style={styles.heroSubtitle}>{t.premium.heroSubtitle}</Text>
        </View>

        <View style={styles.plansContainer}>
          {plans.map((plan) => (
            <View
              key={plan.id}
              style={[styles.planCard, plan.popular && styles.popularCard]}
            >
              {plan.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>{t.premium.popular}</Text>
                </View>
              )}

              <Text style={styles.planName}>{plan.name}</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>{plan.price}</Text>
                <Text style={styles.period}>{plan.period}</Text>
              </View>

              <View style={styles.featuresContainer}>
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={plan.popular ? '#10A37F' : '#8E8EA0'}
                    />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.subscribeButton,
                  plan.popular && styles.popularButton,
                  plan.id === 'free' && styles.freeButton,
                ]}
                onPress={() => handleSubscribe(plan.id)}
              >
                <Text
                  style={[
                    styles.subscribeButtonText,
                    plan.popular && styles.popularButtonText,
                    plan.id === 'free' && styles.freeButtonText,
                  ]}
                >
                  {plan.buttonText}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.guaranteeSection}>
          <Ionicons name="shield-checkmark" size={32} color="#10A37F" />
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
    backgroundColor: '#343541',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#4D4D4F',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#8E8EA0',
    textAlign: 'center',
  },
  plansContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  planCard: {
    backgroundColor: '#40414F',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#4D4D4F',
  },
  popularCard: {
    borderColor: '#10A37F',
    borderWidth: 2,
  },
  popularBadge: {
    backgroundColor: '#10A37F',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 24,
  },
  price: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  period: {
    fontSize: 16,
    color: '#8E8EA0',
    marginLeft: 4,
  },
  featuresContainer: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#ECECF1',
    marginLeft: 12,
  },
  subscribeButton: {
    backgroundColor: '#4D4D4F',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  popularButton: {
    backgroundColor: '#10A37F',
  },
  freeButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4D4D4F',
  },
  subscribeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  popularButtonText: {
    color: '#FFFFFF',
  },
  freeButtonText: {
    color: '#8E8EA0',
  },
  guaranteeSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    marginTop: 16,
  },
  guaranteeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  guaranteeText: {
    fontSize: 14,
    color: '#8E8EA0',
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#8E8EA0',
    textAlign: 'center',
  },
});
