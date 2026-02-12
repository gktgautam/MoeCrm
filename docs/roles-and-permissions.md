# Roles and permissions model

The authorization model now uses database-backed role-permission mappings instead of hardcoded permission lists in application code.

## System roles (non-editable)

These roles are seeded as `is_system = true` and `is_editable = false`:

- **Admin**: full access, including billing, team management, and role management.
- **Manager**: broad access except team create/edit/delete and custom-role management.
- **Marketer**: campaign creation/management and basic reporting access.
- **Developer**: integration-focused access with limited production controls.
- **Analyst**: reporting and segmentation read/export access only.

A legacy **Owner** system role is retained for backward compatibility and maps to Admin-level permissions.

## Custom roles

Custom roles can be created in `app_roles` with `org_id` set and assigned permission rows through `app_role_permissions`.

## Single-user permission overrides

Per-user overrides are stored in `app_user_permission_overrides`:

- `is_allowed = true`: force-grant permission
- `is_allowed = false`: force-revoke permission
- removing the row resets the permission to role default behavior

## Effective permissions

Effective permissions are resolved by:

1. Resolving role for the user (org-specific role first, then system fallback).
2. Loading base permissions from `app_role_permissions`.
3. Applying user overrides from `app_user_permission_overrides`.

`GET /api/v1/auth/me` now returns the computed permission list from DB data.
