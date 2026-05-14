"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function SharePage() {
  const params = useParams();
  const shareId = params.id as string;

  const [list, setList] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (shareId) {
      loadSharedList();
    }
  }, [shareId]);

  const loadSharedList = async () => {
    const { data: listData, error: listError } = await supabase
      .from("lists")
      .select("*")
      .eq("share_id", shareId)
      .maybeSingle();

    if (listError || !listData) {
      setLoading(false);
      return;
    }

    setList(listData);

    const { data: itemsData } = await supabase
      .from("items")
      .select("*")
      .eq("list_id", listData.id);

    setItems(itemsData || []);
    setLoading(false);
  };

  if (loading) {
    return (
      <main style={pageStyle}>
        <h1>Učitavanje liste...</h1>
      </main>
    );
  }

  if (!list) {
    return (
      <main style={pageStyle}>
        <h1>Lista nije pronađena</h1>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={{ color: "#d4af37" }}>✈️ PackMate lista</h1>
        <h2>{list.name}</h2>

        {items.map((item, index) => (
          <div key={index} style={itemStyle}>
            <strong>
              {item.checked ? "☑" : "☐"} {item.name}
            </strong>
            <div style={{ opacity: 0.7, marginTop: 4 }}>
              {item.priority} • {item.category || "Putovanje"}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#071120",
  color: "white",
  padding: 20,
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
};

const cardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 800,
  background: "#0f1d33",
  borderRadius: 24,
  padding: 24,
  marginTop: 40,
};

const itemStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.06)",
  padding: 18,
  borderRadius: 18,
  marginBottom: 14,
};