import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasKey: !!process.env.RAPIDAPI_KEY,
    keyLength: process.env.RAPIDAPI_KEY?.length || 0,
  });
}