export default function ClientesLoading() {
  return (
    <div className="flex-1 flex flex-col animate-pulse">
      <div className="h-14 bg-white border-b border-diose-border-light flex items-center px-9">
        <div className="h-5 w-24 bg-gray-200 rounded" />
      </div>
      <div className="p-9">
        <div className="bg-white border border-diose-border">
          <div className="h-10 bg-gray-100 border-b-2 border-diose-black/20" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-gray-100">
              <div className="flex-1 h-4 bg-gray-200 rounded" />
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-4 w-12 bg-gray-200 rounded" />
              <div className="h-4 w-20 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
