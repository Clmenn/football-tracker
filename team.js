const WORKER_URL = "https://hidden-sky-553e.cleduk11.workers.dev"; // use your real one

const params = new URLSearchParams(window.location.search);
const teamId = params.get("id");
const contentEl = document.querySelector("#team-content");

function getAge(dateOfBirth) {
  if (!dateOfBirth) return "-";
  const msPerYear = 1000 * 60 * 60 * 24 * 365.25;
  return Math.floor((Date.now() - new Date(dateOfBirth).getTime()) / msPerYear);
}

function renderTeam(team) {
  document.title = team.name;

  // group the squad by position
  const groups = {};
  (team.squad || []).forEach((player) => {
    const position = player.position || "Other";
    if (!groups[position]) groups[position] = [];
    groups[position].push(player);
  });

  const squadHTML = Object.entries(groups)
    .map(
      ([position, players]) => `
      <h3 class="squad-heading">${position}</h3>
      ${players
        .map(
          (p) => `
        <div class="player-row">
          <span>${p.name}</span>
          <span class="muted">${p.nationality || ""} · ${getAge(p.dateOfBirth)}</span>
        </div>`
        )
        .join("")}`
    )
    .join("");

  contentEl.innerHTML = `
    <div class="team-header">
      <img src="${team.crest}" alt="${team.name} crest" class="team-crest">
      <div>
        <h1>${team.name}</h1>
        <p class="muted">${team.venue || ""}${team.founded ? " · Founded " + team.founded : ""}</p>
      </div>
    </div>

    <div class="info-grid">
      <div><span class="muted">Coach</span><br>${team.coach?.name || "-"}</div>
      <div><span class="muted">Club colors</span><br>${team.clubColors || "-"}</div>
      <div><span class="muted">Website</span><br>
        ${team.website ? `<a href="${team.website}" target="_blank" rel="noopener">${team.website}</a>` : "-"}
      </div>
    </div>

    <h2>Squad</h2>
    ${squadHTML || "<p class='muted'>No squad data available.</p>"}
  `;
}

async function loadTeam() {
  if (!teamId) {
    contentEl.innerHTML = "<p>No team selected.</p>";
    return;
  }

  contentEl.innerHTML = "<p>Loading...</p>";

  try {
    const response = await fetch(`${WORKER_URL}/?team=${teamId}`);
    if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
    renderTeam(await response.json());
  } catch (error) {
    console.error(error);
    contentEl.innerHTML = "<p>Couldn't load this team. Try again in a minute.</p>";
  }
}

loadTeam();