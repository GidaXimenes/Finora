export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export type Query = Record<string, string | number | boolean | undefined | null>;

interface Options {
  method?: string;
  body?: unknown;
  query?: Query;
}

export function buildQuery(q?: Query): string {
  const params = new URLSearchParams();
  Object.entries(q ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
  });
  const s = params.toString();
  return s ? `?${s}` : '';
}

const NO_REFRESH = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];

function send(path: string, opts: Options) {
  const hasBody = opts.body !== undefined;
  return fetch(`/api${path}${buildQuery(opts.query)}`, {
    method: opts.method ?? 'GET',
    headers: hasBody ? { 'Content-Type': 'application/json' } : undefined,
    body: hasBody ? JSON.stringify(opts.body) : undefined,
    credentials: 'same-origin',
  });
}

let refreshing: Promise<boolean> | null = null;

/** Renova a sessão uma única vez, mesmo com várias requisições recebendo 401 ao mesmo tempo. */
function refreshSession(): Promise<boolean> {
  if (!refreshing) {
    refreshing = fetch('/api/auth/refresh', { method: 'POST', credentials: 'same-origin' })
      .then((r) => r.ok)
      .catch(() => false)
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

async function readError(res: Response): Promise<string> {
  if (res.status === 429) return 'Muitas tentativas. Aguarde um instante e tente de novo.';
  try {
    const data = await res.json();
    if (Array.isArray(data.message)) return data.message.join('. ');
    if (typeof data.message === 'string') return data.message;
  } catch {
    // ignora corpo vazio ou inválido
  }
  return 'Algo deu errado. Tente novamente.';
}

export async function api<T = unknown>(path: string, opts: Options = {}): Promise<T> {
  let res = await send(path, opts);
  if (res.status === 401 && !NO_REFRESH.includes(path) && (await refreshSession())) {
    res = await send(path, opts);
  }
  if (!res.ok) throw new ApiError(await readError(res), res.status);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
