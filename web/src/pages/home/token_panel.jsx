import {useEffect, useState} from 'react';

export default function TokenPanel() {
  const [token, setToken] = useState('');
  const [status, setStatus] = useState('');

  async function post(token) {
    await fetch("http://localhost:8000/token", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(token)
    });
  }

  useEffect(() => {post("")}, []);

  async function check() {
    if (!token.trim()) {
      setStatus('Enter token first');
      return;
    }
    setStatus('Checking...');
    try {
      const res = await post(token.trim())

      if (res.ok) {
        setStatus('Logged in');
      } else {
        const data = await res.json();
        setStatus(data.error || 'Invalid token');
      }
    } catch (err) {
      console.error(err);
      setStatus('Backend offline');
    }
  }

  return (
    <div className="section">
      <h3>Token</h3>
      <div className="section-list">
        <div className="section-item">
          <input
            className="section-input section-input-message"
            placeholder="DevTools → Network → Click on a DM Channel → Messages?limit=50 → Req Headers → Authorization"
            value={token}
            onChange={e => setToken(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault(); // prevent newline
                check();
              }
            }}
            type="password"
          />
        </div>
        <p className="comment">{status}</p>
      </div>
    </div>
  );
}
