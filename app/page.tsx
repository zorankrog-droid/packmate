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
  const [tripDays, setTripDays] =
  useState("");

const [tripTemp, setTripTemp] =
  useState("");

const [destination, setDestination] =
  useState("");
  const [flightMode, setFlightMode] =
  useState("checked");
  const [travelNotes, setTravelNotes] =
  useState("");
  const [timeline, setTimeline] =
  useState("");
  const [repackingMode, setRepackingMode] =
  useState(false);
  const [template, setTemplate] = useState("msc");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const loadUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUser(user);

    if (user) loadLists(user.id);
  };

  useEffect(() => {
    loadUser();

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const signUp = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
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
    if (!confirm("Želiš li obrisati listu?")) return;

    await supabase.from("lists").delete().eq("id", id);

    if (user) loadLists(user.id);

    if (selectedList === id) {
      setSelectedList("");
      setItems([]);
    }
  };

  const shareList = async (list: any) => {
    let shareId = list.share_id;

    if (!shareId) {
      shareId = crypto.randomUUID();

      await supabase
        .from("lists")
        .update({ share_id: shareId })
        .eq("id", list.id);

      if (user) loadLists(user.id);
    }

    const shareUrl = `${window.location.origin}/share/${shareId}`;
    await navigator.clipboard.writeText(shareUrl);
    alert("Link kopiran!\n\n" + shareUrl);
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
      .update({ checked: !item.checked })
      .eq("id", item.id);

    loadItems(selectedList);
  };
const updateItem = async (
  id: string,
  updates: any
) => {
  await supabase
    .from("items")
    .update(updates)
    .eq("id", id);

  loadItems(selectedList);
};
  const deleteItem = async (id: string) => {
    await supabase.from("items").delete().eq("id", id);
    loadItems(selectedList);
  };

  const loadTemplate = async () => {
    if (!selectedList) {
      alert("Odaberi listu.");
      return;
    }

    const templates: any = {
      msc: [
        ["Putovnica", "high", "Dokumenti"],
        ["Boarding pass", "high", "Dokumenti"],
        ["Putno osiguranje", "high", "Dokumenti"],
        ["Kupaći kostim", "medium", "More"],
        ["Elegantna odjeća", "medium", "Odjeća"],
        ["Večernje cipele", "medium", "Odjeća"],
        ["Punjač", "high", "Elektronika"],
        ["Power bank", "medium", "Elektronika"],
        ["Lijekovi protiv mučnine", "high", "Lijekovi"],
        ["Krema za sunce", "medium", "More"],
      ],
      zanzibar: [
        ["Putovnica", "high", "Dokumenti"],
        ["Adapter", "high", "Elektronika"],
        ["Krema SPF 50", "high", "More"],
        ["Lagane majice", "medium", "Odjeća"],
        ["Šešir", "medium", "More"],
        ["Sandale", "medium", "Odjeća"],
        ["Lijekovi", "high", "Lijekovi"],
        ["Naočale za sunce", "medium", "More"],
      ],
      business: [
        ["Laptop", "high", "Posao"],
        ["Punjač za laptop", "high", "Elektronika"],
        ["Poslovno odijelo", "high", "Odjeća"],
        ["Dokumenti", "high", "Dokumenti"],
        ["Vizitke", "medium", "Posao"],
        ["Tablet", "medium", "Elektronika"],
      ],
    };

    for (const item of templates[template] || []) {
      await supabase.from("items").insert({
        name: item[0],
        priority: item[1],
        category: item[2],
        list_id: selectedList,
        checked: false,
      });
    }

    loadItems(selectedList);
    alert("Template učitan!");
  };

  const generateAIList = async () => {
    let realWeather = "";
    if (!selectedList) {
      alert("Prvo odaberi listu.");
      return;
    }
const exportPDF = () => {
  window.print();
};
    if (!aiPrompt) {
      alert("Upiši opis putovanja.");
      return;
    }
if (destination) {
  try {
    const weatherResponse =
      await fetch(
        "/api/weather",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            city: destination,
          }),
        }
      );

    const weatherData =
      await weatherResponse.json();
if (weatherData.temp) {
  setTripTemp(
    `${weatherData.temp}°C`
  );
}
    realWeather = `
Temperatura: ${weatherData.temp}°C
Vrijeme: ${weatherData.description}
`;
  } catch (e) {
    console.log(
      "Weather fetch failed"
    );
  }
}
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
  prompt: `
Destinacija:
${destination}

Broj dana:
${tripDays}

Vrijeme:
${realWeather}
Flight mode:
${flightMode}
Dodatni opis:
${aiPrompt}
Travel notes:
${travelNotes}
Timeline:
${timeline}
Repacking mode:
${repackingMode}
`,
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

  const installApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      return;
    }

    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isAndroid) {
      alert(
        "Za instalaciju:\n\nKlikni ⋮ u browseru i odaberi:\n\n'Dodaj na početni zaslon' ili 'Install app'"
      );
      return;
    }

    if (isIOS) {
      alert("Za instalaciju:\n\nKlikni Share → Add to Home Screen");
      return;
    }

    alert("Instalacija trenutno nije dostupna.");
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
const completedItems =
  items.filter(
    (item) => item.checked
  ).length;

const totalItems =
  items.length;

const progress =
  totalItems > 0
    ? (
        (completedItems /
          totalItems) *
        100
      ).toFixed(0)
    : 0;
    const mustNotForget =
  items.filter(
    (item) =>
      item.priority ===
      "high"
  );
  const groupedItems =
  items
    .sort((a, b) => {
      if (
        a.checked ===
        b.checked
      )
        return 0;

      return a.checked
        ? 1
        : -1;
    })
    .reduce(
      (
        acc: any,
        item: any
      ) => {
        const cat =
          item.category ||
          "Putovanje";

        if (!acc[cat]) {
          acc[cat] = [];
        }

        acc[cat].push(item);

        return acc;
      },
      {}
    );

  const getCategoryIcon = (cat: string) => {
    if (cat === "Dokumenti") return "📄";
    if (cat === "Odjeća") return "👕";
    if (cat === "Elektronika") return "🔌";
    if (cat === "Higijena") return "🧴";
    if (cat === "Lijekovi") return "💊";
    if (cat === "More") return "🏖️";
    if (cat === "Djeca") return "🧸";
    if (cat === "Posao") return "💼";
    return "✈️";
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
          }}
        >
          <h1 style={{ textAlign: "center", color: gold, fontSize: 34 }}>
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
            style={{ ...secondaryButton, width: "100%", marginTop: 12 }}
          >
            Registracija
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: bg, color: "white", padding: 20 }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={sectionCard}>
          <h1 style={{ color: gold }}>✈️ PackMate</h1>

          <button onClick={installApp} style={{ ...goldButton, marginBottom: 16 }}>
            📲 Instaliraj aplikaciju
          </button>

          <p>{user.email}</p>

          <button onClick={logout} style={secondaryButton}>
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
              if (e.target.value) loadItems(e.target.value);
              else setItems([]);
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
  id="quick-add"
  placeholder="Nova stavka"
  value={itemName}
  onChange={(e) => setItemName(e.target.value)}
  style={inputStyle}
/>

          <select value={priority} onChange={(e) => setPriority(e.target.value)} style={inputStyle}>
            <option value="high">🔴 Visoki prioritet</option>
            <option value="medium">🟡 Srednji prioritet</option>
            <option value="low">🟢 Niski prioritet</option>
          </select>

          <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
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
          <h2 style={titleStyle}>🚢 Cruise Templates</h2>

          <select value={template} onChange={(e) => setTemplate(e.target.value)} style={inputStyle}>
            <option value="msc">🚢 MSC Krstarenje</option>
            <option value="zanzibar">🌴 Zanzibar</option>
            <option value="business">💼 Business Trip</option>
          </select>

          <button onClick={loadTemplate} style={goldButton}>
            🚢 Učitaj template
          </button>
        </div>

        <div style={sectionCard}>
          <h2 style={titleStyle}>🤖 AI Generator</h2>
<input
  placeholder="Destinacija"
  value={destination}
  onChange={(e) =>
    setDestination(
      e.target.value
    )
  }
  style={inputStyle}
/>

<div style={{ height: 10 }} />

<input
  placeholder="Broj dana"
  value={tripDays}
  onChange={(e) =>
    setTripDays(
      e.target.value
    )
  }
  style={inputStyle}
/>

<div style={{ height: 10 }} />

<input
  placeholder="Temperatura (npr. 28°C)"
  value={tripTemp}
  onChange={(e) =>
    setTripTemp(
      e.target.value
    )
  }
  style={inputStyle}
/>
<select
  value={flightMode}
  onChange={(e) =>
    setFlightMode(
      e.target.value
    )
  }
  style={inputStyle}
>
  <option value="checked">
    ✈️ Checked baggage
  </option>

  <option value="carryon">
    🧳 Carry-on only
  </option>

  <option value="lowcost">
    💸 Low-cost airline
  </option>
</select>

<div style={{ height: 10 }} />
<div style={{ height: 10 }} />
          <input
            placeholder="npr. MSC krstarenje 7 dana"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            style={inputStyle}
          />
<div style={{ height: 10 }} />

<textarea
  placeholder="Travel notes: hotel, flight, gate, transfer, booking broj..."
  value={travelNotes}
  onChange={(e) =>
    setTravelNotes(
      e.target.value
    )
  }
  style={{
    ...inputStyle,
    minHeight: 100,
    resize: "vertical",
  }}
/>
<div style={{ height: 10 }} />

<textarea
  placeholder="Trip timeline: Day 1 flight + hotel, Day 2 cruise embarkation..."
  value={timeline}
  onChange={(e) =>
    setTimeline(
      e.target.value
    )
  }
  style={{
    ...inputStyle,
    minHeight: 120,
    resize: "vertical",
  }}
/>
<label
  style={{
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
    cursor: "pointer",
  }}
>
  <input
    type="checkbox"
    checked={repackingMode}
    onChange={(e) =>
      setRepackingMode(
        e.target.checked
      )
    }
  />

  🧠 AI Repacking Mode
</label>
          <button onClick={generateAIList} style={goldButton}>
            Generiraj AI listu
          </button>
        </div>

        <div style={sectionCard}>
          <h2 style={{ ...titleStyle, marginBottom: 16 }}>Stavke</h2>
          {mustNotForget.length >
  0 && (
  <div
    style={{
      background:
        "rgba(255,0,0,0.08)",
      border:
        "1px solid rgba(255,0,0,0.18)",
      borderRadius: 22,
      padding: 18,
      marginBottom: 22,
    }}
  >
    <h3
      style={{
        color: "#ff8080",
        marginBottom: 12,
      }}
    >
      🚨 Must Not Forget
    </h3>

    {mustNotForget.map(
      (item) => (
        <div
          key={item.id}
          style={{
            marginBottom: 8,
          }}
        >
          • {item.name}
        </div>
      )
    )}
  </div>
)}
<div
  style={{
    marginBottom: 20,
  }}
>
  <div
    style={{
      display: "flex",
      justifyContent:
        "space-between",
      marginBottom: 8,
      fontSize: 14,
      opacity: 0.8,
    }}
  >
    <span>
      Progress
    </span>

    <span>
      {completedItems} /{" "}
      {totalItems}
    </span>
  </div>

  <div
    style={{
      height: 12,
      background:
        "rgba(255,255,255,0.08)",
      borderRadius: 999,
      overflow: "hidden",
    }}
  >
    <div
      style={{
        width: `${progress}%`,
        height: "100%",
        background:
          "#d4af37",
        transition:
          "0.3s",
      }}
    />
  </div>
</div>
          <button onClick={exportPDF} style={goldButton}>
            📄 PDF
          </button>

          <div style={{ height: 20 }} />

          {items.length === 0 && (
            <p style={{ opacity: 0.7 }}>Nema stavki u odabranoj listi.</p>
          )}

          {Object.entries(groupedItems).map(([cat, catItems]) => (
            <div key={cat} style={{ marginBottom: 30 }}>
              <h3 style={{ color: gold, fontSize: 23, marginBottom: 16 }}>
                {getCategoryIcon(cat)} {cat}
              </h3>

              {(catItems as any[]).map((item) => (
                <div
                  key={item.id}
                  style={{
  background:
    item.priority === "high"
      ? "rgba(255,0,0,0.10)"
      : item.priority === "medium"
      ? "rgba(212,175,55,0.12)"
      : "rgba(0,255,120,0.08)",

  border:
    item.priority === "high"
      ? "1px solid rgba(255,0,0,0.25)"
      : item.priority === "medium"
      ? "1px solid rgba(212,175,55,0.25)"
      : "1px solid rgba(0,255,120,0.2)",

  transition: "all 0.25s ease",

  transform: item.checked
    ? "scale(0.98)"
    : "scale(1)",

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

                    <small style={{ opacity: 0.75 }}>{item.priority || "medium"}</small>
                  </div>

                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      onClick={() => toggleItem(item)}
                      style={{ ...secondaryButton, padding: "10px 12px" }}
                    >
                      {item.checked ? "☑" : "☐"}
                    </button>
<button
  onClick={() => {
    const newName =
      prompt(
        "Uredi stavku",
        item.name
      );

    if (!newName) return;

    updateItem(
      item.id,
      {
        name: newName,
      }
    );
  }}
  style={{
    width: 48,
    height: 48,
    borderRadius: 16,
    border:
      "1px solid rgba(255,255,255,0.08)",
    background:
      "rgba(255,255,255,0.06)",
    color: "white",
    cursor: "pointer",
    fontSize: 18,
  }}
>
  ✏️
</button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      style={{ ...secondaryButton, padding: "10px 12px" }}
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={sectionCard}>
          <h2 style={titleStyle}>Moje liste</h2>
<button
  onClick={exportPDF}
  style={goldButton}
>
  📄 Export PDF
</button>

<div style={{ height: 10 }} />
          {lists.map((list) => (
            <div
              key={list.id}
              style={{
                background: "rgba(255,255,255,0.05)",
                padding: 16,
                borderRadius: 16,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <span>{list.name}</span>

                <button onClick={() => deleteList(list.id)} style={secondaryButton}>
                  🗑
                </button>
              </div>

              <button onClick={() => shareList(list)} style={{ ...goldButton, padding: 12 }}>
                🔗 Podijeli listu
              </button>
            </div>
          ))}
        </div>
      </div>
      <button
  onClick={() => {
    const input =
      document.getElementById(
        "quick-add"
      ) as HTMLInputElement;

    input?.focus();
  }}
  style={{
    position: "fixed",
    right: 24,
    bottom: 24,
    width: 64,
    height: 64,
    borderRadius: "50%",
    border: "none",
    background:
      "#d4af37",
    color: "#000",
    fontSize: 34,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow:
      "0 10px 30px rgba(212,175,55,0.45)",
    zIndex: 999,
    transition:
      "all 0.25s ease",
  }}
>
  +
</button>
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
  background:
    "rgba(15,29,51,0.72)",
  backdropFilter:
    "blur(14px)",
  WebkitBackdropFilter:
    "blur(14px)",
  border:
    "1px solid rgba(255,255,255,0.08)",
  borderRadius: 28,
  padding: 24,
  marginBottom: 20,
  boxShadow:
    "0 10px 40px rgba(0,0,0,0.35)",
};

const titleStyle: React.CSSProperties = {
  marginBottom: 20,
  color: "#d4af37",
};