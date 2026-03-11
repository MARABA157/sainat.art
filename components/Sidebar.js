import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

export default function Sidebar({
  isOpen,
  onClose,
  onNewChat,
  onPremium,
  onSelectChatTheme,
  selectedChatTheme,
  chatThemes,
  onProfilePress,
  conversations,
  onSelectConversation,
  currentConversationId,
  t,
  theme,
}) {
  const { user } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chatThemeOpen, setChatThemeOpen] = useState(false);
  const themeListRef = useRef(null);
  const themeScrollOffsetRef = useRef(0);
  const themeCardStep = 212;

  if (!isOpen) {
    return null;
  }

  const scrollThemes = (direction) => {
    const nextOffset = Math.max(0, themeScrollOffsetRef.current + direction * themeCardStep);

    if (themeListRef.current) {
      themeListRef.current.scrollToOffset({
        animated: true,
        offset: nextOffset,
      });
    }

    themeScrollOffsetRef.current = nextOffset;
  };

  return (
    <View pointerEvents="box-none" style={styles.drawerContainer}>
      <View style={[styles.sidebar, { backgroundColor: theme.sidebarBackground }]}>
        <View style={styles.header}>
          <TouchableOpacity style={[styles.newChatButton, { borderColor: theme.sidebarBorder }]} onPress={onNewChat}>
            <Ionicons name="add" size={20} color={theme.sidebarText} />
            <Text style={[styles.newChatText, { color: theme.sidebarText }]}>{t.sidebar.newChat}</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.sidebarBorder }]} />

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.sidebarMutedText }]}>
            {conversations.length > 0 ? t.sidebar.history || 'Geçmiş' : t.sidebar.today}
          </Text>
          
          {conversations.length === 0 ? (
            <TouchableOpacity style={styles.chatItem} onPress={onNewChat}>
              <Ionicons name="chatbubble-outline" size={16} color={theme.sidebarMutedText} />
              <Text style={[styles.chatText, { color: theme.sidebarText }]}>{t.sidebar.newChat}</Text>
            </TouchableOpacity>
          ) : (
            conversations.map((conv) => (
              <TouchableOpacity 
                key={conv.id} 
                style={[
                  styles.chatItem,
                  currentConversationId === conv.id && [styles.chatItemActive, { backgroundColor: theme.sidebarPremiumBackground }]
                ]}
                onPress={() => onSelectConversation && onSelectConversation(conv.id)}
              >
                <Ionicons 
                  name="chatbubble-outline" 
                  size={16} 
                  color={currentConversationId === conv.id ? theme.sidebarText : theme.sidebarMutedText} 
                />
                <Text 
                  style={[
                    styles.chatText, 
                    { color: currentConversationId === conv.id ? theme.sidebarText : theme.sidebarMutedText }
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {conv.title || 'Yeni Sohbet'}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={[styles.footer, { borderTopColor: theme.sidebarBorder }]}>
          <TouchableOpacity style={[styles.premiumButton, { backgroundColor: theme.sidebarPremiumBackground }]} onPress={onPremium}>
            <Ionicons name="star" size={20} color="#FFD700" />
            <Text style={styles.premiumText}>{t.sidebar.upgrade}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.footerItem}
            onPress={() => {
              setSettingsOpen((prev) => {
                const nextValue = !prev;

                if (!nextValue) {
                  setChatThemeOpen(false);
                }

                return nextValue;
              });
            }}
          >
            <Ionicons name="settings-outline" size={20} color={theme.sidebarMutedText} />
            <Text style={[styles.footerText, { color: theme.sidebarText }]}>{t.sidebar.settings}</Text>
            <View style={styles.footerSpacer} />
            <Ionicons
              name={settingsOpen ? 'chevron-up-outline' : 'chevron-forward-outline'}
              size={18}
              color={theme.sidebarMutedText}
            />
          </TouchableOpacity>
          {settingsOpen && (
            <View style={styles.themeSection}>
              <TouchableOpacity
                style={styles.settingItem}
                onPress={() => setChatThemeOpen((prev) => !prev)}
              >
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingTitle, { color: theme.sidebarText }]}>{t.sidebar.chatTheme}</Text>
                  <Text style={[styles.settingValue, { color: theme.sidebarMutedText }]}>
                    {selectedChatTheme.name}
                  </Text>
                </View>
                <Ionicons
                  name={chatThemeOpen ? 'chevron-up-outline' : 'chevron-forward-outline'}
                  size={18}
                  color={theme.sidebarMutedText}
                />
              </TouchableOpacity>
              {chatThemeOpen && (
                <View style={styles.themeCarousel}>
                  <TouchableOpacity
                    style={[styles.themeNavButton, { backgroundColor: theme.sidebarPremiumBackground }]}
                    onPress={() => scrollThemes(-1)}
                  >
                    <Ionicons name="chevron-back" size={18} color={theme.sidebarText} />
                  </TouchableOpacity>
                  <FlatList
                    ref={themeListRef}
                    data={chatThemes}
                    horizontal
                    nestedScrollEnabled
                    directionalLockEnabled
                    keyboardShouldPersistTaps="handled"
                    showsHorizontalScrollIndicator={false}
                    style={styles.themeScroll}
                    contentContainerStyle={styles.themeList}
                    keyExtractor={(item) => item.id}
                    onScroll={(event) => {
                      themeScrollOffsetRef.current = event.nativeEvent.contentOffset.x;
                    }}
                    scrollEventThrottle={16}
                    renderItem={({ item: chatTheme }) => {
                      const isSelected = selectedChatTheme.id === chatTheme.id;

                      return (
                        <TouchableOpacity
                          style={styles.themeCard}
                          onPress={() => onSelectChatTheme(chatTheme)}
                          activeOpacity={0.85}
                        >
                          {chatTheme.preview ? (
                            <ImageBackground
                              source={chatTheme.preview}
                              style={styles.themePreview}
                              imageStyle={styles.themePreviewImage}
                            >
                              <View
                                style={[
                                  styles.themeOverlay,
                                  isSelected && styles.themeOverlaySelected,
                                ]}
                              >
                                {isSelected && (
                                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                                )}
                              </View>
                            </ImageBackground>
                          ) : (
                            <View
                              style={[
                                styles.themePreview,
                                styles.colorThemePreview,
                                { backgroundColor: chatTheme.backgroundColor },
                              ]}
                            >
                              <View
                                style={[
                                  styles.themeOverlay,
                                  styles.colorThemeOverlay,
                                  isSelected && styles.themeOverlaySelected,
                                ]}
                              >
                                {isSelected && (
                                  <Ionicons
                                    name="checkmark-circle"
                                    size={20}
                                    color={chatTheme.palette === 'dark' ? '#FFFFFF' : '#111827'}
                                  />
                                )}
                              </View>
                            </View>
                          )}
                          <Text style={[styles.themeCardTitle, { color: theme.sidebarText }]}>
                            {chatTheme.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    }}
                  />
                  <TouchableOpacity
                    style={[styles.themeNavButton, { backgroundColor: theme.sidebarPremiumBackground }]}
                    onPress={() => scrollThemes(1)}
                  >
                    <Ionicons name="chevron-forward" size={18} color={theme.sidebarText} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {user && (
            <TouchableOpacity style={styles.footerItem} onPress={onProfilePress}>
              <Ionicons name="person-outline" size={20} color={theme.sidebarMutedText} />
              <Text style={[styles.footerText, { color: theme.sidebarText }]}>{t.sidebar.profile}</Text>
              <View style={styles.footerSpacer} />
              <Ionicons name="chevron-forward-outline" size={18} color={theme.sidebarMutedText} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    elevation: 20,
    pointerEvents: 'box-none',
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: width * 0.75,
    maxWidth: 300,
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  newChatText: {
    fontSize: 14,
    marginLeft: 12,
  },
  divider: {
    height: 1,
    marginHorizontal: 12,
  },
  section: {
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  chatText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    padding: 12,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  footerSpacer: {
    flex: 1,
  },
  premiumButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  premiumText: {
    color: '#FFD700',
    fontSize: 14,
    marginLeft: 12,
    fontWeight: '600',
  },
  footerText: {
    fontSize: 14,
    marginLeft: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 14,
  },
  settingValue: {
    fontSize: 12,
    marginTop: 2,
  },
  themeSection: {
    paddingTop: 4,
  },
  themeCarousel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeNavButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  themeScroll: {
    flex: 1,
  },
  themeList: {
    paddingHorizontal: 4,
    paddingTop: 6,
    paddingBottom: 4,
    paddingRight: 4,
  },
  themeCard: {
    width: 112,
    marginRight: 10,
  },
  themePreview: {
    height: 124,
    borderRadius: 14,
    overflow: 'hidden',
    justifyContent: 'flex-start',
  },
  themePreviewImage: {
    borderRadius: 14,
  },
  colorThemePreview: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  themeOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
    alignItems: 'flex-end',
    padding: 8,
  },
  colorThemeOverlay: {
    backgroundColor: 'transparent',
  },
  themeOverlaySelected: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 14,
  },
  chatItemActive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
  },
  themeCardTitle: {
    fontSize: 12,
    marginTop: 8,
  },
});
