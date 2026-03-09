import { useState, useCallback } from 'react';

const generateId = () => Math.random().toString(36).substring(2, 9);

const getRandomResponse = (translations) => {
  const responses = translations.chat.mockResponses;
  return responses[Math.floor(Math.random() * responses.length)];
};

export default function useChat(t) {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = useCallback((text) => {
    // Kullanıcı mesajını ekle
    const userMessage = {
      id: generateId(),
      text,
      isUser: true,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    // AI yanıtını simüle et (2-3 saniye gecikme)
    setTimeout(() => {
      const aiMessage = {
        id: generateId(),
        text: getRandomResponse(t),
        isUser: false,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 2000 + Math.random() * 1000);
  }, [t]);

  const startNewChat = useCallback(() => {
    setMessages([]);
    setIsTyping(false);
  }, []);

  return {
    messages,
    isTyping,
    sendMessage,
    startNewChat,
  };
}
