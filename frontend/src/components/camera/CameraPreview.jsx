import { useRef, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import {
  analyzeEmotion,
  startEmotionSession,
  saveEmotionSample,
  finishEmotionSession,
} from "../../services/emotionService";

import { emotionIcons } from "../../utils/emotionIcons";

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

function CameraPreview() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const previewIntervalRef = useRef(null);

  const { user } = useAuth();

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isSessionRunning, setIsSessionRunning] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState(null);

  const [error, setError] = useState("");
  const [capturedImage, setCapturedImage] = useState(null);
  const [emotionResult, setEmotionResult] = useState(null);
  const [sessionTimeline, setSessionTimeline] = useState([]);
  const [sessionSummary, setSessionSummary] = useState(null);

  const currentEmotion = getEmotionInfo(emotionResult?.emotion);
  const summaryEmotion = getEmotionInfo(sessionSummary?.dominant_emotion);

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video.videoWidth || !video.videoHeight) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL("image/jpeg");
  };

  const runPreviewAnalysis = async () => {
    try {
      const imageData = captureFrame();
      if (!imageData) return;

      setCapturedImage(imageData);

      const result = await analyzeEmotion(imageData);
      setEmotionResult(result);
    } catch (err) {
      console.error(err);
      setError("Greška pri live analizi emocije.");
    }
  };

  const startPreviewAnalysis = () => {
    if (previewIntervalRef.current) {
      clearInterval(previewIntervalRef.current);
    }

    previewIntervalRef.current = setInterval(() => {
      runPreviewAnalysis();
    }, 1000);
  };

  const stopPreviewAnalysis = () => {
    if (previewIntervalRef.current) {
      clearInterval(previewIntervalRef.current);
      previewIntervalRef.current = null;
    }
  };

  const startCamera = async () => {
    setError("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsCameraOn(true);
      startPreviewAnalysis();
    } catch (err) {
      console.error(err);
      setError("Kamera nije dostupna ili pristup nije dopušten.");
    }
  };

  const stopCamera = () => {
    stopPreviewAnalysis();

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraOn(false);
    setIsSessionRunning(false);
    setActiveSessionId(null);
    setCapturedImage(null);
    setEmotionResult(null);
    setSessionTimeline([]);
  };

  const addTimelineEntry = (result) => {
    if (!result.faceDetected || !result.emotion) return;

    const entry = {
      time: new Date().toLocaleTimeString(),
      emotion: result.emotion,
      confidence: result.confidence,
    };

    setSessionTimeline((prev) => {
      const lastEntry = prev[prev.length - 1];

      if (lastEntry && lastEntry.emotion === result.emotion) {
        return prev;
      }

      return [...prev, entry];
    });
  };

  const processFrame = async (sessionId) => {
    const imageData = captureFrame();
    if (!imageData) return;

    setCapturedImage(imageData);

    const result = await analyzeEmotion(imageData);

    setEmotionResult(result);
    addTimelineEntry(result);

    await saveEmotionSample({
      session_id: sessionId,
      emotion: result.emotion,
      confidence: result.confidence,
      faceDetected: result.faceDetected,
      facesCount: result.facesCount,
    });
  };

  const startLiveSession = async () => {
    if (!user) {
      setError("Korisnik nije prijavljen.");
      return;
    }

    try {
      setError("");
      setSessionSummary(null);
      setEmotionResult(null);
      setSessionTimeline([]);

      stopPreviewAnalysis();

      if (!isCameraOn) {
        await startCamera();
        stopPreviewAnalysis();
      }

      const session = await startEmotionSession(user.id);

      setActiveSessionId(session.id);
      setIsSessionRunning(true);

      await processFrame(session.id);

      intervalRef.current = setInterval(() => {
        processFrame(session.id).catch((err) => {
          console.error(err);
          setError("Greška pri analizi emocije.");
        });
      }, 1000);
    } catch (err) {
      console.error(err);
      setError("Greška pri pokretanju sessiona.");
    }
  };

  const stopLiveSession = async () => {
    try {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      setIsSessionRunning(false);

      if (activeSessionId) {
        const summary = await finishEmotionSession(activeSessionId);

        setSessionSummary(summary);
        setActiveSessionId(null);
      }

      if (isCameraOn) {
        startPreviewAnalysis();
      }
    } catch (err) {
      console.error(err);
      setError("Greška pri završavanju sessiona.");
    }
  };

  return (
    <div className="pb-28">
      <section className="grid items-stretch gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Kamera</p>
              <h2 className="text-xl font-bold text-slate-900">Live video</h2>
            </div>

            {isSessionRunning && (
              <span className="rounded-full bg-red-500 px-3 py-1 text-sm font-medium text-white">
                Live session
              </span>
            )}
          </div>

          <div className="relative aspect-video max-h-[360px] overflow-hidden rounded-2xl bg-slate-900">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
            />

            {emotionResult?.faceDetected && emotionResult?.faceBox && (
              <div
                className="absolute rounded-[40%] border-2 border-pink-400 shadow-[0_0_25px_rgba(236,72,153,0.6)]"
                style={{
                  left: `${emotionResult.faceBox.x + 3}%`,
                  top: `${emotionResult.faceBox.y - 6}%`,
                  width: `${emotionResult.faceBox.width - 6}%`,
                  height: `${emotionResult.faceBox.height + 18}%`,
                }}
              />
            )}

            {!isCameraOn && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                Camera preview placeholder
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {capturedImage && (
            <div className="mt-5">
              <p className="mb-2 text-sm font-medium text-slate-500">
                Zadnji analizirani frame
              </p>

              <img
                src={capturedImage}
                alt="Captured frame"
                className="w-40 rounded-xl border border-slate-200"
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          {error && (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-500">
              {error}
            </div>
          )}

          <div className="flex flex-1 flex-col justify-center rounded-2xl border border-pink-100 bg-pink-50 p-6 text-center shadow-sm">
            <p className="text-sm font-medium text-pink-500">
              Trenutna analiza
            </p>

            {!emotionResult && (
              <div className="mt-6">
                <p className="text-6xl">🎥</p>
                <p className="mt-4 text-2xl font-bold text-slate-900">
                  Čekam kameru
                </p>
                <p className="mt-2 text-slate-500">
                  Pokreni kameru za live prepoznavanje emocija.
                </p>
              </div>
            )}

            {emotionResult && !emotionResult.faceDetected && (
              <div className="mt-6">
                <p className="text-6xl">🫥</p>
                <p className="mt-4 text-2xl font-bold text-slate-900">
                  Lice nije detektirano
                </p>
                <p className="mt-2 text-slate-500">
                  Pokušaj se bolje pozicionirati ispred kamere.
                </p>
              </div>
            )}

            {emotionResult?.faceDetected && (
              <div className="mt-6">
                {currentEmotion.icon ? (
                  <img
                    src={currentEmotion.icon}
                    alt={currentEmotion.label}
                    className="mx-auto h-20 w-20 object-contain"
                  />
                ) : (
                  <p className="text-6xl">❔</p>
                )}
                <p className="mt-4 text-4xl font-bold text-slate-900">
                  {currentEmotion.label}
                </p>
                <p className="mt-2 text-slate-600">
                  Pouzdanost: {emotionResult.confidence}%
                </p>
                <p className="mt-1 text-slate-500">
                  Detektirana lica: {emotionResult.facesCount}
                </p>
              </div>
            )}

            {emotionResult && !isSessionRunning && (
              <p className="mx-auto mt-6 max-w-md rounded-xl bg-white p-4 text-sm text-slate-500">
                Live analiza je aktivna, ali se rezultati ne spremaju dok ne
                pokreneš session.
              </p>
            )}
          </div>

          {sessionSummary && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Sažetak sessiona
              </p>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                  <span className="text-slate-600">Dominantna emocija</span>

                  <span className="font-semibold text-slate-900">
                    {summaryEmotion.icon && (
                      <img
                        src={summaryEmotion.icon}
                        alt={summaryEmotion.label}
                        className="mr-2 inline h-6 w-6 object-contain"
                      />
                    )}
                    {summaryEmotion.label}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                  <span className="text-slate-600">Pouzdanost
                  </span>

                  <span className="font-semibold text-slate-900">
                    {sessionSummary.average_confidence
                      ? `${sessionSummary.average_confidence.toFixed(2)}%`
                      : "N/A"}
                  </span>
                </div>
              </div>

              <Link
                to={`/history/${sessionSummary.id}`}
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-pink-500 px-5 py-3 font-medium text-white hover:bg-pink-600"
              >
                Detalji sessiona
              </Link>
            </div>
          )}
        </div>
      </section>

      {isSessionRunning && sessionTimeline.length > 0 && (
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <p className="text-sm font-medium text-slate-500">
              Emotion timeline
            </p>

            <h3 className="text-2xl font-bold text-slate-900">
              Promjene emocija tijekom sessiona
            </h3>
          </div>

          <div className="space-y-3">
            {sessionTimeline.slice(-10).map((item, index) => {
              const info = getEmotionInfo(item.emotion);

              return (
                <div
                  key={`${item.time}-${index}`}
                  className="grid grid-cols-[120px_1fr_auto] items-center gap-4 rounded-xl bg-slate-50 p-4"
                >
                  <p className="font-mono text-sm font-semibold text-pink-500">
                    {item.time}
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
                    {item.confidence}%
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <div className="fixed bottom-[72px] left-1/2 z-50 -translate-x-1/2">
        <div className="flex flex-wrap justify-center gap-3 rounded-2xl border border-pink-100 bg-white/90 px-5 py-4 shadow-2xl backdrop-blur">
          {!isCameraOn && (
            <button
              onClick={startCamera}
              className="rounded-2xl bg-pink-500 px-5 py-3 text-sm font-semibold text-white hover:bg-pink-600 sm:px-7 sm:py-4 sm:text-lg"
            >
              Start kamera
            </button>
          )}

          {isCameraOn && !isSessionRunning && (
            <>
              <button
                onClick={startLiveSession}
                className="rounded-2xl bg-pink-500 px-5 py-3 text-sm font-semibold text-white hover:bg-pink-600 sm:px-7 sm:py-4 sm:text-lg"
              >
                Pokreni session
              </button>
              <button
                onClick={stopCamera}
                className="rounded-2xl border border-pink-200 bg-white px-5 py-3 text-sm font-semibold text-pink-500 hover:bg-pink-50 sm:px-7 sm:py-4 sm:text-lg"
              >
                Stop kamera
              </button>
            </>
          )}

          {isSessionRunning && (
              <button
                onClick={stopLiveSession}
                className="rounded-2xl bg-red-500 px-5 py-3 text-sm font-semibold text-white hover:bg-red-600 sm:px-7 sm:py-4 sm:text-lg"
              >
                Zaustavi session
              </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CameraPreview;