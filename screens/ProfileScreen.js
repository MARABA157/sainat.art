import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

export default function ProfileScreen({ t, theme, onClose }) {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    Alert.alert(
      t.profile.signOutConfirm.title,
      t.profile.signOutConfirm.message,
      [
        {
          text: t.profile.signOutConfirm.cancel,
          style: 'cancel',
        },
        {
          text: t.profile.signOutConfirm.confirm,
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await signOut();
              onClose();
            } catch (error) {
              Alert.alert(t.profile.error, error.message);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const profileSections = [
    {
      id: 'account',
      title: t.profile.sections.account,
      items: [
        { id: 'email', icon: 'mail', label: t.profile.email, value: user?.email },
        { id: 'name', icon: 'person', label: t.profile.name, value: user?.user_metadata?.full_name || t.profile.notSet },
        { id: 'joined', icon: 'calendar', label: t.profile.memberSince, value: new Date(user?.created_at).toLocaleDateString() },
      ],
    },
    {
      id: 'preferences',
      title: t.profile.sections.preferences,
      items: [
        { id: 'language', icon: 'language', label: t.profile.language, value: 'Türkçe', action: true },
        { id: 'notifications', icon: 'notifications', label: t.profile.notifications, value: t.profile.enabled, action: true },
        { id: 'theme', icon: 'color-palette', label: t.profile.themePreference, value: t.profile.auto, action: true },
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
            {user?.user_metadata?.full_name || user?.email?.split('@')[0] || t.profile.user}
          </Text>
          <Text style={[styles.userEmail, { color: theme.sidebarTextSecondary }]}>
            {user?.email}
          </Text>
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
                  onPress={item.action ? () => {} : null}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
});
