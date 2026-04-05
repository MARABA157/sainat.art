import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

export default function ProfileScreen({
  t,
  theme,
  onClose,
  chatThemes = [],
  selectedChatTheme,
  onSelectChatTheme,
}) {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeSheet, setActiveSheet] = useState(null);
  const [activePage, setActivePage] = useState(null);
  const [profileDraft, setProfileDraft] = useState({
    fullName: user?.user_metadata?.full_name || user?.email?.split('@')[0] || '',
    role: user?.user_metadata?.role || 'Yapay zeka meraklısı',
    bio: user?.user_metadata?.bio || 'Üretkenlik, öğrenme ve yaratıcılık için sainat kullanıyor.',
  });

  const selectedThemeName = selectedChatTheme?.name || t.profile.auto;

  const supportContent = useMemo(
    () => ({
      help: {
        title: t.profile.helpCenter,
        icon: 'help-buoy',
        sections: [
          {
            heading: 'Sainat ile neler yapabilirsiniz?',
            body:
              'Sohbet oluşturabilir, yapay zeka destekli dosya dönüşümleri yapabilir, farklı tema deneyimleri arasında geçiş yapabilir ve hesabınızı tek merkezden yönetebilirsiniz.',
          },
          {
            heading: 'En hızlı başlangıç',
            body:
              'Yeni sohbet başlatın, profilinizden tema tercihinizi seçin ve AI Dosya Dönüştürücü ekranından belge, görsel ve metin dosyalarını dönüştürmeyi deneyin.',
          },
          {
            heading: 'Destek gerektiğinde',
            body:
              'Giriş, dosya yükleme veya tema davranışıyla ilgili sorunlarda geri bildirim alanını kullanın. Hata adımlarını yazmanız çözümü çok hızlandırır.',
          },
        ],
      },
      feedback: {
        title: t.profile.sendFeedback,
        icon: 'chatbox-ellipses',
        sections: [
          {
            heading: 'Geri bildiriminiz değerli',
            body:
              'Sainat deneyimini daha akıllı, daha hızlı ve daha estetik hale getirmek için görüşlerinizi düzenli olarak değerlendiriyoruz.',
          },
          {
            heading: 'En yararlı geri bildirim formatı',
            body:
              'Ne yapmaya çalıştığınızı, ne beklediğinizi ve ekranda gerçekte ne olduğunu kısa maddeler halinde yazın. Mümkünse ekran görüntüsü ekleyin.',
          },
          {
            heading: 'Örnek başlıklar',
            body:
              '“Profil ekranı açılmıyor”, “Dosya dönüşümü mobilde zayıf”, “Tema kartları daha premium olabilir” gibi net başlıklar çok faydalıdır.',
          },
        ],
      },
      privacy: {
        title: t.profile.privacyPolicy,
        icon: 'shield-checkmark',
        sections: [
          {
            heading: 'Veri yaklaşımımız',
            body:
              'Kullanıcı deneyimini geliştirmek için yalnızca gerekli hesap ve oturum verileri işlenir. Erişimler yetkilendirme ve güvenlik kurallarına göre sınırlandırılır.',
          },
          {
            heading: 'Güvenlik ilkeleri',
            body:
              'Kimlik doğrulama akışları güvenli redirect ayarları ile korunur. Uygulama içinde hassas anahtarlar gömülü tutulmaz ve oturumlar güvenli şekilde yönetilir.',
          },
          {
            heading: 'Kullanıcı kontrolü',
            body:
              'Profil, oturum ve tercih yönetimi kullanıcı kontrolündedir. Hesapla ilişkili işlemlerde şeffaflık ve minimum veri prensibi hedeflenir.',
          },
        ],
      },
      terms: {
        title: t.profile.termsOfService,
        icon: 'document-text',
        sections: [
          {
            heading: 'Kullanım çerçevesi',
            body:
              'Sainat üretkenlik, yaratıcılık ve bilgi erişimi amacıyla sunulur. Kullanıcılar sistemi hukuka, platform kurallarına ve etik kullanıma uygun biçimde kullanmalıdır.',
          },
          {
            heading: 'Hizmet kalitesi',
            body:
              'Bazı özellikler geliştirme aşamasında olabilir. Uygulama sürekli iyileştirilir ve deneyimi etkileyen hatalar öncelikli olarak ele alınır.',
          },
          {
            heading: 'Sorumlu kullanım',
            body:
              'Spam, kötüye kullanım, otomatik saldırı denemeleri ve güvenlik ihlali oluşturabilecek kullanım biçimleri engellenebilir veya sınırlandırılabilir.',
          },
        ],
      },
    }),
    [t]
  );

  const handleSignOut = async () => {
    console.log('handleSignOut called - bypassing Alert');
    try {
      setLoading(true);
      console.log('Calling signOut...');
      await signOut();
      console.log('Sign out successful');
      if (onClose) {
        console.log('Calling onClose...');
        onClose();
      }
    } catch (error) {
      console.error('Sign out error:', error);
      Alert.alert(t.profile.error, error?.message || 'Çıkış yapılırken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const openSupportSheet = (sheetKey) => {
    if (sheetKey === 'privacy') {
      setActivePage(sheetKey);
      return;
    }

    setActiveSheet(sheetKey);
  };

  const handleSaveProfile = () => {
    setActiveSheet(null);
    Alert.alert(
      'Profil güncellendi',
      'Gelişmiş profil düzenleme alanı hazırlandı. Kalıcı kayıt için bu alanı ileride Supabase profil tablosuna bağlayabiliriz.'
    );
  };

  const profileSections = [
    {
      id: 'account',
      title: t.profile.sections.account,
      items: [
        { id: 'email', icon: 'mail', label: t.profile.email, value: user?.email },
        { id: 'name', icon: 'person', label: t.profile.name, value: profileDraft.fullName || t.profile.notSet },
        { id: 'joined', icon: 'calendar', label: t.profile.memberSince, value: new Date(user?.created_at).toLocaleDateString() },
      ],
    },
    {
      id: 'preferences',
      title: t.profile.sections.preferences,
      items: [
        { id: 'language', icon: 'language', label: t.profile.language, value: 'Türkçe', action: true },
        { id: 'notifications', icon: 'notifications', label: t.profile.notifications, value: t.profile.enabled, action: true },
        { id: 'theme', icon: 'color-palette', label: t.profile.themePreference, value: selectedThemeName, action: true },
      ],
    },
    {
      id: 'usage',
      title: t.profile.sections.usage,
      items: [
        { id: 'plan', icon: 'diamond', label: t.profile.currentPlan, value: t.profile.freePlan, highlight: true },
        { id: 'messages', icon: 'chatbubbles', label: t.profile.messagesUsed, value: '247 / ∞' },
        { id: 'storage', icon: 'cloud', label: t.profile.storageUsed, value: '1.2 GB / 5 GB' },
      ],
    },
    {
      id: 'support',
      title: t.profile.sections.support,
      items: [
        { id: 'help', icon: 'help-circle', label: t.profile.helpCenter, action: true },
        { id: 'feedback', icon: 'chatbox-ellipses', label: t.profile.sendFeedback, action: true },
        { id: 'privacy', icon: 'shield-checkmark', label: t.profile.privacyPolicy, action: true },
        { id: 'terms', icon: 'document-text', label: t.profile.termsOfService, action: true },
      ],
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.sidebarBackground }]}>
      <View style={[styles.header, { borderBottomColor: theme.sidebarBorder }]}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="arrow-back" size={24} color={theme.sidebarText} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.sidebarText }]}>{t.profile.title}</Text>
        <View style={styles.closeButton} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.profileCard, { backgroundColor: theme.headerBackground }]}>
          <View style={styles.avatarContainer}>
            {user?.user_metadata?.avatar_url ? (
              <Image
                source={{ uri: user.user_metadata.avatar_url }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: theme.paletteAccent || '#10A37F' }]}>
                <Text style={styles.avatarText}>
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            )}
          </View>
          <Text style={[styles.userName, { color: theme.headerText }]}>
            {profileDraft.fullName || user?.email?.split('@')[0] || t.profile.user}
          </Text>
          <Text style={[styles.userEmail, { color: theme.sidebarTextSecondary }]}>
            {user?.email}
          </Text>
          <Text style={[styles.userMeta, { color: theme.sidebarTextSecondary }]}>
            {profileDraft.role}
          </Text>
          <Text style={[styles.userBio, { color: theme.sidebarMutedText }]}>
            {profileDraft.bio}
          </Text>
          <TouchableOpacity
            style={[styles.editProfileButton, { backgroundColor: theme.paletteAccent || '#10A37F' }]}
            onPress={() => setActiveSheet('editProfile')}
          >
            <Ionicons name="create-outline" size={16} color="#FFFFFF" />
            <Text style={styles.editProfileButtonText}>Profili Düzenle</Text>
          </TouchableOpacity>
        </View>

        {profileSections.map((section) => (
          <View key={section.id} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.sidebarTextSecondary }]}>
              {section.title}
            </Text>
            <View style={[styles.sectionCard, { backgroundColor: theme.headerBackground }]}>
              {section.items.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.sectionItem,
                    index !== section.items.length - 1 && styles.sectionItemBorder,
                    { borderBottomColor: theme.sidebarBorder },
                  ]}
                  onPress={
                    item.action
                      ? () => {
                          if (item.id === 'theme') {
                            setActiveSheet('theme');
                            return;
                          }
                          if (item.id === 'help' || item.id === 'feedback' || item.id === 'terms') {
                            openSupportSheet(item.id);
                            return;
                          }
                          if (item.id === 'privacy') {
                            setActivePage('privacy');
                            return;
                          }
                          Alert.alert('Yakında', `${item.label} için gelişmiş ayar ekranı bir sonraki aşamada eklenecek.`);
                        }
                      : null
                  }
                  disabled={!item.action}
                >
                  <View style={styles.itemLeft}>
                    <View
                      style={[
                        styles.itemIcon,
                        {
                          backgroundColor: item.highlight
                            ? theme.paletteAccent || '#10A37F'
                            : theme.sidebarBackground,
                        },
                      ]}
                    >
                      <Ionicons
                        name={item.icon}
                        size={20}
                        color={item.highlight ? '#FFFFFF' : theme.sidebarText}
                      />
                    </View>
                    <Text style={[styles.itemLabel, { color: theme.sidebarText }]}>
                      {item.label}
                    </Text>
                  </View>
                  <View style={styles.itemRight}>
                    <Text
                      style={[
                        styles.itemValue,
                        { color: theme.sidebarTextSecondary },
                        item.highlight && { color: theme.paletteAccent || '#10A37F', fontWeight: '600' },
                      ]}
                    >
                      {item.value}
                    </Text>
                    {item.action && (
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={theme.sidebarTextSecondary}
                        style={styles.chevron}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={[styles.signOutButton, { backgroundColor: '#EF4444' }]}
          onPress={handleSignOut}
          disabled={loading}
        >
          <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
          <Text style={styles.signOutText}>
            {loading ? t.profile.signingOut : t.profile.signOut}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.version, { color: theme.sidebarTextSecondary }]}>
          {t.profile.version} 1.0.0
        </Text>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={false}
        visible={Boolean(activePage && supportContent[activePage])}
        onRequestClose={() => setActivePage(null)}
      >
        {activePage && supportContent[activePage] ? (
          <View style={[styles.pageContainer, { backgroundColor: theme.sidebarBackground }]}>
            <View style={[styles.header, { borderBottomColor: theme.sidebarBorder }]}>
              <TouchableOpacity style={styles.closeButton} onPress={() => setActivePage(null)}>
                <Ionicons name="arrow-back" size={24} color={theme.sidebarText} />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: theme.sidebarText }]}>
                {supportContent[activePage].title}
              </Text>
              <View style={styles.closeButton} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              <View style={[styles.pageHero, { backgroundColor: theme.headerBackground, borderColor: theme.sidebarBorder }]}>
                <View style={[styles.pageHeroIcon, { backgroundColor: theme.paletteAccent || '#10A37F' }]}>
                  <Ionicons name={supportContent[activePage].icon} size={26} color="#FFFFFF" />
                </View>
                <Text style={[styles.pageTitle, { color: theme.headerText }]}>{supportContent[activePage].title}</Text>
                <Text style={[styles.pageSubtitle, { color: theme.sidebarTextSecondary }]}>
                  Kullanıcı verileri, oturum akışları ve temel güvenlik ilkeleri için güncel özet bilgileri burada bulabilirsiniz.
                </Text>
              </View>

              {supportContent[activePage].sections.map((section) => (
                <View
                  key={section.heading}
                  style={[
                    styles.supportCard,
                    styles.pageCard,
                    { backgroundColor: theme.headerBackground, borderColor: theme.sidebarBorder },
                  ]}
                >
                  <Text style={[styles.supportHeading, { color: theme.sidebarText }]}>{section.heading}</Text>
                  <Text style={[styles.supportBody, { color: theme.sidebarTextSecondary }]}>{section.body}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        ) : null}
      </Modal>

      <Modal
        animationType="slide"
        transparent
        visible={Boolean(activeSheet)}
        onRequestClose={() => setActiveSheet(null)}
      >
        <View style={styles.sheetBackdrop}>
          <View style={[styles.sheetContainer, { backgroundColor: theme.headerBackground }]}>
            {activeSheet === 'theme' && (
              <>
                <View style={styles.sheetHeader}>
                  <Text style={[styles.sheetTitle, { color: theme.headerText }]}>Sohbet Teması</Text>
                  <TouchableOpacity onPress={() => setActiveSheet(null)}>
                    <Ionicons name="close" size={22} color={theme.sidebarText} />
                  </TouchableOpacity>
                </View>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={styles.themeGrid}>
                    {chatThemes.map((chatTheme) => {
                      const isSelected = selectedChatTheme?.id === chatTheme.id;
                      return (
                        <TouchableOpacity
                          key={chatTheme.id}
                          style={[
                            styles.themeOption,
                            {
                              borderColor: isSelected ? theme.paletteAccent || '#10A37F' : theme.sidebarBorder,
                              backgroundColor: theme.sidebarBackground,
                            },
                          ]}
                          onPress={() => {
                            onSelectChatTheme?.(chatTheme);
                            setActiveSheet(null);
                          }}
                        >
                          <View
                            style={[
                              styles.themePreview,
                              {
                                backgroundColor: chatTheme.preview ? 'transparent' : chatTheme.backgroundColor || theme.screenBackground,
                              },
                            ]}
                          >
                            {chatTheme.preview ? (
                              <Image source={chatTheme.preview} style={styles.themePreviewImage} />
                            ) : null}
                            {isSelected && (
                              <View style={styles.themeCheck}>
                                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                              </View>
                            )}
                          </View>
                          <Text style={[styles.themeOptionTitle, { color: theme.sidebarText }]}>{chatTheme.name}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              </>
            )}

            {activeSheet === 'editProfile' && (
              <>
                <View style={styles.sheetHeader}>
                  <Text style={[styles.sheetTitle, { color: theme.headerText }]}>Gelişmiş Profil Düzenle</Text>
                  <TouchableOpacity onPress={() => setActiveSheet(null)}>
                    <Ionicons name="close" size={22} color={theme.sidebarText} />
                  </TouchableOpacity>
                </View>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text style={[styles.inputLabel, { color: theme.sidebarText }]}>Görünen Ad</Text>
                  <TextInput
                    value={profileDraft.fullName}
                    onChangeText={(value) => setProfileDraft((prev) => ({ ...prev, fullName: value }))}
                    style={[
                      styles.textInput,
                      {
                        color: theme.sidebarText,
                        borderColor: theme.sidebarBorder,
                        backgroundColor: theme.sidebarBackground,
                      },
                    ]}
                    placeholder="Adınızı girin"
                    placeholderTextColor={theme.sidebarMutedText}
                  />
                  <Text style={[styles.inputLabel, { color: theme.sidebarText }]}>Rol / Unvan</Text>
                  <TextInput
                    value={profileDraft.role}
                    onChangeText={(value) => setProfileDraft((prev) => ({ ...prev, role: value }))}
                    style={[
                      styles.textInput,
                      {
                        color: theme.sidebarText,
                        borderColor: theme.sidebarBorder,
                        backgroundColor: theme.sidebarBackground,
                      },
                    ]}
                    placeholder="Örn. Ürün Tasarımcısı"
                    placeholderTextColor={theme.sidebarMutedText}
                  />
                  <Text style={[styles.inputLabel, { color: theme.sidebarText }]}>Kısa Biyografi</Text>
                  <TextInput
                    value={profileDraft.bio}
                    onChangeText={(value) => setProfileDraft((prev) => ({ ...prev, bio: value }))}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    style={[
                      styles.textArea,
                      {
                        color: theme.sidebarText,
                        borderColor: theme.sidebarBorder,
                        backgroundColor: theme.sidebarBackground,
                      },
                    ]}
                    placeholder="Kendinizi birkaç cümleyle anlatın"
                    placeholderTextColor={theme.sidebarMutedText}
                  />
                  <TouchableOpacity
                    style={[styles.primaryActionButton, { backgroundColor: theme.paletteAccent || '#10A37F' }]}
                    onPress={handleSaveProfile}
                  >
                    <Text style={styles.primaryActionText}>Değişiklikleri Kaydet</Text>
                  </TouchableOpacity>
                </ScrollView>
              </>
            )}

            {activeSheet && supportContent[activeSheet] && (
              <>
                <View style={styles.sheetHeader}>
                  <View style={styles.sheetTitleRow}>
                    <Ionicons
                      name={supportContent[activeSheet].icon}
                      size={20}
                      color={theme.paletteAccent || '#10A37F'}
                    />
                    <Text style={[styles.sheetTitle, { color: theme.headerText }]}>
                      {supportContent[activeSheet].title}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setActiveSheet(null)}>
                    <Ionicons name="close" size={22} color={theme.sidebarText} />
                  </TouchableOpacity>
                </View>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {supportContent[activeSheet].sections.map((section) => (
                    <View
                      key={section.heading}
                      style={[
                        styles.supportCard,
                        { backgroundColor: theme.sidebarBackground, borderColor: theme.sidebarBorder },
                      ]}
                    >
                      <Text style={[styles.supportHeading, { color: theme.sidebarText }]}>{section.heading}</Text>
                      <Text style={[styles.supportBody, { color: theme.sidebarTextSecondary }]}>{section.body}</Text>
                    </View>
                  ))}
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pageContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  profileCard: {
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  userMeta: {
    fontSize: 14,
    marginTop: 10,
    fontWeight: '600',
  },
  userBio: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  editProfileButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editProfileButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  sectionItemBorder: {
    borderBottomWidth: 1,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemValue: {
    fontSize: 14,
    marginRight: 4,
  },
  chevron: {
    marginLeft: 4,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  signOutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 32,
  },
  pageHero: {
    margin: 16,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
  },
  pageHeroIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 14,
    lineHeight: 22,
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
    maxHeight: '82%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sheetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  themeOption: {
    width: '48%',
    borderWidth: 1,
    borderRadius: 16,
    padding: 10,
    marginBottom: 12,
  },
  themePreview: {
    height: 110,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
  },
  themePreviewImage: {
    width: '100%',
    height: '100%',
  },
  themeCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  themeOptionTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 110,
    marginBottom: 20,
  },
  primaryActionButton: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  supportCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  pageCard: {
    marginHorizontal: 16,
  },
  supportHeading: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  supportBody: {
    fontSize: 14,
    lineHeight: 21,
  },
});
