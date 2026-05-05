import MainLayout from "../components/layout/MainLayout";

function Dashboard() {
  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Dashboard
        </h1>
        <p className="mt-2 text-slate-600">
          Pregled trenutnih i prošlih analiza emocija.
        </p>
      </div>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Ukupno sessiona
          </p>
          <p className="mt-3 text-4xl font-bold text-slate-900">
            12
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Najčešća emocija
          </p>
          <p className="mt-3 text-4xl font-bold text-slate-900">
            Happy
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Prosječna sigurnost
          </p>
          <p className="mt-3 text-4xl font-bold text-slate-900">
            86%
          </p>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Emotion chart
          </h2>

          <div className="mt-6 flex h-64 items-end gap-4">
            <div className="h-32 flex-1 rounded-t-xl bg-pink-200"></div>
            <div className="h-52 flex-1 rounded-t-xl bg-pink-500"></div>
            <div className="h-24 flex-1 rounded-t-xl bg-pink-300"></div>
            <div className="h-40 flex-1 rounded-t-xl bg-pink-400"></div>
            <div className="h-20 flex-1 rounded-t-xl bg-pink-200"></div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Zadnji session
          </h2>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
              <span className="text-slate-600">Dominantna emocija</span>
              <span className="font-semibold text-slate-900">Happy</span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
              <span className="text-slate-600">Trajanje</span>
              <span className="font-semibold text-slate-900">02:34</span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
              <span className="text-slate-600">Confidence</span>
              <span className="font-semibold text-slate-900">91%</span>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

export default Dashboard;