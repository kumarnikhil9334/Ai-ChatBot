
import { useState, useEffect, useRef } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [file, setFile] = useState(null);
  const [cvId, setCvId] = useState("");
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const suggestedPrompts = [
    "What are my core skills?",
    "Summarize my experience",
    "Explain my projects",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0];

    if (!selected) return;

    if (
      selected.type !== "application/pdf" &&
      !selected.name.toLowerCase().endsWith(".pdf")
    ) {
      setError("Please select a valid PDF file.");
      return;
    }

    setFile(selected);
    setCvId("");
    setMessages([]);
    setError("");
  };

  const uploadCV = async () => {
    if (!file) {
      setError("Please select a PDF resume.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${API_URL}/upload-cv`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Resume upload failed."
        );
      }

      setCvId(data.cv_id);

      setMessages([
        {
          role: "assistant",
          text:
            "Your resume is ready! I've processed " +
            "your document. Ask me anything about " +
            "your skills, experience or projects.",
        },
      ]);
    } catch (err) {
      setError(err.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const sendMessage = async (event) => {
    event.preventDefault();

    const text = question.trim();

    if (!text || loading || !cvId) return;

    setQuestion("");
    setError("");
    setLoading(true);

    setMessages((prev) => [
      ...prev,
      { role: "user", text },
    ]);

    try {
      const response = await fetch(
        `${API_URL}/chat-cv`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cv_id: cvId,
            message: text,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Failed to generate response."
        );
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.reply,
        },
      ]);
    } catch (err) {
      setError(err.message || "Something went wrong.");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            "Sorry, I couldn't process your request. " +
            "Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setQuestion("");
    setError("");
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="brand">
            <div className="logo">✦</div>

            <div>
              <h1>CV Intelligence</h1>
              <p>AI Resume Workspace</p>
            </div>
          </div>

          <div className="header-right">
            <span className="status">
              <span className="status-dot"></span>
              Local AI
            </span>

            <span className="model-tag">
              Llama 3.2
            </span>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="page-intro">
          <span className="eyebrow">
            YOUR AI WORKSPACE
          </span>

          <h2>Understand your resume better.</h2>

          <p>
            Upload your CV and explore your skills,
            experience and projects with AI.
          </p>
        </div>

        <div className="workspace">
          <aside className="sidebar">
            <div className="card-heading">
              <div className="heading-icon">↥</div>

              <div>
                <h3>Your resume</h3>
                <p>Upload a PDF document</p>
              </div>
            </div>

            <div
              className="upload-zone"
              onClick={() =>
                !uploading && fileInputRef.current?.click()
              }
            >
              <div className="file-icon">▤</div>

              <strong>
                {file ? file.name : "Choose your resume"}
              </strong>

              <p>
                {file
                  ? "Click to select another file"
                  : "PDF format supported"}
              </p>

              <span className="browse-btn">
                Browse files
              </span>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                hidden
              />
            </div>

            <button
              className="primary-btn"
              onClick={uploadCV}
              disabled={!file || uploading || loading}
            >
              {uploading
                ? "Processing resume..."
                : "Upload resume"}
              <span>→</span>
            </button>

            {cvId && (
              <div className="success-box">
                <span>✓</span>
                <div>
                  <strong>Resume ready</strong>
                  <p>
                    Your document is ready for questions.
                  </p>
                </div>
              </div>
            )}

            <div className="sidebar-divider"></div>

            <div className="info-section">
              <h4>How it works</h4>

              <div className="info-step">
                <span>01</span>
                <p>Upload your PDF resume</p>
              </div>

              <div className="info-step">
                <span>02</span>
                <p>AI processes your document</p>
              </div>

              <div className="info-step">
                <span>03</span>
                <p>Ask questions about your CV</p>
              </div>
            </div>

            <div className="privacy-note">
              ◈ Powered by local Ollama AI
            </div>
          </aside>

          <section className="chat-card">
            <div className="chat-header">
              <div className="chat-title">
                <div className="assistant-avatar">
                  ✦
                </div>

                <div>
                  <h3>AI Assistant</h3>
                  <p>
                    Your personal resume companion
                  </p>
                </div>
              </div>

              <button
                className="clear-btn"
                onClick={resetChat}
                disabled={loading || messages.length === 0}
              >
                ↻ New chat
              </button>
            </div>

            <div className="messages">
              {messages.length === 0 ? (
                <div className="empty-chat">
                  <div className="empty-symbol">
                    ✦
                  </div>

                  <h2>
                    Your resume, explained.
                  </h2>

                  <p>
                    Upload your resume to start
                    a conversation with your
                    AI assistant.
                  </p>

                  <div className="suggestions">
                    {suggestedPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        className="suggestion-pill"
                        onClick={() => setQuestion(prompt)}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`message ${message.role}`}
                  >
                    <div className="message-avatar">
                      {message.role === "user"
                        ? "U"
                        : "✦"}
                    </div>

                    <div className="message-content">
                      <span className="message-label">
                        {message.role === "user"
                          ? "You"
                          : "AI Assistant"}
                      </span>

                      <div className="bubble">
                        {message.text}
                      </div>
                    </div>
                  </div>
                ))
              )}

              {loading && (
                <div className="message assistant">
                  <div className="message-avatar">
                    ✦
                  </div>

                  <div className="message-content">
                    <span className="message-label">
                      AI Assistant
                    </span>

                    <div className="typing">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef}></div>
            </div>

            {error && (
              <div className="error">
                {error}
                <button onClick={() => setError("")}>
                  ×
                </button>
              </div>
            )}

            <div className="chat-bottom">
              <form
                className="chat-form"
                onSubmit={sendMessage}
              >
                <input
                  type="text"
                  placeholder={
                    cvId
                      ? "Ask anything about your resume..."
                      : "Upload your resume to begin..."
                  }
                  value={question}
                  onChange={(e) =>
                    setQuestion(e.target.value)
                  }
                  disabled={!cvId || loading}
                />

                <button
                  type="submit"
                  disabled={
                    !cvId ||
                    loading ||
                    !question.trim()
                  }
                  aria-label="Send message"
                >
                  ↑
                </button>
              </form>

              <p className="chat-disclaimer">
                AI responses may contain inaccuracies.
                Verify important details.
              </p>
            </div>
          </section>
        </div>
      </main>

      <footer className="footer">
        <span>© 2026 CV Intelligence</span>
        <span>
          Built with React · FastAPI · Ollama · MongoDB
        </span>
      </footer>
    </div>
  );
}

export default App;
