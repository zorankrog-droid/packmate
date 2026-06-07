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
      <select
        value={themeName}
        onChange={(e) =>
          setThemeName(
            e.target.value as
              | "premiumDark"
              | "travelLight"
          )
        }
        style={{
          padding: "10px 14px",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.15)",
          background: "#0f1d33",
          color: "white",
          cursor: "pointer",
        }}
      >
        <option value="premiumDark">
          🌙 Premium Dark
        </option>

        <option value="travelLight">
          ☀️ Travel Light
        </option>
      </select>
    </div>
  );
}