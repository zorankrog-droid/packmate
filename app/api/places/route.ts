import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  if (!q || q.trim().length < 2) {
    return NextResponse.json([]);
  }

  try {
    const res = await fetch(
      `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${encodeURIComponent(
        q
      )}&limit=8&sort=-population`,
      {
        headers: {
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY || "",
          "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json([]);
    }

    const data = await res.json();

    const places = data.data.map((city: any) => ({
      id: city.id,
      name: `${city.name}, ${city.country}`,
      city: city.name,
      country: city.country,
      region: city.region,
      lat: city.latitude,
      lon: city.longitude,
    }));

    return NextResponse.json(places);
  } catch {
    return NextResponse.json([]);
  }
}