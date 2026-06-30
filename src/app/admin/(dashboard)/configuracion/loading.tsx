export default function ConfiguracionLoading() {
  return (
    <div className="flex-1 flex flex-col animate-pulse">
      <div className="h-14 bg-white border-b border-diose-border-light flex items-center px-9">
        <div className="h-5 w-36 bg-gray-200 rounded" />
      </div>
      <div className="flex flex-1">
        <div className="w-56 bg-white border-r border-diose-border-light p-4 flex flex-col gap-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-9 bg-gray-100 rounded" />
          ))}
        </div>
        <div className="flex-1 p-8 flex flex-col gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border border-diose-border p-6 flex flex-col gap-3">
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-10 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
