import MainLayout from "../components/layout/MainLayout";

function History() {
  const sessions = [
    {
      id: 1,
      date: "12. 6. 2026.",
      emotion: "Happy",
      duration: "02:34",
      confidence: "91%",
    },
    {
      id: 2,
      date: "11. 6. 2026.",
      emotion: "Neutral",
      duration: "01:48",
      confidence: "84%",
    },
    {
      id: 3,
      date: "10. 6. 2026.",
      emotion: "Surprised",
      duration: "03:12",
      confidence: "88%",
    },
  ];

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

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-sm text-slate-500">
            <tr>
              <th className="px-6 py-4">Datum</th>
              <th className="px-6 py-4">Dominantna emocija</th>
              <th className="px-6 py-4">Trajanje</th>
              <th className="px-6 py-4">Confidence</th>
            </tr>
          </thead>

          <tbody>
            {sessions.map((session) => (
              <tr
                key={session.id}
                className="border-t border-slate-100"
              >
                <td className="px-6 py-4 text-slate-700">
                  {session.date}
                </td>
                <td className="px-6 py-4 font-medium text-slate-900">
                  {session.emotion}
                </td>
                <td className="px-6 py-4 text-slate-700">
                  {session.duration}
                </td>
                <td className="px-6 py-4 text-slate-700">
                  {session.confidence}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}

export default History;