import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ImageBackground,
  Dimensions,
  Modal,
} from 'react-native';
import { useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Header from '../components/Header';
import MessageBubble from '../components/MessageBubble';
import ChatInput from '../components/ChatInput';
import Sidebar from '../components/Sidebar';
import PremiumScreen from './PremiumScreen';
import ProfileScreen from './ProfileScreen';
import LoginScreen from './LoginScreen';
import AIFileScreen from './AIFileScreen';
import useChat from '../hooks/useChat';
import { getTranslations } from '../locales/translations';
import { useAuth } from '../contexts/AuthContext';

export default function ChatScreen() {
  // Önce chatThemes tanımla
  const chatThemes = [
    {
      id: 'chatgpt',
      name: 'ChatGPT',
      palette: 'dark',
      backgroundColor: '#343541',
    },
    {
      id: 'siyah',
      name: 'Siyah',
      palette: 'dark',
      backgroundColor: '#000000',
    },
    {
      id: 'beyaz',
      name: 'Beyaz',
      palette: 'light',
      backgroundColor: '#FFFFFF',
    },
    {
      id: 'dere-cicegi',
      name: 'Dere Çiçeği',
      preview: require('../assets/themes/ai resim 4.jpg'),
      palette: 'light',
    },
    {
      id: 'gece-patikasi',
      name: 'Gece Patikası',
      preview: require('../assets/themes/ai resim 5.jpg'),
      palette: 'dark',
    },
    {
      id: 'altin-koruluk',
      name: 'Altın Koruluk',
      preview: require('../assets/themes/ai resim 6.jpg'),
      palette: 'light',
    },
    {
      id: 'sisli-vadi',
      name: 'Sisli Vadi',
      preview: require('../assets/themes/ai resim 7.jpg'),
      palette: 'dark',
    },
    {
      id: 'golge-dere',
      name: 'Gölge Dere',
      preview: require('../assets/themes/ai resim 8.jpg'),
      palette: 'dark',
    },
  ];

  const currentLanguage = 'tr';
  const t = getTranslations(currentLanguage);
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const sidebarWidth = Math.min(width * 0.75, 300);
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAIFile, setShowAIFile] = useState(false);
  const [selectedChatTheme, setSelectedChatTheme] = useState(
    chatThemes.find((item) => item.id === 'chatgpt') || chatThemes[0]
  );
  const [showLogin, setShowLogin] = useState(false);
  const { messages, isTyping, sendMessage, startNewChat } = useChat(t);
  const flatListRef = useRef(null);
  const theme = selectedChatTheme.palette === 'dark' ? themes.dark : themes.light;
  const prevUserRef = useRef(null);

  const themes = {
    dark: {
      screenBackground: '#343541',
      headerBackground: '#343541',
      headerBorder: '#4D4D4F',
      headerText: '#FFFFFF',
      headerIcon: '#FFFFFF',
      messageActionBackground: '#343541',
      messageActionIcon: '#8E8EA0',
      userBubbleBackground: '#10A37F',
      userBubbleText: '#FFFFFF',
      aiBubbleBackground: '#444654',
      aiBubbleText: '#ECECF1',
      inputBarBackground: '#343541',
      inputBarBorder: '#4D4D4F',
      inputWrapperBackground: '#40414F',
      inputText: '#FFFFFF',
      inputPlaceholder: '#8E8EA0',
      inputIcon: '#8E8EA0',
      sendButtonBackground: '#10A37F',
      sendButtonIcon: '#FFFFFF',
      sidebarBackground: '#202123',
      sidebarBorder: '#4D4D4F',
      sidebarText: '#FFFFFF',
      sidebarMutedText: '#8E8EA0',
      sidebarPremiumBackground: '#2D2D2D',
    },
    light: {
      screenBackground: '#F7F7F8',
      headerBackground: '#FFFFFF',
      headerBorder: '#E5E7EB',
      headerText: '#111827',
      headerIcon: '#111827',
      messageActionBackground: '#E5E7EB',
      messageActionIcon: '#6B7280',
      userBubbleBackground: '#10A37F',
      userBubbleText: '#FFFFFF',
      aiBubbleBackground: '#FFFFFF',
      aiBubbleText: '#111827',
      inputBarBackground: '#FFFFFF',
      inputBarBorder: '#E5E7EB',
      inputWrapperBackground: '#F3F4F6',
      inputText: '#111827',
      inputPlaceholder: '#9CA3AF',
      inputIcon: '#6B7280',
      sendButtonBackground: '#10A37F',
      sendButtonIcon: '#FFFFFF',
      sidebarBackground: '#FFFFFF',
      sidebarBorder: '#E5E7EB',
      sidebarText: '#111827',
      sidebarMutedText: '#6B7280',
      sidebarPremiumBackground: '#F3F4F6',
    },
  };

  useEffect(() => {
    // Giriş durumu değiştiğinde kontrol et
    if (user && !prevUserRef.current) {
      // Yeni giriş yapıldı, sadece login modalı kapat
      setShowLogin(false);
    }
    prevUserRef.current = user;
  }, [user]);

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
      theme={theme}
    />
  );

  const handleAIFilePress = () => {
    setShowAIFile(true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.screenBackground }]}>
      <StatusBar style={selectedChatTheme.palette === 'dark' ? 'light' : 'dark'} />
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
        onProfilePress={() => {
          setShowProfile(true);
          setSidebarOpen(false);
        }}
        onSelectChatTheme={setSelectedChatTheme}
        selectedChatTheme={selectedChatTheme}
        chatThemes={chatThemes}
        t={t}
        theme={theme}
      />
      <View
        style={[
          styles.main,
          sidebarOpen && { marginLeft: sidebarWidth, width: width - sidebarWidth },
        ]}
      >
        <Header
          onMenuPress={() => setSidebarOpen((prev) => !prev)}
          onNewChat={startNewChat}
          onProfilePress={() => setShowProfile(true)}
          onLoginPress={() => setShowLogin(true)}
          onAIFilePress={handleAIFilePress}
          t={t}
          theme={theme}
        />
        {selectedChatTheme.preview ? (
          <ImageBackground
            source={selectedChatTheme.preview}
            style={styles.chatBackground}
            imageStyle={styles.chatBackgroundImage}
          >
            <View style={styles.chatOverlay} />
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
                style={styles.messagesListView}
              />
              <ChatInput onSend={sendMessage} isTyping={isTyping} t={t} theme={theme} />
            </KeyboardAvoidingView>
          </ImageBackground>
        ) : (
          <View
            style={[
              styles.chatBackground,
              styles.solidBackground,
              { backgroundColor: selectedChatTheme.backgroundColor || theme.screenBackground },
            ]}
          >
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
                style={styles.messagesListView}
              />
              <ChatInput onSend={sendMessage} isTyping={isTyping} t={t} theme={theme} />
            </KeyboardAvoidingView>
          </View>
        )}
      </View>
      {showPremium && <PremiumScreen onClose={() => setShowPremium(false)} t={t} />}
      {showProfile && (
        <ProfileScreen
          onClose={() => setShowProfile(false)}
          t={t}
          theme={theme}
        />
      )}
      {showAIFile && (
        <Modal
          animationType="slide"
          transparent={false}
          visible={showAIFile}
          onRequestClose={() => setShowAIFile(false)}
        >
          <AIFileScreen onClose={() => setShowAIFile(false)} t={t} theme={theme} />
        </Modal>
      )}
    {showLogin && (
        <Modal
          animationType="slide"
          transparent={false}
          visible={showLogin}
          onRequestClose={() => setShowLogin(false)}
        >
          <LoginScreen onClose={() => setShowLogin(false)} />
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  main: {
    flex: 1,
  },
  mainShifted: {
    marginLeft: 0,
    width: '100%',
  },
  keyboardView: {
    flex: 1,
  },
  chatBackground: {
    flex: 1,
  },
  solidBackground: {
    overflow: 'hidden',
  },
  chatBackgroundImage: {
    opacity: 0.92,
    resizeMode: 'cover',
  },
  chatOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.38)',
  },
  messagesListView: {
    backgroundColor: 'transparent',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
});
