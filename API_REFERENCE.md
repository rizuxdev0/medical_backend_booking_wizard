# Référence API - MedAgenda Backend

Base URL: `http://localhost:3000/api/v1`

## Authentification

| Méthode | Endpoint | Description | Body |
|---------|----------|-------------|------|
| POST | `/auth/login` | Connexion | `{ "email": string, "password": string }` |
| POST | `/auth/register` | Inscription | `{ "email": string, "password": string, "first_name"?: string, "last_name"?: string }` |
| GET | `/auth/me` | Profil courant | - |
| POST | `/auth/logout` | Déconnexion | - |

## Utilisateurs (Admin only)

| Méthode | Endpoint | Description | Body |
|---------|----------|-------------|------|
| GET | `/users` | Liste tous les utilisateurs | Query: `?page=1&limit=10` |
| GET | `/users/:id` | Détail d'un utilisateur | - |
| POST | `/users` | Créer un utilisateur | `{ "email": string, "password": string, "first_name"?: string, ... }` |
| PATCH | `/users/:id` | Modifier un utilisateur | `{ "first_name"?: string, ... }` |
| POST | `/users/:id/roles` | Ajouter un rôle | `{ "role": string }` |
| DELETE | `/users/:id/roles/:role` | Retirer un rôle | - |

## Patients

| Méthode | Endpoint | Description | Body |
|---------|----------|-------------|------|
| GET | `/patients` | Liste des patients | Query: `?search=...&page=1&limit=10` |
| GET | `/patients/:id` | Détail d'un patient | - |
| POST | `/patients` | Créer un patient | `{ "first_name": string, "last_name": string, ... }` |
| PATCH | `/patients/:id` | Modifier un patient | `{ "first_name"?: string, ... }` |
| DELETE | `/patients/:id` | Supprimer un patient | - |
| GET | `/patients/:id/appointments` | Rendez-vous du patient | - |
| GET | `/patients/:id/invoices` | Factures du patient | - |

## Praticiens

| Méthode | Endpoint | Description | Body |
|---------|----------|-------------|------|
| GET | `/practitioners` | Liste des praticiens | - |
| GET | `/practitioners/:id` | Détail d'un praticien | - |
| POST | `/practitioners` | Créer un praticien | `{ "specialty": string, ... }` |
| PATCH | `/practitioners/:id` | Modifier un praticien | `{ "specialty"?: string, ... }` |
| GET | `/practitioners/:id/schedule` | Horaires du praticien | - |
| PUT | `/practitioners/:id/schedule` | Modifier horaires | `[ { "day_of_week": number, "start_time": string, "end_time": string } ]` |
| GET | `/practitioners/:id/absences` | Absences du praticien | - |
| POST | `/practitioners/:id/absences` | Ajouter absence | `{ "start_date": string, "end_date": string, "reason"?: string }` |
| DELETE | `/practitioners/:id/absences/:absenceId` | Supprimer absence | - |
| GET | `/practitioners/:id/availability` | Disponibilité | Query: `?date=YYYY-MM-DD` |
| GET | `/practitioners/:id/guards` | Gardes du praticien | Query: `?month=YYYY-MM` |

## Rendez-vous

| Méthode | Endpoint | Description | Body |
|---------|----------|-------------|------|
| GET | `/appointments` | Liste des rendez-vous | Query: `?status=...&practitioner_id=...&date_from=...&date_to=...&page=1&limit=20` |
| GET | `/appointments/:id` | Détail d'un rendez-vous | - |
| POST | `/appointments` | Créer un rendez-vous | `{ "patient_id": string, "practitioner_id": string, "scheduled_at": string, "duration_minutes"?: number, ... }` |
| PATCH | `/appointments/:id` | Modifier un rendez-vous | `{ "scheduled_at"?: string, ... }` |
| PATCH | `/appointments/:id/status` | Changer statut | `{ "status": "confirmed" \| "cancelled" \| ... }` |
| POST | `/appointments/:id/reschedule` | Replanifier | `{ "scheduled_at": string, "practitioner_id"?: string }` |
| DELETE | `/appointments/:id` | Annuler | - |

## Facturation

| Méthode | Endpoint | Description | Body |
|---------|----------|-------------|------|
| GET | `/invoices` | Liste des factures | Query: `?status=...&patient_id=...&page=1&limit=20` |
| GET | `/invoices/unpaid` | Factures impayées | - |
| GET | `/invoices/dashboard` | Tableau de bord | - |
| GET | `/invoices/:id` | Détail d'une facture | - |
| POST | `/invoices` | Créer une facture | `{ "patient_id": string, "items": [...], "tax_rate"?: number, ... }` |
| PATCH | `/invoices/:id` | Modifier une facture | `{ "status"?: string, ... }` |
| POST | `/invoices/:id/payments` | Ajouter un paiement | `{ "amount": number, "payment_method": string, ... }` |
| GET | `/invoices/:id/payments` | Paiements d'une facture | - |

## File d'attente

| Méthode | Endpoint | Description | Body |
|---------|----------|-------------|------|
| GET | `/queue` | État de la file | Query: `?status=waiting&practitioner_id=...` |
| GET | `/queue/stats` | Statistiques | - |
| POST | `/queue/check-in` | Enregistrer arrivée | `{ "patient_id": string, "practitioner_id"?: string, "priority"?: number }` |
| PATCH | `/queue/:id/call` | Appeler patient | - |
| PATCH | `/queue/:id/start` | Démarrer consultation | - |
| PATCH | `/queue/:id/complete` | Terminer | - |
| PATCH | `/queue/:id/cancel` | Annuler | - |
| PATCH | `/queue/:id/no-show` | Absent | - |
| GET | `/queue/settings` | Paramètres | Query: `?practitioner_id=...` |
| PUT | `/queue/settings` | Modifier paramètres | `{ "average_service_time_minutes": number, "max_queue_size"?: number, ... }` |

## Ressources

| Méthode | Endpoint | Description | Body |
|---------|----------|-------------|------|
| GET | `/resources` | Liste des ressources | Query: `?type=room&is_available=true` |
| GET | `/resources/:id` | Détail d'une ressource | - |
| POST | `/resources` | Créer une ressource | `{ "name": string, "type": "room"\|"equipment", ... }` |
| PATCH | `/resources/:id` | Modifier une ressource | `{ "name"?: string, ... }` |
| GET | `/resources/:id/schedule` | Horaires de la ressource | - |
| PUT | `/resources/:id/schedule` | Modifier horaires | `[ { "day_of_week": number, "start_time": string, "end_time": string } ]` |
| GET | `/resources/:id/bookings` | Réservations | Query: `?date_from=...&date_to=...` |
| POST | `/resources/:id/bookings` | Créer réservation | `{ "start_time": string, "end_time": string, "practitioner_id"?: string }` |
| GET | `/resources/:id/maintenance` | Historique maintenance | - |
| POST | `/resources/:id/maintenance` | Ajouter maintenance | `{ "maintenance_type": string, "description"?: string, ... }` |

## Paramètres

| Méthode | Endpoint | Description | Body |
|---------|----------|-------------|------|
| GET | `/settings` | Tous les paramètres | - |
| GET | `/settings/:key` | Un paramètre | - |
| PUT | `/settings/:key` | Créer/modifier | `{ "value": any }` |
| DELETE | `/settings/:key` | Supprimer | - |

## Journaux d'activité

| Méthode | Endpoint | Description | Body |
|---------|----------|-------------|------|
| GET | `/activity-logs` | Liste des logs | Query: `?entity_type=patient&entity_id=...&page=1&limit=50` |
| GET | `/activity-logs/:id` | Détail d'un log | - |
| POST | `/activity-logs` | Créer un log | `{ "action": string, "entity_type": string, ... }` |

## Départements

| Méthode | Endpoint | Description | Body |
|---------|----------|-------------|------|
| GET | `/departments` | Liste des départements | - |
| GET | `/departments/:id` | Détail d'un département | - |
| POST | `/departments` | Créer un département | `{ "name": string, "code"?: string, "head_user_id"?: string, ... }` |
| PATCH | `/departments/:id` | Modifier | `{ "name"?: string, ... }` |
| DELETE | `/departments/:id` | Supprimer | - |

## Devises

| Méthode | Endpoint | Description | Body |
|---------|----------|-------------|------|
| GET | `/currencies` | Liste des devises | Query: `?active=true` |
| GET | `/currencies/default` | Devise par défaut | - |
| GET | `/currencies/code/:code` | Devise par code | - |
| GET | `/currencies/:id` | Détail d'une devise | - |
| POST | `/currencies` | Créer une devise | `{ "code": string, "name": string, "symbol": string, ... }` |
| PATCH | `/currencies/:id` | Modifier | `{ "code"?: string, ... }` |
| DELETE | `/currencies/:id` | Supprimer | - |

## Gardes

| Méthode | Endpoint | Description | Body |
|---------|----------|-------------|------|
| GET | `/guards` | Liste des gardes | Query: `?practitioner_id=...&month=YYYY-MM` |
| GET | `/guards/:id` | Détail d'une garde | - |
| POST | `/guards` | Créer une garde | `{ "practitioner_id": string, "guard_date": string, "guard_type"?: string }` |
| PATCH | `/guards/:id` | Modifier | `{ "guard_date"?: string, ... }` |
| DELETE | `/guards/:id` | Supprimer | - |

## Notifications

| Méthode | Endpoint | Description | Body |
|---------|----------|-------------|------|
| GET | `/notifications/logs` | Notifications reçues | Query: `?user_id=...&is_read=false` |
| GET | `/notifications/logs/unread/count` | Nombre non lues | - |
| PATCH | `/notifications/logs/:id/read` | Marquer comme lue | - |
| PATCH | `/notifications/logs/read-all` | Tout marquer comme lu | - |
| POST | `/notifications` | Créer notification planifiée | `{ "appointment_id": string, "type": string, "scheduled_for": string }` |
| GET | `/notifications/scheduled` | Notifications planifiées | - |

## Permissions

| Méthode | Endpoint | Description | Body |
|---------|----------|-------------|------|
| GET | `/permissions` | Toutes les permissions | - |
| GET | `/permissions/role/:role` | Permissions d'un rôle | - |
| POST | `/permissions` | Créer une permission | `{ "code": string, "name": string, "module": string }` |
| POST | `/permissions/assign` | Assigner permissions | `{ "role": string, "permission_codes": string[] }` |

## Notes de consultation

| Méthode | Endpoint | Description | Body |
|---------|----------|-------------|------|
| GET | `/consultation-notes/by-appointment/:appointmentId` | Note d'un rendez-vous | - |
| GET | `/consultation-notes/:id` | Détail d'une note | - |
| POST | `/consultation-notes` | Créer une note | `{ "appointment_id": string, "diagnosis"?: string, ... }` |
| PATCH | `/consultation-notes/:id` | Modifier | `{ "diagnosis"?: string, ... }` |
| POST | `/consultation-notes/:id/close` | Fermer la note | - |