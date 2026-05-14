export async function POST(req: Request) {
  try {
    const body = await req.json();

    const city = body.city;

    const apiKey =
      process.env.OPENWEATHER_API_KEY;

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );

    const data = await response.json();

    return Response.json({
      temp: data.main?.temp,
      weather:
        data.weather?.[0]?.main,
      description:
        data.weather?.[0]
          ?.description,
    });
  } catch (error) {
    return Response.json(
      {
        error:
          "Weather error",
      },
      {
        status: 500,
      }
    );
  }
}