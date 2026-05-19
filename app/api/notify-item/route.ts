import { NextResponse } from "next/server";
import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { itemName, addedBy } = await req.json();

    const { data: subscriptions, error } =
      await supabaseAdmin
        .from("push_subscriptions")
        .select("subscription");

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    await Promise.all(
      (subscriptions || []).map((row: any) =>
        webpush
          .sendNotification(
            row.subscription,
            JSON.stringify({
              title: "✈️ PackMate",
              body: `${addedBy || "Netko"} je dodao: ${itemName}`,
            })
          )
          .catch(() => null)
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("NOTIFY ERROR:", error);

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}