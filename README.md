# Medichain Frontend

Medichain Frontend is the client application for the Medichain backend. It is built with Next.js, React Query, Zustand, Tailwind CSS, and shadcn/ui components.

## Application Structure

The frontend uses a single authenticated app shell. The root page decides whether to show the login screen or the dashboard shell based on the current auth state.

Core pieces:

- `src/app/page.tsx`: top-level router for login and in-app views
- `src/lib/api.ts`: typed API client for the backend gateway
- `src/lib/store.ts`: Zustand store for auth, navigation, and UI state
- `src/lib/hooks/*`: React Query hooks for backend operations
- `src/components/ehr/*`: role-specific dashboard views and forms

## How It Works

1. The user signs in or registers from the login screen.
2. The API client sends the request to the backend gateway.
3. The backend returns the user profile plus access and refresh tokens.
4. The frontend stores the tokens in `localStorage` and updates the app store.
5. The UI switches to the role-appropriate default dashboard.
6. Sidebar navigation changes the active view without leaving the app shell.

On reload, the app can restore the session by calling `/auth/me` with the stored token.

## Role-Based UI

The frontend maps backend roles into three UI groups:

- patient
- doctor
- admin

Default landing views:

- patient users go to the patient dashboard
- provider roles go to the doctor dashboard
- ministry and super admin roles go to the admin dashboard

## Main User Areas

Patient area:

- profile and settings
- records
- prescriptions
- documents
- emergency contacts
- allergies and security

Doctor area:

- dashboard
- patient search
- my patients
- new visit workflow
- prescriptions
- facility view
- audit log
- provider settings

Admin area:

- summary dashboard with aggregate analytics

## Backend Integration

The frontend calls the gateway through `NEXT_PUBLIC_API_URL`.

The main API groups are:

- `/auth/*` for login, registration, password change, and session data
- `/patients/*` for patient profile and admin access
- `/providers/*` for staff and facility management
- `/records/*` for encounters, prescriptions, vitals, and documents

Data is fetched with React Query and cached per screen. Mutations invalidate the relevant queries so updated records appear immediately after save.

## Local Development

Scripts from `package.json`:

- `npm run dev`: run the app locally
- `npm run build`: create the production build
- `npm run start`: start the production server
- `npm run lint`: run lint checks

## Environment Variables

The frontend expects:

- `NEXT_PUBLIC_API_URL`

If this is not set, the app defaults to `http://localhost:3000/api/v1`.

## Production Notes

The app is configured for a standalone Next.js build. It is intended to run against the deployed gateway URL in production.

