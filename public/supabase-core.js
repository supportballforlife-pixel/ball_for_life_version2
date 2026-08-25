(function () {
  const config = window.BFL_SUPABASE || {};
  const hasConfig = config.url && config.anonKey && !config.url.includes('YOUR_') && !config.anonKey.includes('YOUR_');
  window.BFL_SUPABASE_READY = Boolean(hasConfig && window.supabase);
  window.BFL_SUPABASE_CLIENT = window.BFL_SUPABASE_READY
    ? window.supabase.createClient(config.url, config.anonKey)
    : null;
})();
