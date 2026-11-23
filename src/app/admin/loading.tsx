export default function AdminLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
      <div className="h-8 w-64 bg-slate-200 rounded-xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-white rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-200" />
              <div className="space-y-2">
                <div className="h-6 w-16 bg-slate-200 rounded" />
                <div className="h-3 w-20 bg-slate-200 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="h-96 bg-white rounded-2xl border border-slate-200" />
    </div>
  );
}
