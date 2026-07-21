export function normalizeParam(
    value: string | string[] | undefined
  ): string {
    if (!value) return "";
    return Array.isArray(value) ? value[0] : value;
  }