export type DateRangeFilterType = 'today' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'all' | 'custom';

export const formatDateTime = (dateInput?: Date | string | number): string => {
  if (!dateInput) return '';
  const d = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return String(dateInput);

  const pad = (num: number) => String(num).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

export const formatSheetDateTime = (dateInput?: Date | string | number): string => {
  return formatDateTime(dateInput);
};

export const getFormattedNow = (): string => {
  return formatDateTime(new Date());
};

/**
 * Checks if a given date string or timestamp falls inside the requested date range filter.
 */
export const isDateInRange = (
  dateInput: string | Date | number | undefined | null,
  filter: DateRangeFilterType,
  customStart?: string,
  customEnd?: string
): boolean => {
  if (filter === 'all') return true;
  if (!dateInput) return false;

  const d = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return true; // Keep if unparseable to avoid false exclusion

  const now = new Date();
  
  // Today boundaries
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  if (filter === 'today') {
    return d >= startOfToday && d <= endOfToday;
  }

  // Calculate start of This Week (Monday 00:00:00)
  const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday...
  const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
  const startOfThisWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - distanceToMonday, 0, 0, 0, 0);
  const endOfThisWeek = new Date(startOfThisWeek.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);

  if (filter === 'thisWeek') {
    return d >= startOfThisWeek && d <= endOfThisWeek;
  }

  // Calculate Last Week (Previous Monday 00:00:00 to Previous Sunday 23:59:59)
  const startOfLastWeek = new Date(startOfThisWeek.getTime() - 7 * 24 * 60 * 60 * 1000);
  const endOfLastWeek = new Date(startOfThisWeek.getTime() - 1);

  if (filter === 'lastWeek') {
    return d >= startOfLastWeek && d <= endOfLastWeek;
  }

  // Calculate This Month
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const endOfThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  if (filter === 'thisMonth') {
    return d >= startOfThisMonth && d <= endOfThisMonth;
  }

  // Calculate Last Month
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  if (filter === 'lastMonth') {
    return d >= startOfLastMonth && d <= endOfLastMonth;
  }

  // Custom Date Range
  if (filter === 'custom') {
    if (customStart && customEnd) {
      const s = new Date(customStart);
      s.setHours(0, 0, 0, 0);
      const e = new Date(customEnd);
      e.setHours(23, 59, 59, 999);
      return d >= s && d <= e;
    } else if (customStart) {
      const s = new Date(customStart);
      s.setHours(0, 0, 0, 0);
      return d >= s;
    } else if (customEnd) {
      const e = new Date(customEnd);
      e.setHours(23, 59, 59, 999);
      return d <= e;
    }
  }

  return true;
};

/**
 * Returns a human-friendly label for the active date range.
 */
export const getDateRangeLabel = (
  filter: DateRangeFilterType,
  customStart?: string,
  customEnd?: string
): string => {
  const now = new Date();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  if (filter === 'today') {
    return `Today (${monthNames[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()})`;
  }

  if (filter === 'thisWeek') {
    const currentDay = now.getDay();
    const distToMon = currentDay === 0 ? 6 : currentDay - 1;
    const startMon = new Date(now.getFullYear(), now.getMonth(), now.getDate() - distToMon);
    const endSun = new Date(startMon.getTime() + 6 * 24 * 60 * 60 * 1000);
    return `This Week (${monthNames[startMon.getMonth()]} ${startMon.getDate()} - ${monthNames[endSun.getMonth()]} ${endSun.getDate()})`;
  }

  if (filter === 'lastWeek') {
    const currentDay = now.getDay();
    const distToMon = currentDay === 0 ? 6 : currentDay - 1;
    const startLastMon = new Date(now.getFullYear(), now.getMonth(), now.getDate() - distToMon - 7);
    const endLastSun = new Date(startLastMon.getTime() + 6 * 24 * 60 * 60 * 1000);
    return `Last Week (${monthNames[startLastMon.getMonth()]} ${startLastMon.getDate()} - ${monthNames[endLastSun.getMonth()]} ${endLastSun.getDate()})`;
  }

  if (filter === 'thisMonth') {
    return `This Month (${monthNames[now.getMonth()]} ${now.getFullYear()})`;
  }

  if (filter === 'lastMonth') {
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return `Last Month (${monthNames[prevMonthDate.getMonth()]} ${prevMonthDate.getFullYear()})`;
  }

  if (filter === 'custom') {
    if (customStart && customEnd) return `${customStart} to ${customEnd}`;
    if (customStart) return `From ${customStart}`;
    if (customEnd) return `Up to ${customEnd}`;
    return 'Custom Range';
  }

  return 'All Recorded Time';
};


