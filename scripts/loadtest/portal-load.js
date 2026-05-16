// k6 load test — Patient Portal + CoW van sync
// Run: k6 run --vus 250 --duration 5m scripts/loadtest/portal-load.js
// Target: p95 < 800ms on critical reads, error rate < 1%.

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const SUPABASE_URL  = __ENV.SUPABASE_URL  || 'https://wxafzwlodzohrwdwkuzy.supabase.co';
const SUPABASE_ANON = __ENV.SUPABASE_ANON || '';
const PORTAL_URL    = __ENV.PORTAL_URL    || 'https://healthos24.com';

export const options = {
  scenarios: {
    portal_users: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 200 },
        { duration: '3m', target: 200 },
        { duration: '1m', target: 0 },
      ],
      exec: 'portalUser',
    },
    cow_vans: {
      executor: 'constant-vus',
      vus: 50,
      duration: '5m',
      exec: 'cowVan',
    },
  },
  thresholds: {
    http_req_failed:   ['rate<0.01'],
    http_req_duration: ['p(95)<800'],
    'http_req_duration{tag:read}':  ['p(95)<600'],
    'http_req_duration{tag:write}': ['p(95)<1200'],
  },
};

const errRate = new Rate('app_errors');
const readT   = new Trend('app_read_latency');

const headers = {
  'apikey': SUPABASE_ANON,
  'Authorization': `Bearer ${SUPABASE_ANON}`,
  'Content-Type': 'application/json',
};

export function portalUser() {
  group('portal:landing', () => {
    const r = http.get(`${PORTAL_URL}/portal/login`, { tags: { tag: 'read' } });
    check(r, { 'portal 200': (res) => res.status === 200 }) || errRate.add(1);
    readT.add(r.timings.duration);
  });

  group('portal:appointments-read', () => {
    const r = http.get(`${SUPABASE_URL}/rest/v1/appointments?select=id,scheduled_at,status&limit=20`,
      { headers, tags: { tag: 'read' } });
    check(r, { 'appts ok': (res) => res.status === 200 || res.status === 401 }) || errRate.add(1);
  });

  sleep(Math.random() * 3 + 1);
}

export function cowVan() {
  group('cow:sync-batch', () => {
    const payload = JSON.stringify({
      ops: Array.from({ length: 5 }, (_, i) => ({
        table: 'vitals',
        op: 'insert',
        row: { recorded_at: new Date().toISOString(), bp_systolic: 120 + i },
      })),
    });
    const r = http.post(`${SUPABASE_URL}/functions/v1/cow-sync`, payload,
      { headers, tags: { tag: 'write' } });
    check(r, { 'sync accepted': (res) => res.status < 500 }) || errRate.add(1);
  });
  sleep(15); // vans sync every ~15s
}
