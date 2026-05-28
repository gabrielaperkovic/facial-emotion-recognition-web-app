import { useEffect, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import { useAuth } from "../context/AuthContext";
import { getSessionHistory } from "../services/emotionService";

function History() {
  const { user } = useAuth();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadHistory() {
      try {
        const data = await getSessionHistory(user.id);
        setSessions(data);
      } catch (err) {
        console.error(err);
        setError("Greška pri dohvaćanju povijesti sessiona.");
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadHistory();
    }
  }, [user]);

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Session history
        </h1>
        <p className="mt-2 text-slate-600">
          Pregled spremljenih analiza emocija.
        </p>
      </div>

      {loading && <p className="text-slate-600">Učitavanje...</p>}

      {error && <p className="text-red-500">{error}</p>}

      {!loading && sessions.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-slate-600">
            Još nema spremljenih sessiona.
          </p>
        </div>
      )}

      {sessions.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-sm text-slate-500">
              <tr>
                <th className="px-6 py-4">Početak</th>
                <th className="px-6 py-4">Kraj</th>
                <th className="px-6 py-4">Dominantna emocija</th>
                <th className="px-6 py-4">Prosječna sigurnost</th>
                <th className="px-6 py-4">Broj uzoraka</th>
              </tr>
            </thead>

            <tbody>
              {sessions.map((session) => (
                <tr key={session.id} className="border-t border-slate-100">
                  <td className="px-6 py-4 text-slate-700">
                    {new Date(session.started_at).toLocaleString()}
                  </td>

                  <td className="px-6 py-4 text-slate-700">
                    {session.ended_at
                      ? new Date(session.ended_at).toLocaleString()
                      : "U tijeku"}
                  </td>

                  <td className="px-6 py-4 font-medium text-slate-900">
                    {session.dominant_emotion || "N/A"}
                  </td>

                  <td className="px-6 py-4 text-slate-700">
                    {session.average_confidence
                      ? `${session.average_confidence.toFixed(2)}%`
                      : "N/A"}
                  </td>

                  <td className="px-6 py-4 text-slate-700">
                    {session.samples?.length || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </MainLayout>
  );
}

export default History;