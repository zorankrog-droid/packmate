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
  <div style="margin:0;padding:0;background:#071120;font-family:Arial,sans-serif;color:#ffffff;">
    <div style="max-width:560px;margin:0 auto;padding:32px 18px;">
      
      <div style="background:#0f1d33;border-radius:22px;padding:28px;border:1px solid rgba(255,255,255,0.08);">
        
        <div style="text-align:center;margin-bottom:24px;">
          <div style="font-size:42px;margin-bottom:8px;">✈️</div>
          <h1 style="margin:0;color:#fd9644;font-size:30px;">
            PackMate pozivnica
          </h1>
        </div>

        <p style="font-size:17px;line-height:1.6;color:#e8eefc;margin:0 0 18px;">
          <strong>${senderName}</strong> vas je pozvao da se pridružite zajedničkoj listi za pakiranje.
        </p>

        <div style="background:#142542;border-radius:16px;padding:18px;margin:22px 0;">
          <p style="margin:0;color:#94a3b8;font-size:14px;">Naziv liste</p>
          <p style="margin:6px 0 0;color:#ffffff;font-size:22px;font-weight:bold;">
            ${listName}
          </p>
        </div>

        <div style="text-align:center;margin:30px 0;">
          <a href="${shareUrl}"
             style="display:inline-block;background:#fd9644;color:#071120;text-decoration:none;font-weight:bold;font-size:17px;padding:15px 28px;border-radius:14px;">
            Otvori listu
          </a>
        </div>

        <p style="font-size:14px;line-height:1.6;color:#94a3b8;margin:0;">
          Ako gumb ne radi, kopirajte ovaj link u preglednik:<br />
          <span style="color:#fd9644;word-break:break-all;">${shareUrl}</span>
        </p>

      </div>

      <p style="text-align:center;color:#64748b;font-size:13px;margin-top:18px;">
        Poslano putem PackMate aplikacije.
      </p>

    </div>
  </div>
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