"use client";

import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [user, setUser] = useState<any>(null);

  const [listName, setListName] = useState("");
  const [lists, setLists] = useState<any[]>([]);

  const [itemName, setItemName] = useState("");
  const [priority, setPriority] = useState("medium");
  const [selectedList, setSelectedList] = useState("");
  const [items, setItems] = useState<any[]>([]);

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

  const loadUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUser(user);
    if (user) loadLists(user.id);
  };

  const createList = async () => {
    if (!user) return;

    if (!listName) {
      alert("Upiši naziv liste.");
      return;
    }

    const { error } = await supabase.from("lists").insert({
      name: listName,
      user_id: user.id,
    });

    if (error) alert(error.message);
    else {
      setListName("");
      loadLists(user.id);
    }
  };

  const loadLists = async (userId: string) => {
    const { data, error } = await supabase
      .from("lists")
      .select("*")
      .eq("user_id", userId);

    if (error) alert(error.message);
    else setLists(data || []);
  };

  const deleteList = async (listId: string) => {
    if (!confirm("Želiš li obrisati ovu listu?")) return;

    const { error } = await supabase.from("lists").delete().eq("id", listId);

    if (error) alert(error.message);
    else {
      if (user) loadLists(user.id);

      if (selectedList === listId) {
        setSelectedList("");
        setItems([]);
      }
    }
  };

  const createItem = async () => {
    if (!selectedList) {
      alert("Prvo odaberi listu.");
      return;
    }

    if (!itemName) {
      alert("Upiši naziv stavke.");
      return;
    }

    const { error } = await supabase.from("items").insert({
      name: itemName,
      list_id: selectedList,
      checked: false,
      priority,
    });

    if (error) alert(error.message);
    else {
      setItemName("");
      setPriority("medium");
      loadItems(selectedList);
    }
  };

  const loadItems = async (listId: string) => {
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("list_id", listId);

    if (error) alert(error.message);
    else setItems(data || []);
  };

  const toggleItem = async (item: any) => {
    const { error } = await supabase
      .from("items")
      .update({ checked: !item.checked })
      .eq("id", item.id);

    if (error) alert(error.message);
    else loadItems(selectedList);
  };

  const deleteItem = async (itemId: string) => {
    const { error } = await supabase.from("items").delete().eq("id", itemId);

    if (error) alert(error.message);
    else loadItems(selectedList);
  };

  const exportPDF = () => {
    if (!selectedList) {
      alert("Prvo odaberi listu.");
      return;
    }

    const selectedListName =
      lists.find((list) => list.id === selectedList)?.name || "Packing lista";

    const doc = new jsPDF();

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(20);
    doc.text("PackMate", 20, 20);

    doc.setFontSize(14);
    doc.text(`Lista: ${selectedListName}`, 20, 35);

    let y = 50;

    items.forEach((item) => {
      if (item.priority === "high") {
        doc.setTextColor(220, 38, 38);
      } else if (item.priority === "low") {
        doc.setTextColor(22, 163, 74);
      } else {
        doc.setTextColor(202, 138, 4);
      }

      const status = item.checked ? "[x]" : "[ ]";

      const itemPriority =
        item.priority === "high"
          ? "Visoki"
          : item.priority === "low"
          ? "Niski"
          : "Srednji";

      doc.text(`${status} ${item.name} (${itemPriority})`, 20, y);
      y += 10;
    });

    doc.setTextColor(0, 0, 0);
    doc.save(`${selectedListName}.pdf`);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setLists([]);
    setItems([]);
    setSelectedList("");
  };

  const getPriorityLabel = (priority: string) => {
    if (priority === "high") return "🔴 Visoki";
    if (priority === "low") return "🟢 Niski";
    return "🟡 Srednji";
  };

  const getPriorityColor = (priority: string) => {
    if (priority === "high") return "#ffe5e5";
    if (priority === "low") return "#e7f9ed";
    return "#fff9db";
  };

  useEffect(() => {
    loadUser();
  }, []);

  if (!user) {
    return (
      <main style={{ maxWidth: 400, margin: "50px auto", padding: 20 }}>
        <h1>PackMate</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: 12, marginBottom: 10 }}
        />

        <input
          type="password"
          placeholder="Lozinka"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: 12, marginBottom: 10 }}
        />

        <button onClick={signUp} style={{ padding: 12, marginRight: 10 }}>
          Registracija
        </button>

        <button onClick={signIn} style={{ padding: 12 }}>
          Prijava
        </button>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 750, margin: "50px auto", padding: 20 }}>
      <h1>PackMate</h1>

      <p>Prijavljen: {user.email}</p>

      <button onClick={logout} style={{ marginBottom: 20 }}>
        Logout
      </button>

      <hr />

      <h2>Napravi novu listu</h2>

      <input
        type="text"
        placeholder="Naziv liste"
        value={listName}
        onChange={(e) => setListName(e.target.value)}
        style={{ width: "100%", padding: 12, marginBottom: 10 }}
      />

      <button onClick={createList} style={{ padding: 12 }}>
        Dodaj listu
      </button>

      <hr />

      <h2>Odaberi listu</h2>

      <select
        value={selectedList}
        onChange={(e) => {
          setSelectedList(e.target.value);
          if (e.target.value) loadItems(e.target.value);
          else setItems([]);
        }}
        style={{ width: "100%", padding: 12, marginBottom: 10 }}
      >
        <option value="">Odaberi listu</option>

        {lists.map((list) => (
          <option key={list.id} value={list.id}>
            {list.name}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Nova stavka"
        value={itemName}
        onChange={(e) => setItemName(e.target.value)}
        style={{ width: "100%", padding: 12, marginBottom: 10 }}
      />

      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        style={{ width: "100%", padding: 12, marginBottom: 10 }}
      >
        <option value="high">🔴 Visoki prioritet</option>
        <option value="medium">🟡 Srednji prioritet</option>
        <option value="low">🟢 Niski prioritet</option>
      </select>

      <button onClick={createItem} style={{ padding: 12 }}>
        Dodaj stavku
      </button>

      <hr />

      <h2>Stavke</h2>

      <button onClick={exportPDF} style={{ padding: 12, marginBottom: 20 }}>
        📄 Izvezi PDF
      </button>

      {items.map((item) => (
        <div
          key={item.id}
          style={{
            padding: 12,
            border: "1px solid #ccc",
            marginBottom: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: getPriorityColor(item.priority),
          }}
        >
          <div>
            <button
              onClick={() => toggleItem(item)}
              style={{ marginRight: 10, cursor: "pointer" }}
            >
              {item.checked ? "☑" : "☐"}
            </button>

            <span
              style={{
                textDecoration: item.checked ? "line-through" : "none",
                marginRight: 10,
              }}
            >
              {item.name}
            </span>

            <small>{getPriorityLabel(item.priority)}</small>
          </div>

          <button onClick={() => deleteItem(item.id)}>🗑</button>
        </div>
      ))}

      <hr />

      <h2>Moje liste</h2>

      {lists.map((list) => (
        <div
          key={list.id}
          style={{
            padding: 10,
            border: "1px solid #ccc",
            marginBottom: 10,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{list.name}</span>

          <button onClick={() => deleteList(list.id)}>🗑</button>
        </div>
      ))}
    </main>
  );
}