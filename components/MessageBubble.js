import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking } from 'react-native';

const canOpenMediaUri = (uri) => {
  if (typeof uri !== 'string') {
    return false;
  }

  return uri.startsWith('https://') || uri.startsWith('data:audio/') || uri.startsWith('data:video/');
};

export default function MessageBubble({ message, isUser, theme }) {
  const handleOpenMedia = async () => {
    if (!message?.media?.uri || !canOpenMediaUri(message.media.uri)) {
      return;
    }

    await Linking.openURL(message.media.uri);
  };

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.aiContainer]}>
      <View
        style={[
          styles.bubble,
          isUser
            ? [styles.userBubble, { backgroundColor: theme.userBubbleBackground }]
            : [styles.aiBubble, { backgroundColor: theme.aiBubbleBackground }],
        ]}
      >
        {!!message?.text && (
          <Text
            style={[
              styles.text,
              isUser
                ? [styles.userText, { color: theme.userBubbleText }]
                : [styles.aiText, { color: theme.aiBubbleText }],
            ]}
          >
            {message.text}
          </Text>
        )}
        {message?.media?.type === 'image' && !!message?.media?.uri && (
          <Image source={{ uri: message.media.uri }} style={styles.mediaImage} resizeMode="cover" />
        )}
        {(message?.media?.type === 'video' || message?.media?.type === 'audio') && !!message?.media?.uri && (
          <TouchableOpacity style={styles.mediaButton} onPress={handleOpenMedia}>
            <Text style={styles.mediaButtonText}>
              {message.media.type === 'video' ? 'Videoyu Aç' : 'Sesi Aç'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    maxWidth: '85%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  userContainer: {
    alignSelf: 'flex-end',
  },
  aiContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    maxWidth: 320,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  mediaImage: {
    width: 260,
    height: 260,
    borderRadius: 14,
    marginTop: 10,
  },
  mediaButton: {
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#10A37F',
    alignSelf: 'flex-start',
  },
  mediaButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  userText: {},
  aiText: {},
});
