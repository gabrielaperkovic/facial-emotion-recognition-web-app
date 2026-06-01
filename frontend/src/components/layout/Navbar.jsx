import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { logoutUser } from "../../services/auth";

function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const linkClass = ({ isActive }) =>
    isActive
      ? "text-pink-500 font-semibold"
      : "text-slate-600 hover:text-pink-500";

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  const userName =
    user?.user_metadata?.name || user?.email?.split("@")[0];

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link to="/" className="text-xl font-bold text-slate-900">
          Emotion<span className="text-pink-500">App</span>
        </Link>

        <div className="flex flex-wrap items-center justify-end gap-6 text-sm">
          <NavLink to="/" className={linkClass}>
            Home
          </NavLink>

          {user && (
            <>
              <NavLink to="/session" className={linkClass}>
                Session
              </NavLink>

              <NavLink to="/history" className={linkClass}>
                History
              </NavLink>
            </>
          )}

          {!user ? (
            <Link
              to="/login"
              className="rounded-xl bg-pink-500 px-4 py-2 font-medium text-white hover:bg-pink-600"
            >
              Login
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                title="Uredi profil"
                className="group flex items-center gap-3 rounded-full px-3 py-2 transition hover:bg-pink-50"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-500 font-semibold text-white">
                  {userName?.charAt(0).toUpperCase()}
                </div>

                <div className="relative hidden sm:block">
                  <p className="text-sm font-semibold text-slate-900">
                    {userName}
                  </p>
                </div>
              </Link>

              <button
                onClick={handleLogout}
                className="rounded-xl bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-800"
              >
                Odjava
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;