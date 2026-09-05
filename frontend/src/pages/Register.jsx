import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await register(formData);
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to register");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-md panel p-8">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Start Shopping Smarter</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">Create your account</h1>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            className="input"
            type="text"
            placeholder="Full name"
            value={formData.name}
            onChange={(event) => setFormData({ ...formData, name: event.target.value })}
          />
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
            {submitting ? "Creating account..." : "Register"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-teal-700">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
