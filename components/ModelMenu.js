import React from 'react';
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

const mediaTypes = [
  { id: 'image', labelKey: 'image', icon: 'image', color: '#E91E63' },
  { id: 'video', labelKey: 'video', icon: 'videocam', color: '#FF5722' },
  { id: 'music', labelKey: 'music', icon: 'musical-notes', color: '#9C27B0' },
];

export default function ModelMenu({ isVisible, onClose, onSelect, t }) {
  const handleSelect = (item) => {
    onSelect(item);
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
              {aiModels.map((model) => (
                <TouchableOpacity
                  key={model.id}
                  style={styles.menuItem}
                  onPress={() => handleSelect(model)}
                >
                  <View style={[styles.iconContainer, { backgroundColor: model.color }]}>
                    <Ionicons name={model.icon} size={20} color="#FFFFFF" />
                  </View>
                  <Text style={styles.menuItemText}>{t.modelMenu.aiModels[model.labelKey]}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#8E8EA0" />
                </TouchableOpacity>
              ))}

              <View style={styles.divider} />

              {mediaTypes.map((media) => (
                <TouchableOpacity
                  key={media.id}
                  style={styles.menuItem}
                  onPress={() => handleSelect(media)}
                >
                  <View style={[styles.iconContainer, { backgroundColor: media.color }]}>
                    <Ionicons name={media.icon} size={20} color="#FFFFFF" />
                  </View>
                  <Text style={styles.menuItemText}>{t.modelMenu.mediaTypes[media.labelKey]}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#8E8EA0" />
                </TouchableOpacity>
              ))}
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
  divider: {
    height: 1,
    backgroundColor: '#4D4D4F',
    marginVertical: 12,
    marginHorizontal: 8,
  },
});
