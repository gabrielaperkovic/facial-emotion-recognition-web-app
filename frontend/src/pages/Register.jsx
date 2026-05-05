import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/auth";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      await registerUser(email, password, name);

      alert("Registracija uspješna! Provjeri email za potvrdu računa.");
      navigate("/login");
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-6">
      <div className="w-full max-w-md rounded-3xl border border-pink-500/20 bg-white p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">Registracija</h1>
          <p className="mt-2 text-slate-500">
            Kreiraj račun za korištenje aplikacije.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Ime
            </label>
            <input
              type="text"
              placeholder="Tvoje ime"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              placeholder="ime@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Lozinka
            </label>
            <input
              type="password"
              placeholder="Minimalno 6 znakova"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
              required
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-pink-500 px-4 py-3 font-semibold text-white hover:bg-pink-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Registracija..." : "Registriraj se"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Već imaš račun?{" "}
          <Link to="/login" className="font-semibold text-pink-500">
            Prijavi se
          </Link>
        </p>

        <Link
          to="/"
          className="mt-6 block text-center text-sm text-slate-400 hover:text-pink-500"
        >
          Povratak na početnu
        </Link>
      </div>
    </div>
  );
}

export default Register;