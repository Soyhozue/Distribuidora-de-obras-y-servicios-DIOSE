"use client";

import { useEffect } from "react";

type Order = {
  number: number;
  createdAt: string;
  total: number;
  customer: {
    name: string;
    phone: string;
    email: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
  };
  items: { id: string; name: string; sku: string; quantity: number; price: string }[];
};

export default function PrintGuia({ order }: { order: Order }) {
  useEffect(() => {
    window.print();
  }, []);

  const peso = order.items.length; // placeholder — real weight would need product data

  return (
    <>
      <style>{`
        @media print {
          body { margin: 0; }
          .no-print { display: none !important; }
        }
        @page { size: A6 landscape; margin: 0; }
      `}</style>

      {/* Toolbar — hidden on print */}
      <div className="no-print flex items-center gap-4 p-4 bg-gray-100 border-b">
        <button onClick={() => window.history.back()} className="text-sm text-gray-600 hover:text-black cursor-pointer">
          ← Volver
        </button>
        <button
          onClick={() => window.print()}
          className="bg-black text-white text-sm px-5 py-2 cursor-pointer hover:bg-gray-800"
        >
          Imprimir guía
        </button>
      </div>

      {/* Guía — tamaño A6 apaisado (148×105mm) */}
      <div
        className="bg-white mx-auto my-8 no-print-margin"
        style={{ width: "148mm", minHeight: "105mm", fontFamily: "Arial, sans-serif", border: "1px solid #ccc" }}
      >
        {/* Header */}
        <div style={{ background: "#1a1a1a", color: "white", padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "16px", fontWeight: "bold", letterSpacing: "0.1em" }}>DIOSE</div>
            <div style={{ fontSize: "9px", color: "#aaa", letterSpacing: "0.05em" }}>Distribuidora de obras y servicios</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "18px", fontWeight: "bold" }}>PEDIDO #{order.number}</div>
            <div style={{ fontSize: "9px", color: "#aaa" }}>{order.createdAt}</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0", borderBottom: "1px solid #eee" }}>
          {/* Remitente */}
          <div style={{ padding: "10px 12px", borderRight: "1px solid #eee" }}>
            <div style={{ fontSize: "8px", color: "#888", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "5px" }}>
              Remitente
            </div>
            <div style={{ fontSize: "11px", fontWeight: "bold", marginBottom: "2px" }}>DIOSE</div>
            <div style={{ fontSize: "10px", color: "#444", lineHeight: "1.5" }}>
              Av. de las Torres 1234<br />
              Col. Industrial<br />
              Ciudad Juárez, Chih. CP 32320<br />
              Tel: (656) 000-0000
            </div>
          </div>

          {/* Destinatario */}
          <div style={{ padding: "10px 12px", background: "#fafafa" }}>
            <div style={{ fontSize: "8px", color: "#888", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "5px" }}>
              Destinatario
            </div>
            <div style={{ fontSize: "12px", fontWeight: "bold", marginBottom: "2px" }}>{order.customer.name}</div>
            <div style={{ fontSize: "10px", color: "#444", lineHeight: "1.5" }}>
              {order.customer.street}<br />
              {order.customer.city}, {order.customer.state}
              {order.customer.postalCode ? ` CP ${order.customer.postalCode}` : ""}
              <br />
              Tel: {order.customer.phone || "—"}
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div style={{ padding: "8px 12px", borderBottom: "1px solid #eee" }}>
          <div style={{ fontSize: "8px", color: "#888", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "5px" }}>
            Contenido del paquete
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #eee" }}>
                <th style={{ textAlign: "left", padding: "2px 0", color: "#888", fontWeight: "normal" }}>Producto</th>
                <th style={{ textAlign: "center", padding: "2px 4px", color: "#888", fontWeight: "normal" }}>Cant.</th>
                <th style={{ textAlign: "right", padding: "2px 0", color: "#888", fontWeight: "normal" }}>Precio</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td style={{ padding: "2px 0", color: "#222" }}>{item.name}</td>
                  <td style={{ textAlign: "center", padding: "2px 4px", color: "#222" }}>{item.quantity}</td>
                  <td style={{ textAlign: "right", padding: "2px 0", color: "#222" }}>{item.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ padding: "6px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "9px", color: "#888" }}>
            {order.items.reduce((s, i) => s + i.quantity, 0)} pieza(s) · {peso} bulto(s)
          </div>
          <div style={{ fontSize: "13px", fontWeight: "bold" }}>
            Total: ${order.total.toLocaleString("es-MX")} MXN
          </div>
        </div>
      </div>
    </>
  );
}
