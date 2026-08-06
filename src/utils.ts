export const generateId = (prefix: string, year?: number): string => {
  const suffix = crypto.randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase();
  return year ? `${prefix}-${year}-${suffix}` : `${prefix}-${suffix}`;
};

export const randomHex = (length: number): string => {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

export const fakeSha256 = (): string => `SHA256-${randomHex(64)}`;
