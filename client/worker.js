/**
 * Cloudflare Worker · realtime-chat client
 *
 * Strategy:
 * 1. Proxy /api/*, /uploads/*, /socket.io* → Railway backend (preserves WS upgrade)
 * 2. Serve Vite static assets (dist/) for everything else
 * 3. SPA fallback: unknown paths return index.html (handled by Workers Static Assets `not_found_handling: "single-page-application"`)
 */

const RAILWAY_BACKEND = "https://server-production-f308.up.railway.app";

/**
 * Build target URL preserving path + query string.
 */
function buildTargetUrl(request) {
  const url = new URL(request.url);
  return RAILWAY_BACKEND + url.pathname + url.search;
}

/**
 * Forward request to Railway backend.
 * For WebSocket upgrade requests, Cloudflare Workers natively forwards the
 * Upgrade header through `fetch()`, so socket.io/Engine.IO works as expected.
 */
async function proxyToRailway(request) {
  const targetUrl = buildTargetUrl(request);

  // Clone request headers, strip Cloudflare-injected headers that may confuse origin
  const headers = new Headers(request.headers);
  headers.delete("cf-connecting-ip");
  headers.delete("cf-ipcountry");
  headers.delete("cf-ray");
  headers.delete("cf-visitor");

  return fetch(targetUrl, {
    method: request.method,
    headers,
    body: request.body,
    redirect: "manual",
    // @ts-ignore · Cloudflare Workers extension
    cf: { cacheTtl: 0 },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Routes proxied to Railway (matches old Vercel rewrites)
    if (
      path.startsWith("/api/") ||
      path.startsWith("/uploads/") ||
      path === "/socket.io" ||
      path.startsWith("/socket.io/")
    ) {
      return proxyToRailway(request);
    }

    // Everything else → serve static assets (Vite dist/) with SPA fallback
    return env.ASSETS.fetch(request);
  },
};
