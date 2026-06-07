import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import type { DateRange } from "react-day-picker";

type Props = {
  range: DateRange | undefined;
  setRange: (range: DateRange | undefined) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  showCalendar: boolean;
  setShowCalendar: (show: boolean) => void;
  inputStyle: React.CSSProperties;
  formatDate: (date: string) => string;
};

export default function DateRangePicker({
  range,
  setRange,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  showCalendar,
  setShowCalendar,
  inputStyle,
  formatDate,
}: Props) {
  const toLocalDateString = (date: Date) => {
    return (
      date.getFullYear() +
      "-" +
      String(date.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(date.getDate()).padStart(2, "0")
    );
  };

  return (
    <div style={{ position: "relative", marginBottom: 12 }}>
      <div
        onClick={() => {
          setRange(undefined);
          setStartDate("");
          setEndDate("");
          setShowCalendar(true);
        }}
        style={{
          ...inputStyle,
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>
          {startDate && endDate
            ? `${formatDate(startDate)} - ${formatDate(endDate)}`
            : "Odaberi datum putovanja"}
        </span>
        <span>📅</span>
      </div>

      {showCalendar && (
        <div
          style={{
            background: "#0f1d33",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 18,
            padding: 12,
            marginTop: 8,
            zIndex: 3000,
          }}
        >
          <DayPicker
            mode="range"
            selected={range}
            onSelect={(selectedRange) => {
              if (!selectedRange?.from) {
                setRange(undefined);
                setStartDate("");
                setEndDate("");
                return;
              }

              const from = toLocalDateString(selectedRange.from);

              const isSameDay =
                selectedRange.to &&
                selectedRange.from.toDateString() ===
                  selectedRange.to.toDateString();

              if (!selectedRange.to || isSameDay) {
                setRange({
                  from: selectedRange.from,
                  to: undefined,
                });
                setStartDate(from);
                setEndDate("");
                return;
              }

              const to = toLocalDateString(selectedRange.to);

              setRange(selectedRange);
              setStartDate(from);
              setEndDate(to);
              setShowCalendar(false);
            }}
          />
        </div>
      )}
    </div>
  );
}