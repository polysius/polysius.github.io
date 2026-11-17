// Connects the A/B calculator inputs to the statistics in ab-stats.js.

const field = (id) => document.getElementById(id);
const percent = (value, digits = 1) => `${(value * 100).toFixed(digits)}%`;
const count = (value) => value.toLocaleString("en-US");

function showRows(listId, rows) {
  const list = field(listId);
  list.replaceChildren();
  rows.forEach(([term, description]) => {
    const dt = document.createElement("dt");
    dt.textContent = term;
    dt.style.fontWeight = "600";
    const dd = document.createElement("dd");
    dd.textContent = description;
    dd.style.margin = "0 0 0.6rem";
    list.append(dt, dd);
  });
}

function updatePlan() {
  const controlRate = Number(field("plan-baseline").value);
  const lift = Number(field("plan-lift").value) / 100;
  const usersPerArm = Number(field("plan-users").value);
  const alpha = Number(field("plan-alpha").value);
  const power = Number(field("plan-power").value);
  const treatmentRate = controlRate * (1 + lift);

  if (!(controlRate > 0 && treatmentRate < 1 && usersPerArm > 0)) {
    showRows("plan-output", [["Check the inputs", "The control rate and lift must give a treatment rate between 0 and 1."]]);
    return;
  }

  const needed = sampleSizePerArm({ controlRate, treatmentRate, alpha, power });
  const reached = powerAtSampleSize({ controlRate, treatmentRate, alpha, usersPerArm });
  const smallest = minimumDetectableLift({ controlRate, alpha, power, usersPerArm });

  showRows("plan-output", [
    ["Users needed per arm for this lift", count(needed)],
    ["Power with your users per arm", `${percent(reached, 0)} chance of detecting a ${percent(lift, 0)} lift`],
    ["Smallest lift you can detect at the target power", smallest === null ? "None: too few users to reach the target power" : `${smallest.toFixed(4)} absolute, ${percent(smallest / controlRate, 0)} relative`],
  ]);
}

function updateAnalysis() {
  const input = {
    controlUsers: Number(field("control-users").value),
    controlHits: Number(field("control-hits").value),
    treatmentUsers: Number(field("treatment-users").value),
    treatmentHits: Number(field("treatment-hits").value),
  };
  const valid = input.controlUsers > 0 && input.treatmentUsers > 0
    && input.controlHits >= 0 && input.controlHits <= input.controlUsers
    && input.treatmentHits >= 0 && input.treatmentHits <= input.treatmentUsers;
  if (!valid) {
    showRows("analysis-output", [["Check the inputs", "Hits must be between 0 and the number of users."]]);
    return;
  }

  const result = twoProportionTest(input);
  const verdict = result.pValue < 0.05 ? "below 0.05" : "not below 0.05";
  showRows("analysis-output", [
    ["Hit rates", `control ${result.controlRate.toFixed(4)}, treatment ${result.treatmentRate.toFixed(4)}`],
    ["Difference", `${result.difference.toFixed(4)} (95% interval ${result.intervalLow.toFixed(4)} to ${result.intervalHigh.toFixed(4)})`],
    ["p-value", `${result.pValue.toFixed(3)}, ${verdict}`],
  ]);
}

document.querySelectorAll("#plan-baseline, #plan-lift, #plan-users, #plan-alpha, #plan-power").forEach((input) => input.addEventListener("input", updatePlan));
document.querySelectorAll("#control-users, #control-hits, #treatment-users, #treatment-hits").forEach((input) => input.addEventListener("input", updateAnalysis));

updatePlan();
updateAnalysis();
