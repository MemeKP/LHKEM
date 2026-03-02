const addLeadingZero = (value) => value.toString().padStart(2, '0');

export const formatNumericDate = (input) => {
  if (!input) return '-';
  const date = new Date(input);
  if (!Number.isFinite(date.getTime())) return '-';

  const day = addLeadingZero(date.getDate());
  const month = addLeadingZero(date.getMonth() + 1);
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

export const formatNumericDateTime = (input) => {
  if (!input) return '-';
  const date = new Date(input);
  if (!Number.isFinite(date.getTime())) return '-';

  const base = formatNumericDate(date);
  const hours = addLeadingZero(date.getHours());
  const minutes = addLeadingZero(date.getMinutes());

  return `${base} ${hours}:${minutes}`;
};
