import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MessageBubble({ message, isUser, theme }) {
  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.aiContainer]}>
      {!isUser && (
        <TouchableOpacity style={[styles.plusButton, { backgroundColor: theme.messageActionBackground }]}>
          <Ionicons name="add" size={16} color={theme.messageActionIcon} />
        </TouchableOpacity>
      )}
      <View
        style={[
          styles.bubble,
          isUser
            ? [styles.userBubble, { backgroundColor: theme.userBubbleBackground }]
            : [styles.aiBubble, { backgroundColor: theme.aiBubbleBackground }],
        ]}
      >
        <Text
          style={[
            styles.text,
            isUser
              ? [styles.userText, { color: theme.userBubbleText }]
              : [styles.aiText, { color: theme.aiBubbleText }],
          ]}
        >
          {message}
        </Text>
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
  plusButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
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
  userText: {},
  aiText: {},
});
