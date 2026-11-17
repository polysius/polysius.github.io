// Lists the saved benchmark questions for one recorded run, with filters.
// The data file is built by tools/build_replay_data.py from the project's reports.

const runSelect = document.getElementById("run");
const difficultySelect = document.getElementById("difficulty");
const outcomeSelect = document.getElementById("outcome");
const summary = document.getElementById("run-summary");
const questionList = document.getElementById("questions");

let runs = [];

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function renderSql(title, sql) {
  const block = createElement("div");
  block.append(createElement("strong", "", title), createElement("pre", "sql", sql));
  return block;
}

function renderQuestion(question) {
  const details = createElement("details", "panel");
  const summaryLine = createElement("summary");
  const status = createElement("span", question.correct ? "correct" : "incorrect", question.correct ? "Correct" : "Incorrect");
  summaryLine.append(status, ` · ${question.difficulty} · ${question.question}`);
  details.append(summaryLine);

  details.append(renderSql("SQL the agent wrote", question.predicted_sql || "(no query produced)"));
  details.append(renderSql("Reference SQL", question.gold_sql));

  const facts = [`${question.latency_s.toFixed(1)} s`, `$${question.cost_usd.toFixed(4)}`, `${question.retries} repair attempts`];
  if (question.failure_class) facts.push(`failure class: ${question.failure_class}`);
  details.append(createElement("p", "", facts.join(" · ")));
  return details;
}

function render() {
  const run = runs[Number(runSelect.value)];
  const filtered = run.questions.filter((question) => {
    const difficultyMatches = difficultySelect.value === "all" || question.difficulty === difficultySelect.value;
    const outcomeMatches = outcomeSelect.value === "all" || (outcomeSelect.value === "correct") === question.correct;
    return difficultyMatches && outcomeMatches;
  });

  const correctCount = run.questions.filter((question) => question.correct).length;
  summary.textContent =
    `${run.database}. Model: ${run.model}. Recorded ${run.recorded_at.slice(0, 10)}. ` +
    `${correctCount} of ${run.questions.length} correct (${(run.accuracy * 100).toFixed(1)}%), ` +
    `median latency ${run.latency_p50_s.toFixed(1)} s, $${run.cost_per_query_usd.toFixed(4)} per question. ` +
    `Showing ${filtered.length}.`;

  questionList.replaceChildren(...filtered.map(renderQuestion));
}

async function start() {
  try {
    const response = await fetch("../data/sql-replay.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    runs = await response.json();
  } catch (error) {
    summary.textContent = "The recorded runs could not be loaded. Serve the site over HTTP instead of opening the file directly.";
    return;
  }

  runs.forEach((run, index) => runSelect.append(new Option(run.label, index)));
  [runSelect, difficultySelect, outcomeSelect].forEach((select) => select.addEventListener("input", render));
  render();
}

start();
