import { vi } from 'vitest';

/**
 * A thenable query builder: every method returns itself, `await` resolves to the
 * result registered for that table. Pages under test never see a real client.
 *
 *   const client = createMockClient({ tables: { submissions: { data: [...], error: null } } });
 *   client.from('submissions').select().eq('id', 1)  →  resolves to that result
 */
const METHODS = ['select', 'insert', 'update', 'upsert', 'delete', 'eq', 'neq', 'in', 'is', 'gte', 'lte', 'gt', 'lt', 'ilike', 'or', 'order', 'limit', 'range', 'single', 'maybeSingle'];

function builder(result) {
  const b = {};
  for (const m of METHODS) b[m] = vi.fn(() => b);
  b.then = (resolve, reject) => Promise.resolve(result).then(resolve, reject);
  return b;
}

export function createMockClient({ tables = {}, rpc = {}, auth = {}, storage = {} } = {}) {
  const channel = {
    on: vi.fn(() => channel),
    subscribe: vi.fn(() => channel),
    unsubscribe: vi.fn(),
  };
  const client = {
    from: vi.fn((table) => builder(tables[table] ?? { data: [], error: null, count: 0 })),
    rpc: vi.fn((name) => Promise.resolve(rpc[name] ?? { data: null, error: null })),
    channel: vi.fn(() => channel),
    removeChannel: vi.fn(),
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: auth.user ?? { id: 'user-1', email: 'karisa@example.com' } }, error: null })),
      getSession: vi.fn(() => Promise.resolve({ data: { session: auth.session ?? { access_token: 'token', user: { id: 'user-1' } } }, error: null })),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
    },
    storage: { from: vi.fn(() => ({ createSignedUrl: vi.fn(() => Promise.resolve(storage.signed ?? { data: { signedUrl: 'https://signed.example/x' }, error: null })) })) },
    _channel: channel,
  };
  return client;
}
