export default function InventarioLoading() {
  return (
    <div className="flex-1 flex flex-col animate-pulse">
      <div className="h-14 bg-white border-b border-diose-border-light flex items-center px-9">
        <div className="h-5 w-28 bg-gray-200 rounded" />
      </div>
      <div className="p-9">
        <div className="bg-white border border-diose-border">
          <div className="h-10 bg-gray-100 border-b border-diose-border-light" />
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-3 border-b border-gray-100">
              <div className="flex-1 h-4 bg-gray-200 rounded" />
              <div className="h-4 w-20 bg-gray-200 rounded" />
              <div className="h-4 w-16 bg-gray-200 rounded" />
              <div className="h-8 w-24 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
