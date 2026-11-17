// Statistics for a two-sided, two-proportion z-test. Kept free of page code so it can be checked in Node.

// Standard normal cumulative distribution (Abramowitz and Stegun 7.1.26 for erf; error below 1.5e-7).
function normalCdf(z) {
  const x = Math.abs(z) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * x);
  const poly = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
  const erf = 1 - poly * Math.exp(-x * x);
  return z >= 0 ? 0.5 * (1 + erf) : 0.5 * (1 - erf);
}

// Inverse of normalCdf by bisection. Slow but short, and fine for a handful of calls per update.
function normalQuantile(probability) {
  let low = -10;
  let high = 10;
  for (let step = 0; step < 80; step++) {
    const middle = (low + high) / 2;
    if (normalCdf(middle) < probability) low = middle;
    else high = middle;
  }
  return (low + high) / 2;
}

// Users needed in each arm to detect a change from controlRate to treatmentRate.
function sampleSizePerArm({ controlRate, treatmentRate, alpha, power }) {
  const zAlpha = normalQuantile(1 - alpha / 2);
  const zPower = normalQuantile(power);
  const pooled = (controlRate + treatmentRate) / 2;
  const spreadUnderNull = Math.sqrt(2 * pooled * (1 - pooled));
  const spreadUnderAlternative = Math.sqrt(controlRate * (1 - controlRate) + treatmentRate * (1 - treatmentRate));
  const difference = treatmentRate - controlRate;
  return Math.ceil(((zAlpha * spreadUnderNull + zPower * spreadUnderAlternative) ** 2) / difference ** 2);
}

// Chance that the test reaches significance when the true treatment rate is as given.
function powerAtSampleSize({ controlRate, treatmentRate, alpha, usersPerArm }) {
  const zAlpha = normalQuantile(1 - alpha / 2);
  const pooled = (controlRate + treatmentRate) / 2;
  const errorUnderNull = Math.sqrt((2 * pooled * (1 - pooled)) / usersPerArm);
  const errorUnderAlternative = Math.sqrt((controlRate * (1 - controlRate) + treatmentRate * (1 - treatmentRate)) / usersPerArm);
  const difference = Math.abs(treatmentRate - controlRate);
  return normalCdf((difference - zAlpha * errorUnderNull) / errorUnderAlternative);
}

// Smallest absolute lift detectable at the requested power, found by bisection.
// Returns null when even the largest possible lift does not reach that power.
function minimumDetectableLift({ controlRate, alpha, power, usersPerArm }) {
  let low = 0;
  let high = 1 - controlRate;
  if (powerAtSampleSize({ controlRate, treatmentRate: 1, alpha, usersPerArm }) < power) return null;
  for (let step = 0; step < 60; step++) {
    const middle = (low + high) / 2;
    const reached = powerAtSampleSize({ controlRate, treatmentRate: controlRate + middle, alpha, usersPerArm });
    if (reached < power) low = middle;
    else high = middle;
  }
  return (low + high) / 2;
}

// Two-sided z-test on observed hit counts.
function twoProportionTest({ controlHits, controlUsers, treatmentHits, treatmentUsers }) {
  const controlRate = controlHits / controlUsers;
  const treatmentRate = treatmentHits / treatmentUsers;
  const pooled = (controlHits + treatmentHits) / (controlUsers + treatmentUsers);
  const standardError = Math.sqrt(pooled * (1 - pooled) * (1 / controlUsers + 1 / treatmentUsers));
  // With no variance (0 hits or all hits in both arms) there is nothing to test.
  const z = standardError === 0 ? 0 : (treatmentRate - controlRate) / standardError;
  const unpooledError = Math.sqrt((controlRate * (1 - controlRate)) / controlUsers + (treatmentRate * (1 - treatmentRate)) / treatmentUsers);
  const margin = normalQuantile(0.975) * unpooledError;
  return {
    controlRate,
    treatmentRate,
    difference: treatmentRate - controlRate,
    pValue: 2 * (1 - normalCdf(Math.abs(z))),
    intervalLow: treatmentRate - controlRate - margin,
    intervalHigh: treatmentRate - controlRate + margin,
  };
}

if (typeof module !== "undefined") {
  module.exports = { normalCdf, normalQuantile, sampleSizePerArm, powerAtSampleSize, minimumDetectableLift, twoProportionTest };
}
