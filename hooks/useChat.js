import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';

const generateId = () => Math.random().toString(36).substring(2, 9);

const getRandomResponse = (translations) => {
  const responses = translations?.chat?.mockResponses || [
    'Anladım! Size bu konuda nasıl yardımcı olabilirim?',
    'Bu ilginç bir soru. Daha fazla detay verebilir misiniz?',
    'Size yardımcı olmaktan mutluluk duyarım!',
  ];
  return responses[Math.floor(Math.random() * responses.length)];
};

export default function useChat(t) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('useChat user effect - user:', user?.id);
    if (user) {
      console.log('User exists, loading conversations...');
      loadConversations();
    } else {
      console.log('No user, clearing conversations');
      setConversations([]);
      setMessages([]);
      setCurrentConversationId(null);
    }
  }, [user]);

  useEffect(() => {
    if (currentConversationId && user) {
      loadMessages(currentConversationId);
    }
  }, [currentConversationId, user]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      console.log('Loading conversations for user:', user?.id);
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Supabase error loading conversations:', error);
        throw error;
      }
      
      console.log('Conversations loaded:', data);
      setConversations(data || []);
      
      if (data && data.length > 0 && !currentConversationId) {
        setCurrentConversationId(data[0].id);
      }
    } catch (error) {
      console.error('Sohbetler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      setMessages(data?.map(msg => ({
        id: msg.id,
        text: msg.content,
        isUser: msg.is_user,
        timestamp: msg.created_at,
      })) || []);
    } catch (error) {
      console.error('Mesajlar yüklenirken hata:', error);
    }
  };

  const createConversation = async (title = 'Yeni Sohbet') => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert([{ user_id: user.id, title }])
        .select()
        .single();

      if (error) throw error;
      
      setConversations(prev => [data, ...prev]);
      setCurrentConversationId(data.id);
      return data.id;
    } catch (error) {
      console.error('Sohbet oluşturulurken hata:', error);
      return null;
    }
  };

  const sendMessage = useCallback(async (text) => {
    if (!user) {
      const userMessage = {
        id: generateId(),
        text,
        isUser: true,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);

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
      return;
    }

    try {
      let conversationId = currentConversationId;
      if (!conversationId) {
        conversationId = await createConversation(text.slice(0, 30) + '...');
        if (!conversationId) return;
      }

      const { error: msgError } = await supabase
        .from('messages')
        .insert([{
          conversation_id: conversationId,
          user_id: user.id,
          content: text,
          is_user: true,
        }]);

      if (msgError) throw msgError;

      const userMessage = {
        id: generateId(),
        text,
        isUser: true,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);

      setTimeout(async () => {
        const aiResponseText = getRandomResponse(t);
        
        await supabase
          .from('messages')
          .insert([{
            conversation_id: conversationId,
            user_id: user.id,
            content: aiResponseText,
            is_user: false,
          }]);

        const aiMessage = {
          id: generateId(),
          text: aiResponseText,
          isUser: false,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiMessage]);
        setIsTyping(false);
      }, 2000 + Math.random() * 1000);

    } catch (error) {
      console.error('Mesaj gönderilirken hata:', error);
    }
  }, [user, currentConversationId, t]);

  const startNewChat = useCallback(async () => {
    if (user) {
      await createConversation('Yeni Sohbet');
    }
    setMessages([]);
  }, [user]);

  const selectConversation = useCallback((conversationId) => {
    setCurrentConversationId(conversationId);
  }, []);

  return {
    messages,
    isTyping,
    loading,
    conversations,
    currentConversationId,
    sendMessage,
    startNewChat,
    selectConversation,
    loadConversations,
  };
}
