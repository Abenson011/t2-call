import { useEffect, useState } from 'react';

const COLORS = ['#EF9F27', '#F59E0B', '#EF4444', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899'];

interface Piece {
  id: number;
  color: string;
  width: number;
  height: number;
  left: number;
  delay: number;
  duration: number;
  isCircle: boolean;
}

export default function Confetti() {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    const generated: Piece[] = Array.from({ length: 80 }, (_, i) => ({
      id: i,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      width: 6 + Math.random() * 8,
      height: 6 + Math.random() * 8,
      left: Math.random() * 100,
      delay: Math.random() * 4,
      duration: 3 + Math.random() * 3,
      isCircle: Math.random() > 0.5,
    }));
    setPieces(generated);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute"
          style={{
            left: `${piece.left}%`,
            top: '-20px',
            width: piece.width,
            height: piece.height,
            backgroundColor: piece.color,
            borderRadius: piece.isCircle ? '50%' : '2px',
            animationName: 'confettiFall',
            animationDuration: `${piece.duration}s`,
            animationDelay: `${piece.delay}s`,
            animationTimingFunction: 'linear',
            animationFillMode: 'forwards',
          }}
        />
      ))}
    </div>
  );
}
