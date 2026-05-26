export function normalizeHostRole(
  hostRole?: string,
  isOwner?: boolean,
  isCoHost?: boolean,
): 'HOST' | 'CO-HOST' | undefined {
  if (hostRole) {
    const normalized = hostRole.toLowerCase();
    if (normalized === 'owner' || normalized === 'host') {
      return 'HOST';
    }
    if (normalized === 'co-host' || normalized === 'co_host') {
      return 'CO-HOST';
    }
    return hostRole as 'HOST' | 'CO-HOST';
  }

  if (isOwner) return 'HOST';
  if (isCoHost) return 'CO-HOST';

  return undefined;
}

export function normalizeEventTypeLabel(rawEventType?: string | null): string | undefined {
  if (!rawEventType) return undefined;

  const lowerType = String(rawEventType).toLowerCase();

  const EVENT_TYPE_LABELS: { [key: string]: string } = {
    'kids-birthday': "KIDS' BIRTHDAY",
    'party': 'EVENTS',
    'cultural-gatherings': 'CULTURAL EVENT',
  };

  if (lowerType in EVENT_TYPE_LABELS) {
    return EVENT_TYPE_LABELS[lowerType];
  }

  if (lowerType.includes('-')) {
    return lowerType.replace(/-/g, ' ').toUpperCase();
  }

  return String(rawEventType).toUpperCase();
}
