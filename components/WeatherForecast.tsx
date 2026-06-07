type ForecastDay = {
  date: string;
  min: number;
  max: number;
  code: number;
};

type WeatherForecastProps = {
  weatherForecast: ForecastDay[];
  startDate: string;
  endDate: string;
};

export default function WeatherForecast({
  weatherForecast,
  startDate,
  endDate,
}: WeatherForecastProps) {
  if (weatherForecast.length === 0) return null;

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString("hr-HR");
  };

  const weatherIcon = (code: number) => {
    if ([0].includes(code)) return "☀️";
    if ([1, 2, 3].includes(code)) return "🌤️";
    if ([45, 48].includes(code)) return "🌫️";
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "🌧️";
    if ([71, 73, 75, 85, 86].includes(code)) return "❄️";
    if ([95, 96, 99].includes(code)) return "⛈️";
    return "🌦️";
  };

  const days: string[] = [];

  if (startDate && endDate) {
    let current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
      days.push(current.toISOString().split("T")[0]);
      current.setDate(current.getDate() + 1);
    }
  }

  return (
    <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
      <div style={{ color: "#fd9644", fontWeight: 700 }}>
        🌦️ Prognoza za dane putovanja
      </div>

      {days.map((date) => {
        const forecastDay = weatherForecast.find((d) => d.date === date);

        return (
          <div
            key={date}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>
              {forecastDay ? weatherIcon(forecastDay.code) : "⏳"}{" "}
              {formatDate(date)}
            </span>

            {forecastDay ? (
              <span>
                {Math.round(forecastDay.min)}°C / {Math.round(forecastDay.max)}
                °C
              </span>
            ) : (
              <span style={{ color: "#fd9644" }}>
                Prognoza još nije dostupna
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}