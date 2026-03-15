-- Notification settings for booking alerts (admin emails + Telegram chat IDs)
insert into site_settings (key, value)
values
  ('notification_admin_emails', '[]'::jsonb),
  ('notification_telegram_chat_ids', '[]'::jsonb)
on conflict (key) do nothing;
