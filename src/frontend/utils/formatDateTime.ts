export const formatDateTime = (value: string): string =>
  new Date(value).toLocaleString();
