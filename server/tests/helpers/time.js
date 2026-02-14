export const getUtcDateStringWithOffset = (daysOffset = 0) => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + daysOffset);
  return date.toISOString().slice(0, 10);
};

