export function getWeekBounds(weekOffset = 0) {
  const now = new Date();
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;

  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + mondayOffset + weekOffset * 7);

  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  return { start, end };
}

export function formatWeekLabel(start: Date, end: Date) {
  const endDisplay = new Date(end);
  endDisplay.setDate(endDisplay.getDate() - 1);

  const sameMonth = start.getMonth() === endDisplay.getMonth();
  const sameYear = start.getFullYear() === endDisplay.getFullYear();

  const startPart = start.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });

  const endPart = endDisplay.toLocaleDateString(undefined, {
    month: sameMonth ? undefined : "short",
    day: "numeric",
    year: "numeric",
  });

  return `${startPart} – ${endPart}`;
}
