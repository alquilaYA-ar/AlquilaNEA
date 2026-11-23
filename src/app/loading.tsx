export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="relative w-12 h-12 mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
        <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
      </div>
      <p className="text-sm font-semibold text-slate-600">Cargando AlquilaNEA...</p>
    </div>
  );
}
