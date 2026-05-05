import MainLayout from "../components/layout/MainLayout";
import CameraPreview from "../components/camera/CameraPreview";

function Session() {
  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Live session
        </h1>
        <p className="mt-2 text-slate-600">
          Kamera i live prikaz emocije.
        </p>
      </div>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <CameraPreview />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Trenutna emocija
          </h2>

          <div className="mt-8 text-center">
            <p className="text-6xl">😊</p>
            <p className="mt-4 text-3xl font-bold text-slate-900">
              Happy
            </p>
            <p className="mt-2 text-slate-500">
              Confidence: 92%
            </p>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

export default Session;