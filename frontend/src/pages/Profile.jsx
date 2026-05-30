import { useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabaseClient";

function Profile() {
  const { user } = useAuth();

  const [displayName, setDisplayName] = useState(
    user?.user_metadata?.display_name || user?.user_metadata?.name || ""
  );

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const updateProfile = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    const wantsPasswordChange =
      currentPassword.trim() || newPassword.trim() || confirmNewPassword.trim();

    if (wantsPasswordChange) {
      if (!currentPassword.trim() || !newPassword.trim() || !confirmNewPassword.trim()) {
        setError("Za promjenu lozinke ispuni sva polja za lozinku.");
        return;
      }

      if (newPassword !== confirmNewPassword) {
        setError("Nove lozinke se ne podudaraju.");
        return;
      }

      if (newPassword.length < 6) {
        setError("Nova lozinka mora imati najmanje 6 znakova.");
        return;
      }
    }

    const updates = {};

    if (displayName.trim()) {
      updates.data = {
        display_name: displayName.trim(),
        name: displayName.trim(),
      };
    }

    if (wantsPasswordChange) {
      updates.password = newPassword;
    }

    const { error } = await supabase.auth.updateUser(updates);

    if (error) {
      setError("Greška pri spremanju profila.");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setMessage("Profil je uspješno ažuriran.");
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Profil</h1>
        <p className="mt-2 text-slate-600">
          Uredi ime koje se prikazuje u aplikaciji i promijeni lozinku.
        </p>
      </div>

      <div className="flex justify-center">
        <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <form onSubmit={updateProfile} className="space-y-5">
            <div>
                <label className="text-sm font-medium text-slate-700">
                Email
                </label>
                <input
                value={user?.email || ""}
                disabled
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500"
                />
            </div>

            <div>
                <label className="text-sm font-medium text-slate-700">
                Ime za prikaz
                </label>
                <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Unesi ime"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-pink-400"
                />
            </div>

            <div className="border-t border-slate-100 pt-5">
                <p className="text-sm font-semibold text-slate-900">
                Promjena lozinke
                </p>
                <p className="mt-1 text-sm text-slate-500">
                Ostavi prazno ako ne želiš mijenjati lozinku.
                </p>
            </div>

            <div>
                <label className="text-sm font-medium text-slate-700">
                Trenutna lozinka
                </label>
                <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Unesi trenutnu lozinku"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-pink-400"
                />
            </div>

            <div>
                <label className="text-sm font-medium text-slate-700">
                Nova lozinka
                </label>
                <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimalno 6 znakova"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-pink-400"
                />
            </div>

            <div>
                <label className="text-sm font-medium text-slate-700">
                Ponovi novu lozinku
                </label>
                <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Ponovi novu lozinku"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-pink-400"
                />
            </div>

            {message && <p className="text-sm text-green-600">{message}</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
                type="submit"
                className="w-full rounded-xl bg-pink-500 px-5 py-3 font-medium text-white hover:bg-pink-600"
            >
                Spremi promjene
            </button>
            </form>
        </div>
      </div>
    </MainLayout>
  );
}

export default Profile;