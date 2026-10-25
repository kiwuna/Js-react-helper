-- Run this whole file in the Supabase SQL Editor.
-- This app has no authentication, so the policies below intentionally allow
-- public reads and edits. Add authentication before using this for private data.

create table if not exists public.documentation_sections (
  id text primary key,
  name text not null,
  short_name text not null,
  color text not null,
  position integer not null unique
);

create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  section_id text not null references public.documentation_sections(id) on delete cascade,
  title text not null,
  position integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (section_id, title),
  unique (section_id, position)
);

create table if not exists public.topic_content (
  topic_id uuid primary key references public.topics(id) on delete cascade,
  subtitle text not null default '',
  lead text not null default '',
  content_blocks jsonb not null default '[]'::jsonb,
  sources jsonb not null default '[]'::jsonb,
  related_topics jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  constraint content_blocks_is_array check (jsonb_typeof(content_blocks) = 'array'),
  constraint sources_is_array check (jsonb_typeof(sources) = 'array'),
  constraint related_topics_is_array check (jsonb_typeof(related_topics) = 'array')
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
drop trigger if exists topics_set_updated_at on public.topics;
create trigger topics_set_updated_at before update on public.topics for each row execute function public.set_updated_at();
drop trigger if exists topic_content_set_updated_at on public.topic_content;
create trigger topic_content_set_updated_at before update on public.topic_content for each row execute function public.set_updated_at();

insert into public.documentation_sections (id, name, short_name, color, position) values
  ('javascript', 'JavaScript', 'JS', '#f3d52c', 1),
  ('react', 'React', 'R', '#48c8df', 2)
on conflict (id) do nothing;

insert into public.topics (section_id, title, position)
select 'javascript', title, ordinality::integer - 1
from unnest(array['Introduction','Variables and Data Types','Operators','Conditions','Loops','Arrays','Array Methods','map()','filter()','find()','reduce()','Objects','Functions','Parameters and Arguments','Return Values','Arrow Functions','Scope','Global Scope and Block Scope','Closures','Hoisting','Callbacks','setTimeout and setInterval','DOM Manipulation','Events','Promises','Async/Await','Fetch API','Modules','Other Notes']) with ordinality as item(title, ordinality)
on conflict (section_id, title) do nothing;

insert into public.topics (section_id, title, position)
select 'react', title, ordinality::integer - 1
from unnest(array['Introduction','Setting Up React with Vite','Project Structure','JSX','Components','Props','State','Event Handling','Conditional Rendering','Lists and Keys','Forms','Hooks','useState','useEffect','React Router','Fetching Data','Project Notes','Other Notes']) with ordinality as item(title, ordinality)
on conflict (section_id, title) do nothing;

insert into public.topic_content (topic_id, subtitle, lead, content_blocks, related_topics)
select id, 'The language that brings the web to life.', 'JavaScript is a programming language used to create interactive experiences in the browser. It can also run on servers and in many other environments.',
  '[{"heading":"What JavaScript does","paragraphs":["HTML gives a page its structure, and CSS describes its appearance. JavaScript adds behavior: responding to clicks, updating content, validating forms, and working with data."]},{"heading":"A first example","code":"const greeting = \"Hello, world!\";\nconsole.log(greeting);","language":"javascript","caption":"Open your browser console to see the message."},{"heading":"A few useful ideas","bullets":["Values can be stored in variables and combined with operators.","Functions package reusable steps.","The browser provides APIs for interacting with the page and the network."]}]'::jsonb,
  '["Variables and Data Types","Functions","DOM Manipulation"]'::jsonb
from public.topics where section_id = 'javascript' and title = 'Introduction'
on conflict (topic_id) do nothing;

insert into public.topic_content (topic_id, subtitle, lead, content_blocks, related_topics)
select id, 'Build interfaces from small, reusable pieces.', 'React is a JavaScript library for building user interfaces. You describe what the page should show, and React updates the screen when your data changes.',
  '[{"heading":"Think in components","paragraphs":["A component is a reusable piece of interface, such as a button, a navigation bar, or an entire page. Components can be composed together to build a complete application."]},{"heading":"A small component","code":"function Greeting() {\n  return <h1>Hello, React!</h1>;\n}","language":"jsx","caption":"A function component returns the UI it describes."},{"heading":"What to learn next","bullets":["JSX describes UI with familiar JavaScript expressions.","Props pass information into a component.","State lets a component remember information that changes over time."]}]'::jsonb,
  '["Setting Up React with Vite","JSX","Components","Props","State"]'::jsonb
from public.topics where section_id = 'react' and title = 'Introduction'
on conflict (topic_id) do nothing;

alter table public.documentation_sections enable row level security;
alter table public.topics enable row level security;
alter table public.topic_content enable row level security;

drop policy if exists "Anyone can read documentation sections" on public.documentation_sections;
drop policy if exists "Anyone can read topics" on public.topics;
drop policy if exists "Anyone can manage topics" on public.topics;
drop policy if exists "Anyone can read topic content" on public.topic_content;
drop policy if exists "Anyone can manage topic content" on public.topic_content;
create policy "Anyone can read documentation sections" on public.documentation_sections for select to anon, authenticated using (true);
create policy "Anyone can read topics" on public.topics for select to anon, authenticated using (true);
create policy "Anyone can manage topics" on public.topics for all to anon, authenticated using (true) with check (true);
create policy "Anyone can read topic content" on public.topic_content for select to anon, authenticated using (true);
create policy "Anyone can manage topic content" on public.topic_content for all to anon, authenticated using (true) with check (true);
