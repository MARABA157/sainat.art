import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';

const MESSAGE_PAYLOAD_PREFIX = '__SAINAT_MESSAGE__';
const generateId = () => Math.random().toString(36).substring(2, 9);
const DEFAULT_SELECTED_MODEL = {
  provider: 'gemini',
  model: 'gemini-2.0-flash',
  mediaType: 'text',
  providerName: 'Gemini',
};

const getRandomResponse = (translations) => {
  const responses = translations?.chat?.mockResponses || [
    'Anladım! Size bu konuda nasıl yardımcı olabilirim?',
    'Bu ilginç bir soru. Daha fazla detay verebilir misiniz?',
    'Size yardımcı olmaktan mutluluk duyarım!',
  ];
  return responses[Math.floor(Math.random() * responses.length)];
};

const buildTextMessage = (text, media) => ({
  text,
  media: media || null,
});

const serializeMessageContent = ({ text, media }) => {
  if (!media) {
    return text;
  }

  return `${MESSAGE_PAYLOAD_PREFIX}${JSON.stringify({ text, media })}`;
};

const deserializeMessageContent = (content) => {
  if (typeof content !== 'string') {
    return buildTextMessage('');
  }

  if (!content.startsWith(MESSAGE_PAYLOAD_PREFIX)) {
    return buildTextMessage(content);
  }

  try {
    const payload = JSON.parse(content.slice(MESSAGE_PAYLOAD_PREFIX.length));
    return buildTextMessage(payload?.text || '', payload?.media || null);
  } catch (error) {
    console.error('Mesaj içeriği çözümlenirken hata:', error);
    return buildTextMessage(content.replace(MESSAGE_PAYLOAD_PREFIX, ''));
  }
};

const getReadableSupabaseError = (error) => {
  const message = typeof error?.message === 'string' ? error.message : '';
  const status = error?.context?.status;

  if (status === 401 || /unauthorized|jwt|token|auth/i.test(message)) {
    return 'Oturumunuz sona ermiş olabilir. Lütfen tekrar giriş yapın.';
  }

  if (status === 404 || /failed to send a request|fetch|network|network request failed/i.test(message)) {
    return 'Supabase bağlantısında sorun oluştu. İnternet bağlantınızı ve proje ayarlarınızı kontrol edin.';
  }

  if (/row-level security|permission denied/i.test(message)) {
    return 'Bu işlem için yetkiniz yok. Supabase RLS politikalarını kontrol edin.';
  }

  return message || 'Supabase isteği sırasında beklenmeyen bir hata oluştu.';
};

const requestModelResponse = async ({ selectedModel, messages, text, accessToken }) => {
  if (!accessToken) {
    throw new Error('AI özelliklerini kullanmak için Google ile giriş yapın.');
  }

  const { data, error } = await supabase.functions.invoke('ai-proxy', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: {
      selectedModel: selectedModel || DEFAULT_SELECTED_MODEL,
      messages: messages.map((message) => ({
        text: message.text,
        isUser: message.isUser,
      })),
      text,
    },
  });

  if (error) {
    throw new Error(getReadableSupabaseError(error) || 'AI yanıtı alınamadı.');
  }

  if (!data || (typeof data.text !== 'string' && !data.media)) {
    throw new Error('Backend geçerli bir AI yanıtı döndürmedi.');
  }

  return buildTextMessage(data.text || '', data.media || null);
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
    if (hasSupabaseSession) {
      loadConversations();
    } else {
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
    if (!user?.id) {
      setConversations([]);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(getReadableSupabaseError(error));
      }

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
    if (!user?.id || !conversationId) {
      setMessages([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(getReadableSupabaseError(error));
      }
      
      setMessages(data?.map(msg => ({
        ...deserializeMessageContent(msg.content),
        id: msg.id,
        isUser: msg.is_user,
        timestamp: msg.created_at,
      })) || []);
    } catch (error) {
      console.error('Mesajlar yüklenirken hata:', error);
    }
  };

  const createConversation = async (title = 'Yeni Sohbet') => {
    if (!user?.id) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert([{ user_id: user.id, title }])
        .select()
        .single();

      if (error) {
        throw new Error(getReadableSupabaseError(error));
      }
      
      setConversations(prev => [data, ...prev]);
      setCurrentConversationId(data.id);
      return data.id;
    } catch (error) {
      console.error('Sohbet oluşturulurken hata:', error);
      return null;
    }
  };

  const sendMessage = useCallback(async ({ text, selectedModel }) => {
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
        throw new Error('AI özelliklerini kullanmak için Google ile giriş yapın.');
      } catch (error) {
        console.error('AI yanıtı alınırken hata:', error);
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

      if (msgError) {
        throw new Error(getReadableSupabaseError(msgError));
      }

      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);

      const aiResponse = await requestModelResponse({
        selectedModel,
        messages,
        text,
        accessToken: session?.access_token,
      });

      const { error: aiInsertError } = await supabase
          .from('messages')
          .insert([{
            conversation_id: conversationId,
            user_id: user.id,
            content: serializeMessageContent(aiResponse),
            is_user: false,
          }]);

      if (aiInsertError) {
        throw new Error(getReadableSupabaseError(aiInsertError));
      }

      const aiMessage = {
        id: generateId(),
        text: aiResponse.text,
        media: aiResponse.media || null,
        isUser: false,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);

    } catch (error) {
      console.error('Mesaj gönderilirken hata:', error);
      const errorMessage = {
        id: generateId(),
        text: error?.message || 'Mesaj gönderilirken Supabase bağlantı hatası oluştu.',
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
