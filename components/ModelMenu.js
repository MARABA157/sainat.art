import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const aiModels = [
  { id: 'deepseek', labelKey: 'deepseek', icon: 'sparkles', color: '#4F46E5' },
  { id: 'gemini', labelKey: 'gemini', icon: 'planet', color: '#4285F4' },
  { id: 'chatgpt', labelKey: 'chatgpt', icon: 'chatbubble', color: '#10A37F' },
];

const deepseekChatModels = [
  { id: 'deepseek-v3', labelKey: 'v3', parentId: 'deepseek', icon: 'sparkles', color: '#6366F1' },
  { id: 'deepseek-r1', labelKey: 'r1', parentId: 'deepseek', icon: 'flash', color: '#7C3AED' },
];

const geminiChatModels = [
  { id: 'gemini-2-flash', labelKey: 'flash', parentId: 'gemini', icon: 'flash', color: '#4285F4' },
  { id: 'gemini-1-5-pro', labelKey: 'pro', parentId: 'gemini', icon: 'planet', color: '#2563EB' },
];

const chatgptChatModels = [
  { id: 'gpt-4o', labelKey: 'gpt4o', parentId: 'chatgpt', icon: 'chatbubble', color: '#10A37F' },
  { id: 'o3-mini', labelKey: 'o3mini', parentId: 'chatgpt', icon: 'sparkles', color: '#059669' },
];

const mediaTypes = [
  { id: 'image', labelKey: 'image', icon: 'image', color: '#E91E63' },
  { id: 'video', labelKey: 'video', icon: 'videocam', color: '#FF5722' },
  { id: 'music', labelKey: 'music', icon: 'musical-notes', color: '#9C27B0' },
];

const imageGenerationModels = [
  { id: 'gemini-image', labelKey: 'gemini', parentId: 'image', icon: 'planet', color: '#4285F4' },
  { id: 'chatgpt-image', labelKey: 'chatgpt', parentId: 'image', icon: 'sparkles', color: '#10A37F' },
  { id: 'deepseek-image', labelKey: 'deepseek', parentId: 'image', icon: 'image', color: '#6366F1' },
];

const videoGenerationModels = [
  { id: 'gemini-video', labelKey: 'gemini', parentId: 'video', icon: 'videocam', color: '#4285F4' },
  { id: 'chatgpt-video', labelKey: 'chatgpt', parentId: 'video', icon: 'film', color: '#10A37F' },
  { id: 'deepseek-video', labelKey: 'deepseek', parentId: 'video', icon: 'play', color: '#6366F1' },
];

const musicGenerationModels = [
  { id: 'gemini-music', labelKey: 'gemini', parentId: 'music', icon: 'musical-note', color: '#4285F4' },
];

export default function ModelMenu({ isVisible, onClose, onSelect, t }) {
  const [deepseekOpen, setDeepseekOpen] = useState(false);
  const [geminiOpen, setGeminiOpen] = useState(false);
  const [chatgptOpen, setChatgptOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [musicOpen, setMusicOpen] = useState(false);

  const handleSelect = (item) => {
    onSelect(item);
    setDeepseekOpen(false);
    setGeminiOpen(false);
    setChatgptOpen(false);
    setImageOpen(false);
    setVideoOpen(false);
    setMusicOpen(false);
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.overlay} onPress={onClose}>
        <View style={styles.menuContainer}>
          <View style={styles.menu}>
            <Text style={styles.sectionTitle}>{t.modelMenu.title}</Text>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              {aiModels.map((model) => {
                const isDeepSeek = model.id === 'deepseek';
                const isGemini = model.id === 'gemini';
                const isChatGpt = model.id === 'chatgpt';
                const isOpen = isDeepSeek ? deepseekOpen : isGemini ? geminiOpen : isChatGpt ? chatgptOpen : false;
                const subModels = isDeepSeek
                  ? deepseekChatModels
                  : isGemini
                    ? geminiChatModels
                    : isChatGpt
                      ? chatgptChatModels
                      : [];
                const translationGroup = isDeepSeek
                  ? t.modelMenu.deepseekModels
                  : isGemini
                    ? t.modelMenu.geminiModels
                    : t.modelMenu.chatgptModels;

                return (
                  <View key={model.id}>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => {
                        if (isDeepSeek) {
                          setDeepseekOpen((prev) => !prev);
                          return;
                        }

                        if (isGemini) {
                          setGeminiOpen((prev) => !prev);
                          return;
                        }

                        if (isChatGpt) {
                          setChatgptOpen((prev) => !prev);
                          return;
                        }

                        handleSelect(model);
                      }}
                    >
                      <View style={[styles.iconContainer, { backgroundColor: model.color }]}>
                        <Ionicons name={model.icon} size={20} color="#FFFFFF" />
                      </View>
                      <Text style={styles.menuItemText}>{t.modelMenu.aiModels[model.labelKey]}</Text>
                      <Ionicons
                        name={isOpen ? 'chevron-up' : 'chevron-forward'}
                        size={20}
                        color="#8E8EA0"
                      />
                    </TouchableOpacity>
                    {isOpen && (
                      <View style={styles.subMenu}>
                        {subModels.map((subModel) => (
                          <TouchableOpacity
                            key={subModel.id}
                            style={styles.subMenuItem}
                            onPress={() => handleSelect(subModel)}
                          >
                            <View style={[styles.subIconContainer, { backgroundColor: subModel.color }]}>
                              <Ionicons name={subModel.icon} size={16} color="#FFFFFF" />
                            </View>
                            <Text style={styles.subMenuItemText}>
                              {translationGroup[subModel.labelKey]}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}

              <View style={styles.divider} />

              {mediaTypes.map((media) => {
                const isImage = media.id === 'image';
                const isVideo = media.id === 'video';
                const isMusic = media.id === 'music';

                return (
                  <View key={media.id}>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => {
                        if (isImage) {
                          setImageOpen((prev) => !prev);
                          return;
                        }

                        if (isVideo) {
                          setVideoOpen((prev) => !prev);
                          return;
                        }

                        if (isMusic) {
                          setMusicOpen((prev) => !prev);
                          return;
                        }

                        handleSelect(media);
                      }}
                    >
                      <View style={[styles.iconContainer, { backgroundColor: media.color }]}>
                        <Ionicons name={media.icon} size={20} color="#FFFFFF" />
                      </View>
                      <Text style={styles.menuItemText}>{t.modelMenu.mediaTypes[media.labelKey]}</Text>
                      <Ionicons
                        name={isImage && imageOpen ? 'chevron-up' : isVideo && videoOpen ? 'chevron-up' : isMusic && musicOpen ? 'chevron-up' : 'chevron-forward'}
                        size={20}
                        color="#8E8EA0"
                      />
                    </TouchableOpacity>
                    {isImage && imageOpen && (
                      <View style={styles.subMenu}>
                        {imageGenerationModels.map((imageModel) => (
                          <TouchableOpacity
                            key={imageModel.id}
                            style={styles.subMenuItem}
                            onPress={() => handleSelect(imageModel)}
                          >
                            <View style={[styles.subIconContainer, { backgroundColor: imageModel.color }]}>
                              <Ionicons name={imageModel.icon} size={16} color="#FFFFFF" />
                            </View>
                            <Text style={styles.subMenuItemText}>
                              {t.modelMenu.imageModels[imageModel.labelKey]}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                    {isVideo && videoOpen && (
                      <View style={styles.subMenu}>
                        {videoGenerationModels.map((videoModel) => (
                          <TouchableOpacity
                            key={videoModel.id}
                            style={styles.subMenuItem}
                            onPress={() => handleSelect(videoModel)}
                          >
                            <View style={[styles.subIconContainer, { backgroundColor: videoModel.color }]}>
                              <Ionicons name={videoModel.icon} size={16} color="#FFFFFF" />
                            </View>
                            <Text style={styles.subMenuItemText}>
                              {t.modelMenu.videoModels[videoModel.labelKey]}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                    {isMusic && musicOpen && (
                      <View style={styles.subMenu}>
                        {musicGenerationModels.map((musicModel) => (
                          <TouchableOpacity
                            key={musicModel.id}
                            style={styles.subMenuItem}
                            onPress={() => handleSelect(musicModel)}
                          >
                            <View style={[styles.subIconContainer, { backgroundColor: musicModel.color }]}>
                              <Ionicons name={musicModel.icon} size={16} color="#FFFFFF" />
                            </View>
                            <Text style={styles.subMenuItemText}>
                              {t.modelMenu.musicModels[musicModel.labelKey]}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  menu: {
    backgroundColor: '#40414F',
    borderRadius: 16,
    padding: 16,
    maxHeight: 400,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  scrollView: {
    maxHeight: 350,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  subMenu: {
    marginLeft: 18,
    marginBottom: 8,
    paddingLeft: 18,
    borderLeftWidth: 1,
    borderLeftColor: '#4D4D4F',
  },
  subMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  subIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  subMenuItemText: {
    fontSize: 15,
    color: '#E5E7EB',
  },
  divider: {
    height: 1,
    backgroundColor: '#4D4D4F',
    marginVertical: 12,
    marginHorizontal: 8,
  },
});
