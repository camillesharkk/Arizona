import styles from "./report.module.css";

export function BarChart({
  rows,
  total,
}: {
  rows: { label: string; value: number | null }[];
  total: number | null;
}) {
  const numbers = rows.map((row) => row.value).filter((value): value is number => value != null);
  const max = Math.max(...numbers, 1);
  return (
    <ul className={styles.bars}>
      {rows.map((row) => {
        const share = row.value != null && total != null && total > 0 ? (row.value / total) * 100 : null;
        const width = row.value == null ? 0 : (row.value / max) * 100;
        const caption =
          row.value == null
            ? `${row.label}：未返回`
            : share == null
              ? `${row.label}：${row.value}`
              : `${row.label}：${row.value}，占 ${share.toFixed(1)}%`;
        return (
          <li key={row.label} className={styles.barRow}>
            <span className={styles.barLabel}>{row.label}</span>
            <svg role="img" aria-label={caption} viewBox="0 0 100 16" className={styles.barSvg} preserveAspectRatio="none">
              <rect x="0" y="3" height="10" width={width} className={styles.barFill} />
            </svg>
            <span className={styles.barValue}>
              {row.value == null ? "未返回" : share == null ? String(row.value) : `${row.value} · ${share.toFixed(1)}%`}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function TrendChart({ points }: { points: { label: string; value: number }[] }) {
  if (points.length < 2) return null;
  const min = Math.min(...points.map((point) => point.value));
  const max = Math.max(...points.map((point) => point.value));
  const span = max - min || 1;
  const coords = points.map((point, index) => {
    const x = (index / (points.length - 1)) * 100;
    const y = 28 - ((point.value - min) / span) * 24;
    return `${x},${y}`;
  });
  return (
    <figure className={styles.trendWrap}>
      <svg role="img" aria-label={points.map((point) => `${point.label} ${point.value}`).join("，")} viewBox="0 0 100 32" className={styles.trend}>
        <polyline points={coords.join(" ")} className={styles.trendLine} />
      </svg>
      <figcaption className={styles.trendCaption}>
        {points.map((point) => (
          <span key={point.label}>
            {point.label} {point.value}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
