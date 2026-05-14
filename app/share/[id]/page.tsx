"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

export default function SharePage({
  params,
}: {
  params: {
    id: string;
  };
}) {
  const [list, setList] =
    useState<any>(null);

  const [items, setItems] =
    useState<any[]>([]);

  useEffect(() => {
    loadSharedList();
  }, []);

  const loadSharedList =
    async () => {
      const { data: listData } =
        await supabase
          .from("lists")
          .select("*")
          .eq(
            "share_id",
            params.id
          )
          .single();

      if (!listData) return;

      setList(listData);

      const {
        data: itemsData,
      } = await supabase
        .from("items")
        .select("*")
        .eq(
          "list_id",
          listData.id
        );

      setItems(itemsData || []);
    };

  if (!list) {
    return (
      <main
        style={{
          minHeight:
            "100vh",
          background:
            "#071120",
          color: "white",
          display: "flex",
          justifyContent:
            "center",
          alignItems:
            "center",
          padding: 20,
        }}
      >
        <h1>
          Lista nije pronađena
        </h1>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#071120",
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
        <div
          style={{
            background:
              "#0f1d33",
            borderRadius: 24,
            padding: 24,
          }}
        >
          <h1
            style={{
              color: "#d4af37",
              marginBottom: 10,
            }}
          >
            ✈️ Shared PackMate lista
          </h1>

          <h2>
            {list.name}
          </h2>

          <div
            style={{
              marginTop: 30,
            }}
          >
            {items.map(
              (
                item,
                index
              ) => (
                <div
                  key={index}
                  style={{
                    background:
                      "rgba(255,255,255,0.06)",
                    padding: 18,
                    borderRadius: 18,
                    marginBottom: 14,
                  }}
                >
                  <div
                    style={{
                      fontSize: 18,
                    }}
                  >
                    {item.checked
                      ? "☑"
                      : "☐"}{" "}
                    {item.name}
                  </div>

                  <small
                    style={{
                      opacity: 0.7,
                    }}
                  >
                    {
                      item.priority
                    }{" "}
                    •{" "}
                    {
                      item.category
                    }
                  </small>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </main>
  );
}