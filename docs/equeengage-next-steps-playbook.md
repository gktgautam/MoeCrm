# EqueEngage – What Next? (Execution Playbook)

This is a concrete plan to move from idea to a production-ready MoEngage-like wedge on top of this repository.

## North-star for the next 90 days

Ship one complete lifecycle loop:

1. Ingest/derive customer events from CRM
2. Build a segment using attributes + behavior
3. Launch an email campaign to that segment
4. Measure delivery + engagement in dashboard analytics

If this loop works reliably for 3 design partners, you have a strong MVP foundation.

---

## Phase 0 (Week 1): Lock product boundaries

### Decide and freeze MVP scope

**Include now**
- Contacts + events sync from CRM to Engage DB
- Segment rules: attribute filters + "did event in last N days"
- Email campaign execution only
- Campaign funnel metrics (sent/delivered/open/click/bounce)

**Explicitly exclude now**
- Multi-channel orchestration
- Advanced attribution
- AI/predictive scores

### Define success metrics (must be measurable)
- Segment compute time for 100k contacts: < 2 minutes
- Campaign launch latency (click "send" to first message): < 60 sec
- Sync lag CRM -> Engage: p95 < 5 minutes
- Failed delivery jobs auto-retried + DLQ visibility

---

## Phase 1 (Weeks 2-4): Data foundation hardening

## 1) Event taxonomy and contracts
Create a canonical list of events and required properties (example):
- `order_created`: `order_id`, `amount`, `currency`, `created_at`
- `call_logged`: `call_id`, `agent_id`, `duration_sec`, `created_at`
- `whatsapp_sent`: `message_id`, `status`, `created_at`
- `email_opened`: `campaign_id`, `message_id`, `opened_at`

Deliverables:
- Versioned event contract doc
- Validation at ingestion/sync boundaries
- Rejection metrics for malformed events

## 2) CRM -> Engage sync reliability
- Add checkpointing per source table
- Idempotent upsert keys for contacts/events
- Backfill command for historical replay
- Reconciliation job (nightly) with mismatch report

## 3) Observability baseline
- Structured logs for sync + campaign workers
- Core metrics: throughput, lag, retries, failures
- Dead letter queue table/topic + operator runbook

---

## Phase 2 (Weeks 5-7): Segmentation engine v1

## 1) Segment DSL v1 (JSON rule tree)
Support:
- Attribute operators: `eq`, `neq`, `in`, `contains`, `gte`, `lte`
- Behavior operators: `did_event`, `did_not_event`, lookback window
- Boolean groups: `AND`, `OR`

Example:
```json
{
  "op": "AND",
  "rules": [
    { "type": "attribute", "field": "city", "op": "eq", "value": "Mumbai" },
    {
      "type": "behavior",
      "event": "order_created",
      "op": "did_event",
      "within_days": 30,
      "count_gte": 1
    }
  ]
}
```

## 2) Segment evaluation + membership materialization
- Save compiled query plan per segment
- Recompute on schedule and on-demand
- Write members into `segment_members` snapshot table
- Persist evaluation metadata (`started_at`, `finished_at`, `member_count`, `error`)

## 3) Guardrails
- Query complexity limits (max nested rules, max window)
- Timeouts and partial-failure reporting
- Segment preview endpoint before save/send

---

## Phase 3 (Weeks 8-10): Campaign execution v1

## 1) Campaign domain model
Required entities:
- `campaigns` (name, segment_id, template_id, schedule, status)
- `campaign_runs` (snapshot info, started/ended, counters)
- `campaign_messages` (contact_id, provider_message_id, status timeline)

## 2) Email sending pipeline
- Audience snapshot at run start (immutable member set)
- Token rendering (`{{first_name}}`) with fallback values
- Throttled dispatch worker
- Retry policy with exponential backoff

## 3) Delivery status ingestion
- Webhook endpoint for provider callbacks
- Idempotent status updates
- Aggregate counters by campaign run

---

## Phase 4 (Weeks 11-13): Analytics + operator experience

## 1) Dashboard KPIs
- Campaign funnel cards
- Time-series for sends/open/click rates
- Segment size trend

## 2) Operational screens
- Sync health (lag, failures)
- Worker queue health
- Campaign run logs + error drill-down

## 3) Trust and governance minimums
- RBAC checks for create/send actions
- Audit fields on all mutating APIs
- Consent/unsubscribe enforcement in send pipeline

---

## Engineering backlog (prioritized)

### P0 (must-have)
1. Event contract + validation
2. Sync checkpoints + idempotent upserts
3. Segment DSL + evaluation worker
4. Campaign run snapshot + dispatch worker
5. Delivery webhook + analytics rollups

### P1 (next)
1. Segment preview and estimate API
2. Reconciliation and drift dashboard
3. Retry/DLQ tooling and replay API

### P2 (later)
1. Second channel (WhatsApp or Push)
2. Journey builder v1
3. Experimentation (A/B + holdout)

---

## Suggested ownership model

- **Data Platform pod:** sync, contracts, identity, reliability
- **Activation pod:** segmentation + campaign execution
- **Insights pod:** analytics and KPI correctness
- **Trust pod (shared):** RBAC, consent, auditability

Each pod should own both API and UI surfaces for faster delivery.

---

## Launch strategy (design partners)

Pick 2-3 customers with similar CRM data quality. For each:
1. Run a historical backfill
2. Validate segment counts against known manual queries
3. Launch one campaign per week
4. Run weekly review on delivery + conversion metrics
5. Capture missing feature requests in a ranked list

Do not scale sales before campaign reliability is stable for at least 4 weeks.

---

## Practical “start tomorrow” checklist

1. Freeze MVP feature flags and non-goals
2. Approve event taxonomy + JSON contract
3. Implement sync checkpoint table and backfill CLI
4. Implement segment DSL parser + preview endpoint
5. Implement campaign run + snapshot + throttled worker
6. Add webhook status ingestion and rollup jobs
7. Build dashboard cards for funnel + segment trend
8. Run pilot with first design partner

If you execute this sequence without scope creep, you can reach a strong MoEngage-like MVP quickly and safely.
