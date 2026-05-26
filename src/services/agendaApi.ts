export interface AgendaDay {
  date: string;
  items: AgendaItem[];
}

export interface AgendaItem {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  description?: string;
}

export interface AgendaCard {
  date: string;
  title: string;
  time: string;
  description?: string;
}

export async function getAgendaDaysForEvent(eventId: string): Promise<AgendaDay[]> {
  // Mock API call - simulates fetching agenda
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([]);
    }, 500);
  });
}

export function transformAgendaDaysForCard(days: AgendaDay[]): AgendaCard[] {
  return days.flatMap(day =>
    day.items.map(item => ({
      date: day.date,
      title: item.title,
      time: item.startTime,
      description: item.description,
    }))
  );
}
