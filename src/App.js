import React, { useMemo, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h2>Bir hata oluştu</h2>
          <p>{this.state.error?.message || 'Uygulama yüklenirken bir sorun oluştu'}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

function AppContent() {
  const { loading, user, signInWithGoogle, signInTestUser, signOut } = useAuth();
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content:
        'Merhaba! Ben Sainat AI. Şu an ilk hedef olarak ChatGPT tarzı sohbet arayüzünü kuruyorum.',
    },
    {
      id: 2,
      role: 'assistant',
      content:
        'Solda sohbet geçmişi, ortada mesaj akışı ve altta mesaj yazma alanı olacak şekilde temel kopya hazır.',
    },
  ]);

  const conversations = useMemo(
    () => [
      { id: 'c1', title: 'Yeni sohbet', time: 'Şimdi' },
      { id: 'c2', title: 'Landing page taslağı', time: 'Dün' },
      { id: 'c3', title: 'Supabase auth akışı', time: '2 gün önce' },
      { id: 'c4', title: 'Sainat AI ürün notları', time: 'Bu hafta' },
    ],
    []
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const submitMessage = () => {
    const value = draft.trim();

    if (!value) {
      return;
    }

    setMessages((current) => [
      ...current,
      {
        id: Date.now(),
        role: 'user',
        content: value,
      },
      {
        id: Date.now() + 1,
        role: 'assistant',
        content:
          'Bu şu an görsel prototip aşamasında. Sonraki adımda bunu gerçek model yanıtı ve Supabase kayıt akışı ile bağlayacağım.',
      },
    ]);
    setDraft('');
  };

  return (
    <main className="chat-app">
      <aside className="sidebar">
        <div className="sidebar-top">
          <button className="new-chat-button">+ Yeni sohbet</button>
          <div className="brand-block">
            <div className="brand-mark">S</div>
            <div>
              <strong>Sainat AI</strong>
              <p>Chat workspace</p>
            </div>
          </div>
        </div>

        <div className="conversation-list">
          {conversations.map((conversation) => (
            <button key={conversation.id} className="conversation-item">
              <span>{conversation.title}</span>
              <small>{conversation.time}</small>
            </button>
          ))}
        </div>

        <div className="sidebar-bottom">
          <div className="user-card">
            <div>
              <strong>{user?.user_metadata?.full_name || 'Misafir kullanıcı'}</strong>
              <p>{user?.email || 'Henüz giriş yapılmadı'}</p>
            </div>
          </div>
          <div className="auth-actions">
            {!user ? (
              <>
                <button className="primary-button" onClick={signInWithGoogle}>
                  Google ile giriş
                </button>
                <button className="secondary-button" onClick={signInTestUser}>
                  Test kullanıcı
                </button>
              </>
            ) : (
              <button className="secondary-button" onClick={signOut}>
                Çıkış yap
              </button>
            )}
          </div>
        </div>
      </aside>

      <section className="chat-panel">
        <header className="chat-header">
          <div>
            <span className="eyebrow">Model</span>
            <h1>Sainat GPT</h1>
          </div>
          <div className="header-badges">
            <span className="header-badge">GPT tarzı arayüz</span>
            <span className="header-badge success-badge">Hazır</span>
          </div>
        </header>

        <div className="message-stream">
          {messages.map((message) => (
            <div key={message.id} className={`message-row ${message.role}`}>
              <div className="message-avatar">
                {message.role === 'assistant' ? 'AI' : 'Sen'}
              </div>
              <div className="message-bubble">
                <span className="message-role">
                  {message.role === 'assistant' ? 'Sainat AI' : 'Sen'}
                </span>
                <p>{message.content}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="composer-shell">
          <div className="prompt-chips">
            <button className="chip" onClick={() => setDraft('Bana modern bir landing page taslağı çıkar.')}>
              Landing page yaz
            </button>
            <button className="chip" onClick={() => setDraft('Supabase auth akışını planla.')}>
              Auth planı üret
            </button>
            <button className="chip" onClick={() => setDraft('Mobil uygulama için onboarding metni yaz.')}>
              Onboarding yaz
            </button>
          </div>
          <div className="composer">
            <textarea
              className="composer-input"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Sainat AI'ya bir mesaj yaz..."
            />
            <button className="send-button" onClick={submitMessage}>
              Gönder
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}
