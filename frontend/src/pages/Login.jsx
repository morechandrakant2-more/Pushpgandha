import { useState } from "react";
import axios from "axios";
import "../App.css";

const API = import.meta.env.VITE_API_URL;

export default function Login({ setIsLoggedIn, setToken }) {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  // ---------------- HANDLE INPUT ----------------
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ---------------- LOGIN ----------------
  const handleLogin = async () => {
    if (!form.username || !form.password) {
      alert("Enter username and password");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(`${API}/api/login`, form);

      // ✅ Save token
      localStorage.setItem("token", res.data.token);

      // ✅ Update App state
      setToken(res.data.token);
      setIsLoggedIn(true);

    } catch (err) {
      console.error("Login error:", err);
      alert("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="container" style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Login</h2>

      <input
        name="username"
        placeholder="Username"
        value={form.username}
        onChange={handleChange}
      />
      <br /><br />

      <input
        name="password"
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
      />
      <br /><br />

      <button onClick={handleLogin} disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </div>
  );
}