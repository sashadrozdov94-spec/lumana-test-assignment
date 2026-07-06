export interface LogPayload {
  type: string;
  message: string;
  meta?: Record<string, unknown>;
}

export interface RedisTsItem {
  timestamp: number;
  value: number;
}