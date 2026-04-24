-- IDA - AI Render Platform
-- Supabase Database Schema

-- Users table
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  avatar text,
  credits integer default 10,
  plan text default 'free',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Transactions (credit history)
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  type text not null check (type in ('purchase', 'consume', 'gift', 'refund')),
  amount integer not null,
  description text,
  created_at timestamp with time zone default now()
);

-- Generations (render history)
create table if not exists generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  function_type text not null,
  prompt text,
  input_image_url text,
  output_image_url text,
  credits_used integer not null default 1,
  is_public boolean default false,
  created_at timestamp with time zone default now()
);

-- Subscriptions
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  plan text not null,
  stripe_subscription_id text unique,
  status text default 'active',
  current_period_end timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- Indexes
create index if not exists idx_transactions_user on transactions(user_id);
create index if not exists idx_generations_user on generations(user_id);
create index if not exists idx_generations_public on generations(is_public) where is_public = true;
create index if not exists idx_subscriptions_user on subscriptions(user_id);

-- RPC: atomic credit update
create or replace function update_credits(p_user_id uuid, p_delta integer)
returns void as $$
begin
  update users
  set credits = credits + p_delta,
      updated_at = now()
  where id = p_user_id
    and credits + p_delta >= 0;
  if not found then
    raise exception 'Insufficient credits or user not found';
  end if;
end;
$$ language plpgsql;

-- Row Level Security
alter table users enable row level security;
alter table transactions enable row level security;
alter table generations enable row level security;
alter table subscriptions enable row level security;

-- Policies: users can read/update their own data
create policy "Users can view own profile" on users for select using (auth.uid() = id);
create policy "Users can update own profile" on users for update using (auth.uid() = id);

create policy "Users can view own transactions" on transactions for select using (auth.uid() = user_id);

create policy "Users can view own generations" on generations for select using (auth.uid() = user_id);
create policy "Anyone can view public generations" on generations for select using (is_public = true);
create policy "Users can update own generations" on generations for update using (auth.uid() = user_id);

create policy "Users can view own subscriptions" on subscriptions for select using (auth.uid() = user_id);
