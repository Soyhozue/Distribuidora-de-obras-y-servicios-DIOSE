export default function PublicidadLoading() {
  return (
    <div className="flex-1 flex flex-col animate-pulse">
      <div className="h-14 bg-white border-b border-diose-border-light flex items-center px-9">
        <div className="h-5 w-48 bg-gray-200 rounded" />
      </div>
      <div className="flex flex-1 gap-0 overflow-hidden">
        <div className="w-72 bg-white border-r border-diose-border-light p-6 flex flex-col gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded" />
          ))}
        </div>
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="w-80 h-80 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}
