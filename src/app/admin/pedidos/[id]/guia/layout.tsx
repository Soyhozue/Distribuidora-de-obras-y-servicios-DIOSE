export default function GuiaLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, background: "#f0f0f0", fontFamily: "Arial, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
