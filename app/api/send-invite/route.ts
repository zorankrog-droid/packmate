import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, listName, shareUrl, senderName } = await req.json();

    const { error } = await resend.emails.send({
      from: "PackMate <onboarding@resend.dev>",
      to: email,
      subject: `${senderName} vas je pozvao u PackMate listu`,
      html: `
        <h2>✈️ PackMate pozivnica</h2>
        <p>${senderName} vas je pozvao u listu: <b>${listName}</b></p>
        <p><a href="${shareUrl}">Otvori zajedničku listu</a></p>
      `,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}