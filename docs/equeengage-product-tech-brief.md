# EqueEngage – Product & Tech Brief

## One-liner
EqueEngage is a MoEngage-like B2B marketing automation SaaS built on top of our existing CRM.
It enables segmentation, campaigns (email/WhatsApp), and analytics using CRM data without SDK-heavy external sync.

## Problem Statement
The CRM already contains rich customer and behavior data (customers, orders, calls, WhatsApp logs), but marketing and growth teams cannot:

- Segment users quickly by attributes + behavior.
- Run targeted campaigns from one interface.
- Measure campaign effectiveness with unified analytics.

External tools create a parallel data stack that requires continuous event sync and SDK instrumentation. EqueEngage solves this by creating an Engage layer directly connected to CRM data.

## Target Users
- Marketing managers
- Growth and lifecycle teams
- CRM operators

## MVP Scope

### 1) Customer 360
- Unified contact profile and communication identifiers.
- Attribute store (email, phone, city, plan, lifecycle metadata).
- Activity timeline derived from CRM actions.

### 2) Events & Behavior
- Normalize CRM-derived events (`order_created`, `call_logged`, `whatsapp_sent`, `email_opened`).
- Store in Engage DB for fast segment and campaign querying.
- Attach event metadata for analytics and personalization.

### 3) Segmentation
- Attribute filters (for example: city, plan, `last_purchase_at`).
- Behavior filters (for example: `did_event X in last N days`).
- Nested boolean logic (`AND` / `OR`).
- Save reusable segments.
- Precompute segment members to support low-latency campaign launches.

### 4) Campaigns
- Bulk email sending for MVP.
- Template + token personalization (`{{first_name}}`).
- Schedule execution windows.
- Throttling control (emails per minute).

### 5) Analytics
- Campaign funnel metrics (sent, delivered, opens, clicks, bounces).
- Segment size trend reporting.
- Dashboard-level KPI cards + trend lines.

### 6) Team & Access
- Internal app users: owner/admin/manager/viewer.
- User invitation flow.
- Role-based access control at API + UI level.

## Architecture

### Databases

#### CRM DB (existing Postgres)
- Source of truth.
- Contains customers, orders, calls, WhatsApp logs, and historic operational records.
- No schema migrations to be applied from Engage.

#### Engage DB (new Postgres)
Optimized query model for campaign use-cases:
- `contacts`
- `events`
- `segments`
- `segment_members`
- `campaigns`
- `campaign_messages` / analytics rollups
- `app_users`

### Data Flow
1. Read from CRM DB.
2. Transform + derive canonical contact and event records.
3. Upsert into Engage DB.
4. Precompute segment membership in Engage DB.
5. Execute campaigns against Engage DB member snapshots.
6. Write delivery/engagement outcomes back into Engage analytics tables.

**Constraints**
- Avoid cross-database transactions.
- Keep heavy joins in Engage DB.
- Use idempotent upserts and sync checkpoints.

## Backend Stack
- Node.js + Fastify
- Two DB clients:
  - `app.dbCrm` (`pg`)
  - `app.dbEngage` (`pg`)
- Knex migrations for Engage DB schema management.
- Cookie + JWT auth.
- TypeBox schemas and Swagger for API contracts.

## Frontend Stack
- React + Vite
- Dashboard modules:
  - Segmentation builder
  - Campaign manager
  - Analytics dashboard
- UI goals:
  - Enterprise-grade visual system
  - Data-dense workflow-first UX

## Suggested MVP Milestones

### Milestone 1: Data Foundation
- Create Engage DB core schema.
- Build CRM -> Engage sync jobs for contacts/events.
- Add observability for sync lag and failures.

### Milestone 2: Segmentation Engine
- Segment DSL (JSON rule tree).
- Segment evaluation worker.
- `segment_members` precompute pipeline.

### Milestone 3: Campaign Execution
- Email template management.
- Audience snapshot + scheduler.
- Throttled delivery worker.

### Milestone 4: Analytics & UX
- Campaign funnel metrics.
- Segment trend visualizations.
- Access-control guarded UI screens.

## Non-goals for MVP
- Full journey orchestration.
- Multi-channel inbox and conversational automation.
- Advanced attribution modeling.
- Real-time event streaming with exactly-once semantics.

## Risks & Mitigations
- **Data drift between CRM and Engage** -> incremental sync checkpoints + nightly reconciliation.
- **Segment compute latency at scale** -> precompute members + indexed event schema.
- **Deliverability issues** -> domain setup checks, bounce/complaint handling, sending limits.
- **Access misuse** -> strict RBAC and audit fields on mutations.
