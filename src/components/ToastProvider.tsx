"use client";

import { useToastStore } from "@/store/toastStore";

export default function ToastProvider() {
  const { toasts, dismiss } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => dismiss(t.id)}
          className={`pointer-events-auto flex items-center gap-3 px-5 py-3 shadow-lg text-sm font-medium tracking-[0.02em] cursor-pointer animate-in fade-in slide-in-from-bottom-2 duration-200 ${
            t.type === "success"
              ? "bg-diose-black text-white"
              : "bg-red-600 text-white"
          }`}
        >
          <span>{t.type === "success" ? "✓" : "✕"}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
