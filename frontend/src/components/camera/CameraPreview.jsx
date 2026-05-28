import { useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  analyzeEmotion,
  startEmotionSession,
  saveEmotionSample,
  finishEmotionSession,
} from "../../services/emotionService";

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
    <div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <div className="relative aspect-video max-h-[360px] overflow-hidden rounded-2xl bg-slate-900">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
            />

            {!isCameraOn && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                Camera preview placeholder
              </div>
            )}

            {isSessionRunning && (
              <div className="absolute left-4 top-4 rounded-full bg-red-500 px-3 py-1 text-sm font-medium text-white">
                Live session
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {capturedImage && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-medium text-slate-600">
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

        <div className="space-y-6">
          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-red-500">
              {error}
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-bold text-slate-900">
              Kontrole sessiona
            </h2>

            <div className="mt-5 flex flex-wrap gap-4">
              {!isCameraOn && (
                <button
                  onClick={startCamera}
                  className="rounded-xl bg-pink-500 px-5 py-3 font-medium text-white hover:bg-pink-600"
                >
                  Start kamera
                </button>
              )}

              {isCameraOn && !isSessionRunning && (
                <>
                  <button
                    onClick={startLiveSession}
                    className="rounded-xl bg-pink-500 px-5 py-3 font-medium text-white hover:bg-pink-600"
                  >
                    Pokreni session
                  </button>

                  <button
                    onClick={stopCamera}
                    className="rounded-xl bg-slate-900 px-5 py-3 font-medium text-white hover:bg-slate-800"
                  >
                    Stop kamera
                  </button>
                </>
              )}

              {isSessionRunning && (
                <button
                  onClick={stopLiveSession}
                  className="rounded-xl bg-red-500 px-5 py-3 font-medium text-white hover:bg-red-600"
                >
                  Zaustavi session
                </button>
              )}
            </div>
          </div>

          {emotionResult && (
            <div className="rounded-2xl border border-pink-100 bg-pink-50 p-6">
              <p className="text-sm font-medium text-pink-500">
                Trenutna analiza
              </p>

              <p className="mt-3 text-3xl font-bold text-slate-900">
                {emotionResult.faceDetected
                  ? emotionResult.emotion
                  : "Lice nije detektirano"}
              </p>

              {emotionResult.faceDetected && (
                <>
                  <p className="mt-2 text-slate-600">
                    Confidence: {emotionResult.confidence}%
                  </p>

                  <p className="mt-1 text-slate-600">
                    Detektirana lica: {emotionResult.facesCount}
                  </p>
                </>
              )}

              {!isSessionRunning && (
                <p className="mt-4 text-sm text-slate-500">
                  Live analiza je aktivna, ali se rezultati ne spremaju dok ne
                  pokreneš session.
                </p>
              )}
            </div>
          )}

          {sessionSummary && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-sm font-medium text-slate-500">
                Sažetak sessiona
              </p>

              <p className="mt-3 text-xl font-bold text-slate-900">
                Dominantna emocija:{" "}
                {sessionSummary.dominant_emotion || "N/A"}
              </p>

              <p className="mt-2 text-slate-600">
                Prosječna sigurnost:{" "}
                {sessionSummary.average_confidence
                  ? `${sessionSummary.average_confidence.toFixed(2)}%`
                  : "N/A"}
              </p>
            </div>
          )}
        </div>
      </div>

      {isSessionRunning && sessionTimeline.length > 0 && (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-5">
            <p className="text-sm font-medium text-slate-500">
              Emotion timeline
            </p>

            <h3 className="text-2xl font-bold text-slate-900">
              Promjene emocija tijekom sessiona
            </h3>
          </div>

          <div className="space-y-3">
            {sessionTimeline.slice(-10).map((item, index) => (
              <div
                key={`${item.time}-${index}`}
                className="flex items-center justify-between rounded-xl bg-slate-50 p-4"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {item.emotion}
                  </p>

                  <p className="text-sm text-slate-500">
                    {item.time}
                  </p>
                </div>

                <span className="rounded-full bg-pink-100 px-3 py-1 text-sm font-medium text-pink-600">
                  {item.confidence}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isSessionRunning && sessionTimeline.length > 0 && (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">
            Timeline se prikazuje samo tijekom aktivnog sessiona.
          </p>
        </div>
      )}
    </div>
  );
}

export default CameraPreview;