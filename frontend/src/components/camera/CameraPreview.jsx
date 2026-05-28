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

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [error, setError] = useState("");
  const [capturedImage, setCapturedImage] = useState(null);
  const [emotionResult, setEmotionResult] = useState(null);

  const { user } = useAuth();
  const intervalRef = useRef(null);

  const [activeSessionId, setActiveSessionId] = useState(null);
  const [isSessionRunning, setIsSessionRunning] = useState(false);
  const [sessionSummary, setSessionSummary] = useState(null);

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
    } catch (err) {
      console.error(err);
      setError("Kamera nije dostupna ili pristup nije dopušten.");
    }
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL("image/jpeg");
  };

  const startLiveSession = async () => {
  if (!user) {
    setError("Korisnik nije prijavljen.");
    return;
  }

  try {
    setError("");
    setSessionSummary(null);

    if (!isCameraOn) {
      await startCamera();
    }

    const session = await startEmotionSession(user.id);
      setActiveSessionId(session.id);
      setIsSessionRunning(true);

      intervalRef.current = setInterval(async () => {
        const imageData = captureFrame();

        if (!imageData) return;

        setCapturedImage(imageData);

        const result = await analyzeEmotion(imageData);
        setEmotionResult(result);

        await saveEmotionSample({
          session_id: session.id,
          emotion: result.emotion,
          confidence: result.confidence,
          faceDetected: result.faceDetected,
          facesCount: result.facesCount,
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
    } catch (err) {
      console.error(err);
      setError("Greška pri završavanju sessiona.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraOn(false);
    setCapturedImage(null);
    setEmotionResult(null);
  };

  const handleAnalyzeEmotion = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL("image/jpeg");
    setCapturedImage(imageData);

    try {
      const result = await analyzeEmotion(imageData);
      setEmotionResult(result);
    } catch (err) {
      console.error(err);
      setError("Greška pri analizi emocije.");
    }
  };

  return (
    <div>
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-slate-900">
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
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      <div className="mt-6 flex flex-wrap gap-4">
        {!isCameraOn && (
          <button
            onClick={startCamera}
            className="rounded-xl bg-pink-500 px-5 py-3 font-medium text-white hover:bg-pink-600"
          >
            Start kamera
          </button>
        )}

        {isCameraOn && !isSessionRunning && (
          <button
            onClick={startLiveSession}
            className="rounded-xl bg-pink-500 px-5 py-3 font-medium text-white hover:bg-pink-600"
          >
            Pokreni session
          </button>
        )}

        {isSessionRunning && (
          <button
            onClick={stopLiveSession}
            className="rounded-xl bg-red-500 px-5 py-3 font-medium text-white hover:bg-red-600"
          >
            Zaustavi session
          </button>
        )}

        {isCameraOn && !isSessionRunning && (
          <button
            onClick={stopCamera}
            className="rounded-xl bg-slate-900 px-5 py-3 font-medium text-white hover:bg-slate-800"
          >
            Stop kamera
          </button>
        )}
      </div>

      {emotionResult && (
        <div className="mt-6 rounded-2xl border border-pink-100 bg-pink-50 p-5">
          <p className="text-sm font-medium text-pink-500">
            Rezultat analize
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {emotionResult.faceDetected
              ? "Lice detektirano"
              : "Lice nije detektirano"}
          </p>

          <p className="mt-1 text-slate-600">
            Broj detektiranih lica: {emotionResult.facesCount}
          </p>

          {emotionResult.faceDetected && (
            <div className="mt-4 rounded-xl bg-white p-4">
              <p className="text-sm text-slate-500">
                Dominantna emocija
              </p>

              <p className="mt-1 text-3xl font-bold text-slate-900">
                {emotionResult.emotion}
              </p>

              <p className="mt-1 text-slate-600">
                Confidence: {emotionResult.confidence}%
              </p>
            </div>
          )}
        </div>
      )}
      {capturedImage && (
        <div className="mt-6">
          <p className="mb-2 text-sm font-medium text-slate-600">
            Uhvaćeni frame
          </p>
          <img
            src={capturedImage}
            alt="Captured frame"
            className="w-48 rounded-xl border border-slate-200"
          />
        </div>
      )}
      {sessionSummary && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">
            Sažetak sessiona
          </p>

          <p className="mt-2 text-xl font-bold text-slate-900">
            Dominantna emocija: {sessionSummary.dominant_emotion || "N/A"}
          </p>

          <p className="text-slate-600">
            Prosječna sigurnost:{" "}
            {sessionSummary.average_confidence
              ? `${sessionSummary.average_confidence.toFixed(2)}%`
              : "N/A"}
          </p>
        </div>
      )}
    </div>
  );
}

export default CameraPreview;