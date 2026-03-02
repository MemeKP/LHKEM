export const getWorkshopRegistrationEndDate = (workshop) => {
  return workshop?.endDate || workshop?.registrationEndDate || null;
};

export const getWorkshopCapacityStats = (workshop) => {
  const capacity = Number(workshop?.capacity || workshop?.seatLimit || 0);
  const booked = Number(workshop?.current_participants || workshop?.seatsBooked || 0);
  const seatsLeft = Math.max(0, capacity - booked);
  return { capacity, booked, seatsLeft };
};

export const getWorkshopAvailabilityState = (workshop, now = Date.now()) => {
  const { capacity, booked, seatsLeft } = getWorkshopCapacityStats(workshop);
  const registrationEndRaw = getWorkshopRegistrationEndDate(workshop);

  let registrationEndDate = null;
  if (registrationEndRaw) {
    const parsed = new Date(registrationEndRaw);
    if (!Number.isNaN(parsed.getTime())) {
      registrationEndDate = parsed;
    }
  }

  let isRegistrationClosed = false;
  if (registrationEndDate) {
    const endOfDay = new Date(registrationEndDate);
    endOfDay.setHours(23, 59, 59, 999);
    isRegistrationClosed = now > endOfDay.getTime();
  }

  const isFull = seatsLeft <= 0;

  return {
    capacity,
    booked,
    seatsLeft,
    registrationEndDate,
    isRegistrationClosed,
    isFull,
  };
};
