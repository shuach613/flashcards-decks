type DeckProgressProps = {
  goodCount: number;
  totalCount: number;
  label: string;
  progressLabel: string;
};

export function DeckProgress({
  goodCount,
  totalCount,
  label,
  progressLabel,
}: DeckProgressProps) {
  const percentage = totalCount > 0 ? (goodCount / totalCount) * 100 : 0;

  return (
    <div className="mt-3">
      <p className="mb-1.5 text-sm text-dark-gray">{label}</p>
      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-sand"
        role="progressbar"
        aria-valuenow={goodCount}
        aria-valuemin={0}
        aria-valuemax={Math.max(totalCount, 1)}
        aria-valuetext={label}
        aria-label={progressLabel}
      >
        <div
          className="h-full rounded-full bg-grass-green transition-[width] duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
