import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  if (!q || q.trim().length < 2) {
    return NextResponse.json([]);
  }

  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=8&addressdetails=1&q=${encodeURIComponent(q)}`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "PackMate/1.0",
    },
  });

  if (!res.ok) {
    return NextResponse.json([]);
  }

  const data = await res.json();

  const places = data.map((place: any) => ({
    id: place.place_id,
    name: place.display_name,
    lat: place.lat,
    lon: place.lon,
  }));

  return NextResponse.json(places);
}