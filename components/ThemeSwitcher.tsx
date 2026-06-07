type Props = {
  themeName: string;
  setThemeName: (
    theme: "premiumDark" | "travelLight"
  ) => void;
};

export default function ThemeSwitcher({
  themeName,
  setThemeName,
}: Props) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        marginBottom: 20,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 8,
          background: "#081633",
          padding: 6,
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <button
          onClick={() =>
            setThemeName("premiumDark")
          }
          style={{
            border: "none",
            borderRadius: 10,
            padding: "10px 14px",
            cursor: "pointer",
            fontWeight: 700,
            background:
              themeName === "premiumDark"
                ? "#f39c12"
                : "transparent",
            color: "white",
          }}
        >
          🌙 Dark
        </button>

        <button
          onClick={() =>
            setThemeName("travelLight")
          }
          style={{
            border: "none",
            borderRadius: 10,
            padding: "10px 14px",
            cursor: "pointer",
            fontWeight: 700,
            background:
              themeName === "travelLight"
                ? "#f39c12"
                : "transparent",
            color: "white",
          }}
        >
          ☀️ Light
        </button>
      </div>
    </div>
  );
}