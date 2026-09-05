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

type StoredCalibration = { ppi: number; dpr: number };

function currentDpr(): number {
  return typeof window !== "undefined" && window.devicePixelRatio ? window.devicePixelRatio : 1;
}

function readStoredCalibration(): StoredCalibration | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const ppi = Number(parsed?.ppi);
    const dpr = Number(parsed?.dpr);
    if (!Number.isFinite(ppi) || ppi < MIN_PPI || ppi > MAX_PPI) return null;
    // Calibraciones guardadas antes de que se registrara el dpr: se asume
    // que el zoom no ha cambiado desde entonces (mejor esfuerzo).
    return { ppi, dpr: Number.isFinite(dpr) && dpr > 0 ? dpr : currentDpr() };
  } catch {
    return null;
  }
}

/**
 * El navegador reporta el mismo devicePixelRatio para "hacer zoom" que para
 * tener una pantalla de alta densidad — por eso sirve para detectar cambios
 * de zoom: si el cliente calibra al 100% y luego hace zoom a 150%, el
 * devicePixelRatio sube en la misma proporción, y hay que agrandar el dibujo
 * esa misma proporción para que siga siendo el tamaño físico real.
 */
function useDevicePixelRatio(): number {
  const [dpr, setDpr] = useState(currentDpr);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    let mql: MediaQueryList | null = null;

    function subscribe() {
      const value = currentDpr();
      mql = window.matchMedia(`(resolution: ${value}dppx)`);
      mql.addEventListener("change", handleChange);
    }

    function handleChange() {
      mql?.removeEventListener("change", handleChange);
      setDpr(currentDpr());
      subscribe();
    }

    subscribe();
    return () => mql?.removeEventListener("change", handleChange);
  }, []);

  return dpr;
}

/**
 * Calibración de pantalla compartida entre la regla de tamaño real y el
 * buscador visual de tornillería — ambos dibujan a la misma escala física
 * calibrada por el cliente, guardada una sola vez por dispositivo, y
 * ajustada en vivo si el cliente hace zoom en el navegador después de
 * calibrar (sin eso, el zoom rompería la proporción real).
 */
export function useScreenCalibration() {
  const liveDpr = useDevicePixelRatio();
  const [basePpi, setBasePpi] = useState(DEFAULT_PPI);
  const [baseDpr, setBaseDpr] = useState(1);
  const [calibrated, setCalibrated] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [draftPpi, setDraftPpi] = useState(DEFAULT_PPI);

  useEffect(() => {
    const stored = readStoredCalibration();
    if (stored === null) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lectura única de localStorage al montar (API solo de cliente)
    setBasePpi(stored.ppi);
    setBaseDpr(stored.dpr);
    setCalibrated(true);
    setDraftPpi(stored.ppi);
  }, []);

  // ppi efectivo: el que se calibró, reescalado si el zoom cambió desde
  // entonces. Sin calibrar, no hay base de zoom que compensar — se usa tal
  // cual, como aproximación estándar.
  const ppi = calibrated ? basePpi * (liveDpr / baseDpr) : basePpi;

  function openPanel() {
    setDraftPpi(basePpi);
    setPanelOpen(true);
  }

  function saveCalibration() {
    const toStore: StoredCalibration = { ppi: draftPpi, dpr: liveDpr };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch {
      /* si el navegador bloquea el almacenamiento, al menos aplica en esta visita */
    }
    setBasePpi(draftPpi);
    setBaseDpr(liveDpr);
    setCalibrated(true);
    setPanelOpen(false);
  }

  function resetCalibration() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignorar */
    }
    setBasePpi(DEFAULT_PPI);
    setBaseDpr(1);
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
