import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  if (!q || q.trim().length < 2) {
    return NextResponse.json([]);
  }

  try {
    const res = await fetch(
      `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${encodeURIComponent(q)}&limit=10&sort=-population`,
      {
        headers: {
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY || "",
          "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
        },
      }
    );

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: true, status: res.status, message: text });
    }

    const data = await res.json();

    return NextResponse.json(
      data.data.map((city: any) => ({
        id: city.id,
        name: `${city.name}, ${city.country}`,
        city: city.name,
        country: city.country,
        region: city.region,
        lat: city.latitude,
        lon: city.longitude,
      }))
    );
  } catch (error: any) {
    return NextResponse.json({
      error: true,
      message: error?.message || "Unknown error",
    });
  }
}