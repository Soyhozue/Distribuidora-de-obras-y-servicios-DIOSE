"use client";

import { useEffect } from "react";

type Props = {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
};

export default function ConfirmModal({ message, onConfirm, onCancel, danger = true }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter") onConfirm();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onCancel, onConfirm]);

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onCancel} />
      <div className="relative bg-white shadow-2xl w-full max-w-sm mx-4">
        {/* Top accent bar */}
        <div className={`h-1 w-full ${danger ? "bg-red-500" : "bg-diose-amber"}`} />
        <div className="px-7 py-6">
          <p className="text-[14px] text-diose-black leading-relaxed">{message}</p>
        </div>
        <div className="flex border-t border-diose-border-light">
          <button
            onClick={onCancel}
            className="flex-1 py-3.5 text-[12px] font-semibold tracking-[0.08em] uppercase text-gray-500 hover:bg-gray-50 cursor-pointer transition-colors border-r border-diose-border-light"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3.5 text-[12px] font-semibold tracking-[0.08em] uppercase cursor-pointer transition-colors ${
              danger
                ? "text-red-600 hover:bg-red-50"
                : "text-diose-black hover:bg-gray-50"
            }`}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
