import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// AI Provider'ların renkleri ve ikonları
const AI_MODELS = [
  {
    id: 'deepseek',
    name: 'DeepSeek',
    color: '#4D6BFA',
    icon: '🔍',
    models: {
      text: [
        { id: 'deepseek-v3', name: 'DeepSeek V3', description: 'Genel amaçlı' },
        { id: 'deepseek-r1', name: 'DeepSeek R1', description: 'Akıl yürütme' },
      ],
      image: [
        { id: 'deepseek-v3-vision', name: 'DeepSeek V3 Vision', description: 'Görsel analizi' },
        { id: 'deepseek-r1-vision', name: 'DeepSeek R1 Vision', description: 'Görsel akıl yürütme' },
      ],
      video: [
        { id: 'deepseek-video', name: 'DeepSeek Video', description: 'Video oluşturma' },
        { id: 'deepseek-video-pro', name: 'DeepSeek Video Pro', description: 'Profesyonel video' },
      ],
      music: [
        { id: 'deepseek-audio', name: 'DeepSeek Audio', description: 'Ses analizi' },
        { id: 'deepseek-music', name: 'DeepSeek Music', description: 'Müzik oluşturma' },
      ],
    },
  },
  {
    id: 'gemini',
    name: 'Gemini',
    color: '#4285F4',
    icon: '✨',
    models: {
      text: [
        { id: 'gemini-flash', name: '2.0 Flash', description: 'Hızlı yanıt' },
        { id: 'gemini-pro', name: '1.5 Pro', description: 'Gelişmiş' },
      ],
      image: [
        { id: 'gemini-pro-vision', name: '1.5 Pro Vision', description: 'Görsel anlama' },
        { id: 'gemini-flash-vision', name: '2.0 Flash Vision', description: 'Hızlı görsel' },
      ],
      video: [
        { id: 'gemini-video', name: 'Gemini Video', description: 'Video analizi' },
        { id: 'gemini-video-pro', name: 'Gemini Video Pro', description: 'Gelişmiş video' },
      ],
      music: [
        { id: 'gemini-audio', name: 'Gemini Audio', description: 'Ses tanıma' },
        { id: 'gemini-music', name: 'Gemini Music', description: 'Müzik oluşturma' },
      ],
    },
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    color: '#10A37F',
    icon: '💬',
    models: {
      text: [
        { id: 'gpt-4o', name: 'GPT-4o', description: 'En yetenekli' },
        { id: 'o3-mini', name: 'o3-mini', description: 'Akıl yürütme' },
      ],
      image: [
        { id: 'gpt-4o-vision', name: 'GPT-4o Vision', description: 'Görsel anlama' },
        { id: 'dall-e-3', name: 'DALL-E 3', description: 'Görsel oluşturma' },
      ],
      video: [
        { id: 'gpt-4o-video', name: 'GPT-4o Video', description: 'Video analizi' },
        { id: 'sora', name: 'Sora', description: 'Video oluşturma' },
      ],
      music: [
        { id: 'gpt-4o-audio', name: 'GPT-4o Audio', description: 'Ses analizi' },
        { id: 'music-gen', name: 'MusicGen', description: 'Müzik oluşturma' },
      ],
    },
  },
];

const MEDIA_TYPES = [
  { id: 'text', icon: 'chatbubble', label: 'Sohbet', color: '#10A37F' },
  { id: 'image', icon: 'image', label: 'Görsel', color: '#8B5CF6' },
  { id: 'video', icon: 'videocam', label: 'Video', color: '#EF4444' },
  { id: 'music', icon: 'musical-note', label: 'Müzik', color: '#F59E0B' },
];

export default function ModelMenu({ t, theme, selectedModel, onSelectModel, isVisible, onClose }) {
  const [selectedProvider, setSelectedProvider] = useState(selectedModel?.provider || 'chatgpt');
  const [mediaType, setMediaType] = useState('text');

  useEffect(() => {
    if (selectedModel?.provider) {
      setSelectedProvider(selectedModel.provider);
    }
  }, [selectedModel]);

  const handleSelect = (providerId, modelId) => {
    onSelectModel?.({ provider: providerId, model: modelId });
    setSelectedProvider(providerId);
    onClose?.();
  };

  const provider = useMemo(
    () => AI_MODELS.find((p) => p.id === selectedProvider) || AI_MODELS[0],
    [selectedProvider]
  );

  // Default theme values to prevent undefined errors
  const safeTheme = {
    headerText: theme?.headerText || '#FFFFFF',
    headerIcon: theme?.headerIcon || '#FFFFFF',
    screenBackground: theme?.screenBackground || '#343541',
    sidebarBackground: theme?.sidebarBackground || '#202123',
    sidebarText: theme?.sidebarText || '#FFFFFF',
    sidebarBorder: theme?.sidebarBorder || '#4D4D4F',
    sidebarMutedText: theme?.sidebarMutedText || '#8E8EA0',
    sidebarPremiumBackground: theme?.sidebarPremiumBackground || '#2D2D2D',
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: safeTheme.screenBackground }]}>
            {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: safeTheme.headerText }]}>
              Yapay Zeka Seç
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={safeTheme.headerIcon} />
            </TouchableOpacity>
          </View>

            {/* Media Type Selector */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mediaTypeSelector}>
            {MEDIA_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.mediaTypeButton,
                  {
                    backgroundColor: mediaType === type.id ? type.color + '20' : 'transparent',
                    borderColor: type.color,
                  },
                ]}
                onPress={() => setMediaType(type.id)}
              >
                <Ionicons name={type.icon} size={20} color={type.color} />
                <Text style={[styles.mediaTypeText, { color: safeTheme.sidebarText }]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

            {/* AI Providers List */}
          <ScrollView style={styles.providersList} showsVerticalScrollIndicator={false}>
            {AI_MODELS.map((providerItem) => (
              <View key={providerItem.id} style={styles.providerSection}>
                <TouchableOpacity
                  style={[
                    styles.providerHeader,
                    {
                      backgroundColor: selectedProvider === providerItem.id ? providerItem.color + '15' : 'transparent',
                      borderColor: providerItem.color,
                    },
                  ]}
                  onPress={() => setSelectedProvider(providerItem.id)}
                >
                  <Text style={styles.providerIcon}>{providerItem.icon}</Text>
                  <Text style={[styles.providerName, { color: safeTheme.sidebarText }]}>
                    {providerItem.name}
                  </Text>
                  <Ionicons
                    name={selectedProvider === providerItem.id ? 'checkmark-circle' : 'checkmark-circle-outline'}
                    size={20}
                    color={providerItem.color}
                  />
                </TouchableOpacity>

                {selectedProvider === providerItem.id && (
                  <View style={styles.modelsList}>
                    {providerItem.models[mediaType].map((model) => (
                      <TouchableOpacity
                        key={model.id}
                        style={[
                          styles.modelItem,
                          {
                            backgroundColor: selectedModel?.model === model.id ? providerItem.color + '15' : 'transparent',
                            borderColor: safeTheme.sidebarBorder,
                          },
                        ]}
                        onPress={() => handleSelect(providerItem.id, model.id)}
                      >
                        <View>
                          <Text style={[styles.modelName, { color: safeTheme.sidebarText }]}>
                            {model.name}
                          </Text>
                          <Text style={[styles.modelDescription, { color: safeTheme.sidebarMutedText }]}>
                            {model.description}
                          </Text>
                        </View>
                        {selectedModel?.model === model.id && (
                          <Ionicons name="checkmark" size={16} color={providerItem.color} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 8,
  },
  mediaTypeContainer: {
    marginBottom: 20,
  },
  mediaTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
    marginRight: 10,
    gap: 6,
  },
  mediaTypeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  providersList: {
    maxHeight: 400,
  },
  providerSection: {
    marginBottom: 12,
  },
  providerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  providerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  providerIconText: {
    fontSize: 22,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  providerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  providerBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modelsList: {
    marginTop: 8,
    paddingLeft: 56,
    gap: 8,
  },
  modelButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  modelInfo: {
    flex: 1,
  },
  modelName: {
    fontSize: 15,
    fontWeight: '600',
  },
  modelDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  providerIcon: {
    fontSize: 22,
  },
  modelItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  sectionItemBorder: {
    borderBottomWidth: 1,
  },
});
