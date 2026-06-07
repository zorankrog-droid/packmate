type Props = {
  children: React.ReactNode;
  cardColor: string;
};

export default function AppCard({
  children,
  cardColor,
}: Props) {
  return (
    <div
      style={{
        background: cardColor,
        borderRadius: 28,
        padding: 24,
        marginBottom: 20,
        boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
      }}
    >
      {children}
    </div>
  );
}