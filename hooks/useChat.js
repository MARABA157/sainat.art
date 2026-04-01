import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';

const generateId = () => Math.random().toString(36).substring(2, 9);
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || process.env.REACT_APP_GEMINI_API_KEY;
const GEMINI_MODEL = process.env.EXPO_PUBLIC_GEMINI_MODEL || 'gemini-2.0-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

const getRandomResponse = (translations) => {
  const responses = translations?.chat?.mockResponses || [
    'Anladım! Size bu konuda nasıl yardımcı olabilirim?',
    'Bu ilginç bir soru. Daha fazla detay verebilir misiniz?',
    'Size yardımcı olmaktan mutluluk duyarım!',
  ];
  return responses[Math.floor(Math.random() * responses.length)];
};

const buildConversationPrompt = (messages, nextUserText) => {
  const history = messages
    .slice(-12)
    .map((message) => `${message.isUser ? 'Kullanıcı' : 'Asistan'}: ${message.text}`)
    .join('\n');

  return [
    'Sen Sainat uygulamasındaki yardımcı bir AI asistansın.',
    'Kısa, net ve yardımcı cevaplar ver.',
    history,
    `Kullanıcı: ${nextUserText}`,
    'Asistan:',
  ]
    .filter(Boolean)
    .join('\n\n');
};

const requestGeminiResponse = async ({ prompt }) => {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API anahtarı eksik. `.env` dosyasına `EXPO_PUBLIC_GEMINI_API_KEY` ekleyin.');
  }

  const response = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Gemini isteği başarısız oldu.');
  }

  const text = payload?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || '')
    .join('')
    .trim();

  if (!text) {
    throw new Error('Gemini boş yanıt döndürdü.');
  }

  return text;
};

export default function useChat(t) {
  const { user, session } = useAuth();
  const hasSupabaseSession = Boolean(session?.access_token && user?.id);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('useChat user effect - user:', user?.id);
    if (hasSupabaseSession) {
      console.log('User exists, loading conversations...');
      loadConversations();
    } else {
      console.log('No user, clearing conversations');
      setConversations([]);
      setMessages([]);
      setCurrentConversationId(null);
    }
  }, [hasSupabaseSession, user]);

  useEffect(() => {
    if (currentConversationId && hasSupabaseSession) {
      loadMessages(currentConversationId);
    }
  }, [currentConversationId, hasSupabaseSession]);

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
    const userMessage = {
      id: generateId(),
      text,
      isUser: true,
      timestamp: new Date().toISOString(),
    };

    if (!hasSupabaseSession) {
      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);

      try {
        const aiResponseText = await requestGeminiResponse({
          prompt: buildConversationPrompt(messages, text),
        });
        const aiMessage = {
          id: generateId(),
          text: aiResponseText,
          isUser: false,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } catch (error) {
        console.error('Gemini yanıtı alınırken hata:', error);
        const fallbackMessage = {
          id: generateId(),
          text: error?.message || getRandomResponse(t),
          isUser: false,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, fallbackMessage]);
      } finally {
        setIsTyping(false);
      }
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

      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);

      const aiResponseText = await requestGeminiResponse({
        prompt: buildConversationPrompt(messages, text),
      });

      const { error: aiInsertError } = await supabase
          .from('messages')
          .insert([{
            conversation_id: conversationId,
            user_id: user.id,
            content: aiResponseText,
            is_user: false,
          }]);

      if (aiInsertError) throw aiInsertError;

      const aiMessage = {
        id: generateId(),
        text: aiResponseText,
        isUser: false,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);

    } catch (error) {
      console.error('Mesaj gönderilirken hata:', error);
      const errorMessage = {
        id: generateId(),
        text: error?.message || 'Mesaj gönderilirken bir hata oluştu.',
        isUser: false,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [hasSupabaseSession, user, currentConversationId, messages, t]);

  const startNewChat = useCallback(async () => {
    if (hasSupabaseSession) {
      await createConversation('Yeni Sohbet');
    }
    setMessages([]);
  }, [hasSupabaseSession]);

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
