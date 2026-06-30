export default function AdminLoading() {
  return (
    <div className="flex-1 bg-[#F2F2F2] flex flex-col animate-pulse">
      <div className="h-14 bg-white border-b border-diose-border-light" />
      <div className="p-9 flex flex-col gap-4">
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border border-diose-border h-28" />
          ))}
        </div>
        <div className="bg-white border border-diose-border h-64" />
      </div>
    </div>
  );
}
