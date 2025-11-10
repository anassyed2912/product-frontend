// Login.tsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await axios.post("http://localhost:4000/api/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", resp.data.token);
      navigate("/app");
    } catch (err: any) {
      alert("Login failed: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.backgroundOrbs}>
        <div style={{ ...styles.orb, ...styles.orb1 }}></div>
        <div style={{ ...styles.orb, ...styles.orb2 }}></div>
      </div>

      <div style={styles.card}>
        <div style={styles.iconContainer}>
          <div style={styles.icon}>🔐</div>
        </div>

        <h2 style={styles.title}>Welcome Back</h2>
        <p style={styles.subtitle}>Sign in to continue your transparency journey</p>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
              minLength={6}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.primaryBtn}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerText}>or</span>
        </div>

        <p style={styles.footerText}>
          Don't have an account?{" "}
          <Link to="/register" style={styles.link}>
            Create one here
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  wrapper: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    position: "relative",
    overflow: "hidden",
  },
  backgroundOrbs: {
    position: "absolute",
    width: "100%",
    height: "100%",
    overflow: "hidden",
    pointerEvents: "none",
  },
  orb: {
    position: "absolute",
    borderRadius: "50%",
    filter: "blur(80px)",
    opacity: 0.3,
  },
  orb1: {
    width: "400px",
    height: "400px",
    background: "#f093fb",
    top: "-10%",
    right: "-10%",
  },
  orb2: {
    width: "350px",
    height: "350px",
    background: "#4facfe",
    bottom: "-10%",
    left: "-10%",
  },
  card: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(20px)",
    borderRadius: "24px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
    width: "100%",
    maxWidth: "440px",
    padding: "48px",
    position: "relative",
    zIndex: 1,
  },
  iconContainer: {
    textAlign: "center",
    marginBottom: "24px",
  },
  icon: {
    fontSize: "48px",
    display: "inline-block",
    animation: "float 3s ease-in-out infinite",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: "8px",
  },
  subtitle: {
    fontSize: "15px",
    color: "#6b7280",
    textAlign: "center",
    marginBottom: "32px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
  },
  input: {
    padding: "14px 18px",
    borderRadius: "12px",
    border: "2px solid #e5e7eb",
    fontSize: "16px",
    transition: "all 0.3s ease",
    outline: "none",
  },
  primaryBtn: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    padding: "16px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
    marginTop: "8px",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    textAlign: "center",
    margin: "24px 0",
  },
  dividerText: {
    padding: "0 12px",
    color: "#9ca3af",
    fontSize: "14px",
    flex: "0 0 auto",
  },
  footerText: {
    textAlign: "center",
    fontSize: "14px",
    color: "#6b7280",
  },
  link: {
    color: "#667eea",
    textDecoration: "none",
    fontWeight: "600",
    transition: "color 0.3s ease",
  },
};
