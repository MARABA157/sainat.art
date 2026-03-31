import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Text,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ModelMenu from './ModelMenu';

export default function ChatInput({
  onSend,
  isTyping,
  t,
  theme,
  quickPrompts = [],
  onPickImage,
  onPickCamera,
  onPickDocument,
  onStartVoiceInput,
  pendingAttachment,
  onClearAttachment,
}) {
  const [message, setMessage] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedModel, setSelectedModel] = useState({
    provider: 'chatgpt',
    model: 'gpt-4o',
    providerName: 'ChatGPT',
    providerIcon: '💬',
    providerColor: '#10A37F',
  });

  const handleSend = () => {
    if ((message.trim() || pendingAttachment) && !isTyping) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleModelSelect = (model) => {
    setSelectedModel(model);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.inputBarBackground, borderTopColor: theme.inputBarBorder }]}> 
      <ModelMenu
        t={t}
        theme={theme}
        selectedModel={selectedModel}
        onSelectModel={handleModelSelect}
        isVisible={menuVisible}
        onClose={() => setMenuVisible(false)}
      />
      {quickPrompts.length > 0 && (
        <View style={styles.quickPromptScroll}>
          {quickPrompts.map((prompt) => (
            <TouchableOpacity
              key={prompt}
              style={[styles.quickPromptChip, { backgroundColor: theme.inputWrapperBackground, borderColor: theme.inputBarBorder }]}
              onPress={() => {
                if (!isTyping) {
                  onSend(prompt);
                }
              }}
            >
              <Text style={[styles.quickPromptText, { color: theme.inputText }]}>{prompt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {pendingAttachment && (
        <View style={[styles.attachmentCard, { backgroundColor: theme.inputWrapperBackground, borderColor: theme.inputBarBorder }]}> 
          <View style={styles.attachmentInfo}>
            <Ionicons
              name={pendingAttachment.type === 'document' ? 'document-text-outline' : 'image-outline'}
              size={18}
              color={theme.inputIcon}
            />
            <Text style={[styles.attachmentText, { color: theme.inputText }]} numberOfLines={1}>
              {pendingAttachment.label}
            </Text>
          </View>
          <TouchableOpacity onPress={onClearAttachment}>
            <Ionicons name="close-circle" size={20} color={theme.inputIcon} />
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.actionRow}>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.inputWrapperBackground }]} onPress={onPickCamera}>
          <Ionicons name="camera-outline" size={18} color={theme.inputIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.inputWrapperBackground }]} onPress={onPickImage}>
          <Ionicons name="image-outline" size={18} color={theme.inputIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.inputWrapperBackground }]} onPress={onPickDocument}>
          <Ionicons name="document-attach-outline" size={18} color={theme.inputIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.inputWrapperBackground }]} onPress={onStartVoiceInput}>
          <Ionicons name="mic-outline" size={18} color={theme.inputIcon} />
        </TouchableOpacity>
      </View>
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
            (!(message.trim() || pendingAttachment) || isTyping) && [styles.sendButtonDisabled, { backgroundColor: 'transparent' }],
          ]}
          onPress={handleSend}
          disabled={!(message.trim() || pendingAttachment) || isTyping}
        >
          {isTyping ? (
            <ActivityIndicator size="small" color={theme.inputIcon} />
          ) : (
            <Ionicons name="send" size={20} color={message.trim() || pendingAttachment ? theme.sendButtonIcon : theme.inputIcon} />
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
    paddingBottom: Platform.OS === 'android' ? 24 : 12,
  },
  quickPromptScroll: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  quickPromptChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  quickPromptText: {
    fontSize: 13,
  },
  attachmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  attachmentInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  attachmentText: {
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
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
