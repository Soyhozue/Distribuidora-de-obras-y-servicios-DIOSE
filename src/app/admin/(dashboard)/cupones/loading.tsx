export default function CuponesLoading() {
  return (
    <div className="flex-1 flex flex-col animate-pulse">
      <div className="h-14 bg-white border-b border-diose-border-light" />
      <div className="p-9 flex flex-col gap-6">
        <div className="bg-white border border-diose-border h-28" />
        <div className="bg-white border border-diose-border h-48" />
      </div>
    </div>
  );
}
