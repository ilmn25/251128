import {useEffect, useState} from 'react';

export default function TokenPanel() {
  const [token, setToken] = useState('');
  const [status, setStatus] = useState('PLEASE SELECT A USER');
  const [items, setItems] = useState([]);

  useEffect(() => {
    async function fetchAll() {
      setItems(await (await fetch("http://localhost:8000/user")).json());
    }
    fetchAll();
  }, []);

  async function sync(data) {
    await fetch("http://localhost:8000/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async function add(token) {
    if (!token.trim()) {
      setStatus('Enter token first');
      return;
    }
    setStatus('Checking...');
    try {
      const res = await fetch("http://localhost:8000/user/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(token.trim())
      });

      let data = await res.json();
      if (data.success === true) {
        setItems(() => {
          if (items.some(i => i.token === token)) return items;
          const newItems = [{"token": token, "username": data.username}, ...items]
          sync(newItems);
          return newItems;
        });
        setToken("")
        setStatus("Selected: " + data.username);
      } else {
        setStatus((data.error || 'Invalid token'));
      }
    } catch (err) {
      console.error(err);
      setStatus('Backend offline');
    }
  }

  function remove(token) {
    setItems(prevItems => {
      const newItems = prevItems.filter(c => c.token !== token);
      sync(newItems);
      return newItems;
    });
  }

  return (
    <div className="section">
      <h3>Token</h3>
      <div className="section-list">
        <div className="section-item" style={{width:'50em'}}>
          <input
            className="section-input"
            style={{width:'100%'}}
            placeholder="DevTools → Network → Click on a Channel → Messages?limit=50 → Req Headers → Authorization"
            value={token}
            onChange={e => setToken(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault(); // prevent newline
                add(token);
              }
            }}
            type="password"
          />
        </div>
        <h5 style={{margin: "1em"}}>{status}</h5>
        <div className={"user-list"}>
          {items.map(item => (
            <div key={item.token} className="section-item section-input-token">
              <p className="section-title" style={{padding: "0", width: "7em", overflowWrap: "anywhere"}}>
                @{item.username}
              </p>
              <button onClick={() => {add(item.token)}} className="btn">pick</button>
              <button onClick={() => {remove(item.token)}} className="btn">delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
