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
  const [onlineUsers, setOnlineUsers] = useState(1);
  const [newItem, setNewItem] = useState("");
  const [guestName, setGuestName] = useState("");

  useEffect(() => {
  const savedName = localStorage.getItem("packmate-guest-name");
  if (savedName) setGuestName(savedName);
}, []);

useEffect(() => {
  if (guestName) {
    localStorage.setItem("packmate-guest-name", guestName);
  }
}, [guestName]);

  useEffect(() => {
  if (!shareId) return;

  loadSharedList();
}, [shareId]);

useEffect(() => {
  if (!list?.id) return;

  const channel = supabase
    .channel(`shared-items-${list.id}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "items",
        filter: `list_id=eq.${list.id}`,
      },
      () => {
        loadSharedList();
      }
    )
    .subscribe((status) => {
      console.log("Realtime status:", status);
    });

  return () => {
    supabase.removeChannel(channel);
  };
}, [list?.id]);

useEffect(() => {
  if (!list?.id) return;

  const presenceChannel = supabase.channel(
    `presence-list-${list.id}`
  );

  presenceChannel
    .on("presence", { event: "sync" }, () => {
      const state = presenceChannel.presenceState();
      setOnlineUsers(Object.keys(state).length);
    })
    .subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await presenceChannel.track({
          online_at: new Date().toISOString(),
        });
      }
    });

  return () => {
    supabase.removeChannel(presenceChannel);
  };
}, [list?.id]);
  const loadSharedList = async () => {
    const { data: listData } = await supabase
      .from("lists")
      .select("*")
      .eq("share_id", shareId)
      .maybeSingle();

    if (!listData) {
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

  const addItem = async () => {
    if (!newItem || !list) return;

    await supabase.from("items").insert({
      list_id: list.id,
      name: newItem,
      checked: false,
      priority: "medium",
      category: "Putovanje",
    });

    setNewItem("");
    loadSharedList();
  };

  const toggleItem = async (item: any) => {
    await supabase
      .from("items")
      .update({ checked: !item.checked })
      .eq("id", item.id);

    loadSharedList();
  };

  if (loading) {
    return <main style={pageStyle}><h1>Učitavanje liste...</h1></main>;
  }

  if (!list) {
    return <main style={pageStyle}><h1>Lista nije pronađena</h1></main>;
  }

  return (
    <main style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={{ color: "#d4af37" }}>✈️ PackMate lista</h1>
        <h2>{list.name}</h2>

<input
  value={guestName}
  onChange={(e) => setGuestName(e.target.value)}
  placeholder="Vaše ime"
  style={{
    width: "100%",
    padding: 12,
    marginTop: 12,
    borderRadius: 10,
    border: "1px solid #333",
    background: "#111",
    color: "white",
  }}
/>

        <p style={{ opacity: 0.75, marginTop: 6 }}>
  👥 Zajednička lista za pakiranje
</p>
<div
  style={{
    marginTop: 10,
    marginBottom: 20,
    padding: "8px 14px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.08)",
    display: "inline-block",
    fontSize: 14,
  }}
>
  👥 Online korisnika: {onlineUsers}
</div>
        <div style={{ marginBottom: 20 }}>
          <input
            placeholder="Dodaj stavku"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            style={inputStyle}
          />

          <button onClick={addItem} style={buttonStyle}>
            Dodaj stavku
          </button>
        </div>

        {items.map((item) => (
          <div
            key={item.id}
            style={itemStyle}
            onClick={() => toggleItem(item)}
          >
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
  cursor: "pointer",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: 14,
  borderRadius: 12,
  border: "none",
  marginBottom: 10,
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  padding: 14,
  borderRadius: 12,
  border: "none",
  background: "#d4af37",
  color: "#071120",
  fontWeight: "bold",
  cursor: "pointer",
};