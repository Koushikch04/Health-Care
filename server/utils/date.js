export const getUtcDayBounds = (dateInput) => {
  const parsedDate = new Date(dateInput);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  const start = new Date(
    Date.UTC(
      parsedDate.getUTCFullYear(),
      parsedDate.getUTCMonth(),
      parsedDate.getUTCDate(),
      0,
      0,
      0,
      0
    )
  );

  const end = new Date(
    Date.UTC(
      parsedDate.getUTCFullYear(),
      parsedDate.getUTCMonth(),
      parsedDate.getUTCDate(),
      23,
      59,
      59,
      999
    )
  );

  return { start, end };
};

export const normalizeToUtcDayStart = (dateInput) => {
  const bounds = getUtcDayBounds(dateInput);
  return bounds ? bounds.start : null;
};
