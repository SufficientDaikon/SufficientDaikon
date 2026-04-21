export const config = {
  runtime: "edge",
};

// IANA timezone → UTC offset in hours
function getUtcOffset(timezone) {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "shortOffset",
    });
    const parts = formatter.formatToParts(now);
    const tzPart = parts.find((p) => p.type === "timeZoneName");
    if (!tzPart) return 2;

    // Format: "GMT+5", "GMT-3", "GMT+5:30", "GMT"
    const match = tzPart.value.match(/GMT([+-]?)(\d+)?(?::(\d+))?/);
    if (!match) return 2;

    const sign = match[1] === "-" ? -1 : 1;
    const hours = parseInt(match[2] || "0", 10);
    const minutes = parseInt(match[3] || "0", 10);
    return sign * (hours + minutes / 60);
  } catch {
    return 2; // fallback to UTC+2 (Egypt)
  }
}

export default async function handler(request) {
  // Get timezone from Vercel's GeoIP header or query param
  const url = new URL(request.url);
  const headerTz = request.headers.get("x-vercel-ip-timezone");
  const queryTz = url.searchParams.get("tz");
  const timezone = queryTz || headerTz || "Africa/Cairo";

  const offset = getUtcOffset(timezone);
  const roundedOffset = Math.round(offset);

  // Build upstream URL
  const upstream = new URL(
    "https://github-profile-summary-cards.vercel.app/api/cards/productive-time"
  );
  upstream.searchParams.set("username", "SufficientDaikon");
  upstream.searchParams.set("theme", "tokyonight");
  upstream.searchParams.set("utcOffset", roundedOffset.toString());

  try {
    const response = await fetch(upstream.toString(), {
      headers: { Accept: "image/svg+xml" },
    });

    if (!response.ok) {
      return new Response("Upstream error", { status: 502 });
    }

    const svg = await response.text();

    return new Response(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
        "X-Detected-Timezone": timezone,
        "X-UTC-Offset": roundedOffset.toString(),
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    // Fallback: redirect to upstream with default offset
    return Response.redirect(
      `https://github-profile-summary-cards.vercel.app/api/cards/productive-time?username=SufficientDaikon&theme=tokyonight&utcOffset=2`,
      302
    );
  }
}
