import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const user = await login(formData);
      const redirectTo =
        user.role === "admin" ? "/admin" : location.state?.from?.pathname || "/";
      navigate(redirectTo, { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to login");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-md panel p-8">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Welcome Back</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">Login to SmartCart</h1>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            className="input"
            type="email"
            placeholder="Email address"
            value={formData.email}
            onChange={(event) => setFormData({ ...formData, email: event.target.value })}
          />
          <input
            className="input"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(event) => setFormData({ ...formData, password: event.target.value })}
          />
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? "Signing in..." : "Login"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          No account yet?{" "}
          <Link to="/register" className="font-semibold text-teal-700">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
