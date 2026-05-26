interface EventDateInput {
  event_date?: string | null;
  start_timestamp?: string | null;
  end_timestamp?: string | null;
  timezone?: string | null;
}

export function formatEventDateTime(event: EventDateInput): string {
  if (!event.event_date && !event.start_timestamp) {
    return 'Date TBD';
  }

  try {
    const date = event.start_timestamp
      ? new Date(event.start_timestamp)
      : event.event_date
        ? new Date(event.event_date)
        : null;

    if (!date || isNaN(date.getTime())) {
      return 'Date TBD';
    }

    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();

    if (event.start_timestamp && event.end_timestamp) {
      const endDate = new Date(event.end_timestamp);
      if (endDate.toDateString() !== date.toDateString()) {
        const endMonth = monthNames[endDate.getMonth()];
        const endDay = endDate.getDate();
        return `${month} ${day} - ${endMonth} ${endDay}, ${year}`;
      }
    }

    return `${month} ${day}, ${year}`;
  } catch {
    return 'Date TBD';
  }
}
