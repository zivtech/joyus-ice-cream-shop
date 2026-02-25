# Roles and Permissions

This document defines the five platform roles used across the Milk Jawn platform. For full context on the role model design decisions, see `docs/planning/07-platform-reboot-plan.md` (Role Model section).

## The Five Roles

| Platform Role | Milk Jawn Label | Purpose |
|---|---|---|
| **Admin** | Owner/Admin | Strategic oversight, platform configuration, financials, full analytics access |
| **GM** | General Manager | Operational approvals, schedule sign-off, publish gate authority |
| **Store Manager** | Store Manager | Day-to-day scheduling, shift editing, exception requests, retrospectives |
| **Key Lead** | Key Lead | On-shift authority, opening/closing duties, compliance certification holder |
| **Staff** | Staff | View schedule, request time off, manage availability |

Role labels are **tenant-configurable**. A bakery might call their GM a "Head Baker." The label is cosmetic; the permission set is what matters and is enforced server-side.

---

## Permissions by Role

### Admin

Full platform access.

- Platform configuration (business rules, guardrails, compliance jurisdiction, pay assumptions)
- Financials and all analytics surfaces
- User management (create/edit/deactivate users, assign roles)
- Tenant settings (operating hours, seasonal calendar, target profiles)
- All CRUD on schedules, locations, employees, and compliance rules
- POS and delivery marketplace connection management
- Audit log access

### GM (General Manager)

Operational approvals and schedule governance.

- Approve or reject weekly schedule submissions
- Publish approved schedules to POS
- Resolve exception requests from Store Managers
- Review and act on compliance readiness checks before publish
- Employee management (view and edit employee records)
- Analytics view (read-only on financial and staffing surfaces)
- Refresh PTO sync and review conflict state

### Store Manager

Day-to-day scheduling within their location(s).

- Create and edit shift plans (slots, assignments, headcount)
- Submit schedule drafts for GM approval
- Submit day-level exception requests (events, weather, anomalies)
- View employee roster and availability for their location
- Location-scoped analytics (read-only)
- Post shift notes and review planned-vs-actual variance

### Key Lead

On-shift authority. View-only on schedules; cannot edit or manage employees.

- View assigned shifts with opening/closing duties
- See on-shift responsibility periods (certified coverage windows)
- View certification status and renewal reminders (own record only)

### Staff

Self-service schedule and availability.

- View own upcoming and historical shifts
- Request time off (PTO and availability changes)
- View request status and approval/denial notifications

---

## Design Notes

- **Key Lead exists for compliance reasons.** Food safety regulations (ServSafe and equivalents) require a certified person on every shift in most jurisdictions. Collapsing Key Lead into Staff removes the ability to enforce this as a scheduling constraint.
- **Permissions are server-side.** Laravel enforces access control via Policies and spatie/laravel-permission. The React frontend renders based on the authenticated user's permissions but never trusts client-side role checks alone.
- **Tenant-configurable labels.** Tenants can rename roles to match their culture (Job 17 in the platform reboot plan). Permission sets are not affected by label changes.
