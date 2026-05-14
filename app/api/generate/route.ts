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
Ti si premium travel packing AI za putovanja, krstarenja, hotele, avion, obitelj i business putovanja.

Vrati ISKLJUČIVO JSON objekt.

Format:
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
- category može biti samo:
Dokumenti, Odjeća, Elektronika, Higijena, Lijekovi, More, Djeca, Putovanje, Posao

Ako je krstarenje, dodaj:
- formal night odjeću
- kupaći
- dokumente
- izlete
- večernju odjeću
- lijekove protiv mučnine

Ako je topla destinacija, dodaj:
- SPF kremu
- šešir
- laganu odjeću
- sunčane naočale

Ako je business put:
- laptop
- punjače
- dokumente
- poslovnu odjeću

Ako su djeca:
- igračke
- lijekove
- rezervnu odjeću

Napravi ultra pametnu packing listu za:
${prompt}

Obavezno prilagodi:
- vremenskim uvjetima
- sezoni
- temperaturi
- kiši
- toplini
- hladnoći
- destinaciji
- tipu putovanja
- avionu
- krstarenju
- poslovnom putu
- djeci
- plaži
- izletima

Vrati 25 do 40 vrlo relevantnih stavki.
Dodaj količine gdje ima smisla.
Primjer:
- 5 majica
- 2 kupaća kostima
- 3 para čarapa
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