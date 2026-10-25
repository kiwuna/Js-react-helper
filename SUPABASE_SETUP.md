# Supabase setup

This React app reads and writes its documentation through Supabase. It uses only the browser-safe publishable (formerly “anon”) key—never a service-role key.

## 1. Create a project

1. Sign in at [Supabase](https://supabase.com/dashboard) and select **New project**.
2. Choose an organization, project name, database password, and region.
3. Wait for the project to finish provisioning.

## 2. Get browser-safe credentials

Open **Project Settings → API**. Copy the **Project URL** and the **Publishable key**. If your dashboard only shows legacy keys, use the `anon` public key. Do not use `service_role` anywhere in this React app.

## 3. Configure local environment variables

Copy `.env.example` to a new `.env` file in the project root, then replace both placeholders:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_or_anon_key
```

`.env` is gitignored. Restart Vite after changing it.

## 4. Create the database and policies

1. In Supabase, open **SQL Editor → New query**.
2. Paste the complete contents of `supabase/schema.corrected.sql` and run it.
3. Verify under **Table Editor** that `documentation_sections`, `topics`, and `topic_content` exist.

The schema seeds the existing JavaScript and React topic lists and their introduction pages. RLS stays enabled on every table. Visitors can read the documentation, while only allowlisted editors can create, edit, rename, and delete notes.

## 5. Enable editor sign-in

1. In Supabase, open **Authentication → Providers → Email** and ensure Email is enabled. Keep **Confirm email** enabled for secure account verification.
2. In **Authentication → URL Configuration**, add your local Vite URL (for example `http://localhost:5173`) and your deployed Vercel URL to Redirect URLs.
3. Use the top-right profile button in the website to create an account or sign in. New accounts must confirm their email before first sign-in.
4. In SQL Editor, allow an account to edit (replace the email):

```sql
insert into public.documentation_editors (user_id)
select id from auth.users where email = 'editor@example.com'
on conflict (user_id) do nothing;
```

Editors must enter their own account password to unlock changes. The unlock lasts 10 minutes and is held only in memory; it is not stored in browser storage.

## 6. Run locally

```bash
npm install
npm run dev
```

Open the local URL Vite prints. The app shows a configuration, loading, error, empty, or loaded state as appropriate.

## 7. Deploy to Vercel

1. Push this project to a Git provider and import it in [Vercel](https://vercel.com/new).
2. Keep the detected Vite build settings (`npm run build`, output directory `dist`).
3. In **Project Settings → Environment Variables**, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` for Production (and Preview if desired).
4. Deploy or redeploy after adding them.

Never add the database password or service-role key to Vercel frontend variables.
