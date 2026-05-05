import { Link } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";

function Home() {
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
              to="/dashboard"
              className="rounded-xl bg-pink-500 px-5 py-3 font-medium text-white hover:bg-pink-600"
            >
              Pogledaj dashboard
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="aspect-video rounded-2xl bg-slate-900 p-6 text-white">
            <p className="text-sm text-slate-300">Live preview</p>

            <div className="mt-20 text-center">
              <p className="text-5xl">😊</p>
              <p className="mt-4 text-xl font-semibold">Happy</p>
              <p className="mt-2 text-sm text-slate-300">
                Confidence: 92%
              </p>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

export default Home;