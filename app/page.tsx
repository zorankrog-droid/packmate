"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<any>(null);

  const [lists, setLists] = useState<any[]>([]);
  const [selectedList, setSelectedList] = useState("");
  const [items, setItems] = useState<any[]>([]);

  const [listName, setListName] = useState("");
  const [itemName, setItemName] = useState("");

  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("Putovanje");

  const [aiPrompt, setAiPrompt] = useState("");

  const loadUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUser(user);

    if (user) {
      loadLists(user.id);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const signUp = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) alert(error.message);
    else alert("Registracija uspješna!");
  };

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) alert(error.message);
    else loadUser();
  };

  const logout = async () => {
    await supabase.auth.signOut();

    setUser(null);
    setLists([]);
    setItems([]);
    setSelectedList("");
  };

  const loadLists = async (userId: string) => {
    const { data } = await supabase
      .from("lists")
      .select("*")
      .eq("user_id", userId);

    setLists(data || []);
  };

  const createList = async () => {
    if (!user || !listName) return;

    await supabase.from("lists").insert({
      name: listName,
      user_id: user.id,
    });

    setListName("");
    loadLists(user.id);
  };

  const deleteList = async (id: string) => {
    await supabase.from("lists").delete().eq("id", id);

    if (user) loadLists(user.id);

    if (selectedList === id) {
      setSelectedList("");
      setItems([]);
    }
  };

  const loadItems = async (listId: string) => {
    const { data } = await supabase
      .from("items")
      .select("*")
      .eq("list_id", listId);

    setItems(data || []);
  };

  const createItem = async () => {
    if (!selectedList || !itemName) return;

    await supabase.from("items").insert({
      name: itemName,
      list_id: selectedList,
      checked: false,
      priority,
      category,
    });

    setItemName("");
    loadItems(selectedList);
  };

  const toggleItem = async (item: any) => {
    await supabase
      .from("items")
      .update({
        checked: !item.checked,
      })
      .eq("id", item.id);

    loadItems(selectedList);
  };

  const deleteItem = async (id: string) => {
    await supabase.from("items").delete().eq("id", id);

    loadItems(selectedList);
  };

  const generateAIList = async () => {
    if (!selectedList || !aiPrompt) return;

    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: aiPrompt,
      }),
    });

    const data = await response.json();

    if (!data.items) {
      alert("AI greška.");
      return;
    }

    for (const item of data.items) {
      await supabase.from("items").insert({
        name: item.name,
        priority: item.priority || "medium",
        category: item.category || "Putovanje",
        checked: false,
        list_id: selectedList,
      });
    }

    setAiPrompt("");
    loadItems(selectedList);

    alert("AI lista generirana!");
  };

  const exportPDF = () => {
    if (!selectedList) return;

    const selectedListName =
      lists.find((l) => l.id === selectedList)?.name || "PackMate";

    localStorage.setItem(
      "packmate_print",
      JSON.stringify({
        listName: selectedListName,
        items,
      })
    );

    window.open("/print", "_blank");
  };

  const bg = "#071120";
  const card = "#0f1d33";
  const gold = "#d4af37";

  if (!user) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: bg,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 400,
            background: card,
            borderRadius: 24,
            padding: 30,
            color: "white",
            boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
          }}
        >
          <h1
            style={{
              textAlign: "center",
              marginBottom: 30,
              color: gold,
              fontSize: 34,
            }}
          >
            ✈️ PackMate
          </h1>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="Lozinka"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />

          <button onClick={signIn} style={goldButton}>
            Prijava
          </button>

          <button
            onClick={signUp}
            style={{
              ...secondaryButton,
              width: "100%",
              marginTop: 12,
            }}
          >
            Registracija
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: bg,
        color: "white",
        padding: 20,
      }}
    >
      <div
        style={{
          maxWidth: 800,
          margin: "0 auto",
        }}
      >
        <div style={sectionCard}>
          <h1
            style={{
              color: gold,
              marginBottom: 10,
            }}
          >
            ✈️ PackMate
          </h1>

          <p>{user.email}</p>

          <button
            onClick={logout}
            style={{
              ...secondaryButton,
              marginTop: 10,
            }}
          >
            Logout
          </button>
        </div>

        <div style={sectionCard}>
          <h2 style={titleStyle}>Nova lista</h2>

          <input
            placeholder="Naziv liste"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            style={inputStyle}
          />

          <button onClick={createList} style={goldButton}>
            Dodaj listu
          </button>
        </div>

        <div style={sectionCard}>
          <h2 style={titleStyle}>Odaberi listu</h2>

          <select
            value={selectedList}
            onChange={(e) => {
              setSelectedList(e.target.value);

              if (e.target.value) {
                loadItems(e.target.value);
              } else {
                setItems([]);
              }
            }}
            style={inputStyle}
          >
            <option value="">Odaberi listu</option>

            {lists.map((list) => (
              <option key={list.id} value={list.id}>
                {list.name}
              </option>
            ))}
          </select>
        </div>

        <div style={sectionCard}>
          <h2 style={titleStyle}>Nova stavka</h2>

          <input
            placeholder="Nova stavka"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            style={inputStyle}
          />

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            style={inputStyle}
          >
            <option value="high">🔴 Visoki prioritet</option>
            <option value="medium">🟡 Srednji prioritet</option>
            <option value="low">🟢 Niski prioritet</option>
          </select>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={inputStyle}
          >
            <option value="Dokumenti">📄 Dokumenti</option>
            <option value="Odjeća">👕 Odjeća</option>
            <option value="Elektronika">🔌 Elektronika</option>
            <option value="Higijena">🧴 Higijena</option>
            <option value="Lijekovi">💊 Lijekovi</option>
            <option value="More">🏖️ More</option>
            <option value="Djeca">🧸 Djeca</option>
            <option value="Putovanje">✈️ Putovanje</option>
            <option value="Posao">💼 Posao</option>
          </select>

          <button onClick={createItem} style={goldButton}>
            Dodaj stavku
          </button>
        </div>

        <div style={sectionCard}>
          <h2 style={titleStyle}>🤖 AI Generator</h2>

          <input
            placeholder="npr. MSC krstarenje 7 dana"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            style={inputStyle}
          />

          <button onClick={generateAIList} style={goldButton}>
            Generiraj AI listu
          </button>
        </div>

        <div style={sectionCard}>
          <div
            style={{
              display: "flex",
flexDirection: "column",
alignItems: "stretch",
marginBottom: 20,
gap: 16,
            }}
          >
            <<h2
  style={{
    ...titleStyle,
    marginBottom: 0,
  }}
>
  Stavke
</h2>>

            <button
              onClick={exportPDF}
style={{
  ...goldButton,
  width: "100%",
}}            >
              📄 PDF
            </button>
          </div>

          {items.length === 0 && (
            <p style={{ opacity: 0.7 }}>Nema stavki u odabranoj listi.</p>
          )}

          {items.map((item) => (
            <div
              key={item.id}
              style={{
                background: "rgba(255,255,255,0.06)",
                padding: 18,
                borderRadius: 18,
                marginBottom: 14,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 18,
                    textDecoration: item.checked ? "line-through" : "none",
                  }}
                >
                  {item.name}
                </div>

                <small style={{ opacity: 0.75 }}>
                  {item.priority || "medium"} • {item.category || "Putovanje"}
                </small>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                }}
              >
                <button
                  onClick={() => toggleItem(item)}
                  style={{
                    ...secondaryButton,
                    padding: "10px 12px",
                  }}
                >
                  {item.checked ? "☑" : "☐"}
                </button>

                <button
                  onClick={() => deleteItem(item.id)}
                  style={{
                    ...secondaryButton,
                    padding: "10px 12px",
                  }}
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={sectionCard}>
          <h2 style={titleStyle}>Moje liste</h2>

          {lists.length === 0 && <p style={{ opacity: 0.7 }}>Još nema lista.</p>}

          {lists.map((list) => (
            <div
              key={list.id}
              style={{
                background: "rgba(255,255,255,0.05)",
                padding: 16,
                borderRadius: 16,
                marginBottom: 12,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span>{list.name}</span>

              <button
                onClick={() => deleteList(list.id)}
                style={secondaryButton}
              >
                🗑
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: 16,
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.1)",
  backgroundColor: "#14233d",
  color: "white",
  marginBottom: 16,
  fontSize: 16,
  outline: "none",
  appearance: "none",
};

const goldButton: React.CSSProperties = {
  width: "100%",
  padding: 16,
  borderRadius: 16,
  border: "none",
  backgroundColor: "#d4af37",
  color: "#071120",
  fontWeight: 700,
  fontSize: 16,
  cursor: "pointer",
};

const secondaryButton: React.CSSProperties = {
  padding: "12px 16px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.15)",
  backgroundColor: "rgba(255,255,255,0.08)",
  color: "white",
  cursor: "pointer",
};

const sectionCard: React.CSSProperties = {
  backgroundColor: "#0f1d33",
  borderRadius: 24,
  padding: 24,
  marginBottom: 20,
};

const titleStyle: React.CSSProperties = {
  marginBottom: 20,
  color: "#d4af37",
};