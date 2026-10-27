export function unwrapList<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (raw && typeof raw === 'object') {
    const data = (raw as { data?: unknown }).data;
    if (Array.isArray(data)) return data as T[];
    if (data && typeof data === 'object' && Array.isArray((data as { items?: unknown }).items)) {
      return (data as { items: T[] }).items;
    }
  }
  return [];
}

export function isApiOk(result?: { success?: boolean } | null): boolean {
  return !!result && result.success !== false;
}
