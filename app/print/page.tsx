"use client";

import { useEffect, useState } from "react";

export default function PrintPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("packmate_print");

    if (saved) {
      setData(JSON.parse(saved));

      setTimeout(() => {
        window.print();
      }, 1000);
    }
  }, []);

  if (!data) {
    return <p>Nema podataka za ispis.</p>;
  }

  return (
    <>
      <style>{`
        @page {
          size: A4;
          margin: 15mm;
        }

        html, body {
          font-family: Arial, Helvetica, sans-serif;
          color: black;
          background: white;
        }

        body {
          padding: 0;
          margin: 0;
        }

        .container {
          padding: 30px;
        }

        h1 {
          color: #2563eb;
          margin-bottom: 10px;
        }

        h2 {
          margin-bottom: 30px;
        }

        .item {
          padding: 12px 0;
          border-bottom: 1px solid #ccc;
          page-break-inside: avoid;
          break-inside: avoid;
        }

        .title {
          font-size: 16px;
          font-weight: bold;
        }

        .meta {
          font-size: 13px;
          color: #555;
          margin-top: 4px;
        }
      `}</style>

      <div className="container">
        <h1>PackMate lista</h1>

        <h2>{data.listName}</h2>

        {data.items.map((item: any, index: number) => (
          <div key={index} className="item">
            <div className="title">
              {item.checked ? "✓" : "☐"} {item.name}
            </div>

            <div className="meta">
              Prioritet: {item.priority} | Kategorija:{" "}
              {item.category || "Putovanje"}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}