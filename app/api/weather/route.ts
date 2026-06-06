import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json([]);
  }

  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
    `&timezone=auto&forecast_days=16`;

  const res = await fetch(url);

  if (!res.ok) {
    return NextResponse.json([]);
  }

  const data = await res.json();

  return NextResponse.json({
    currentTemp: data.current?.temperature_2m ?? null,
    daily: data.daily ?? null,
  });
}