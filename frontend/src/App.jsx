
import { useState } from "react";
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

  // Upload PDF resume to FastAPI
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

      const response = await fetch(`${API_URL}/upload-cv`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "CV upload failed.");
      }

      setCvId(data.cv_id);
      setMessages([
        {
          role: "assistant",
          text: `Resume uploaded successfully! (${data.characters_extracted} characters extracted). You can now ask questions about your CV.`,
        },
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  // Ask questions using uploaded CV
  const sendMessage = async (event) => {
    event.preventDefault();

    const text = question.trim();

    if (!text || loading) return;

    if (!cvId) {
      setError("Please upload your CV first.");
      return;
    }

    setError("");
    setQuestion("");
    setMessages((prev) => [
      ...prev,
      { role: "user", text },
    ]);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/chat-cv`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cv_id: cvId,
          message: text,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Chat request failed.");
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.reply },
      ]);
    } catch (err) {
      setError(err.message);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Sorry, I could not generate a response. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <div className="logo">AI</div>
          <div>
            <h1>AI CV Chatbot</h1>
            <p>Powered by FastAPI, Ollama & MongoDB</p>
          </div>
        </div>
        <span className="status">● Local AI</span>
      </header>

      <main className="container">
        <section className="upload-card">
          <div className="section-heading">
            <h2>Upload Your Resume</h2>
            <p>Upload a PDF to start chatting with your CV.</p>
          </div>

          <div className="upload-area">
            <div className="upload-icon">📄</div>
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) => {
                setFile(e.target.files?.[0] || null);
                setCvId("");
                setMessages([]);
                setError("");
              }}
            />
            <p>{file ? file.name : "Choose your PDF resume"}</p>
          </div>

          <button
            className="upload-btn"
            onClick={uploadCV}
            disabled={uploading || !file}
          >
            {uploading ? "Uploading..." : "Upload Resume"}
          </button>

          {cvId && (
            <p className="success">
              ✓ Resume ready! Ask your questions below.
            </p>
          )}
        </section>

        <section className="chat-card">
          <div className="chat-heading">
            <div>
              <h2>Chat With Your Resume</h2>
              <p>Ask about skills, education, projects and experience.</p>
            </div>
            <span className="chat-badge">Llama 3.2</span>
          </div>

          <div className="messages">
            {messages.length === 0 && (
              <div className="empty-chat">
                <div className="empty-icon">🤖</div>
                <h3>Your AI Resume Assistant</h3>
                <p>
                  Upload your CV and ask questions such as
                  "What are my technical skills?"
                </p>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${message.role}`}
              >
                <span className="message-label">
                  {message.role === "user" ? "You" : "AI Assistant"}
                </span>
                <div className="bubble">{message.text}</div>
              </div>
            ))}

            {loading && (
              <div className="typing">AI is thinking...</div>
            )}
          </div>

          <form className="chat-form" onSubmit={sendMessage}>
            <input
              type="text"
              placeholder="Ask a question about your resume..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={!cvId || loading}
            />
            <button
              type="submit"
              disabled={!cvId || loading || !question.trim()}
            >
              Send ➤
            </button>
          </form>
        </section>

        {error && <div className="error">{error}</div>}
      </main>

      <footer>
        AI CV Chatbot • React + FastAPI + Ollama + MongoDB
      </footer>
    </div>
  );
}

export default App;
