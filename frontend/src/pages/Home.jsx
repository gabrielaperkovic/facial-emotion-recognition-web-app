import { Link } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import { useEffect, useRef } from "react";


function Home() {


  const videoRef = useRef(null);
  
  useEffect(() => {
    let stream;

    async function startPreview() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (err) {
        console.error(err);
      }
    }

    startPreview();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <MainLayout>
      <section className="grid min-h-[70vh] items-center gap-10 md:grid-cols-2">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-pink-600">
            Završni rad
          </p>

          <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-6xl">
            Prepoznavanje emocija u stvarnom vremenu
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Aplikacija koristi kameru za analizu izraza lica i prikaz dominantne
            emocije tijekom korisničke sesije.
          </p>

          <div className="mt-8 flex gap-4">
            <Link
              to="/session"
              className="rounded-xl bg-pink-500 px-5 py-3 font-medium text-white hover:bg-pink-600"
            >
              Pokreni session
            </Link>

            <Link
              to="/history"
              className="rounded-xl bg-slate-900 px-5 py-3 font-medium text-white hover:bg-slate-800"
            >
              Pogledaj history
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="relative aspect-video overflow-hidden rounded-2xl bg-slate-900">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-pink-500/10 backdrop-blur-[2px]" />

            <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/40 px-3 py-1 backdrop-blur">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <span className="text-xs font-medium text-white">
                LIVE
              </span>
            </div>

            <div className="absolute left-1/2 top-1/2 h-44 w-36 -translate-x-1/2 -translate-y-1/2 rounded-[40%] border-2 border-pink-400 shadow-[0_0_25px_rgba(236,72,153,0.6)]" />
            <div className="absolute left-1/2 top-1/2 flex h-44 w-36 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[40%] border border-pink-300/30 bg-pink-500/10">
  
              <span className="text-8xl font-bold text-pink-500">
                ?
              </span>

            </div>

            <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-3 rounded-full bg-black/40 px-4 py-2 backdrop-blur">
              <span className="text-2xl">😊</span>
              <span className="text-2xl">😐</span>
              <span className="text-2xl">😮</span>
              <span className="text-2xl">😢</span>
              <span className="text-2xl">😠</span>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

export default Home;