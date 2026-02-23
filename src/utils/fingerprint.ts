import type {
  ErrorPayload,
  ConsolePayload,
  NetworkPayload,
  PerformancePayload,
  MemoryPayload,
} from '../types';

function djb2Hash(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) & 0xffffffff;
  }
  return (hash >>> 0).toString(36);
}

export function computeFingerprint(
  payload: ErrorPayload | ConsolePayload | NetworkPayload | PerformancePayload | MemoryPayload
): string {
  let raw: string;

  switch (payload.kind) {
    case 'error': {
      const firstFrame = payload.stack?.split('\n')[1]?.trim() || '';
      raw = `${payload.name}:${payload.message}:${firstFrame}`;
      break;
    }
    case 'console':
      raw = `console:${payload.level}:${payload.args.join(',')}`;
      break;
    case 'network':
      raw = `network:${payload.method}:${payload.url}:${payload.status}`;
      break;
    case 'performance':
      raw = `performance:${payload.metric}:${Math.floor(payload.value / 100) * 100}`;
      break;
    case 'memory':
      raw = `memory:${Math.floor(payload.heapUsagePercent * 10) / 10}`;
      break;
  }

  return djb2Hash(raw);
}
