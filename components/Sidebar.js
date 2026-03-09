import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function Sidebar({ isOpen, onClose, onNewChat, onPremium, t }) {
  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        
        <View style={styles.sidebar}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.newChatButton} onPress={onNewChat}>
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.newChatText}>{t.sidebar.newChat}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.sidebar.today}</Text>
            <TouchableOpacity style={styles.chatItem}>
              <Ionicons name="chatbubble-outline" size={16} color="#8E8EA0" />
              <Text style={styles.chatText}>{t.sidebar.newChat}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.premiumButton} onPress={onPremium}>
              <Ionicons name="star" size={20} color="#FFD700" />
              <Text style={styles.premiumText}>{t.sidebar.upgrade}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.footerItem}>
              <Ionicons name="settings-outline" size={20} color="#8E8EA0" />
              <Text style={styles.footerText}>{t.sidebar.settings}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    flex: 1,
  },
  sidebar: {
    width: width * 0.75,
    maxWidth: 300,
    backgroundColor: '#202123',
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
    borderColor: '#4D4D4F',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  newChatText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#4D4D4F',
    marginHorizontal: 12,
  },
  section: {
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  sectionTitle: {
    color: '#8E8EA0',
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
    borderTopColor: '#4D4D4F',
    padding: 12,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  premiumButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#2D2D2D',
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
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 12,
  },
});
