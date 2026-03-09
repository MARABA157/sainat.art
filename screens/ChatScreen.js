import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Header from '../components/Header';
import MessageBubble from '../components/MessageBubble';
import ChatInput from '../components/ChatInput';
import Sidebar from '../components/Sidebar';
import PremiumScreen from './PremiumScreen';
import useChat from '../hooks/useChat';
import { getTranslations } from '../locales/translations';

export default function ChatScreen() {
  const currentLanguage = 'tr';
  const t = getTranslations(currentLanguage);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const { messages, isTyping, sendMessage, startNewChat } = useChat(t);
  const flatListRef = useRef(null);

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const renderMessage = ({ item }) => (
    <MessageBubble
      message={item.text}
      isUser={item.isUser}
      timestamp={item.timestamp}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewChat={() => {
          startNewChat();
          setSidebarOpen(false);
        }}
        onPremium={() => {
          setShowPremium(true);
          setSidebarOpen(false);
        }}
        t={t}
      />

      <View style={styles.main}>
        <Header
          onMenuPress={() => setSidebarOpen(true)}
          onNewChat={startNewChat}
          t={t}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
          />

          <ChatInput onSend={sendMessage} isTyping={isTyping} t={t} />
        </KeyboardAvoidingView>
      </View>

      {showPremium && <PremiumScreen onClose={() => setShowPremium(false)} t={t} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#343541',
  },
  main: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
});
