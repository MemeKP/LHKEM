export const getWorkshopRegistrationEndDate = (workshop) => {
  return workshop?.endDate || workshop?.registrationEndDate || null;
};

export const getWorkshopCapacityStats = (workshop) => {
  const capacity = Number(workshop?.capacity || workshop?.seatLimit || 0);
  const currentParticipants = Number(workshop?.current_participants || workshop?.seatsBooked || 0);
  const pendingSeats = Math.max(0, Number(workshop?.pendingRegistrationSeat || 0));
  
  // ที่ว่างสำหรับลูกค้า = capacity - confirmed เท่านั้น
  // pending ไม่นับว่าเต็ม เพราะยังไม่ได้ confirm และอาจถูก reject
  const seatsLeft = Math.max(0, capacity - currentParticipants);
  // booked ยังคงไว้สำหรับ shop owner view (รวม pending)
  const booked = currentParticipants + pendingSeats;
  
  return { capacity, booked, seatsLeft, currentParticipants, pendingSeats };
};

export const getWorkshopAvailabilityState = (workshop, now = Date.now()) => {
  const { capacity, booked, seatsLeft, pendingSeats } = getWorkshopCapacityStats(workshop);
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

  // Force check the actual string status as well (case-insensitive)
  const isStatusClosed = String(workshop?.registrationStatus || '').toUpperCase() !== 'OPEN';

  const isFull = seatsLeft <= 0;

  return {
    capacity,
    booked,
    seatsLeft,
    pendingSeats,
    registrationEndDate,
    // It is closed if the date passed OR the status is not OPEN
    isRegistrationClosed: isRegistrationClosed || isStatusClosed,
    isFull,
  };
};