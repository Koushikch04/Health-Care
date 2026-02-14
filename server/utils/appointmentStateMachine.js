export const APPOINTMENT_STATUSES = Object.freeze({
  SCHEDULED: "scheduled",
  COMPLETED: "completed",
  CANCELED: "canceled",
});

export const APPOINTMENT_ACTIONS = Object.freeze({
  CANCEL: "cancel",
  COMPLETE: "complete",
  RESCHEDULE: "reschedule",
});

const ACTION_RULES = Object.freeze({
  [APPOINTMENT_ACTIONS.CANCEL]: {
    from: [APPOINTMENT_STATUSES.SCHEDULED],
    to: APPOINTMENT_STATUSES.CANCELED,
  },
  [APPOINTMENT_ACTIONS.COMPLETE]: {
    from: [APPOINTMENT_STATUSES.SCHEDULED],
    to: APPOINTMENT_STATUSES.COMPLETED,
  },
  [APPOINTMENT_ACTIONS.RESCHEDULE]: {
    from: [APPOINTMENT_STATUSES.SCHEDULED],
    to: APPOINTMENT_STATUSES.SCHEDULED,
  },
});

export const getAllowedFromStatuses = (action) => {
  return ACTION_RULES[action]?.from || [];
};

export const canApplyAction = (currentStatus, action) => {
  return getAllowedFromStatuses(action).includes(currentStatus);
};

export const assertActionAllowed = (currentStatus, action) => {
  if (!canApplyAction(currentStatus, action)) {
    throw new Error(
      `Illegal transition: cannot perform "${action}" from "${currentStatus}".`
    );
  }
};
