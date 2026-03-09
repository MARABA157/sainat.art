import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Header({ onMenuPress, onNewChat, t }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.menuButton} onPress={onMenuPress}>
        <Ionicons name="menu" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <Text style={styles.title}>{t.headerTitle}</Text>

      <TouchableOpacity style={styles.newChatButton} onPress={onNewChat}>
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#343541',
    borderBottomWidth: 1,
    borderBottomColor: '#4D4D4F',
  },
  menuButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  newChatButton: {
    padding: 8,
  },
});
