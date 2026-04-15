import { useState, useEffect, useRef } from 'react';
import { ComposableMap, Geographies, Geography, Line, Marker } from 'react-simple-maps';

// World atlas topojson — standard public CDN for geographic data
const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// Great circle waypoints: JFK New York → Waterville, County Kerry (Hogs Head)
// Waterville is on the SW tip of Ireland — further south and west than Dublin
const FLIGHT_PATH: [number, number][] = [
  [-74.0,  40.7],  // New York (JFK)
  [-68.5,  43.0],
  [-62.0,  45.5],
  [-55.0,  48.0],
  [-47.0,  50.0],
  [-38.5,  51.5],
  [-29.5,  52.5],
  [-20.0,  52.5],
  [-14.0,  52.2],
  [-10.04, 51.83], // Waterville, County Kerry (Hogs Head)
];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function getJetPosition(progress: number): [number, number] {
  const n = FLIGHT_PATH.length - 1;
  const raw = Math.min(progress, 0.9999) * n;
  const i = Math.floor(raw);
  const t = raw - i;
  return [
    lerp(FLIGHT_PATH[i][0], FLIGHT_PATH[i + 1][0], t),
    lerp(FLIGHT_PATH[i][1], FLIGHT_PATH[i + 1][1], t),
  ];
}

// Returns the line segments the jet has already flown
function getTraveledSegments(progress: number): Array<[[number, number], [number, number]]> {
  const n = FLIGHT_PATH.length - 1;
  const raw = progress * n;
  const fullSegments = Math.floor(raw);
  const partialT = raw - fullSegments;
  const segments: Array<[[number, number], [number, number]]> = [];

  for (let i = 0; i < fullSegments && i < n; i++) {
    segments.push([FLIGHT_PATH[i], FLIGHT_PATH[i + 1]]);
  }

  if (fullSegments < n && partialT > 0.001) {
    const from = FLIGHT_PATH[fullSegments];
    const to = FLIGHT_PATH[fullSegments + 1];
    segments.push([from, [lerp(from[0], to[0], partialT), lerp(from[1], to[1], partialT)]]);
  }

  return segments;
}

const FLIGHT_DURATION = 9000; // ms

export default function FlightMap() {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    const start = () => {
      const animate = (ts: number) => {
        if (!startRef.current) startRef.current = ts;
        const p = Math.min((ts - startRef.current) / FLIGHT_DURATION, 1);
        setProgress(p);
        if (p < 1) rafRef.current = requestAnimationFrame(animate);
      };
      rafRef.current = requestAnimationFrame(animate);
    };

    const delay = setTimeout(start, 800);
    return () => {
      clearTimeout(delay);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const jetPos = getJetPosition(progress);
  const traveledSegments = getTraveledSegments(progress);
  const showDublin = progress > 0.88;

  return (
    <ComposableMap
      projection="geoNaturalEarth1"
      projectionConfig={{ rotate: [42, 0, 0], center: [0, 46], scale: 600 }}
      width={960}
      height={560}
      style={{ width: '100%', height: '100%' }}
    >
      {/* Ocean background */}
      <rect x={0} y={0} width={960} height={560} fill="#0f2744" />

      <Geographies geography={GEO_URL}>
        {({ geographies }) =>
          geographies.map((geo) => (
            <Geography
              key={geo.rsmKey}
              geography={geo}
              fill="#1e3d6b"
              stroke="#2a5494"
              strokeWidth={0.6}
              style={{
                default: { outline: 'none' },
                hover:   { outline: 'none' },
                pressed: { outline: 'none' },
              }}
            />
          ))
        }
      </Geographies>

      {/* Full intended route — faint dashed */}
      {FLIGHT_PATH.slice(0, -1).map((_, i) => (
        <Line
          key={`ghost-${i}`}
          from={FLIGHT_PATH[i]}
          to={FLIGHT_PATH[i + 1]}
          stroke="#EF9F27"
          strokeOpacity={0.2}
          strokeWidth={1.5}
          strokeDasharray="5 7"
          strokeLinecap="round"
        />
      ))}

      {/* Traveled route — solid gold, grows with jet */}
      {traveledSegments.map(([from, to], i) => (
        <Line
          key={`traveled-${i}`}
          from={from}
          to={to}
          stroke="#EF9F27"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeOpacity={0.95}
        />
      ))}

      {/* Origin — New York */}
      <Marker coordinates={[-74.0, 40.7]}>
        <circle r={4} fill="#EF9F27" />
        <text
          textAnchor="middle"
          y={-9}
          style={{ fontSize: '8px', fill: '#EF9F27', fontWeight: 700, letterSpacing: '0.08em' }}
        >
          NEW YORK
        </text>
      </Marker>

      {/* Destination — Hogs Head, Waterville (fades in as jet approaches) */}
      <Marker coordinates={[-10.04, 51.83]}>
        <circle r={4} fill="#EF9F27" opacity={showDublin ? 1 : 0.2} style={{ transition: 'opacity 1s' }} />
        <text
          textAnchor="middle"
          y={-9}
          style={{
            fontSize: '8px',
            fill: '#EF9F27',
            fontWeight: 700,
            letterSpacing: '0.08em',
            opacity: showDublin ? 1 : 0.2,
            transition: 'opacity 1s',
          }}
        >
          HOGS HEAD
        </text>
      </Marker>

      {/* Jet */}
      {progress > 0.005 && (
        <Marker coordinates={jetPos}>
          <text
            textAnchor="middle"
            dominantBaseline="central"
            style={{ fontSize: '20px', userSelect: 'none' }}
          >
            ✈️
          </text>
        </Marker>
      )}
    </ComposableMap>
  );
}
