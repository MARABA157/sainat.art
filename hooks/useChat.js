import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const generateId = () => Math.random().toString(36).substring(2, 9);
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || process.env.REACT_APP_GEMINI_API_KEY;
const GEMINI_MODEL = process.env.EXPO_PUBLIC_GEMINI_MODEL || 'gemini-2.0-flash';
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || process.env.REACT_APP_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_IMAGE_API_URL = 'https://api.openai.com/v1/images/generations';
const OPENAI_VIDEO_API_URL = 'https://api.openai.com/v1/videos';
const DEFAULT_SELECTED_MODEL = {
  provider: 'gemini',
  model: GEMINI_MODEL,
  mediaType: 'text',
  providerName: 'Gemini',
};
const MODEL_ALIASES = {
  gemini: {
    text: {
      'gemini-2.0-flash': 'gemini-2.0-flash',
    },
    image: {
      'gemini-2.0-flash-preview-image-generation': 'gemini-2.0-flash-preview-image-generation',
    },
    video: {
      'veo-2': 'veo-2.0-generate-001',
    },
    music: {
      lyria: 'lyria-3-clip-preview',
    },
  },
  chatgpt: {
    text: {
      'gpt-4o': 'gpt-4o',
    },
    image: {
      'gpt-image-1': 'gpt-image-1',
    },
    video: {
      sora: 'sora-2',
    },
    music: {
      'gpt-4o-audio': 'gpt-4o-audio-preview',
    },
  },
};

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

const buildOpenAiMessages = (messages, nextUserText) => {
  const history = messages.slice(-12).map((message) => ({
    role: message.isUser ? 'user' : 'assistant',
    content: message.text,
  }));

  return [
    {
      role: 'system',
      content: 'You are the helpful AI assistant inside the Sainat app. Reply clearly, briefly, and helpfully in the user\'s language.',
    },
    ...history,
    {
      role: 'user',
      content: nextUserText,
    },
  ];
};

const resolveModelAlias = (selectedModel) => {
  const provider = selectedModel?.provider || DEFAULT_SELECTED_MODEL.provider;
  const mediaType = selectedModel?.mediaType || DEFAULT_SELECTED_MODEL.mediaType;
  const model = selectedModel?.model || DEFAULT_SELECTED_MODEL.model;

  return MODEL_ALIASES[provider]?.[mediaType]?.[model] || model;
};

const buildTextMessage = (text, media) => ({
  text,
  media: media || null,
});

const extractGeminiText = (payload) => {
  const text = payload?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || '')
    .join('')
    .trim();

  return text || '';
};

const pollOperation = async ({ operationName, headers }) => {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const response = await fetch(`${GEMINI_BASE_URL}/${operationName}`, {
      method: 'GET',
      headers,
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload?.error?.message || 'Asenkron medya işlemi başarısız oldu.');
    }

    if (payload?.done) {
      return payload;
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  throw new Error('Medya üretimi zaman aşımına uğradı. Lütfen tekrar deneyin.');
};

const requestGeminiResponse = async ({ prompt, model }) => {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API anahtarı eksik. `.env` dosyasına `EXPO_PUBLIC_GEMINI_API_KEY` ekleyin.');
  }

  const apiUrl = `${GEMINI_BASE_URL}/models/${model || GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const response = await fetch(apiUrl, {
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

  const text = extractGeminiText(payload);

  if (!text) {
    throw new Error('Gemini boş yanıt döndürdü.');
  }

  return text;
};

const requestGeminiImageResponse = async ({ prompt, model }) => {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API anahtarı eksik. `.env` dosyasına `EXPO_PUBLIC_GEMINI_API_KEY` ekleyin.');
  }

  const response = await fetch(`${GEMINI_BASE_URL}/models/${model}:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Gemini görsel isteği başarısız oldu.');
  }

  const parts = payload?.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find((part) => part.inlineData?.data);
  const text = parts.map((part) => part.text || '').join('').trim() || 'Görsel üretildi.';

  if (!imagePart?.inlineData?.data) {
    throw new Error('Gemini görsel döndürmedi.');
  }

  return buildTextMessage(text, {
    type: 'image',
    uri: `data:${imagePart.inlineData.mimeType || 'image/png'};base64,${imagePart.inlineData.data}`,
    mimeType: imagePart.inlineData.mimeType || 'image/png',
  });
};

const requestGeminiMusicResponse = async ({ prompt, model }) => {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API anahtarı eksik. `.env` dosyasına `EXPO_PUBLIC_GEMINI_API_KEY` ekleyin.');
  }

  const response = await fetch(`${GEMINI_BASE_URL}/models/${model}:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ['AUDIO', 'TEXT'],
      },
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Gemini müzik isteği başarısız oldu.');
  }

  const parts = payload?.candidates?.[0]?.content?.parts || [];
  const audioPart = parts.find((part) => part.inlineData?.data);
  const text = parts.map((part) => part.text || '').join('').trim() || 'Müzik üretildi.';

  if (!audioPart?.inlineData?.data) {
    throw new Error('Gemini ses çıktısı döndürmedi.');
  }

  return buildTextMessage(text, {
    type: 'audio',
    uri: `data:${audioPart.inlineData.mimeType || 'audio/mpeg'};base64,${audioPart.inlineData.data}`,
    mimeType: audioPart.inlineData.mimeType || 'audio/mpeg',
  });
};

const requestGeminiVideoResponse = async ({ prompt, model }) => {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API anahtarı eksik. `.env` dosyasına `EXPO_PUBLIC_GEMINI_API_KEY` ekleyin.');
  }

  const headers = {
    'Content-Type': 'application/json',
    'x-goog-api-key': GEMINI_API_KEY,
  };

  const response = await fetch(`${GEMINI_BASE_URL}/models/${model}:predictLongRunning`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      instances: [{ prompt }],
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Gemini video isteği başarısız oldu.');
  }

  const operationName = payload?.name;

  if (!operationName) {
    throw new Error('Video işlemi başlatılamadı.');
  }

  const result = await pollOperation({ operationName, headers: { 'x-goog-api-key': GEMINI_API_KEY } });
  const videoUri = result?.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;

  if (!videoUri) {
    throw new Error('Gemini video bağlantısı döndürmedi.');
  }

  return buildTextMessage('Video üretildi. Aşağıdaki bağlantıdan açabilirsiniz.', {
    type: 'video',
    uri: videoUri,
    mimeType: 'video/mp4',
  });
};

const requestOpenAiResponse = async ({ messages, model }) => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API anahtarı eksik. `.env` dosyasına `EXPO_PUBLIC_OPENAI_API_KEY` ekleyin.');
  }

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: model || 'gpt-4o',
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error?.message || 'OpenAI isteği başarısız oldu.');
  }

  const text = payload?.choices?.[0]?.message?.content?.trim();

  if (!text) {
    throw new Error('OpenAI boş yanıt döndürdü.');
  }

  return text;
};

const requestOpenAiImageResponse = async ({ prompt, model }) => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API anahtarı eksik. `.env` dosyasına `EXPO_PUBLIC_OPENAI_API_KEY` ekleyin.');
  }

  const response = await fetch(OPENAI_IMAGE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      prompt,
      size: '1024x1024',
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error?.message || 'OpenAI görsel isteği başarısız oldu.');
  }

  const image = payload?.data?.[0];
  const imageUri = image?.b64_json ? `data:image/png;base64,${image.b64_json}` : image?.url;

  if (!imageUri) {
    throw new Error('OpenAI görsel döndürmedi.');
  }

  return buildTextMessage('Görsel üretildi.', {
    type: 'image',
    uri: imageUri,
    mimeType: 'image/png',
  });
};

const requestOpenAiAudioResponse = async ({ prompt, model }) => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API anahtarı eksik. `.env` dosyasına `EXPO_PUBLIC_OPENAI_API_KEY` ekleyin.');
  }

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      modalities: ['text', 'audio'],
      audio: {
        voice: 'alloy',
        format: 'mp3',
      },
      messages: [
        {
          role: 'system',
          content: 'You generate short helpful music or audio snippets based on the user prompt.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error?.message || 'OpenAI ses isteği başarısız oldu.');
  }

  const message = payload?.choices?.[0]?.message;
  const audioData = message?.audio?.data;
  const text = message?.content?.trim() || message?.audio?.transcript || 'Ses üretildi.';

  if (!audioData) {
    throw new Error('OpenAI ses çıktısı döndürmedi.');
  }

  return buildTextMessage(text, {
    type: 'audio',
    uri: `data:audio/mp3;base64,${audioData}`,
    mimeType: 'audio/mp3',
  });
};

const pollOpenAiVideo = async (videoId) => {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const response = await fetch(`${OPENAI_VIDEO_API_URL}/${videoId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload?.error?.message || 'OpenAI video durumu alınamadı.');
    }

    if (payload?.status === 'succeeded' || payload?.status === 'completed') {
      return payload;
    }

    if (payload?.status === 'failed' || payload?.status === 'cancelled') {
      throw new Error(payload?.error?.message || 'OpenAI video üretimi başarısız oldu.');
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  throw new Error('OpenAI video üretimi zaman aşımına uğradı.');
};

const requestOpenAiVideoResponse = async ({ prompt, model }) => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API anahtarı eksik. `.env` dosyasına `EXPO_PUBLIC_OPENAI_API_KEY` ekleyin.');
  }

  const response = await fetch(OPENAI_VIDEO_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      prompt,
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error?.message || 'OpenAI video isteği başarısız oldu.');
  }

  const videoId = payload?.id || payload?.data?.[0]?.id;

  if (!videoId) {
    throw new Error('OpenAI video işlemi başlatılamadı.');
  }

  const result = await pollOpenAiVideo(videoId);
  const videoUri = result?.output?.[0]?.url || result?.data?.[0]?.url || result?.url;

  if (!videoUri) {
    throw new Error('OpenAI video bağlantısı döndürmedi.');
  }

  return buildTextMessage('Video üretildi. Aşağıdaki bağlantıdan açabilirsiniz.', {
    type: 'video',
    uri: videoUri,
    mimeType: 'video/mp4',
  });
};

const requestModelResponse = async ({ selectedModel, messages, text }) => {
  const activeModel = selectedModel || DEFAULT_SELECTED_MODEL;
  const resolvedModel = resolveModelAlias(activeModel);

  if (activeModel.provider === 'gemini' && activeModel.mediaType === 'text') {
    return buildTextMessage(await requestGeminiResponse({
      prompt: buildConversationPrompt(messages, text),
      model: resolvedModel,
    }));
  }

  if (activeModel.provider === 'chatgpt' && activeModel.mediaType === 'text') {
    return buildTextMessage(await requestOpenAiResponse({
      messages: buildOpenAiMessages(messages, text),
      model: resolvedModel,
    }));
  }

  if (activeModel.provider === 'gemini' && activeModel.mediaType === 'image') {
    return requestGeminiImageResponse({ prompt: text, model: resolvedModel });
  }

  if (activeModel.provider === 'chatgpt' && activeModel.mediaType === 'image') {
    return requestOpenAiImageResponse({ prompt: text, model: resolvedModel });
  }

  if (activeModel.provider === 'gemini' && activeModel.mediaType === 'video') {
    return requestGeminiVideoResponse({ prompt: text, model: resolvedModel });
  }

  if (activeModel.provider === 'chatgpt' && activeModel.mediaType === 'video') {
    return requestOpenAiVideoResponse({ prompt: text, model: resolvedModel });
  }

  if (activeModel.provider === 'gemini' && activeModel.mediaType === 'music') {
    return requestGeminiMusicResponse({ prompt: text, model: resolvedModel });
  }

  if (activeModel.provider === 'chatgpt' && activeModel.mediaType === 'music') {
    return requestOpenAiAudioResponse({ prompt: text, model: resolvedModel });
  }

  throw new Error('Seçilen sağlayıcı henüz desteklenmiyor.');
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
        const aiResponse = await requestModelResponse({
          selectedModel,
          messages,
          text,
        });
        const aiMessage = {
          id: generateId(),
          text: aiResponse.text,
          media: aiResponse.media || null,
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

      const aiResponse = await requestModelResponse({
        selectedModel,
        messages,
        text,
      });

      const { error: aiInsertError } = await supabase
          .from('messages')
          .insert([{
            conversation_id: conversationId,
            user_id: user.id,
            content: aiResponse.text,
            is_user: false,
          }]);

      if (aiInsertError) throw aiInsertError;

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
