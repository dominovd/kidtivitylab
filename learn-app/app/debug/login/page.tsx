"use client";

import { useState } from "react";

export default function DebugLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  return (
    <main className="app">
      <form
        className="card gate"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError(false);
          const res = await fetch("/learn/api/debug-login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password }),
          });
          setBusy(false);
          if (res.ok) window.location.href = "/learn/debug";
          else setError(true);
        }}
      >
        <div className="result-icon">🛠️</div>
        <h1>Debug mode</h1>
        <input className="answer-input" type="password" placeholder="Debug password" autoFocus value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="error">Wrong password</p>}
        <button className="btn primary" disabled={!password || busy}>
          Enter →
        </button>
      </form>
    </main>
  );
}
