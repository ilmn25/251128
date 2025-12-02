import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';
import '../discord.css';

export default function Login() {
  const [token, setToken] = useState('');
  const [status, setStatus] = useState('Made by illu');
  const navigate = useNavigate();

  async function check() {
    if (!token.trim()) {
      setStatus('Enter token first');
      return;
    }

    setStatus('Checking...');

    try {
      const res = await fetch('http://localhost:8000/login', {
        method: 'POST',
        credentials: 'include', // keep cookies
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim() })
      });

      const data = await res.json();

      if (res.ok) {
        // backend returned success
        setStatus('Logged in');
        navigate('/Home');
      } else {
        setStatus(data.error || 'Invalid token');
      }
    } catch (err) {
      console.error(err);
      setStatus('Backend offline');
    }
  }

  return (
    <div>
      <h1>Discord Posting Automation Tool</h1>
      <p className="comment">{status}</p>

      <div className="chat-bar">
        <input
          className="chat-input"
          placeholder="Enter Token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && check()}
        />
        <button onClick={check} className="send-btn">
          Go
        </button>
      </div>

      <p className="comment">
        Browser Discord → F12 → Network → Click on another Discord Channel → Messages?limit=50 → Headers → Authorization
      </p>
    </div>
  );
}
