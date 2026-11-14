const LEAGUES = ["PL", "PD", "SA", "BL1", "FL1", "CL"];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const league = url.searchParams.get("league");
    const team = url.searchParams.get("team");

    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    };

    let path;
    if (league && LEAGUES.includes(league)) {
      path = `/competitions/${league}/standings`;
    } else if (team && /^\d+$/.test(team)) {
      path = `/teams/${team}`;
    } else {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400,
        headers,
      });
    }

    const upstream = await fetch(`https://api.football-data.org/v4${path}`, {
      headers: { "X-Auth-Token": env.API_KEY },
      cf: { cacheTtl: 600, cacheEverything: true },
    });

    return new Response(upstream.body, { status: upstream.status, headers });
  },
};