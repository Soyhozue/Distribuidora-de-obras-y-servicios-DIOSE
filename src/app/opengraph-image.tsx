import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "DIOSE – Materiales de construcción en Ciudad Juárez";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0A0A0A",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          padding: "80px",
        }}
      >
        {/* Triangle logo */}
        <svg
          width="60"
          height="55"
          viewBox="0 0 56 50"
          fill="none"
          style={{ marginBottom: 24 }}
        >
          <path d="M28 3 L54 48 L2 48 Z" stroke="#F5A623" strokeWidth="2.5" strokeLinejoin="round" />
          <circle cx="28" cy="32" r="4.5" fill="#F5A623" />
        </svg>
        <div
          style={{
            fontFamily: "sans-serif",
            fontSize: 88,
            fontWeight: 700,
            color: "#FFFFFF",
            letterSpacing: "0.08em",
            lineHeight: 1,
            marginBottom: 16,
          }}
        >
          DIOSE
        </div>
        <div
          style={{
            fontFamily: "sans-serif",
            fontSize: 28,
            color: "rgba(255,255,255,0.5)",
            letterSpacing: "0.04em",
            marginBottom: 40,
          }}
        >
          Materiales de construcción · Ciudad Juárez
        </div>
        <div
          style={{
            display: "flex",
            gap: 12,
          }}
        >
          {["Herramientas", "Materiales", "Suministros"].map((tag) => (
            <div
              key={tag}
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.6)",
                fontSize: 14,
                fontFamily: "sans-serif",
                letterSpacing: "0.1em",
                padding: "6px 16px",
                textTransform: "uppercase",
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
