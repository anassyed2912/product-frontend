// App.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

type Answers = { [key: string]: any };

interface ProductData {
  _id: string;
  name: string;
  category: string;
  questions: string[];
  attributes: Answers;
  transparencyScore?: number;
}

export default function App() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Other");
  const [answers, setAnswers] = useState<Answers>({});
  const [questions, setQuestions] = useState<string[]>([]);
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [saved, setSaved] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in first.");
      navigate("/login");
    }
  }, [navigate]);

  const startInterview = async () => {
    try {
      setLoading(true);
      const payload = { name, category, attributes: answers };
      const token = localStorage.getItem("token");

      const resp = await axios.post<ProductData>(
        `${API_BASE}/api/products`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSaved(resp.data);
      await fetchNextQuestion({}, []);
      setStep(1);
    } catch (err: any) {
      console.error("Error creating product:", err);
      alert("Error creating product: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchNextQuestion = async (
    prevAnswers: Answers,
    prevQuestions: string[] = askedQuestions
  ) => {
    try {
      setLoading(true);
      const resp = await axios.post(`${API_BASE}/generate-questions`, {
        productName: name,
        category,
        attributes: saved?.attributes || {},
        previousAnswers: prevAnswers,
        askedQuestions: prevQuestions,
      });

      const newQs: string[] = resp.data.questions || [];
      if (newQs.length === 0) {
        await finalizeReport(prevAnswers);
        return;
      }

      const nextQ = newQs[0];
      setQuestions((q) => [...q, ...newQs]);
      setAskedQuestions((prev) => [...prev, nextQ]);
      setCurrentQuestion(nextQ);
    } catch (err) {
      console.error("Error fetching next question:", err);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (answer: string) => {
    if (!currentQuestion) return;

    const newAnswers = { ...answers, [currentQuestion]: answer };
    setAnswers(newAnswers);
    setQuestions((prev) => prev.filter((q) => q !== currentQuestion));
    setAskedQuestions((prev) => [...prev, currentQuestion]);
    await fetchNextQuestion(newAnswers, [...askedQuestions, currentQuestion]);
  };

  const finalizeReport = async (finalAnswers = answers) => {
    if (!saved?._id) {
      alert("Error: Product ID missing.");
      return;
    }
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const scoreResp = await axios.post<{ product: ProductData; score: number }>(
        `${API_BASE}/api/products/${saved._id}/score`,
        finalAnswers,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSaved(scoreResp.data.product);
      setStep(2);
    } catch (err: any) {
      alert("Error saving answers: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.loadingSpinner}></div>
        <h2 style={styles.loadingTitle}>Analyzing Transparency</h2>
        <p style={styles.loadingText}>Our AI is processing your responses...</p>
      </div>
    );
  }

  const score = saved?.transparencyScore ?? 0;

  return (
    <div style={styles.wrapper}>
      <div style={styles.backgroundOrbs}>
        <div style={{ ...styles.orb, ...styles.orb1 }}></div>
        <div style={{ ...styles.orb, ...styles.orb2 }}></div>
        <div style={{ ...styles.orb, ...styles.orb3 }}></div>
      </div>

      <div style={styles.card}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Transparency Lens</h1>
            <p style={styles.tagline}>Illuminating Ethical Commerce</p>
          </div>
          <button onClick={logout} style={styles.logoutBtn}>
            <span style={styles.logoutIcon}>⊗</span>
          </button>
        </div>

        {/* STEP 0: Product Foundation */}
        {step === 0 && (
          <div style={styles.stepContainer}>
            <div style={styles.stepHeader}>
              <span style={styles.stepNumber}>01</span>
              <h2 style={styles.stepTitle}>Product Foundation</h2>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <span style={styles.labelText}>Product Name</span>
                <input
                  type="text"
                  style={styles.input}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter product name..."
                />
              </label>

              <label style={styles.label}>
                <span style={styles.labelText}>Category</span>
                <select
                  style={styles.select}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Other">Other</option>
                  <option value="Food">Food & Beverage</option>
                  <option value="Cosmetics">Cosmetics & Skincare</option>
                  <option value="Apparel">Apparel & Textile</option>
                  <option value="Electronics">Electronics</option>
                </select>
              </label>
            </div>

            <button
              onClick={startInterview}
              style={styles.primaryBtn}
              disabled={!name}
            >
              <span>Begin Analysis</span>
              <span style={styles.btnArrow}>→</span>
            </button>
          </div>
        )}

        {/* STEP 1: Transparency Interview */}
        {step === 1 && (
          <div style={styles.stepContainer}>
            <div style={styles.stepHeader}>
              <span style={styles.stepNumber}>02</span>
              <h2 style={styles.stepTitle}>Transparency Interview</h2>
            </div>

            <div style={styles.productBadge}>
              <span style={styles.productName}>{name}</span>
              <span style={styles.productCategory}>{category}</span>
            </div>

            {currentQuestion ? (
              <div style={styles.questionCard}>
                <p style={styles.questionText}>{currentQuestion}</p>
                <textarea
                  style={styles.textarea}
                  value={answers[currentQuestion] || ""}
                  onChange={(e) =>
                    setAnswers({ ...answers, [currentQuestion]: e.target.value })
                  }
                  placeholder="Provide detailed information..."
                  rows={6}
                />
                <button
                  onClick={() => {
                    if (!answers[currentQuestion]) {
                      alert("Please provide an answer before proceeding.");
                      return;
                    }
                    submitAnswer(answers[currentQuestion]);
                  }}
                  style={styles.primaryBtn}
                  disabled={!answers[currentQuestion]}
                >
                  <span>Continue</span>
                  <span style={styles.btnArrow}>→</span>
                </button>
              </div>
            ) : (
              <div style={styles.completionCard}>
                <div style={styles.checkmark}>✓</div>
                <p style={styles.completionText}>Interview Complete</p>
                <button onClick={() => finalizeReport()} style={styles.primaryBtn}>
                  <span>Generate Report</span>
                  <span style={styles.btnArrow}>→</span>
                </button>
              </div>
            )}

            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${(askedQuestions.length / 5) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        )}

        {/* STEP 2: Analysis Complete */}
        {step === 2 && saved && (
          <div style={styles.stepContainer}>
            <div style={styles.stepHeader}>
              <span style={styles.stepNumber}>03</span>
              <h2 style={styles.stepTitle}>Analysis Complete</h2>
            </div>

            <div style={styles.scoreCard}>
              <div style={styles.scoreCircle}>
                <svg style={styles.scoreSvg} viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke={score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444"}
                    strokeWidth="8"
                    strokeDasharray={`${score * 3.39} 339`}
                    strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                  />
                </svg>
                <div style={styles.scoreValue}>{score}</div>
              </div>
              <h3 style={styles.scoreLabel}>Transparency Score</h3>
              <p style={styles.scoreDescription}>
                {score >= 75
                  ? "Excellent transparency practices"
                  : score >= 50
                  ? "Moderate transparency"
                  : "Limited transparency disclosure"}
              </p>
            </div>

            <div style={styles.actionButtons}>
              <button
                onClick={async () => {
                  try {
                    const token = localStorage.getItem("token");
                    const response = await axios.get(
                      `${API_BASE}/api/products/${saved._id}/report`,
                      {
                        headers: { Authorization: `Bearer ${token}` },
                        responseType: "blob",
                      }
                    );
                    const blob = new Blob([response.data], { type: "application/pdf" });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${saved.name}_transparency_report.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    window.URL.revokeObjectURL(url);
                  } catch (err: any) {
                    alert(
                      "Error downloading report: " +
                        (err.response?.data?.error || err.message)
                    );
                  }
                }}
                style={styles.downloadBtn}
              >
                <span>Download Full Report</span>
                <span style={styles.btnArrow}>↓</span>
              </button>

              <button
                onClick={() => {
                  setStep(0);
                  setAnswers({});
                  setQuestions([]);
                  setAskedQuestions([]);
                  setCurrentQuestion(null);
                  setSaved(null);
                  setName("");
                  setCategory("Other");
                }}
                style={styles.secondaryBtn}
              >
                New Analysis
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== STYLES ====================
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
    animation: "float 20s ease-in-out infinite",
  },
  orb1: { width: "500px", height: "500px", background: "#f093fb", top: "-10%", left: "-10%" },
  orb2: { width: "400px", height: "400px", background: "#4facfe", bottom: "-10%", right: "-10%", animationDelay: "-10s" },
  orb3: { width: "350px", height: "350px", background: "#43e97b", top: "50%", left: "50%", animationDelay: "-5s" },
  card: { background: "rgba(255,255,255,0.95)", backdropFilter: "blur(20px)", borderRadius: "24px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", width: "100%", maxWidth: "700px", padding: "40px", position: "relative", zIndex: 1 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "40px", paddingBottom: "20px", borderBottom: "2px solid #f3f4f6" },
  title: { fontSize: "32px", fontWeight: 700, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "4px" },
  tagline: { color: "#6b7280", fontSize: "14px", fontStyle: "italic", letterSpacing: "0.5px" },
  logoutBtn: { background: "transparent", border: "2px solid #ef4444", borderRadius: "12px", width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.3s ease", fontSize: "20px" },
  logoutIcon: { color: "#ef4444" },
  stepContainer: { animation: "fadeIn 0.5s ease" },
  stepHeader: { display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" },
  stepNumber: { background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", fontSize: "18px", fontWeight: 700, width: "48px", height: "48px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" },
  stepTitle: { fontSize: "24px", fontWeight: 600, color: "#111827" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "20px", marginBottom: "32px" },
  label: { display: "flex", flexDirection: "column", gap: "8px" },
  labelText: { fontSize: "14px", fontWeight: 600, color: "#374151", letterSpacing: "0.3px" },
  input: { padding: "14px 18px", borderRadius: "12px", border: "2px solid #e5e7eb", fontSize: "16px", transition: "all 0.3s ease", outline: "none" },
  select: { padding: "14px 18px", borderRadius: "12px", border: "2px solid #e5e7eb", fontSize: "16px", transition: "all 0.3s ease", outline: "none", cursor: "pointer" },
  primaryBtn: { background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", border: "none", borderRadius: "12px", padding: "16px 32px", fontSize: "16px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", transition: "all 0.3s ease", boxShadow: "0 4px 15px rgba(102,126,234,0.4)" },
  btnArrow: { fontSize: "20px", transition: "transform 0.3s ease" },
  productBadge: { background: "#f9fafb", borderRadius: "12px", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", border: "1px solid #e5e7eb" },
  productName: { fontSize: "16px", fontWeight: 600, color: "#111827" },
  productCategory: { fontSize: "14px", color: "#6b7280", background: "#e5e7eb", padding: "4px 12px", borderRadius: "6px" },
  questionCard: { marginBottom: "24px" },
  questionText: { fontSize: "18px", fontWeight: 500, color: "#111827", marginBottom: "16px", lineHeight: "1.6" },
  textarea: { width: "100%", padding: "16px", borderRadius: "12px", border: "2px solid #e5e7eb", fontSize: "15px", lineHeight: "1.6", resize: "vertical", outline: "none" },
  completionCard: { textAlign: "center", padding: "40px 0" },
  checkmark: { fontSize: "64px", color: "#10b981", marginBottom: "16px" },
  completionText: { fontSize: "20px", fontWeight: 600, color: "#111827", marginBottom: "24px" },
  progressBar: { height: "10px", background: "#e5e7eb", borderRadius: "10px", overflow: "hidden" },
  progressFill: { height: "100%", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", transition: "width 0.5s ease" },
  scoreCard: { textAlign: "center", marginBottom: "40px" },
  scoreCircle: { position: "relative", width: "120px", height: "120px", margin: "0 auto 16px" },
  scoreSvg: { width: "120px", height: "120px" },
  scoreValue: { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: "28px", fontWeight: 700, color: "#111827" },
  scoreLabel: { fontSize: "18px", fontWeight: 600, color: "#111827", marginBottom: "8px" },
  scoreDescription: { fontSize: "14px", color: "#6b7280" },
  actionButtons: { display: "flex", flexDirection: "column", gap: "16px", alignItems: "center" },
  downloadBtn: { background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)", color: "white", border: "none", borderRadius: "12px", padding: "16px 32px", fontSize: "16px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", transition: "all 0.3s ease", boxShadow: "0 4px 15px rgba(16,185,129,0.4)" },
  secondaryBtn: { background: "white", color: "#111827", border: "2px solid #e5e7eb", borderRadius: "12px", padding: "14px 32px", fontSize: "15px", fontWeight: 500, cursor: "pointer", transition: "all 0.3s ease" },
  loadingScreen: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", textAlign: "center", animation: "fadeIn 1s ease" },
  loadingSpinner: { width: "60px", height: "60px", border: "6px solid rgba(255,255,255,0.3)", borderTop: "6px solid white", borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: "24px" },
  loadingTitle: { fontSize: "28px", fontWeight: 700, marginBottom: "8px" },
  loadingText: { fontSize: "16px", opacity: 0.8 },
};
