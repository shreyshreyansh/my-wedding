// Bindings and variables the Worker receives (wrangler.toml, and the Cloudflare dashboard for secrets).
export interface Env {
  /** the built site (dist/), served by Cloudflare's static assets */
  ASSETS: Fetcher;
  /** Workers KV: `guests` (the list, published from the Sheet), `r:<code>` (each family's latest reply), `fail:<code>` (replies the Sheet hasn't got yet) */
  GUESTS: KVNamespace;
  /** the Apps Script web app's /exec URL, and the shared secret it checks */
  APPS_SCRIPT_URL?: string;
  APPS_SCRIPT_SECRET?: string;
  /** WhatsApp numbers for the fallback, digits with country code, e.g. 919812345678 */
  WA_BRIDE?: string;
  WA_GROOM?: string;
  /** set to 1 in local tests to pretend "now" is a given ISO time */
  NOW?: string;
}

export const now = (env: Env) => (env.NOW ? Date.parse(env.NOW) : Date.now());
