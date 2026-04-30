import { cn } from "@/lib/utils";

/**
 * DataMatrixMark — procedural 5x5 boolean grid rendered as SVG, seeded by an
 * id. Decorative; mirrors the data-matrix glyphs printed on every unit card
 * next to the asset code.
 */
export function DataMatrixMark({
  className,
  size = 22,
  source,
}: {
  className?: string;
  size?: number;
  source: string;
}) {
  const cells = generateGrid(source);
  const cellSize = 100 / 5;

  return (
    <svg
      aria-hidden
      className={cn("text-[color:var(--foreground)]", className)}
      height={size}
      role="presentation"
      viewBox="0 0 100 100"
      width={size}
    >
      {cells.map((on, index) => {
        if (!on) return null;
        const x = (index % 5) * cellSize;
        const y = Math.floor(index / 5) * cellSize;

        return <rect key={index} fill="currentColor" height={cellSize} width={cellSize} x={x} y={y} />;
      })}
    </svg>
  );
}

function generateGrid(source: string): boolean[] {
  // simple 32-bit FNV-ish hash, then expand to 25 cells.
  let hash = 2166136261;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  const cells: boolean[] = [];
  let state = hash >>> 0;
  for (let index = 0; index < 25; index += 1) {
    state = (Math.imul(state, 1103515245) + 12345) >>> 0;
    cells.push((state & 1) === 1);
  }

  // anchor the corners so it always reads as a glyph, not noise.
  cells[0] = true;
  cells[4] = true;
  cells[20] = true;
  cells[24] = true;

  return cells;
}
