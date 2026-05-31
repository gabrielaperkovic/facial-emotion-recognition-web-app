import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
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

function SessionDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSession() {
      try {
        const sessions = await getSessionHistory(user.id);
        const foundSession = sessions.find(
          (item) => String(item.id) === String(id)
        );

        if (!foundSession) {
          setError("Session nije pronađen.");
        } else {
          setSession(foundSession);
        }
      } catch (err) {
        console.error(err);
        setError("Greška pri dohvaćanju detalja sessiona.");
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadSession();
    }
  }, [user, id]);

  if (loading) {
    return (
      <MainLayout>
        <p className="text-slate-600">Učitavanje detalja sessiona...</p>
      </MainLayout>
    );
  }

  if (error || !session) {
    return (
      <MainLayout>
        <p className="text-slate-600">
          {error || "Session nije učitan."}
        </p>

        <Link
          to="/history"
          className="mt-4 inline-block rounded-xl bg-pink-500 px-4 py-2 text-white"
        >
          Povratak na history
        </Link>
      </MainLayout>
    );
  }

  const samples = session.samples || [];

  const validSamples = samples.filter(
    (sample) => sample.face_detected && sample.emotion
  );

  const emotionCounts = validSamples.reduce((acc, sample) => {
    acc[sample.emotion] = (acc[sample.emotion] || 0) + 1;
    return acc;
  }, {});

  const emotionFrequency = Object.entries(emotionCounts)
    .map(([emotion, count]) => ({
      emotion,
      count,
      percentage:
        validSamples.length > 0
          ? Number(((count / validSamples.length) * 100).toFixed(1))
          : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const peakSample = validSamples.reduce((best, sample) => {
    if (!best || sample.confidence > best.confidence) {
      return sample;
    }
    return best;
  }, null);

  const dominant = getEmotionInfo(session.dominant_emotion);
  const peak = getEmotionInfo(peakSample?.emotion);

  const timelineChanges = validSamples.filter((sample, index, arr) => {
    if (index === 0) return true;
    return sample.emotion !== arr[index - 1].emotion;
  });

  return (
    <MainLayout>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Detalji sessiona {formatSessionId(id)}
          </h1>
          <p className="mt-2 text-slate-600">
            Analiza emocionalne reakcije tijekom jednog sessiona.
          </p>
        </div>

        <Link
          to="/history"
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Povratak
        </Link>
      </div>

      <section className="mb-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Vrijeme početka
          </p>

          <p className="mt-3 text-xl font-bold text-slate-900">
            {formatDate(session.started_at)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Vrijeme završetka
          </p>

          <p className="mt-3 text-xl font-bold text-slate-900">
            {session.ended_at
              ? formatDate(session.ended_at)
              : "U tijeku"}
          </p>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Dominantna emocija
          </p>
          <p className="mt-3 flex flex-col items-center text-center text-4xl font-bold text-slate-900">
            {dominant.icon && (
              <img
                src={dominant.icon}
                alt={dominant.label}
                className="mb-3 h-14 w-14 object-contain"
              />
            )}
            {dominant.label}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Prosječna sigurnost
          </p>

          <div className="flex h-[120px] items-center justify-center">
            <p className="text-4xl font-bold text-slate-900">
              {session.average_confidence
                ? `${session.average_confidence.toFixed(2)}%`
                : "N/A"}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Broj uzoraka
          </p>

          <div className="flex h-[120px] items-center justify-center">
            <p className="text-4xl font-bold text-slate-900">
              {validSamples.length}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Učestalost emocija
          </h2>

          <div className="mt-6 flex h-64 items-end gap-4">
            {emotionFrequency.length === 0 && (
              <p className="text-slate-500">Nema detektiranih emocija.</p>
            )}

            {emotionFrequency.map((item) => {
              const info = getEmotionInfo(item.emotion);

              return (
                <div
                  key={item.emotion}
                  className="flex flex-1 flex-col items-center gap-2"
                >
                  <div
                    className="w-full rounded-t-xl bg-pink-500"
                    style={{
                      height: `${Math.max(item.percentage * 2, 24)}px`,
                    }}
                  />

                  {info.icon ? (
                    <img
                      src={info.icon}
                      alt={info.label}
                      className="h-8 w-8 object-contain"
                    />
                  ) : (
                    <p className="text-xl">❔</p>
                  )}
                  <p className="text-center text-xs font-medium text-slate-600">
                    {info.label}
                  </p>
                  <p className="text-xs text-slate-400">
                    {item.percentage}%
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Najizraženija reakcija
          </h2>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
              <span className="text-slate-600">Emocija</span>
              <span className="font-semibold text-slate-900">
                {peak.icon && (
                  <img
                    src={peak.icon}
                    alt={peak.label}
                    className="mr-2 inline h-6 w-6 object-contain"
                  />
                )}
                {peak.label}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
              <span className="text-slate-600">Vrijeme</span>
              <span className="font-semibold text-slate-900">
                {peakSample
                  ? new Date(peakSample.created_at).toLocaleTimeString()
                  : "N/A"}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
              <span className="text-slate-600">Confidence</span>
              <span className="font-semibold text-slate-900">
                {peakSample?.confidence
                  ? `${peakSample.confidence.toFixed(2)}%`
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <p className="text-sm font-medium text-slate-500">
            Emotion timeline
          </p>
          <h2 className="text-2xl font-bold text-slate-900">
            Vremenski pregled promjena emocija
          </h2>
        </div>

        <div className="space-y-3">
          {timelineChanges.length === 0 && (
            <p className="text-slate-500">Nema spremljenih emocija.</p>
          )}

          {timelineChanges.map((sample) => {
            const info = getEmotionInfo(sample.emotion);

            return (
              <div
                key={sample.id}
                className="grid grid-cols-[120px_1fr_auto] items-center gap-4 rounded-xl bg-slate-50 p-4"
              >
                <p className="font-mono text-sm font-semibold text-pink-500">
                  {new Date(sample.created_at).toLocaleTimeString()}
                </p>

                <div className="flex items-center gap-3">
                  {info.icon ? (
                    <img
                      src={info.icon}
                      alt={info.label}
                      className="h-8 w-8 object-contain"
                    />
                  ) : (
                    <span className="text-2xl">❔</span>
                  )}
                  <p className="font-semibold text-slate-900">
                    {info.label}
                  </p>
                </div>

                <span className="rounded-full bg-pink-100 px-3 py-1 text-sm font-medium text-pink-600">
                  {sample.confidence?.toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </MainLayout>
  );
}

export default SessionDetails;