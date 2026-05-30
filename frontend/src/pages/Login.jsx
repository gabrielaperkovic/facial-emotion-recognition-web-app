import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/auth";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      await loginUser(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-6">
      <div className="w-full max-w-md rounded-3xl border border-pink-500/20 bg-white p-8 shadow-2xl">
        <h1 className="mb-6 text-center text-3xl font-bold text-slate-900">
          Login
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border px-4 py-3"
            required
          />

          <input
            type="password"
            placeholder="Lozinka"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border px-4 py-3"
            required
          />

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-pink-500 py-3 text-white"
          >
            {loading ? "Loading..." : "Prijavi se"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm">
          Nemaš račun?{" "}
          <Link to="/register" className="text-pink-500">
            Registriraj se
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;