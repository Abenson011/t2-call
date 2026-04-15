export default function JetFlyby() {
  return (
    <div
      className="fixed pointer-events-none z-50"
      style={{ top: '32vh', left: 0, right: 0, overflow: 'hidden' }}
    >
      <span
        style={{
          display: 'inline-block',
          fontSize: '56px',
          lineHeight: 1,
          animationName: 'jetFly',
          animationDuration: '3.8s',
          animationDelay: '1s',
          animationTimingFunction: 'ease-in-out',
          animationFillMode: 'both',
        }}
      >
        ✈️
      </span>
    </div>
  );
}
