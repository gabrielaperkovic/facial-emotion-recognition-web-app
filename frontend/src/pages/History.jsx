import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import { useAuth } from "../context/AuthContext";
import { getSessionHistory } from "../services/emotionService";

import { emotionIcons } from "../utils/emotionIcons";

const emotionLabels = {
  Angry: { label: "Ljutnja", icon: emotionIcons.Angry },
  Disgust: { label: "Gađenje", icon: emotionIcons.Disgust },
  Fear: { label: "Strah", icon: emotionIcons.Fear },
  Happy: { label: "Sreća", icon: emotionIcons.Happy },
  Sad: { label: "Tuga", icon: emotionIcons.Sad },
  Surprise: { label: "Iznenađenje", icon: emotionIcons.Surprise },
  Neutral: { label: "Neutralno", icon: emotionIcons.Neutral },
};

function getEmotionInfo(emotion) {
  return emotionLabels[emotion] || {
    label: emotion || "N/A",
    icon: null,
  };
}

function formatSessionId(id) {
  return `#${String(id).slice(0, 6).toUpperCase()}`;
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleString("hr-HR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

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
          <p className="text-slate-600">Još nema spremljenih sessiona.</p>
        </div>
      )}

      {sessions.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-[900px] w-full text-left">
            <thead className="bg-slate-50 text-sm text-slate-500">
              <tr>
                <th className="px-6 py-4 text-center">#ID</th>
                <th className="px-6 py-4 text-center">Početak</th>
                <th className="px-6 py-4 text-center">Kraj</th>
                <th className="px-6 py-4 text-center">
                  Dominantna emocija
                </th>
                <th className="px-6 py-4 text-center">
                  Prosječna pouzdanost
                </th>
                <th className="px-6 py-4 text-center">
                  Broj uzoraka
                </th>
                <th className="px-6 py-4 text-center">Detalji</th>
              </tr>
            </thead>

            <tbody>
              {sessions.map((session) => (
                <tr
                  key={session.id}
                  className="border-t border-slate-100"
                >
                  <td className="px-6 py-4 text-center font-medium text-pink-500">
                    {formatSessionId(session.id)}
                  </td>

                  <td className="px-6 py-4 text-center text-slate-700">
                    {formatDate(session.started_at)}
                  </td>

                  <td className="px-6 py-4 text-center text-slate-700">
                    {session.ended_at
                      ? formatDate(session.ended_at)
                      : "U tijeku"}
                  </td>

                  <td className="px-6 py-4 text-center">
                    {getEmotionInfo(session.dominant_emotion).icon ? (
                      <img
                        src={getEmotionInfo(session.dominant_emotion).icon}
                        alt={
                          getEmotionInfo(session.dominant_emotion).label
                        }
                        className="inline-block h-8 w-8 object-contain"
                      />
                    ) : (
                      "N/A"
                    )}
                  </td>

                  <td className="px-6 py-4 text-center text-slate-700">
                    {session.average_confidence
                      ? `${session.average_confidence.toFixed(2)}%`
                      : "N/A"}
                  </td>

                  <td className="px-6 py-4 text-center text-slate-700">
                    {session.samples?.length || 0}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <Link
                      to={`/history/${session.id}`}
                      state={{ session }}
                      className="rounded-xl bg-pink-500 px-4 py-2 text-sm font-medium text-white hover:bg-pink-600"
                    >
                      Detalji
                    </Link>
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