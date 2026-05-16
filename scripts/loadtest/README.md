# Load Testing — Wave 1

## Setup
```bash
# macOS
brew install k6

# Linux
sudo apt install k6
```

## Run
```bash
export SUPABASE_URL="https://wxafzwlodzohrwdwkuzy.supabase.co"
export SUPABASE_ANON="<anon-key>"
export PORTAL_URL="https://healthos24.com"

k6 run scripts/loadtest/portal-load.js
```

## Scenarios
| Scenario | VUs | Duration | Goal |
|---|---|---|---|
| `portal_users` | ramp 0→200 | 5m | 200 concurrent portal browsers |
| `cow_vans` | 50 | 5m | 50 CoW vans flushing offline queues |

## Pass thresholds
- p95 read latency **< 600 ms**
- p95 write latency **< 1200 ms**
- error rate **< 1 %**

## Reporting
Pipe JSON output for CI gates:
```bash
k6 run --out json=results.json scripts/loadtest/portal-load.js
```
