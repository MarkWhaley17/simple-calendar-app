export const toDayStart = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const shiftCalendarDay = (baseDate: Date, deltaDays: number): Date => {
  const next = toDayStart(baseDate);
  next.setDate(next.getDate() + deltaDays);
  return next;
};
