import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ModelMenu from './ModelMenu';

export default function ChatInput({ onSend, isTyping, t }) {
  const [message, setMessage] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);

  const handleSend = () => {
    if (message.trim() && !isTyping) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleModelSelect = (model) => {
    setSelectedModel(model);
    // Burada seçilen modele göre işlem yapabilirsiniz
    console.log('Seçilen:', model);
  };

  return (
    <View style={styles.container}>
      <ModelMenu
        isVisible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onSelect={handleModelSelect}
        t={t}
      />
      <View style={styles.inputWrapper}>
        <TouchableOpacity 
          style={styles.plusButton}
          onPress={() => setMenuVisible(true)}
        >
          <Ionicons name="globe" size={24} color="#8E8EA0" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder={t.inputPlaceholder}
          placeholderTextColor="#8E8EA0"
          value={message}
          onChangeText={setMessage}
          multiline
          maxHeight={120}
          editable={!isTyping}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!message.trim() || isTyping) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!message.trim() || isTyping}
        >
          {isTyping ? (
            <ActivityIndicator size="small" color="#8E8EA0" />
          ) : (
            <Ionicons name="send" size={20} color={message.trim() ? '#FFFFFF' : '#8E8EA0'} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#343541',
    borderTopWidth: 1,
    borderTopColor: '#4D4D4F',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#40414F',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 150,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    maxHeight: 120,
    paddingTop: 8,
    paddingBottom: 8,
    marginLeft: 8,
  },
  plusButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10A37F',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: 'transparent',
  },
});
