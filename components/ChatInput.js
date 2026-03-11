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

export default function ChatInput({ onSend, isTyping, t, theme }) {
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
    <View style={[styles.container, { backgroundColor: theme.inputBarBackground, borderTopColor: theme.inputBarBorder }]}>
      <ModelMenu
        isVisible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onSelect={handleModelSelect}
        t={t}
      />
      <View style={[styles.inputWrapper, { backgroundColor: theme.inputWrapperBackground }]}>
        <TouchableOpacity 
          style={styles.plusButton}
          onPress={() => setMenuVisible(true)}
        >
          <Ionicons name="globe" size={24} color={theme.inputIcon} />
        </TouchableOpacity>
        <TextInput
          style={[styles.input, { color: theme.inputText }]}
          placeholder={t.inputPlaceholder}
          placeholderTextColor={theme.inputPlaceholder}
          cursorColor="#10A37F"
          selectionColor="#10A37F"
          value={message}
          onChangeText={setMessage}
          multiline
          maxHeight={120}
          editable={!isTyping}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            { backgroundColor: theme.sendButtonBackground },
            (!message.trim() || isTyping) && [styles.sendButtonDisabled, { backgroundColor: 'transparent' }],
          ]}
          onPress={handleSend}
          disabled={!message.trim() || isTyping}
        >
          {isTyping ? (
            <ActivityIndicator size="small" color={theme.inputIcon} />
          ) : (
            <Ionicons name="send" size={20} color={message.trim() ? theme.sendButtonIcon : theme.inputIcon} />
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
    borderTopWidth: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 150,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 120,
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 12,
    marginLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(16, 163, 127, 0.55)',
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
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: 'transparent',
  },
});
