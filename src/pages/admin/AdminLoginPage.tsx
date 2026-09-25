import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import logo from "../../assets/figAndPeach.png";
import { useAdminAuth } from "../../context/useAdminAuth";
import "./AdminPages.css";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { session, login } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (session) {
    return <Navigate to="/admin" replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-page admin-page--centered">
      <form className="admin-card admin-login" onSubmit={handleSubmit} autoComplete="off">
        <img src={logo} alt="Fig and Peach" className="admin-login__logo" />
        <h1 className="admin-title">Admin</h1>
        <p className="admin-muted">Sign in to manage the shop, products, and customization photos.</p>

        <label className="admin-field">
          <span>Email</span>
          <input
            id="admin-email"
            type="email"
            name="admin-email"
            autoComplete="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label className="admin-field">
          <span>Password</span>
          <input
            id="admin-password"
            type="password"
            name="admin-password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        {error && (
          <p className="admin-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="admin-button" disabled={submitting}>
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
