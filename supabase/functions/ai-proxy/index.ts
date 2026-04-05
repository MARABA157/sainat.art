import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_IMAGE_API_URL = 'https://api.openai.com/v1/images/generations';
const OPENAI_VIDEO_API_URL = 'https://api.openai.com/v1/videos';
const DEFAULT_SELECTED_MODEL = {
  provider: 'gemini',
  model: 'gemini-2.0-flash',
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

const buildJsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });

const buildTextMessage = (text: string, media: Record<string, unknown> | null = null) => ({
  text,
  media,
});

const resolveModelAlias = (selectedModel: Record<string, string>) => {
  const provider = selectedModel?.provider || DEFAULT_SELECTED_MODEL.provider;
  const mediaType = selectedModel?.mediaType || DEFAULT_SELECTED_MODEL.mediaType;
  const model = selectedModel?.model || DEFAULT_SELECTED_MODEL.model;

  return MODEL_ALIASES[provider as keyof typeof MODEL_ALIASES]?.[mediaType as 'text' | 'image' | 'video' | 'music']?.[model] || model;
};

const buildConversationPrompt = (messages: Array<{ text?: string; isUser?: boolean }>, nextUserText: string) => {
  const history = messages
    .slice(-12)
    .map((message) => `${message.isUser ? 'Kullanıcı' : 'Asistan'}: ${message.text || ''}`)
    .join('\n');

  return [
    'Sen Sainat uygulamasındaki yardımcı bir AI asistansın.',
    'Kısa, net ve yardımcı cevaplar ver.',
    'Kullanıcının son mesajı hangi dilde yazıldıysa cevabını da aynı dilde ver.',
    'Eğer kullanıcı birden fazla dil kullanıyorsa baskın dili takip et.',
    history,
    `Kullanıcı: ${nextUserText}`,
    'Asistan:',
  ]
    .filter(Boolean)
    .join('\n\n');
};

const buildOpenAiMessages = (messages: Array<{ text?: string; isUser?: boolean }>, nextUserText: string) => {
  const history = messages.slice(-12).map((message) => ({
    role: message.isUser ? 'user' : 'assistant',
    content: message.text || '',
  }));

  return [
    {
      role: 'system',
      content: 'You are the helpful AI assistant inside the Sainat app. Reply clearly, briefly, and helpfully. Always answer in the same language as the user\'s latest prompt. If the user mixes languages, follow the dominant language of the latest prompt.',
    },
    ...history,
    {
      role: 'user',
      content: nextUserText,
    },
  ];
};

const buildVideoPrompt = (prompt: string) => [
  'Generate a video, not an image or storyboard.',
  'The final output must be a playable video clip.',
  'Any textual response or summary must use the same language as the user prompt.',
  (prompt || '').trim(),
]
  .filter(Boolean)
  .join('\n\n');

const buildLocalizedFallbackText = (prompt: string, variants: { tr: string; en: string }) => {
  const normalizedPrompt = (prompt || '').trim();

  if (!normalizedPrompt) {
    return variants.en;
  }

  const asciiOnly = /^[\x00-\x7F\s\p{P}]*$/u.test(normalizedPrompt);
  const hasTurkishChars = /[çğıöşüÇĞİÖŞÜ]/.test(normalizedPrompt);

  if (hasTurkishChars) {
    return variants.tr;
  }

  return asciiOnly ? variants.en : variants.tr;
};

const isVideoUrl = (value: string | null | undefined) => {
  if (typeof value !== 'string') {
    return false;
  }

  if (value.startsWith('data:video/')) {
    return true;
  }

  try {
    const parsedUrl = new URL(value);
    const pathname = parsedUrl.pathname.toLowerCase();
    return ['.mp4', '.mov', '.webm', '.m4v'].some((extension) => pathname.endsWith(extension));
  } catch {
    return false;
  }
};

const extractGeminiText = (payload: Record<string, unknown>) => {
  const candidates = Array.isArray(payload?.candidates) ? payload.candidates as Array<Record<string, unknown>> : [];
  const parts = Array.isArray(candidates[0]?.content?.parts) ? candidates[0].content.parts as Array<Record<string, unknown>> : [];
  return parts.map((part) => typeof part?.text === 'string' ? part.text : '').join('').trim();
};

const extractOpenAiText = (payload: Record<string, unknown>) => {
  const choice = Array.isArray(payload?.choices) ? payload.choices[0] as Record<string, unknown> : null;
  const message = choice?.message as Record<string, unknown> | undefined;

  if (typeof message?.content === 'string') {
    return message.content.trim();
  }

  if (Array.isArray(message?.content)) {
    return message.content
      .map((item: unknown) => {
        if (typeof item === 'string') {
          return item;
        }

        if (typeof item === 'object' && item !== null) {
          const typedItem = item as Record<string, unknown>;
          if (typedItem.type === 'text' && typeof typedItem.text === 'string') {
            return typedItem.text;
          }

          if (typeof typedItem.text === 'object' && typedItem.text !== null) {
            const nestedText = typedItem.text as Record<string, unknown>;
            return typeof nestedText.value === 'string' ? nestedText.value : '';
          }
        }

        return '';
      })
      .join('')
      .trim();
  }

  return '';
};

const extractOpenAiAudio = (payload: Record<string, unknown>) => {
  const choice = Array.isArray(payload?.choices) ? payload.choices[0] as Record<string, unknown> : null;
  const message = choice?.message as Record<string, unknown> | undefined;
  const messageAudio = message?.audio as Record<string, unknown> | undefined;
  const choiceAudio = choice?.audio as Record<string, unknown> | undefined;

  return {
    audioData: typeof messageAudio?.data === 'string' ? messageAudio.data : typeof choiceAudio?.data === 'string' ? choiceAudio.data : null,
    transcript: typeof messageAudio?.transcript === 'string' ? messageAudio.transcript : typeof choiceAudio?.transcript === 'string' ? choiceAudio.transcript : '',
    text: extractOpenAiText(payload),
  };
};

const extractGeminiVideoUri = (payload: Record<string, unknown>) => {
  const response = payload?.response as Record<string, unknown> | undefined;
  const generatedSamples = Array.isArray(response?.generateVideoResponse?.generatedSamples) ? response.generateVideoResponse.generatedSamples as Array<Record<string, unknown>> : [];
  const generatedVideos = Array.isArray(response?.generatedVideos) ? response.generatedVideos as Array<Record<string, unknown>> : [];

  return generatedSamples[0]?.video?.uri || generatedVideos[0]?.video?.uri || generatedVideos[0]?.uri || null;
};

const extractOpenAiVideoId = (payload: Record<string, unknown>) => {
  const dataItems = Array.isArray(payload?.data) ? payload.data as Array<Record<string, unknown>> : [];
  return payload?.id || dataItems[0]?.id || payload?.video?.id || null;
};

const extractOpenAiVideoUri = (payload: Record<string, unknown>) => {
  const outputItems = Array.isArray(payload?.output) ? payload.output as Array<Record<string, unknown>> : [];
  const dataItems = Array.isArray(payload?.data) ? payload.data as Array<Record<string, unknown>> : [];

  const candidateUrls = [
    ...outputItems.map((item) => item?.url || item?.download_url || item?.video?.url || item?.file_url),
    ...dataItems.map((item) => item?.url || item?.download_url || item?.video?.url || item?.file_url),
    payload?.url,
    payload?.download_url,
    payload?.video?.url,
  ].filter((value) => typeof value === 'string');

  return (candidateUrls as string[]).find((url) => isVideoUrl(url)) || null;
};

const pollOperation = async ({ operationName, headers }: { operationName: string; headers: Record<string, string> }) => {
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
      return payload as Record<string, unknown>;
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  throw new Error('Medya üretimi zaman aşımına uğradı. Lütfen tekrar deneyin.');
};

const pollOpenAiVideo = async ({ videoId, apiKey }: { videoId: string; apiKey: string }) => {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const response = await fetch(`${OPENAI_VIDEO_API_URL}/${videoId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload?.error?.message || 'OpenAI video durumu alınamadı.');
    }

    if (payload?.status === 'succeeded' || payload?.status === 'completed') {
      return payload as Record<string, unknown>;
    }

    if (payload?.status === 'failed' || payload?.status === 'cancelled') {
      throw new Error(payload?.error?.message || 'OpenAI video üretimi başarısız oldu.');
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  throw new Error('OpenAI video üretimi zaman aşımına uğradı.');
};

const requestGeminiResponse = async ({ prompt, model, apiKey }: { prompt: string; model: string; apiKey: string }) => {
  const response = await fetch(`${GEMINI_BASE_URL}/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
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

const requestGeminiImageResponse = async ({ prompt, model, apiKey }: { prompt: string; model: string; apiKey: string }) => {
  const response = await fetch(`${GEMINI_BASE_URL}/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: `${prompt}\n\nReturn any accompanying text in the same language as the user prompt.` }] }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Gemini görsel isteği başarısız oldu.');
  }

  const candidates = Array.isArray(payload?.candidates) ? payload.candidates as Array<Record<string, unknown>> : [];
  const parts = Array.isArray(candidates[0]?.content?.parts) ? candidates[0].content.parts as Array<Record<string, unknown>> : [];
  const imagePart = parts.find((part) => typeof part?.inlineData?.data === 'string');
  const text = parts.map((part) => typeof part?.text === 'string' ? part.text : '').join('').trim() || buildLocalizedFallbackText(prompt, {
    tr: 'Görsel üretildi.',
    en: 'Image generated.',
  });

  if (!imagePart?.inlineData?.data) {
    throw new Error('Gemini görsel döndürmedi.');
  }

  return buildTextMessage(text, {
    type: 'image',
    uri: `data:${imagePart.inlineData.mimeType || 'image/png'};base64,${imagePart.inlineData.data}`,
    mimeType: imagePart.inlineData.mimeType || 'image/png',
  });
};

const requestGeminiMusicResponse = async ({ prompt, model, apiKey }: { prompt: string; model: string; apiKey: string }) => {
  const response = await fetch(`${GEMINI_BASE_URL}/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: `${prompt}\n\nReturn any accompanying text in the same language as the user prompt.` }] }],
      generationConfig: {
        responseModalities: ['AUDIO', 'TEXT'],
      },
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Gemini müzik isteği başarısız oldu.');
  }

  const candidates = Array.isArray(payload?.candidates) ? payload.candidates as Array<Record<string, unknown>> : [];
  const parts = Array.isArray(candidates[0]?.content?.parts) ? candidates[0].content.parts as Array<Record<string, unknown>> : [];
  const audioPart = parts.find((part) => typeof part?.inlineData?.data === 'string');
  const text = parts.map((part) => typeof part?.text === 'string' ? part.text : '').join('').trim() || buildLocalizedFallbackText(prompt, {
    tr: 'Müzik üretildi.',
    en: 'Music generated.',
  });

  if (!audioPart?.inlineData?.data) {
    throw new Error('Gemini ses çıktısı döndürmedi.');
  }

  return buildTextMessage(text, {
    type: 'audio',
    uri: `data:${audioPart.inlineData.mimeType || 'audio/mpeg'};base64,${audioPart.inlineData.data}`,
    mimeType: audioPart.inlineData.mimeType || 'audio/mpeg',
  });
};

const requestGeminiVideoResponse = async ({ prompt, model, apiKey }: { prompt: string; model: string; apiKey: string }) => {
  const videoPrompt = buildVideoPrompt(prompt);
  const headers = {
    'Content-Type': 'application/json',
    'x-goog-api-key': apiKey,
  };

  const response = await fetch(`${GEMINI_BASE_URL}/models/${model}:predictLongRunning`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      instances: [{ prompt: videoPrompt }],
      parameters: {
        aspectRatio: '16:9',
      },
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Gemini video isteği başarısız oldu.');
  }

  if (!payload?.name) {
    throw new Error('Video işlemi başlatılamadı.');
  }

  const result = await pollOperation({ operationName: payload.name, headers: { 'x-goog-api-key': apiKey } });
  const videoUri = extractGeminiVideoUri(result);

  if (!videoUri || !isVideoUrl(videoUri)) {
    throw new Error('Gemini video bağlantısı döndürmedi.');
  }

  return buildTextMessage(buildLocalizedFallbackText(prompt, {
    tr: 'Video üretildi. Aşağıdaki bağlantıdan açabilirsiniz.',
    en: 'Video generated. You can open it from the link below.',
  }), {
    type: 'video',
    uri: videoUri,
    mimeType: 'video/mp4',
  });
};

const requestOpenAiResponse = async ({ messages, model, apiKey }: { messages: Array<Record<string, unknown>>; model: string; apiKey: string }) => {
  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
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

  const text = extractOpenAiText(payload);
  if (!text) {
    throw new Error('OpenAI boş yanıt döndürdü.');
  }

  return text;
};

const requestOpenAiImageResponse = async ({ prompt, model, apiKey }: { prompt: string; model: string; apiKey: string }) => {
  const response = await fetch(OPENAI_IMAGE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
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

  const image = Array.isArray(payload?.data) ? payload.data[0] as Record<string, unknown> : null;
  const imageUri = typeof image?.b64_json === 'string' ? `data:image/png;base64,${image.b64_json}` : image?.url;

  if (typeof imageUri !== 'string') {
    throw new Error('OpenAI görsel döndürmedi.');
  }

  return buildTextMessage(buildLocalizedFallbackText(prompt, {
    tr: 'Görsel üretildi.',
    en: 'Image generated.',
  }), {
    type: 'image',
    uri: imageUri,
    mimeType: 'image/png',
  });
};

const requestOpenAiAudioResponse = async ({ prompt, model, apiKey }: { prompt: string; model: string; apiKey: string }) => {
  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
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
          content: 'You generate short helpful music or audio snippets based on the user prompt. Any textual response must be in the same language as the user\'s latest prompt.',
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

  const { audioData, transcript, text } = extractOpenAiAudio(payload);
  if (!audioData) {
    throw new Error('OpenAI ses çıktısı döndürmedi.');
  }

  return buildTextMessage(text || transcript || buildLocalizedFallbackText(prompt, {
    tr: 'Ses üretildi.',
    en: 'Audio generated.',
  }), {
    type: 'audio',
    uri: `data:audio/mp3;base64,${audioData}`,
    mimeType: 'audio/mp3',
  });
};

const requestOpenAiVideoResponse = async ({ prompt, model, apiKey }: { prompt: string; model: string; apiKey: string }) => {
  const response = await fetch(OPENAI_VIDEO_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      prompt: buildVideoPrompt(prompt),
      size: '1280x720',
      seconds: 5,
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error?.message || 'OpenAI video isteği başarısız oldu.');
  }

  const videoId = extractOpenAiVideoId(payload);
  if (typeof videoId !== 'string') {
    throw new Error('OpenAI video işlemi başlatılamadı.');
  }

  const result = await pollOpenAiVideo({ videoId, apiKey });
  const videoUri = extractOpenAiVideoUri(result);

  if (!videoUri || !isVideoUrl(videoUri)) {
    throw new Error('OpenAI video bağlantısı döndürmedi.');
  }

  return buildTextMessage(buildLocalizedFallbackText(prompt, {
    tr: 'Video üretildi. Aşağıdaki bağlantıdan açabilirsiniz.',
    en: 'Video generated. You can open it from the link below.',
  }), {
    type: 'video',
    uri: videoUri,
    mimeType: 'video/mp4',
  });
};

const routeModelRequest = async ({ selectedModel, messages, text, openAiApiKey, geminiApiKey }: { selectedModel: Record<string, string>; messages: Array<{ text?: string; isUser?: boolean }>; text: string; openAiApiKey: string; geminiApiKey: string }) => {
  const activeModel = selectedModel || DEFAULT_SELECTED_MODEL;
  const resolvedModel = resolveModelAlias(activeModel);

  if (activeModel.provider === 'gemini' && activeModel.mediaType === 'text') {
    return buildTextMessage(await requestGeminiResponse({
      prompt: buildConversationPrompt(messages, text),
      model: resolvedModel,
      apiKey: geminiApiKey,
    }));
  }

  if (activeModel.provider === 'chatgpt' && activeModel.mediaType === 'text') {
    return buildTextMessage(await requestOpenAiResponse({
      messages: buildOpenAiMessages(messages, text),
      model: resolvedModel,
      apiKey: openAiApiKey,
    }));
  }

  if (activeModel.provider === 'gemini' && activeModel.mediaType === 'image') {
    return requestGeminiImageResponse({ prompt: text, model: resolvedModel, apiKey: geminiApiKey });
  }

  if (activeModel.provider === 'chatgpt' && activeModel.mediaType === 'image') {
    return requestOpenAiImageResponse({ prompt: text, model: resolvedModel, apiKey: openAiApiKey });
  }

  if (activeModel.provider === 'gemini' && activeModel.mediaType === 'video') {
    return requestGeminiVideoResponse({ prompt: text, model: resolvedModel, apiKey: geminiApiKey });
  }

  if (activeModel.provider === 'chatgpt' && activeModel.mediaType === 'video') {
    return requestOpenAiVideoResponse({ prompt: text, model: resolvedModel, apiKey: openAiApiKey });
  }

  if (activeModel.provider === 'gemini' && activeModel.mediaType === 'music') {
    return requestGeminiMusicResponse({ prompt: text, model: resolvedModel, apiKey: geminiApiKey });
  }

  if (activeModel.provider === 'chatgpt' && activeModel.mediaType === 'music') {
    return requestOpenAiAudioResponse({ prompt: text, model: resolvedModel, apiKey: openAiApiKey });
  }

  throw new Error('Seçilen sağlayıcı henüz desteklenmiyor.');
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authorization = request.headers.get('Authorization');
    if (!authorization) {
      return buildJsonResponse({ error: 'Unauthorized' }, 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const openAiApiKey = Deno.env.get('OPENAI_API_KEY');
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase function yapılandırması eksik.');
    }

    if (!openAiApiKey || !geminiApiKey) {
      throw new Error('AI provider secret anahtarları eksik.');
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authorization,
        },
      },
      auth: {
        persistSession: false,
      },
    });

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return buildJsonResponse({ error: 'Unauthorized' }, 401);
    }

    const body = await request.json();
    const text = typeof body?.text === 'string' ? body.text.trim() : '';
    const selectedModel = typeof body?.selectedModel === 'object' && body?.selectedModel !== null ? body.selectedModel as Record<string, string> : DEFAULT_SELECTED_MODEL;
    const messages = Array.isArray(body?.messages) ? body.messages as Array<{ text?: string; isUser?: boolean }> : [];

    if (!text) {
      return buildJsonResponse({ error: 'Mesaj boş olamaz.' }, 400);
    }

    const response = await routeModelRequest({
      selectedModel,
      messages,
      text,
      openAiApiKey,
      geminiApiKey,
    });

    return buildJsonResponse(response);
  } catch (error) {
    return buildJsonResponse({ error: error instanceof Error ? error.message : 'Beklenmeyen bir hata oluştu.' }, 500);
  }
});
