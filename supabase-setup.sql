-- ============================================================================================================
--  SAAD CAR RENTAL: Supabase setup (replaces Cloudflare D1 for the Insights dashboard and the Clients list)
--  How to use: Supabase dashboard > SQL Editor > New query > paste this WHOLE file > press Run.
--  It is safe to run again (nothing is deleted, existing data is kept).
--  Security: all three tables have Row Level Security ON and NO policy, so the public (anon) key can read or write NOTHING.
--  Only the website's server (secret key, kept in Cloudflare) can use the functions at the bottom.
-- ============================================================================================================

-- 1) Tables -------------------------------------------------------------------------------------------------
create table if not exists public.hits (          -- one row per page view / click / "still here" ping
  id bigint generated always as identity primary key,
  ts bigint not null, day text not null, hr integer not null,
  vid text not null, sid text not null, type text not null,
  path text, item text, src text, dev text, cty text, city text
);
create index if not exists hits_day on public.hits (day, type);
create index if not exists hits_vid on public.hits (vid, ts);
create index if not exists hits_ts  on public.hits (ts);
-- The live feed only needs real events, not the 30-second pings: these two small indexes make it instant (this is what exhausted D1).
create index if not exists hits_feed_id  on public.hits (id desc) where type not in ('ping', 'form_error');
create index if not exists hits_last_ts  on public.hits (ts desc) where type <> 'ping';

create table if not exists public.vfirst (          -- one row per visitor = the moment they were first seen
  vid text primary key, ts bigint not null, day text not null, hr integer not null
);
create index if not exists vfirst_day on public.vfirst (day);

create table if not exists public.leads (           -- customers typed into the website forms (also those who never pressed Send)
  vid text not null, src text not null, created bigint not null, updated bigint not null,
  name text not null default '', phone text not null default '', email text not null default '', whatsapp text not null default '',
  car text not null default '', pickup text not null default '', dropoff text not null default '', day text not null default '',
  tm text not null default '', pax text not null default '', extra text not null default '', city text not null default '',
  dev text not null default '', status text not null default 'partial', seen integer not null default 0, called integer not null default 0,
  primary key (vid, src)
);
create index if not exists leads_updated on public.leads (updated);
create index if not exists leads_created on public.leads (created);
create index if not exists leads_unseen  on public.leads (seen) where seen = 0;

-- 2) Security: Row Level Security ON, no policies = the public key cannot touch these tables ----------------
alter table public.hits   enable row level security;
alter table public.vfirst enable row level security;
alter table public.leads  enable row level security;
revoke all on table public.hits, public.vfirst, public.leads from anon, authenticated;

-- 3) Functions the website server calls (same numbers and fields the old D1 code produced) -----------------------
create or replace function public.saad_collect(p_ts bigint, p_day text, p_hr integer, p_vid text, p_sid text, p_type text,
  p_path text, p_item text, p_src text, p_dev text, p_cty text, p_city text) returns void language plpgsql as $$
begin
  insert into public.hits (ts, day, hr, vid, sid, type, path, item, src, dev, cty, city)
  values (p_ts, p_day, p_hr, p_vid, p_sid, p_type, p_path, p_item, p_src, p_dev, p_cty, p_city);
  if p_type = 'pv' then
    insert into public.vfirst (vid, ts, day, hr) values (p_vid, p_ts, p_day, p_hr) on conflict (vid) do nothing;
  end if;
  if random() < 0.01 then
    delete from public.hits where ts < p_ts - 400::bigint * 86400000;                          -- keep ~13 months of detail
    delete from public.hits where type = 'ping' and ts < p_ts - 7::bigint * 86400000;          -- 30-second pings are only needed for "online now": drop them after 7 days so the free 500 MB never fills
  end if;
end $$;

create or replace function public._saad_kpi(p_a text, p_b text) returns jsonb language sql stable as $$
  select coalesce(jsonb_agg(t), '[]'::jsonb) from (
    select count(distinct vid) filter (where type = 'pv') as vis, count(*) filter (where type = 'pv') as pv,
           count(distinct sid) filter (where type = 'pv') as ses,
           count(*) filter (where type = 'phone_click') as calls, count(*) filter (where type = 'whatsapp_click') as wa,
           count(*) filter (where type = 'email_click') as em, count(*) filter (where type = 'booking_click') as bc,
           count(*) filter (where type = 'quote_start') as qs, count(*) filter (where type = 'quote_submit') as qd
    from public.hits where day between p_a and p_b) t $$;

create or replace function public._saad_bounce(p_a text, p_b text) returns jsonb language sql stable as $$
  select jsonb_build_array(jsonb_build_object('n', count(*))) from (
    select sid from public.hits where type = 'pv' and day between p_a and p_b group by sid having count(*) = 1) x $$;

create or replace function public._saad_new(p_a text, p_b text) returns jsonb language sql stable as $$
  select jsonb_build_array(jsonb_build_object('n', count(*))) from public.vfirst where day between p_a and p_b $$;

create or replace function public._saad_top(p_col text, p_kind text, p_a text, p_b text, p_lim integer) returns jsonb language plpgsql stable as $$
declare r jsonb; whr text;
begin
  if p_col not in ('path', 'src', 'dev', 'city', 'item') then raise exception 'bad column'; end if;
  whr := case p_kind
    when 'pv'      then $q$type = 'pv'$q$
    when 'pv_city' then $q$type = 'pv' and city <> ''$q$
    when 'vehicle' then $q$type = 'vehicle_view' and item <> ''$q$
    when 'spots'   then $q$type in ('route_view', 'location_view', 'service_view') and item <> ''$q$
  end;
  if whr is null then raise exception 'bad kind'; end if;
  execute format($f$select coalesce(jsonb_agg(t), '[]'::jsonb) from (
      select %1$I as k, count(*) as n, count(distinct vid) as u from public.hits
      where %2$s and day between $1 and $2 group by %1$I order by n desc, k limit %3$s) t$f$, p_col, whr, greatest(1, least(p_lim, 50)))
    into r using p_a, p_b;
  return r;
end $$;

-- Everything the dashboard's main screen needs, in ONE call.
create or replace function public.saad_stats_raw(p_key text, p_n integer, p_step integer, p_today text, p_from text, p_pfrom text,
  p_pto text, p_y text, p_w7 text, p_m30 text) returns jsonb language plpgsql stable as $$
declare s jsonb; ns jsonb;
begin
  if p_key = 'today' then
    select coalesce(jsonb_agg(t), '[]'::jsonb) into s from (
      select hr as b, count(*) as pv, count(distinct vid) as vis from public.hits where type = 'pv' and day = p_today group by hr) t;
    select coalesce(jsonb_agg(t), '[]'::jsonb) into ns from (
      select hr as b, count(*) as n from public.vfirst where day = p_today group by hr) t;
  else
    select coalesce(jsonb_agg(t), '[]'::jsonb) into s from (
      select ((day::date - p_from::date) / greatest(p_step, 1)) as b, count(*) as pv, count(distinct vid) as vis
      from public.hits where type = 'pv' and day between p_from and p_today group by 1) t;
    select coalesce(jsonb_agg(t), '[]'::jsonb) into ns from (
      select ((day::date - p_from::date) / greatest(p_step, 1)) as b, count(*) as n
      from public.vfirst where day between p_from and p_today group by 1) t;
  end if;
  return jsonb_build_object(
    'series', s, 'newSeries', ns,
    'cur', public._saad_kpi(p_from, p_today), 'prev', public._saad_kpi(p_pfrom, p_pto),
    'bCur', public._saad_bounce(p_from, p_today), 'bPrev', public._saad_bounce(p_pfrom, p_pto),
    'nCur', public._saad_new(p_from, p_today), 'nPrev', public._saad_new(p_pfrom, p_pto),
    'kToday', public._saad_kpi(p_today, p_today), 'kY', public._saad_kpi(p_y, p_y),
    'kW', public._saad_kpi(p_w7, p_today), 'kM', public._saad_kpi(p_m30, p_today),
    'nToday', public._saad_new(p_today, p_today), 'nY', public._saad_new(p_y, p_y),
    'nW', public._saad_new(p_w7, p_today), 'nM', public._saad_new(p_m30, p_today),
    'pages',   public._saad_top('path', 'pv', p_from, p_today, 8),
    'sources', public._saad_top('src', 'pv', p_from, p_today, 7),
    'devices', public._saad_top('dev', 'pv', p_from, p_today, 4),
    'places',  public._saad_top('city', 'pv_city', p_from, p_today, 6),
    'cars',    public._saad_top('item', 'vehicle', p_from, p_today, 6),
    'spots',   public._saad_top('item', 'spots', p_from, p_today, 6),
    'hours', (select coalesce(jsonb_agg(t), '[]'::jsonb) from (
      select hr as k, count(*) as n from public.hits where type = 'pv' and day between p_from and p_today group by hr) t),
    'since',  (select jsonb_build_array(jsonb_build_object('f', min(ts))) from public.hits),
    'allPv',  (select jsonb_build_array(jsonb_build_object('n', count(*))) from public.hits where type = 'pv'),
    'allVis', (select jsonb_build_array(jsonb_build_object('n', count(*))) from public.vfirst)
  );
end $$;

-- Daily / weekly / monthly trend and weekday averages.
create or replace function public.saad_trend_raw(p_today text, p_d0 text, p_w0 text, p_m0 text, p_wmin text) returns jsonb language plpgsql stable as $$
declare since text; wf text;
begin
  select coalesce(min(day), p_today) into since from public.hits;
  wf := case when since > p_wmin then since else p_wmin end;
  return jsonb_build_object('wf', wf, 'r', jsonb_build_array(
    (select coalesce(jsonb_agg(t), '[]'::jsonb) from (select day as k, count(distinct vid) filter (where type = 'pv') as vis, count(*) filter (where type = 'pv') as pv,
        count(distinct sid) filter (where type = 'pv') as ses, count(*) filter (where type in ('phone_click', 'whatsapp_click', 'quote_submit')) as inq
        from public.hits where day between p_d0 and p_today group by day) t),
    (select coalesce(jsonb_agg(t), '[]'::jsonb) from (select day as k, count(*) as n from public.vfirst where day between p_d0 and p_today group by day) t),
    (select coalesce(jsonb_agg(t), '[]'::jsonb) from (select ((day::date - p_w0::date) / 7) as k, count(distinct vid) filter (where type = 'pv') as vis, count(*) filter (where type = 'pv') as pv,
        count(distinct sid) filter (where type = 'pv') as ses, count(*) filter (where type in ('phone_click', 'whatsapp_click', 'quote_submit')) as inq
        from public.hits where day between p_w0 and p_today group by 1) t),
    (select coalesce(jsonb_agg(t), '[]'::jsonb) from (select ((day::date - p_w0::date) / 7) as k, count(*) as n from public.vfirst where day between p_w0 and p_today group by 1) t),
    (select coalesce(jsonb_agg(t), '[]'::jsonb) from (select substr(day, 1, 7) as k, count(distinct vid) filter (where type = 'pv') as vis, count(*) filter (where type = 'pv') as pv,
        count(distinct sid) filter (where type = 'pv') as ses, count(*) filter (where type in ('phone_click', 'whatsapp_click', 'quote_submit')) as inq
        from public.hits where day between p_m0 and p_today group by 1) t),
    (select coalesce(jsonb_agg(t), '[]'::jsonb) from (select substr(day, 1, 7) as k, count(*) as n from public.vfirst where day between p_m0 and p_today group by 1) t),
    (select coalesce(jsonb_agg(t), '[]'::jsonb) from (select extract(dow from day::date)::integer as k, count(*) as pv from public.hits
        where type = 'pv' and day between wf and p_today group by 1) t)
  ));
end $$;

-- "Taza activity" sheet (newest first, page by page).
create or replace function public.saad_activity_raw(p_before bigint, p_lim integer) returns jsonb language sql stable as $$
  select coalesce(jsonb_agg(t order by t.id desc), '[]'::jsonb) from (
    select h.id, h.ts, h.type, h.path, h.item, h.city, h.dev, h.src, h.vid, (v.ts = h.ts) as nw
    from public.hits h left join public.vfirst v on v.vid = h.vid
    where h.type not in ('ping', 'form_error') and (p_before <= 0 or h.id < p_before)
    order by h.id desc limit greatest(1, least(p_lim, 100))) t $$;

-- Who is on the website right now + newest events.
create or replace function public.saad_live_raw(p_since bigint, p_cut bigint) returns jsonb language sql stable as $$
  select jsonb_build_object(
    'online', (select jsonb_build_array(jsonb_build_object('n', count(distinct vid))) from public.hits where ts > p_cut),
    'people', (select coalesce(jsonb_agg(t order by t.ts desc), '[]'::jsonb) from (
        select path, src, dev, city, ts from (
          select distinct on (vid) vid, path, src, dev, city, ts from public.hits
          where ts > p_cut and type <> 'form_error' order by vid, ts desc, id desc) x
        order by ts desc limit 10) t),
    'events', (select coalesce(jsonb_agg(t order by t.id desc), '[]'::jsonb) from (
        select h.id, h.ts, h.type, h.path, h.item, h.city, h.dev, h.src, h.vid, (v.ts = h.ts) as nw
        from public.hits h left join public.vfirst v on v.vid = h.vid
        where h.type not in ('ping', 'form_error') and (p_since <= 0 or h.id > p_since)
        order by h.id desc limit (case when p_since > 0 then 25 else 15 end)) t),
    'maxid', (select jsonb_build_array(jsonb_build_object('m', max(id))) from public.hits),
    'last',  (select coalesce(jsonb_agg(t), '[]'::jsonb) from (select ts from public.hits where type <> 'ping' order by ts desc limit 1) t)
  ) $$;

-- Clients / leads ---------------------------------------------------------------------------------------------
create or replace function public.saad_lead_save(p_vid text, p_src text, p_now bigint, p_name text, p_phone text, p_email text, p_whatsapp text,
  p_car text, p_pickup text, p_dropoff text, p_day text, p_tm text, p_pax text, p_extra text, p_city text, p_dev text, p_status text) returns jsonb language plpgsql as $$
declare had boolean; v_phone text; v_email text; c bigint; burst bigint; unseen bigint;
begin
  select phone, email into v_phone, v_email from public.leads where vid = p_vid and src = p_src;
  had := found;
  if not had then   -- flood guard: a bot cannot fill the list
    select count(*) into c from public.leads where created > p_now - 3600000;
    if c > 400 then return jsonb_build_object('busy', true); end if;
  end if;
  insert into public.leads (vid, src, created, updated, name, phone, email, whatsapp, car, pickup, dropoff, day, tm, pax, extra, city, dev, status)
  values (p_vid, p_src, p_now, p_now, p_name, p_phone, p_email, p_whatsapp, p_car, p_pickup, p_dropoff, p_day, p_tm, p_pax, p_extra, p_city, p_dev, p_status)
  on conflict (vid, src) do update set
    updated  = excluded.updated,
    name     = case when excluded.name     <> '' then excluded.name     else public.leads.name     end,
    phone    = case when excluded.phone    <> '' then excluded.phone    else public.leads.phone    end,
    email    = case when excluded.email    <> '' then excluded.email    else public.leads.email    end,
    whatsapp = case when excluded.whatsapp <> '' then excluded.whatsapp else public.leads.whatsapp end,
    car      = case when excluded.car      <> '' then excluded.car      else public.leads.car      end,
    pickup   = case when excluded.pickup   <> '' then excluded.pickup   else public.leads.pickup   end,
    dropoff  = case when excluded.dropoff  <> '' then excluded.dropoff  else public.leads.dropoff  end,
    day      = case when excluded.day      <> '' then excluded.day      else public.leads.day      end,
    tm       = case when excluded.tm       <> '' then excluded.tm       else public.leads.tm       end,
    pax      = case when excluded.pax      <> '' then excluded.pax      else public.leads.pax      end,
    extra    = case when excluded.extra    <> '' then excluded.extra    else public.leads.extra    end,
    city     = case when excluded.city     <> '' then excluded.city     else public.leads.city     end,
    dev      = case when excluded.dev      <> '' then excluded.dev      else public.leads.dev      end,
    status   = case when public.leads.status = 'sent' or excluded.status = 'sent' then 'sent' else 'partial' end,
    seen     = case when excluded.status = 'sent' and public.leads.status <> 'sent' then 0 else public.leads.seen end;
  if random() < 0.01 then delete from public.leads where updated < p_now - 730::bigint * 86400000; end if;   -- keep 2 years
  select count(*) into burst from public.leads where created > p_now - 60000;
  select count(*) into unseen from public.leads where seen = 0;
  return jsonb_build_object('busy', false, 'had', had, 'prev_phone', v_phone, 'prev_email', v_email, 'burst', burst, 'unseen', unseen);
end $$;

create or replace function public.saad_lead_count() returns jsonb language sql stable as $$
  select jsonb_build_object('unseen', (select count(*) from public.leads where seen = 0)) $$;

create or replace function public.saad_lead_list() returns jsonb language sql stable as $$
  select coalesce(jsonb_agg(t order by t.updated desc, t.vid, t.src), '[]'::jsonb) from (
    select vid, src, created, updated, name, phone, email, whatsapp, car, pickup, dropoff, day, tm, pax, extra, city, dev, status, seen, called
    from public.leads order by updated desc, vid, src limit 500) t $$;

create or replace function public.saad_lead_seen() returns void language sql as $$ update public.leads set seen = 1 where seen = 0 $$;

create or replace function public.saad_lead_update(p_vid text, p_src text, p_called boolean) returns void language sql as $$
  update public.leads set called = case when p_called then 1 else 0 end where vid = p_vid and src = p_src $$;

create or replace function public.saad_lead_delete(p_vid text, p_src text) returns void language sql as $$
  delete from public.leads where vid = p_vid and src = p_src $$;

-- 4) Only the server (secret key = service_role) may call these functions ------------------------------------------
do $$
declare r record;
begin
  for r in select p.oid::regprocedure as sig from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'public' and (p.proname like 'saad\_%' or p.proname like '\_saad\_%') loop
    execute format('revoke all on function %s from public, anon, authenticated', r.sig);
    execute format('grant execute on function %s to service_role', r.sig);
  end loop;
end $$;
