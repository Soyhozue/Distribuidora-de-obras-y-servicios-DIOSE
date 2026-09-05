"use client";

import { useEffect, useState } from "react";

/** Píxeles CSS por pulgada de referencia (aproximación estándar del navegador). */
export const DEFAULT_PPI = 96;
export const MIN_PPI = 40;
export const MAX_PPI = 400;
/** Tarjeta bancaria / INE — medida estándar ISO, igual en todo el mundo. */
export const CARD_WIDTH_MM = 85.6;
export const CARD_HEIGHT_MM = 53.98;
export const MM_PER_INCH = 25.4;

const STORAGE_KEY = "diose-ruler-ppi";

function readStoredPpi(): number | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const value = Number(raw);
    if (!Number.isFinite(value) || value < MIN_PPI || value > MAX_PPI) return null;
    return value;
  } catch {
    return null;
  }
}

/**
 * Calibración de pantalla compartida entre la regla de tamaño real y el
 * buscador visual de tornillería — ambos dibujan a la misma escala física
 * calibrada por el cliente, guardada una sola vez por dispositivo.
 */
export function useScreenCalibration() {
  const [ppi, setPpi] = useState(DEFAULT_PPI);
  const [calibrated, setCalibrated] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [draftPpi, setDraftPpi] = useState(DEFAULT_PPI);

  useEffect(() => {
    const stored = readStoredPpi();
    if (stored === null) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lectura única de localStorage al montar (API solo de cliente)
    setPpi(stored);
    setCalibrated(true);
    setDraftPpi(stored);
  }, []);

  function openPanel() {
    setDraftPpi(ppi);
    setPanelOpen(true);
  }

  function saveCalibration() {
    try {
      localStorage.setItem(STORAGE_KEY, String(draftPpi));
    } catch {
      /* si el navegador bloquea el almacenamiento, al menos aplica en esta visita */
    }
    setPpi(draftPpi);
    setCalibrated(true);
    setPanelOpen(false);
  }

  function resetCalibration() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignorar */
    }
    setPpi(DEFAULT_PPI);
    setDraftPpi(DEFAULT_PPI);
    setCalibrated(false);
    setPanelOpen(false);
  }

  return {
    ppi,
    calibrated,
    panelOpen,
    draftPpi,
    setDraftPpi,
    openPanel,
    closePanel: () => setPanelOpen(false),
    saveCalibration,
    resetCalibration,
  };
}
