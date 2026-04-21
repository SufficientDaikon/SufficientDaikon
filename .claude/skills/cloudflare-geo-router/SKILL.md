---
name: cloudflare-geo-router
description: "Cloudflare Pages geo-routing skill. Drops a `_worker.js` into any CF Pages project to auto-serve localized pages based on visitor country. Config-driven, supports any number of languages. Use when deploying a site to Cloudflare Pages that needs region-based language routing, i18n, or geo-detection."
---

# Cloudflare Pages Geo-Router

## What This Does

Serves different static pages based on visitor country — entirely at the edge, zero client-side JS. One file (`_worker.js`), dropped into the Pages output directory.

## When to Use

Activate this skill whenever:
- A project is being deployed to **Cloudflare Pages**
- The site has **multiple language versions** (e.g. `index.html` + `index-ar.html`)
- The user wants **automatic region-based routing**
- The user mentions geo-detection, i18n routing, or language auto-detect on Cloudflare

## How It Works

1. Visitor hits `/` on the CF Pages site
2. `_worker.js` reads `request.cf.country` (free on every CF request — no API, no DB, no external call)
3. If the country matches a configured language region → serve that language's page
4. Otherwise → serve default `index.html`
5. `?lang=XX` overrides geo (explicit user choice)
6. `?_country=XX` simulates geo for testing

## The Template

Drop this as `_worker.js` in the **output directory** of any CF Pages project (the folder that gets deployed — e.g. `docs/`, `dist/`, `public/`, `out/`).

```js
// Cloudflare Pages geo-router.
// Drop this file as _worker.js in any Pages project's output directory.
// Convention: default page is index.html, translations are index-{lang}.html.
//
// Test with ?_country=US or ?_country=EG to simulate geo from anywhere.

// -- REGION LISTS (reusable across projects) --
const ME_NORTH_AFRICA = [
  "EG","SA","AE","IQ","JO","LB","SY","KW",
  "QA","OM","BH","YE","PS","SD","LY","DZ","TN","MA",
];

const LATAM = [
  "MX","GT","HN","SV","NI","CR","PA","CO","VE","EC",
  "PE","BO","CL","AR","UY","PY","CU","DO","PR",
];

const FRANCOPHONE = [
  "FR","BE","CH","LU","MC","SN","CI","ML","BF","NE",
  "TG","BJ","GA","CG","CD","CM","MG","HT","RE","GP","MQ",
];

const DACH = ["DE","AT","CH","LI"];

const CJK = ["CN","JP","KR","TW","HK","MO"];

const LUSOPHONE = ["BR","PT","AO","MZ","CV","GW","TL","ST"];
// ---------------------------------------------

// -- CONFIG: edit this per project --
const LANG_ROUTES = {
  ar: { countries: ME_NORTH_AFRICA, file: "/index-ar" },
  // es: { countries: LATAM, file: "/index-es" },
  // fr: { countries: FRANCOPHONE, file: "/index-fr" },
  // de: { countries: DACH, file: "/index-de" },
  // zh: { countries: CJK, file: "/index-zh" },
  // pt: { countries: LUSOPHONE, file: "/index-pt" },
};
// ------------------------------------

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      // Explicit ?lang= forces a specific language, skipping geo
      const lang = url.searchParams.get("lang");
      if (lang) {
        if (LANG_ROUTES[lang]) {
          return env.ASSETS.fetch(new Request(url.origin + LANG_ROUTES[lang].file, request));
        }
        // Unknown lang code → serve default root
        return env.ASSETS.fetch(new Request(url.origin + "/", request));
      }

      // Determine country: test override or real Cloudflare geo
      const country = url.searchParams.get("_country") || request.cf?.country || "";

      for (const [, route] of Object.entries(LANG_ROUTES)) {
        if (route.countries.includes(country)) {
          return env.ASSETS.fetch(new Request(url.origin + route.file, request));
        }
      }
    }

    // Default: serve static files as-is
    return env.ASSETS.fetch(request);
  },
};
```

## Setup Steps (for Claude to execute)

1. **Identify the output directory** — the folder CF Pages deploys (`docs/`, `dist/`, `public/`, etc.)
2. **Create `_worker.js`** in that directory using the template above
3. **Edit `LANG_ROUTES`** — uncomment/add only the languages the project actually has pages for
4. **Ensure translated pages exist** — e.g. `index-ar.html`, `index-es.html` in the same directory
5. **Add language switcher links** to the pages:
   - From default page: `<a href="?lang=ar">العربية</a>`
   - From translated page back to default: `<a href="/?lang=en">English</a>`
6. **Deploy** with `npx wrangler pages deploy <output-dir> --project-name <name>`
   - Use `--skip-caching` if redeploying after changes to force re-upload

## Critical CF Pages Gotchas

These are hard-won lessons — do NOT relearn them:

| Gotcha | What happens | Fix |
|--------|-------------|-----|
| `.html` in routes | CF Pages 308-redirects `/index-ar.html` → `/index-ar` | Use clean URLs without `.html` in `LANG_ROUTES.file` |
| `env.ASSETS.fetch(url)` | Passing a URL object doesn't route correctly | Always pass `new Request(url.origin + path, request)` |
| `?lang=en` falls through | If "en" isn't in LANG_ROUTES, geo-detection fires anyway | Check `lang` param first — if present but not in routes, serve root `/` directly |
| `?lang=en` → `/index` | Rewriting to `/index` causes CF Pages to 308 back to `/` | For default lang, serve `url.origin + "/"` not `url.origin + "/index"` |
| Wrangler caching | "0 files uploaded" even after changes | Use `--skip-caching` flag |
| Testing from target region | All tests return the localized page because you're IN that region | Use `?_country=XX` param to simulate, or note that geo-detection is working correctly |

## File Naming Convention

| Language | File name | Route |
|----------|----------|-------|
| English (default) | `index.html` | `/` |
| Arabic | `index-ar.html` | `/index-ar` |
| Spanish | `index-es.html` | `/index-es` |
| French | `index-fr.html` | `/index-fr` |
| German | `index-de.html` | `/index-de` |
| Chinese | `index-zh.html` | `/index-zh` |
| Portuguese | `index-pt.html` | `/index-pt` |

## Verification Script

After deploying, test with PowerShell:

```powershell
$base = "https://<project>.pages.dev"
@(
  @{url="$base/?_country=US"; expect="English"},
  @{url="$base/?_country=EG"; expect="Arabic"},
  @{url="$base/?lang=en";     expect="English (override)"},
  @{url="$base/?lang=ar";     expect="Arabic (override)"}
) | ForEach-Object {
  $r = Invoke-WebRequest -Uri $_.url -UseBasicParsing
  $lang = if ($r.Content -match 'lang="ar"') { "Arabic" } else { "English" }
  Write-Host "$($_.expect): $lang $(if($lang -match $_.expect.Split(' ')[0]){'✅'}else{'❌'})"
}
```

## What This Skill Does NOT Do

- No database, no KV store, no external APIs
- No cookies or session tracking
- No redirect chains — serves the page directly (no 302/301)
- No client-side JS needed for routing
- Does not handle subpaths (only `/`) — extend the `url.pathname` check if needed for multi-page routing
