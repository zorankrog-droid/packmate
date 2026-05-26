"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<any>(null);

  const [lists, setLists] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
const [templateName, setTemplateName] = useState("");
const [selectedTemplate, setSelectedTemplate] = useState("");
const [templateItemName, setTemplateItemName] = useState("");
const [templateItems, setTemplateItems] = useState<any[]>([]);

const [selectedList, setSelectedList] = useState("");

const [startDate, setStartDate] = useState("");
const [endDate, setEndDate] = useState("");

const [isGenerating, setIsGenerating] = useState(false);
const [generateStatus, setGenerateStatus] = useState("");

  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const listFromUrl = params.get("list");

  const savedList =
    listFromUrl || localStorage.getItem("packmate-selected-list");

  if (savedList) {
    setSelectedList(savedList);
    localStorage.setItem("packmate-selected-list", savedList);
    loadItems(savedList);
  }
}, []);

  const [items, setItems] = useState<any[]>([]);

  const [listName, setListName] = useState("");
  const [shareEmail, setShareEmail] = useState("");
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
  const [adults, setAdults] =
  useState(1);

const [kids, setKids] =
  useState(0);

const [babies, setBabies] =
  useState(0);
  const [stayMode, setStayMode] =
  useState("hotel");
  const [template, setTemplate] = useState("msc");
  const [showTemplates, setShowTemplates] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
const [isOffline, setIsOffline] =
  useState(() => {
    if (typeof navigator === "undefined") {
      return false;
    }

    return !navigator.onLine;
  });
  
 const loadUser = async () => {
  if (isOffline) return;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUser(user);

if (user) {
  loadLists(user);
  loadTemplates();
}
  } catch {
    setIsOffline(true);
  }
};

useEffect(() => {
  if (!isOffline) {
    loadUser();
  }
}, [isOffline]);
useEffect(() => {
  if (!isOffline) return;

  const savedLists =
    localStorage.getItem("packmate-lists");

  const savedItems =
    localStorage.getItem("packmate-items");

  const savedSelectedList =
    localStorage.getItem(
      "packmate-selected-list"
    );

  if (savedLists) {
    setLists(JSON.parse(savedLists));
  }

  if (savedItems) {
    setItems(JSON.parse(savedItems));
  }

  if (savedSelectedList) {
    setSelectedList(savedSelectedList);
  }

  setUser({
    email: "Offline mode",
  });
}, [isOffline]);

useEffect(() => {
  localStorage.setItem(
    "packmate-selected-list",
    selectedList
  );
}, [selectedList]);

useEffect(() => {
  const handler = (e: any) => {
    setDeferredPrompt(e);
  };

  window.addEventListener(
    "beforeinstallprompt",
    handler
  );

  return () => {
    window.removeEventListener(
      "beforeinstallprompt",
      handler
    );
  };
}, []);

useEffect(() => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js");
  }
}, []);

useEffect(() => {
  const updateOnlineStatus = () => {
    setIsOffline(!navigator.onLine);
  };

  updateOnlineStatus();

  window.addEventListener(
    "online",
    updateOnlineStatus
  );

  window.addEventListener(
    "offline",
    updateOnlineStatus
  );

  return () => {
    window.removeEventListener(
      "online",
      updateOnlineStatus
    );

    window.removeEventListener(
      "offline",
      updateOnlineStatus
    );
  };
}, []);

useEffect(() => {
  if (!selectedList) return;

  const channel = supabase
    .channel(`main-items-${selectedList}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "items",
        filter: `list_id=eq.${selectedList}`,
      },
      () => {
        loadItems(selectedList);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [selectedList]);

useEffect(() => {
  if (!isOffline && user) {
    syncOfflineLists();
  }

}, [isOffline, user]);
  const signUp = async () => {
  if (isOffline) {
    alert(
      "Offline si. Registracija nije dostupna bez interneta."
    );
    return;
  }

  const { error } =
    await supabase.auth.signUp({
      email,
      password,
    });

  if (error) {
    alert(error.message);
  } else {
    alert("Registracija uspješna!");
  }
};
    
  const signIn = async () => {
    if (isOffline) {
  alert("Offline si. Login nije dostupan bez interneta.");
  return;
}
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

  const loadLists = async (currentUser: any = user) => {
  if (!currentUser) return;

  const { data: ownedLists } = await supabase
    .from("lists")
    .select("*")
    .eq("user_id", currentUser.id);

  const { data: memberLists } = await supabase
    .from("list_members")
    .select(`
      list_id,
      lists (*)
    `)
    .eq("user_id", currentUser.id);

  const shared =
    memberLists
      ?.map((m: any) => m.lists)
      .filter(Boolean) || [];

  const allLists = [...(ownedLists || []), ...shared];

  setLists(allLists);
};
const loadTemplates = async () => {
  const { data } = await supabase
    .from("templates")
    .select("*")
    .order("created_at", { ascending: false });

  setTemplates(data || []);
};
  
const createTemplate = async () => {
  if (!templateName || !user) return;

  const { error } = await supabase.from("templates").insert({
    name: templateName,
    user_id: user.id,
  });

  if (error) {
    alert("Greška kod spremanja templatea: " + error.message);
    return;
  }

  setTemplateName("");
  setSelectedList("");
setItems([]);
localStorage.removeItem("packmate-selected-list");
  loadTemplates();
};
const addTemplateItem = async () => {
  if (!selectedTemplate || !templateItemName) return;

  const { error } = await supabase
    .from("template_items")
    .insert({
      template_id: selectedTemplate,
      name: templateItemName,
      category: "Putovanje",
      priority: "medium",
    });

  if (error) {
    alert("Greška: " + error.message);
    return;
  }

  setTemplateItemName("");
  alert("Stavka dodana u template!");
};

const loadSelectedTemplateItems = async (templateId: string) => {
  const { data, error } = await supabase
    .from("template_items")
    .select("*")
    .eq("template_id", templateId)
    .order("created_at", { ascending: true });

  if (error) {
    alert("Greška kod učitavanja stavki templatea: " + error.message);
    return;
  }

  setTemplateItems(data || []);
};

const deleteTemplateItem = async (itemId: string) => {
  const confirmed = confirm("Želite li obrisati ovu stavku iz templatea?");

  if (!confirmed) return;

  const { error } = await supabase
    .from("template_items")
    .delete()
    .eq("id", itemId);

  if (error) {
    alert("Greška kod brisanja stavke: " + error.message);
    return;
  }

  if (selectedTemplate) {
    loadSelectedTemplateItems(selectedTemplate);
  }
};

const editTemplateItem = async (item: any) => {
  const newName = prompt("Uredi naziv stavke:", item.name);

  if (!newName) return;

  const { error } = await supabase
    .from("template_items")
    .update({ name: newName })
    .eq("id", item.id);

  if (error) {
    alert("Greška kod uređivanja stavke: " + error.message);
    return;
  }

  if (selectedTemplate) {
    loadSelectedTemplateItems(selectedTemplate);
  }
};

const deleteTemplate = async (templateId: string) => {
  const confirmed = confirm("Želite li obrisati cijeli template?");

  if (!confirmed) return;

  const { error } = await supabase
    .from("templates")
    .delete()
    .eq("id", templateId);

  if (error) {
    alert("Greška kod brisanja templatea: " + error.message);
    return;
  }

  setSelectedTemplate("");
  setTemplateItems([]);
  loadTemplates();
};

const editTemplate = async (template: any) => {
  const newName = prompt(
    "Uredi naziv templatea:",
    template.name
  );

  if (!newName) return;

  const { error } = await supabase
    .from("templates")
    .update({ name: newName })
    .eq("id", template.id);

  if (error) {
    alert(
      "Greška kod uređivanja templatea: " +
        error.message
    );
    return;
  }

  loadTemplates();
};

const setDefaultTemplate = async (templateId: string) => {
  if (!user) return;

  await supabase
    .from("templates")
    .update({ is_default: false })
    .eq("user_id", user.id);

  const { error } = await supabase
    .from("templates")
    .update({ is_default: true })
    .eq("id", templateId);

  if (error) {
    alert("Greška kod postavljanja zadanog templatea: " + error.message);
    return;
  }

  loadTemplates();
};

const loadTemplateItems = async () => {
  if (!selectedTemplate || !selectedList) {
    alert("Odaberi template i listu");
    return;
  }

  const { data, error } = await supabase
    .from("template_items")
    .select("*")
    .eq("template_id", selectedTemplate);

  if (error) {
    alert("Greška: " + error.message);
    return;
  }

  if (!data || data.length === 0) {
    alert("Template nema stavki");
    return;
  }

  const itemsToInsert = data.map((item) => ({
    list_id: selectedList,
    name: item.name,
    category: item.category,
    priority: item.priority,
    checked: false,
    added_by: user?.email || "Korisnik",
  }));

  const { error: insertError } = await supabase
    .from("items")
    .insert(itemsToInsert);

  if (insertError) {
    alert("Greška kod učitavanja templatea: " + insertError.message);
    return;
  }

  loadItems(selectedList);
  alert("Template učitan!");
};

const createListFromTemplate = async () => {
  if (!selectedTemplate || !listName || !user) {
    alert("Odaberi template i upiši naziv liste");
    return;
  }

  const { data: newList, error: listError } =
    await supabase
      .from("lists")
      .insert({
        name: listName,
        user_id: user.id,
      })
      .select()
      .single();

  if (listError || !newList) {
    alert("Greška kod kreiranja liste");
    return;
  }

  const { data: templateData, error: templateError } =
    await supabase
      .from("template_items")
      .select("*")
      .eq("template_id", selectedTemplate);

  if (templateError || !templateData) {
    alert("Greška kod učitavanja templatea");
    return;
  }

  const itemsToInsert = templateData.map((item) => ({
    list_id: newList.id,
    name: item.name,
    category: item.category,
    priority: item.priority,
    checked: false,
    added_by: user.email,
  }));

  await supabase
    .from("items")
    .insert(itemsToInsert);

  setSelectedList(newList.id);

  loadLists(user);
  loadItems(newList.id);

  alert("Lista kreirana iz templatea!");
};

const createList = async () => {
  if (!listName) return;

  if (isOffline) {
    const newList = {
      id: `offline-${Date.now()}`,
      name: listName,
      offline: true,
    };

    const updatedLists = [...lists, newList];

    setLists(updatedLists);

    localStorage.setItem(
      "packmate-lists",
      JSON.stringify(updatedLists)
    );

    setListName("");
    return;
  }

  if (!user) return;

  await supabase.from("lists").insert({
    name: listName,
    user_id: user.id,
  });

  setListName("");
  loadLists();
};

const shareSelectedList = async () => {
  if (!selectedList || !shareEmail) return;

  const { data: targetUser } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", shareEmail)
    .single();

  if (!targetUser) {
    alert("Korisnik s tim emailom nije pronađen.");
    return;
  }

  await supabase.from("list_members").insert({
    list_id: selectedList,
    user_id: targetUser.id,
  });

  setShareEmail("");
  alert("Lista je podijeljena!");
};

const syncOfflineLists = async () => {
  if (!user || isOffline) return;

  const offlineLists = lists.filter(
    (list) => list.offline
  );

  if (offlineLists.length === 0) return;

  for (const list of offlineLists) {

  const { data: insertedList } = await supabase
    .from("lists")
    .insert({
      name: list.name,
      user_id: user.id,
    })
    .select()
    .single();

  const offlineItems = JSON.parse(
    localStorage.getItem(
      `packmate-items-${list.id}`
    ) || "[]"
  );

  for (const item of offlineItems) {
    await supabase.from("items").insert({
  list_id: insertedList.id,
  name: item.name,
  checked: item.checked || false,
  priority: item.priority || "medium",
  category: item.category || "Putovanje",
});
  }

  localStorage.removeItem(
    `packmate-items-${list.id}`
  );
}

  const syncedLists = lists.filter(
    (list) => !list.offline
  );

  setLists(syncedLists);

  localStorage.setItem(
    "packmate-lists",
    JSON.stringify(syncedLists)
  );

  loadLists();
};
  const deleteList = async (id: string) => {
    if (!confirm("Želiš li obrisati listu?")) return;

    await supabase.from("lists").delete().eq("id", id);

    if (user) loadLists();

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

      if (user) loadLists();
    }

    const shareUrl = `${window.location.origin}/share/${shareId}`;
    const response = await fetch("/api/send-invite", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: shareEmail,
    listName: list.name,
    shareUrl,
    senderName: user?.email || "PackMate korisnik",
  }),
});

if (!response.ok) {
  alert("Greška kod slanja emaila");
  return;
}

setShareEmail("");
alert("Pozivnica poslana!");
  };

  const loadItems = async (listId: string) => {
  // OFFLINE MODE
  if (isOffline) {
  const savedItems = JSON.parse(
    localStorage.getItem(`packmate-items-${listId}`) || "[]"
  );

  setItems(savedItems);
  return;
}

  const { data } = await supabase
    .from("items")
    .select("*")
    .eq("list_id", listId);

  setItems(data || []);

  localStorage.setItem(
  `packmate-items-${listId}`,
  JSON.stringify(data || [])
);
};

useEffect(() => {
  if (!selectedList) return;

  const channel = supabase
    .channel(`items-${selectedList}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "items",
        filter: `list_id=eq.${selectedList}`,
      },
      () => {
        loadItems(selectedList);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [selectedList]);

  const createItem = async () => {
  if (!selectedList || !itemName) return;

  // OFFLINE MODE
  if (isOffline) {
    const newItem = {
      id: Date.now().toString(),
      name: itemName,
      list_id: selectedList,
      checked: false,
      priority,
      category,
      offline: true,
      added_by: user?.email || "Korisnik",
    };

    const updatedItems = [...items, newItem];

    setItems(updatedItems);

    localStorage.setItem(
  `packmate-items-${selectedList}`,
  JSON.stringify(updatedItems)
);

    setItemName("");

    return;
  }

  await supabase.from("items").insert({
    name: itemName,
    list_id: selectedList,
    checked: false,
    priority,
    category,
    added_by: user?.email || "Korisnik",
  });

  await fetch("/api/notify-item", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    itemName,
    addedBy: user?.email || "Korisnik",
    senderEndpoint: JSON.parse(
  localStorage.getItem("packmate-push-subscription") || "{}"
).endpoint,
listId: selectedList,
  }),
});

  setItemName("");
  loadItems(selectedList);
};

  const toggleItem = async (item: any) => {
  if (isOffline) {
    const updatedItems = items.map((i) =>
      i.id === item.id
        ? { ...i, checked: !i.checked }
        : i
    );

    setItems(updatedItems);

    localStorage.setItem(
      "packmate-items",
      JSON.stringify(updatedItems)
    );

    return;
  }

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
  if (isOffline) {
    const updatedItems = items.map((item) =>
      item.id === id
        ? { ...item, ...updates }
        : item
    );

    setItems(updatedItems);

    localStorage.setItem(
      "packmate-items",
      JSON.stringify(updatedItems)
    );

    return;
  }

  await supabase
    .from("items")
    .update(updates)
    .eq("id", id);

  loadItems(selectedList);
};
const deleteItem = async (id: string) => {
  if (isOffline) {
    const updatedItems = items.filter(
      (item) => item.id !== id
    );

    setItems(updatedItems);

    localStorage.setItem(
      "packmate-items",
      JSON.stringify(updatedItems)
    );

    return;
  }

  await supabase
    .from("items")
    .delete()
    .eq("id", id);

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
    setIsGenerating(true);
setGenerateStatus("Pripremam podatke za AI...");
    let realWeather = "";
    if (!selectedList) {
      alert("Prvo odaberi listu.");
      setIsGenerating(false);
      return;
    }

    if (!aiPrompt) {
      alert("Upiši opis putovanja.");
      setIsGenerating(false);
      return;
    }
    
    setGenerateStatus("Provjeravam vremensku prognozu...");
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
setGenerateStatus("AI izrađuje pametnu listu...");

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

Datum putovanja:
Od ${startDate}
Do ${endDate}

Vrijeme:
${realWeather}
Flight mode:
${flightMode}
Stay mode:
${stayMode}
Travelers:
Adults: ${adults}
Kids: ${kids}
Babies: ${babies}
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

setGenerateStatus("Spremam stavke u tvoju listu...");

    for (const item of data.items) {
      await supabase.from("items").insert({
        name: item.name,
        priority: item.priority || "medium",
        category: item.category || "Putovanje",
        bag: item.bag || "checked",
        checked: false,
        list_id: selectedList,
      });
    }
setGenerateStatus("Lista je uspješno generirana!");
setIsGenerating(false);
    setAiPrompt("");
    loadItems(selectedList);
    alert("AI lista generirana!");
  };

  const installApp = async () => {
  if (!deferredPrompt) {
    alert(
      "Ako se instalacija ne otvori automatski, klikni tri točkice u Chromeu i odaberi 'Dodaj na početni zaslon'."
    );
    return;
  }

  deferredPrompt.prompt();

  await deferredPrompt.userChoice;

  setDeferredPrompt(null);
};
const subscribeToPush = async () => {
  if (!("serviceWorker" in navigator)) {
    alert("Push notifikacije nisu podržane.");
    return;
  }

  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    alert("Notifikacije nisu dopuštene.");
    return;
  }

  const registration = await navigator.serviceWorker.ready;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey:
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  });

  localStorage.setItem(
    "packmate-push-subscription",
    JSON.stringify(subscription)
  );

if (user) {
console.log("USER:", user);
console.log("SPREMANJE PRETPLATE...");

  const { error } = await supabase
  .from("push_subscriptions")
  .upsert({
    user_id: user.id,
    subscription,
    endpoint: subscription.endpoint,
  }, {
    onConflict: "endpoint",
  });

if (error) {
  console.error("PUSH INSERT ERROR:", error);
}
}

  alert("Push notifikacije su uključene!");
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
    const highPriorityMissing =
  items.filter(
    (item) =>
      item.priority ===
        "high" &&
      !item.checked
  ).length;

const packingScore = Math.max(
  0,
  100 -
    highPriorityMissing * 10
);
const estimatedWeight =
  items.length * 0.4;

const carryOnWarning =
  flightMode ===
    "carryon" &&
  estimatedWeight > 8;
  const smartAlerts: string[] = [];

if (carryOnWarning) {
  smartAlerts.push(
    "⚠️ Carry-on možda pretežak"
  );
}

if (
  destination
    .toLowerCase()
    .includes("london")
) {
  smartAlerts.push(
    "🌧️ Moguća kiša u Londonu"
  );
}

if (
  stayMode === "cruise"
) {
  smartAlerts.push(
    "🚢 Provjeri embarkation dokumente"
  );
}

if (
  flightMode ===
  "lowcost"
) {
  smartAlerts.push(
    "🧳 Provjeri dimenzije low-cost prtljage"
  );
}
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
<div
  style={{
    marginBottom: 16,
    padding: "8px 12px",
    borderRadius: 999,
    background: isOffline
      ? "#7f1d1d"
      : "#14532d",
    color: "white",
    fontSize: 14,
    display: "inline-block",
  }}
>
  {isOffline ? "🔴 Offline način rada" : "🟢 Online"}
</div>
          <button onClick={installApp} style={{ ...goldButton, marginBottom: 16 }}>
            📲 Instaliraj aplikaciju
          </button>

<button
  onClick={subscribeToPush}
  style={{
    ...goldButton,
    marginBottom: 16,
    marginLeft: 10,
  }}
>
  🔔 Uključi notifikacije
</button>
          <p>{user.email}</p>

          <button onClick={logout} style={secondaryButton}>
            Logout
          </button>
        </div>
        
        <div style={sectionCard}>
  <div
  onClick={() => setShowTemplates(!showTemplates)}
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    marginBottom: 12,
  }}
>
  <h2 style={titleStyle}>Moji templatei</h2>

  <span style={{ color: "#d4af37", fontSize: 22 }}>
    {showTemplates ? "−" : "+"}
  </span>
</div>

{showTemplates && (
  <div>

  <input
    placeholder="Naziv templatea"
    value={templateName}
    onChange={(e) => setTemplateName(e.target.value)}
    style={inputStyle}
  />

  <button onClick={createTemplate} style={goldButton}>
    Dodaj template
  </button>

<input
  placeholder="Nova stavka templatea"
  value={templateItemName}
  onChange={(e) => setTemplateItemName(e.target.value)}
  style={{
    ...inputStyle,
    marginTop: 18,
  }}
/>

</div>
)}

<div style={{ display: "grid", gap: 12, marginTop: 12 }}>
  <button
    onClick={addTemplateItem}
    style={goldButton}
  >
    ➕ Dodaj stavku u template
  </button>

  <button
    onClick={loadTemplateItems}
    style={secondaryButton}
  >
    📥 Učitaj template u listu
  </button>
</div>

<div>
  {templates.map((t) => (
  <div
    key={t.id}
    style={{
      ...secondaryButton,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      marginTop: 12,
      border:
        selectedTemplate === t.id
          ? "2px solid gold"
          : "2px solid transparent",
    }}
  >
    <span
      onClick={() => {
        setSelectedTemplate(t.id);
        loadSelectedTemplateItems(t.id);
      }}
      style={{ flex: 1, cursor: "pointer" }}
    >
      {t.name}
    </span>

<button
  onClick={() => setDefaultTemplate(t.id)}
  style={{
    background: "transparent",
    border: "none",
    color: t.is_default ? "#d4af37" : "#888",
    fontSize: 18,
    cursor: "pointer",
    marginRight: 8,
  }}
>
  {t.is_default ? "⭐" : "☆"}
</button>

<button
  onClick={() => editTemplate(t)}
  style={{
    background: "transparent",
    border: "none",
    color: "#d4af37",
    fontSize: 18,
    cursor: "pointer",
    marginRight: 8,
  }}
>

  ✏️
</button>

    <button
      onClick={() => deleteTemplate(t.id)}
      style={{
        background: "transparent",
        border: "none",
        color: "#ff6b6b",
        fontSize: 18,
        cursor: "pointer",
      }}
    >
      🗑️
    </button>
  </div>
))}

  {templateItems.length > 0 && (
    <div style={{ marginTop: 14 }}>
      <p style={{ opacity: 0.7 }}>Stavke u templateu:</p>

      {templateItems.map((item) => (
  <div
    key={item.id}
    style={{
      ...secondaryButton,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    <span>• {item.name}</span>

<button
  onClick={() => editTemplateItem(item)}
  style={{
    background: "transparent",
    border: "none",
    color: "#d4af37",
    fontSize: 18,
    cursor: "pointer",
    marginRight: 8,
  }}
>
  ✏️
</button>

    <button
      onClick={() => deleteTemplateItem(item.id)}
      style={{
        background: "transparent",
        border: "none",
        color: "#ff6b6b",
        fontSize: 18,
        cursor: "pointer",
      }}
    >
      🗑️
    </button>
  </div>
))}
    </div>
  )}
</div>

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
<button
  onClick={createListFromTemplate}
  style={secondaryButton}
>
  🚀 Kreiraj listu iz templatea
</button>

        <div style={sectionCard}>
          <h2 style={titleStyle}>Odaberi listu</h2>

          <select
            value={selectedList}
            onChange={(e) => {
              setSelectedList(e.target.value);

localStorage.setItem(
  "packmate-selected-list",
  e.target.value
);
              
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
          <div style={{ marginTop: 10 }}>
  <input
    type="email"
    placeholder="Email korisnika"
    value={shareEmail}
    onChange={(e) => setShareEmail(e.target.value)}
    style={inputStyle}
  />

  <button onClick={shareSelectedList}>
    Podijeli listu
  </button>
</div>
          <button
  onClick={() => {
    const list = lists.find((l) => l.id === selectedList);
    if (!list) return;

    shareList(list);
  }}
  style={{
    ...goldButton,
    marginTop: 12,
  }}
>
  🔗 Podijeli listu
</button>
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

<div style={{ display: "grid", gap: 12 }}>
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
    <label>
      <div style={{ marginBottom: 6, opacity: 0.7 }}>Od</div>
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        style={inputStyle}
      />
    </label>

    <label>
      <div style={{ marginBottom: 6, opacity: 0.7 }}>Do</div>
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        style={inputStyle}
      />
    </label>
  </div>

  <input
    placeholder="Broj dana"
    value={
      startDate && endDate
        ? Math.max(
            1,
            Math.ceil(
              (new Date(endDate).getTime() -
                new Date(startDate).getTime()) /
                (1000 * 60 * 60 * 24)
            ) + 1
          )
        : ""
    }
    readOnly
    style={{
      ...inputStyle,
      opacity: 0.7,
    }}
  />
</div>

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
<div
  style={{
    display: "grid",
    gridTemplateColumns:
      "1fr 1fr 1fr",
    gap: 10,
    marginBottom: 10,
  }}
>
  <div>
    <div
      style={{
        fontSize: 12,
        marginBottom: 6,
        opacity: 0.7,
      }}
    >
      👨 Adults
    </div>

    <input
      type="number"
      min="1"
      value={adults}
      onChange={(e) =>
        setAdults(
          Number(
            e.target.value
          )
        )
      }
      style={inputStyle}
    />
  </div>

  <div>
    <div
      style={{
        fontSize: 12,
        marginBottom: 6,
        opacity: 0.7,
      }}
    >
      🧒 Kids
    </div>

    <input
      type="number"
      min="0"
      value={kids}
      onChange={(e) =>
        setKids(
          Number(
            e.target.value
          )
        )
      }
      style={inputStyle}
    />
  </div>

  <div>
    <div
      style={{
        fontSize: 12,
        marginBottom: 6,
        opacity: 0.7,
      }}
    >
      👶 Babies
    </div>

    <input
      type="number"
      min="0"
      value={babies}
      onChange={(e) =>
        setBabies(
          Number(
            e.target.value
          )
        )
      }
      style={inputStyle}
    />
  </div>
</div>
<select
  value={stayMode}
  onChange={(e) => setStayMode(e.target.value)}
  style={inputStyle}
>
  <option value="hotel">🏨 Hotel</option>
  <option value="apartment">🏡 Apartment</option>
  <option value="cruise">🚢 Cruise ship</option>
  <option value="resort">🌴 Resort</option>
  <option value="camping">⛺ Camping</option>
  <option value="business_hotel">💼 Business hotel</option>
</select>

<div style={{ height: 10 }} />
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
          <button
  onClick={generateAIList}
  style={goldButton}
  disabled={isGenerating}
>
  {isGenerating
    ? "⏳ AI generira listu..."
    : "✨ Generiraj AI listu"}
</button>

{isGenerating && (
  <div
    style={{
      color: "#d4af37",
      marginTop: 12,
      fontSize: 14,
      fontWeight: 600,
    }}
  >
    ⏳ {generateStatus}
  </div>
)}

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
    marginBottom: 10,
    fontSize: 14,
    opacity: 0.85,
  }}
>
  🎯 Packing Score:
  {packingScore}%
  <div
  style={{
    marginTop: 8,
    fontSize: 14,
    opacity: 0.85,
  }}
>
  📦 Estimated weight:
  {estimatedWeight.toFixed(1)}
  kg
</div>
{smartAlerts.length > 0 && (
  <div
    style={{
      marginTop: 14,
      padding: 12,
      borderRadius: 12,
      background:
        "rgba(255,255,255,0.05)",
    }}
  >
    <div
      style={{
        fontWeight: 700,
        marginBottom: 8,
      }}
    >
      🔔 Smart Alerts
    </div>

    {smartAlerts.map(
      (alert, index) => (
        <div
          key={index}
          style={{
            marginBottom: 6,
            fontSize: 14,
            opacity: 0.9,
          }}
        >
          {alert}
        </div>
      )
    )}
  </div>
)}
{carryOnWarning && (
  <div
    style={{
      marginTop: 8,
      color: "#ffb84d",
      fontSize: 13,
    }}
  >
    ⚠️ Carry-on limit
    možda prekoračen
  </div>
)}
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

                    <div
  style={{
    display: "flex",
    gap: 10,
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 6,
  }}
>
  <small style={{ opacity: 0.75 }}>
    {item.priority || "medium"}
  </small>

  <small
    style={{
      background: "rgba(212,175,55,0.15)",
      color: "#d4af37",
      padding: "4px 8px",
      borderRadius: 10,
      fontSize: 11,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    }}
  >
    {item.bag === "backpack"
      ? "🎒 Backpack"
      : item.bag === "carryon"
      ? "💼 Carry-on"
      : item.bag === "kids"
      ? "🧒 Kids bag"
      : "🧳 Checked"}
  </small>
</div>

                    <div style={{ opacity: 0.6, fontSize: 12, marginTop: 4 }}>
  dodao: {item.added_by || "Gost"}
</div>
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
                <span
  onClick={() => {
    setSelectedList(list.id);

    localStorage.setItem(
      "packmate-selected-list",
      list.id
    );

    loadItems(list.id);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }}
  style={{
    cursor: "pointer",
    flex: 1,
    fontWeight:
      selectedList === list.id
        ? 700
        : 400,
    color:
      selectedList === list.id
        ? "#d4af37"
        : "white",
  }}
>
  {list.name}
</span>

                <button onClick={() => deleteList(list.id)} style={secondaryButton}>
                  🗑
                </button>
              </div>

              
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
    "1px solid rgba(32, 3, 3, 0.08)",
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
