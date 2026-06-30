"use client";

import { useEffect } from "react";

type Order = {
  number: number;
  createdAt: string;
  customer: {
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
  };
  items: { id: string; quantity: number }[];
};

export default function PrintGuia({ order }: { order: Order }) {
  useEffect(() => { window.print(); }, []);

  const totalPieces = order.items.reduce((s, i) => s + i.quantity, 0);
  const trackingRef = `DIOSE-${String(order.number).padStart(6, "0")}`;

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        @media print {
          html, body { margin: 0; padding: 0; background: white; }
          .no-print { display: none !important; }
          .label { box-shadow: none !important; border: 1px solid #000 !important; }
          @page { size: 100mm 150mm; margin: 0; }
        }
        @media screen {
          body { display: flex; flex-direction: column; align-items: center; padding: 24px; background: #e5e5e5; }
        }
      `}</style>

      {/* Toolbar */}
      <div className="no-print" style={{ width: "100mm", marginBottom: "12px", display: "flex", gap: "8px" }}>
        <button onClick={() => window.history.back()}
          style={{ fontSize: "12px", color: "#555", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          ← Volver
        </button>
        <button onClick={() => window.print()}
          style={{ marginLeft: "auto", background: "#1a1a1a", color: "white", border: "none", padding: "7px 18px", fontSize: "12px", cursor: "pointer", letterSpacing: "0.05em" }}>
          Imprimir
        </button>
      </div>

      {/* Label — 100×150mm (standard paquetería MX) */}
      <div className="label" style={{
        width: "100mm", background: "white",
        boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
        border: "1px solid #ccc",
        display: "flex", flexDirection: "column",
      }}>

        {/* TOP HEADER */}
        <div style={{ background: "#111", color: "white", padding: "6px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "14px", fontWeight: "900", letterSpacing: "0.12em" }}>DIOSE</div>
            <div style={{ fontSize: "7px", color: "#aaa", letterSpacing: "0.06em" }}>Distribuidora de obras y servicios</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "7px", color: "#aaa", letterSpacing: "0.06em" }}>GUÍA DE ENVÍO</div>
            <div style={{ fontSize: "9px", color: "#fff", letterSpacing: "0.04em" }}>{order.createdAt}</div>
          </div>
        </div>

        {/* TRACKING NUMBER */}
        <div style={{ borderBottom: "2px solid #111", padding: "8px 10px", background: "#f9f9f9" }}>
          <div style={{ fontSize: "7px", color: "#888", letterSpacing: "0.12em", marginBottom: "2px" }}>N° DE SEGUIMIENTO</div>
          <div style={{ fontSize: "18px", fontWeight: "bold", letterSpacing: "0.08em", color: "#111" }}>{trackingRef}</div>
          {/* Barcode simulation */}
          <div style={{ marginTop: "4px", display: "flex", gap: "1px", height: "20px", alignItems: "flex-end" }}>
            {Array.from(trackingRef.replace(/[^0-9A-Z]/g, "")).map((c, i) => {
              const h = ((c.charCodeAt(0) * 7 + i * 13) % 16) + 6;
              return <div key={i} style={{ width: "2px", background: "#111", height: `${h}px` }} />;
            })}
          </div>
        </div>

        {/* DIVIDER LABEL */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>

          {/* REMITENTE */}
          <div style={{ padding: "8px 10px", borderRight: "1px solid #ddd", borderBottom: "1px solid #ddd" }}>
            <div style={{ fontSize: "7px", color: "#888", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "4px", fontWeight: "bold" }}>
              Remitente
            </div>
            <div style={{ fontSize: "10px", fontWeight: "bold", marginBottom: "2px" }}>DIOSE</div>
            <div style={{ fontSize: "8.5px", color: "#444", lineHeight: "1.6" }}>
              Av. de las Torres 1234<br />
              Col. Industrial<br />
              Ciudad Juárez, Chih.<br />
              CP 32320<br />
              Tel: (656) 000-0000
            </div>
          </div>

          {/* INFO PAQUETE */}
          <div style={{ padding: "8px 10px", borderBottom: "1px solid #ddd" }}>
            <div style={{ fontSize: "7px", color: "#888", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "4px", fontWeight: "bold" }}>
              Paquete
            </div>
            <div style={{ fontSize: "8.5px", color: "#444", lineHeight: "1.8" }}>
              <span style={{ color: "#888" }}>Piezas:&nbsp;</span><strong>{totalPieces}</strong><br />
              <span style={{ color: "#888" }}>Pedido:&nbsp;</span><strong>#{order.number}</strong><br />
              <span style={{ color: "#888" }}>Tipo:&nbsp;</span>Paquete<br />
              <span style={{ color: "#888" }}>Servicio:&nbsp;</span>Estándar
            </div>
          </div>
        </div>

        {/* DESTINATARIO — main block */}
        <div style={{ padding: "10px 10px", background: "#fff", borderBottom: "2px dashed #333", flex: 1 }}>
          <div style={{ fontSize: "7px", color: "#888", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "5px", fontWeight: "bold" }}>
            ▼ &nbsp;Destinatario
          </div>
          <div style={{ fontSize: "15px", fontWeight: "900", color: "#111", marginBottom: "5px", lineHeight: 1.2 }}>
            {order.customer.name}
          </div>
          <div style={{ fontSize: "11px", color: "#222", lineHeight: "1.7" }}>
            {order.customer.street}<br />
            {order.customer.city}, {order.customer.state}
            {order.customer.postalCode && <>&nbsp;&nbsp;CP <strong style={{ fontSize: "13px" }}>{order.customer.postalCode}</strong></>}
          </div>
          <div style={{ marginTop: "6px", fontSize: "10px", color: "#555" }}>
            Tel: <strong>{order.customer.phone || "—"}</strong>
          </div>
        </div>

        {/* POSTAL CODE LARGE */}
        {order.customer.postalCode && (
          <div style={{ padding: "6px 10px", background: "#111", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "7px", color: "#aaa", letterSpacing: "0.1em" }}>CÓDIGO POSTAL DESTINO</div>
              <div style={{ fontSize: "22px", fontWeight: "900", letterSpacing: "0.15em" }}>{order.customer.postalCode}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "7px", color: "#aaa", letterSpacing: "0.1em" }}>ESTADO</div>
              <div style={{ fontSize: "11px", fontWeight: "bold", letterSpacing: "0.06em" }}>{order.customer.state.toUpperCase()}</div>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div style={{ padding: "5px 10px", background: "#f9f9f9", borderTop: "1px solid #eee" }}>
          <div style={{ fontSize: "7px", color: "#aaa", textAlign: "center", letterSpacing: "0.04em" }}>
            DIOSE · diose.com · Ciudad Juárez, Chih., México
          </div>
        </div>
      </div>
    </>
  );
}
