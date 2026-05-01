const DEFAULTS = {
  minCardWidth: 260,
  cardBodyHeight: 36,
  gap: 5,
  padding: 6,
  minPageSize: 1,
  maxPageSize: 100,
};

export function calculateVisiblePageSize(width, height, options = {}) {
  const cfg = { ...DEFAULTS, ...options };
  const usableWidth = Math.max(0, width - cfg.padding * 2);
  const usableHeight = Math.max(0, height - cfg.padding * 2);

  const columns = Math.max(
    1,
    Math.floor((usableWidth + cfg.gap) / (cfg.minCardWidth + cfg.gap))
  );
  const cardWidth = (usableWidth - cfg.gap * (columns - 1)) / columns;
  const cardHeight = cardWidth + cfg.cardBodyHeight;
  const rows = Math.max(
    1,
    Math.floor((usableHeight + cfg.gap) / (cardHeight + cfg.gap))
  );

  return Math.max(
    cfg.minPageSize,
    Math.min(cfg.maxPageSize, columns * rows)
  );
}
