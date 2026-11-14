// 1. Your Worker URL (it's the one from your screenshot, swap it if it's different)
const WORKER_URL = "https://hidden-sky-553e.cleduk11.workers.dev";

// 2. Leagues are now just names + API codes. The data comes from the internet
const leagues = {
  premier: {
    name: "Premier League",
    code: "PL",
    zones: [
      { from: 1, to: 4, type: "cl" },
      { from: 5, to: 5, type: "el" },
      { from: 18, to: 20, type: "relegation" },
    ],
  },
  laliga: {
    name: "La Liga",
    code: "PD",
    zones: [
      { from: 1, to: 4, type: "cl" },
      { from: 5, to: 6, type: "el" },
      { from: 7, to: 7, type: "conf" },
      { from: 18, to: 20, type: "relegation" },
    ],
  },
  seriea: {
    name: "Serie A",
    code: "SA",
    zones: [
      { from: 1, to: 4, type: "cl" },
      { from: 5, to: 5, type: "el" },
      { from: 6, to: 6, type: "conf" },
      { from: 18, to: 20, type: "relegation" },
    ],
  },
  bundesliga: {
    name: "Bundesliga",
    code: "BL1",
    zones: [
      { from: 1, to: 4, type: "cl" },
      { from: 5, to: 5, type: "el" },
      { from: 6, to: 6, type: "conf" },
      { from: 16, to: 16, type: "playoff" },
      { from: 17, to: 18, type: "relegation" },
    ],
  },
  ligue1: {
    name: "Ligue 1",
    code: "FL1",
    zones: [
      { from: 1, to: 3, type: "cl" },
      { from: 4, to: 4, type: "el" },
      { from: 5, to: 5, type: "conf" },
      { from: 16, to: 16, type: "playoff" },
      { from: 17, to: 18, type: "relegation" },
    ],
  },
  ucl: {
  name: "Champions League",
  code: "CL",
  zones: [
    { from: 1, to: 8, type: "r16" },
    { from: 9, to: 24, type: "ko" },
    { from: 25, to: 36, type: "out" },
  ],
},
};

function getZone(key, position) {
  const zone = leagues[key].zones.find(
    (z) => position >= z.from && position <= z.to
  );
  return zone ? `zone-${zone.type}` : "";
}

const ZONE_LABELS = {
  cl: "Champions League",
  el: "Europa League",
  conf: "Conference League",
  playoff: "Relegation play-off",
  relegation: "Relegation",
  r16: "Round of 16",
  ko: "Knockout play-off",
  out: "Eliminated",
};

const legendEl = document.querySelector("#legend");

// 3. Cache: once a league is fetched, we keep it here and don't ask again
const cache = {};
let currentLeague = null;

const titleEl = document.querySelector("#league-title");
const bodyEl = document.querySelector("#standings-body");
const buttons = document.querySelectorAll("nav button");

// 4. Get the standings table for a league (from cache or from the Worker)
async function getStandings(key) {
  if (cache[key]) return cache[key];

  const response = await fetch(`${WORKER_URL}/?league=${leagues[key].code}`);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const data = await response.json();
  cache[key] = data.standings[0].table;
  return cache[key];
}

// 5. Draw a league on the page
async function renderLeague(key) {
  currentLeague = key;
  titleEl.textContent = leagues[key].name;
  legendEl.innerHTML = leagues[key].zones
  .map(
    (z) => `<li><span class="dot" style="background: var(--${z.type})"></span> ${ZONE_LABELS[z.type]}</li>`
  )
  .join("");
  bodyEl.innerHTML = `<tr><td colspan="10">Loading...</td></tr>`;

  try {
    const table = await getStandings(key);

    // if the user clicked another league while we were waiting, stop
    if (currentLeague !== key) return;

    bodyEl.innerHTML = table
      .map(
        (row) => `
        <tr class="${getZone(key, row.position)}">
          <td>${row.position}</td>
          <td>
            <a class="team-cell" href="team.html?id=${row.team.id}">
                <img src="${row.team.crest}" alt="" class="crest" loading="lazy">
                <span>${row.team.shortName}</span>
            </a>
          </td>
          <td>${row.playedGames}</td>
          <td>${row.won}</td>
          <td>${row.draw}</td>
          <td>${row.lost}</td>
          <td>${row.goalsFor}</td>
          <td>${row.goalsAgainst}</td>
          <td>${row.goalDifference}</td>
          <td>${row.points}</td>
        </tr>`
      )
      .join("");
  } catch (error) {
    console.error(error);
    if (currentLeague !== key) return;
    bodyEl.innerHTML = `<tr><td colspan="10">Couldn't load standings. Try again in a minute.</td></tr>`;
  }
}

// 6. Buttons
buttons.forEach((button) => {
  button.addEventListener("click", () => {
    renderLeague(button.dataset.league);

    buttons.forEach((b) => b.classList.remove("active"));
    button.classList.add("active");
  });
});

// 7. First load
renderLeague("premier");
buttons[0].classList.add("active");