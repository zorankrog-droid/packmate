import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt = body.prompt || "putovanje";

    const response = await client.responses.create({
      model: "gpt-5.4-mini",
      input: `
Vrati ISKLJUČIVO JSON objekt.

Format mora biti:

{
  "items": [
    {
      "name": "Putovnica",
      "priority": "high",
      "category": "Dokumenti"
    }
  ]
}

Pravila:
- priority može biti samo: high, medium, low
- category može biti samo: Dokumenti, Odjeća, Elektronika, Higijena, Lijekovi, More, Djeca, Putovanje, Posao

Napravi detaljnu packing listu za:
${prompt}

Vrati 15 do 25 stavki.
Bez objašnjenja.
Bez markdowna.
`,
    });

    const text = response.output_text || '{"items":[]}';
    const parsed = JSON.parse(text);

    return Response.json({
      items: Array.isArray(parsed.items) ? parsed.items : [],
    });
  } catch (error) {
    console.log("AI ERROR:", error);

    return Response.json(
      {
        error: "AI greška",
        items: [],
      },
      {
        status: 500,
      }
    );
  }
}