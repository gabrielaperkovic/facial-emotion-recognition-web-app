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
          Kamera, prepoznavanje emocija i spremanje rezultata u stvarnom vremenu.
        </p>
      </div>

      <section>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <CameraPreview />
        </div>
      </section>
    </MainLayout>
  );
}

export default Session;