function wheelerMicroHenry(diameterCm, coilLengthCm, turns) {
  return (turns * turns * diameterCm * diameterCm) / (45.72 * diameterCm + 101.6 * coilLengthCm);
}

function solveCloseWoundTurns(targetMicroHenry, diameterCm, pitchCm) {
  const a = diameterCm * diameterCm;
  const b = -targetMicroHenry * 101.6 * pitchCm;
  const c = -targetMicroHenry * 45.72 * diameterCm;
  return (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
}

function helicalWireLengthMeters(diameterCm, pitchCm, turns) {
  const circumferenceCm = Math.PI * diameterCm;
  return (Math.sqrt(circumferenceCm * circumferenceCm + pitchCm * pitchCm) * turns) / 100;
}

function coilVolumeCm3(outerDiameterCm, coilLengthCm) {
  return Math.PI * Math.pow(outerDiameterCm / 2, 2) * coilLengthCm;
}

function findCompactCoil(targetMicroHenry, wireCm, gapCm, minBareDiameterCm, maxRatio, stepCm = 0.01) {
  const pitchCm = wireCm + gapCm;
  const maxBareDiameterCm = Math.max(minBareDiameterCm * 40, minBareDiameterCm + 80);
  let best = null;

  for (let bareDiameterCm = minBareDiameterCm; bareDiameterCm <= maxBareDiameterCm; bareDiameterCm += stepCm) {
    const centerDiameterCm = bareDiameterCm + wireCm;
    const outerDiameterCm = bareDiameterCm + (2 * wireCm);
    const turns = solveCloseWoundTurns(targetMicroHenry, centerDiameterCm, pitchCm);
    const roundedTurns = Math.ceil(turns);
    const coilLengthCm = roundedTurns * pitchCm;
    const ratio = coilLengthCm / outerDiameterCm;
    if (ratio > maxRatio) continue;

    const actualMicroHenry = wheelerMicroHenry(centerDiameterCm, coilLengthCm, roundedTurns);
    const volumeCm3 = coilVolumeCm3(outerDiameterCm, coilLengthCm);
    const wireLengthM = helicalWireLengthMeters(centerDiameterCm, pitchCm, roundedTurns);
    const candidate = { bareDiameterCm, centerDiameterCm, outerDiameterCm, roundedTurns, coilLengthCm, ratio, actualMicroHenry, volumeCm3, wireLengthM };
    if (!best || candidate.volumeCm3 < best.volumeCm3) best = candidate;
  }

  return best;
}

function resonanceInductanceMicroHenry(capacitanceF, frequencyHz) {
  const omega = 2 * Math.PI * frequencyHz;
  return (1 / (omega * omega * capacitanceF)) * 1000000;
}

function rfReactanceOhm(capacitanceF, frequencyHz) {
  return 1 / (2 * Math.PI * frequencyHz * capacitanceF);
}

function closeEnough(actual, expected, tolerance = 1e-9) {
  return Math.abs(actual - expected) <= tolerance;
}

const wireCm = 0.08;
const directBareDiameterCm = 2;
const directCenterDiameterCm = directBareDiameterCm + wireCm;
const directExample = wheelerMicroHenry(directCenterDiameterCm, 1, 10);
if (!closeEnough(directCenterDiameterCm, 2.08)) {
  throw new Error(`Direct example failed: ${directExample}`);
}

const targetBareDiameterCm = 3;
const targetCenterDiameterCm = targetBareDiameterCm + wireCm;
const turns = solveCloseWoundTurns(10, targetCenterDiameterCm, wireCm);
const length = turns * wireCm;
const checkedInductance = wheelerMicroHenry(targetCenterDiameterCm, length, turns);
if (!closeEnough(checkedInductance, 10, 1e-9)) {
  throw new Error(`Target reverse calculation failed: ${checkedInductance}`);
}

const roundedTurns = Math.ceil(turns);
const roundedInductance = wheelerMicroHenry(targetCenterDiameterCm, roundedTurns * wireCm, roundedTurns);
const compact = findCompactCoil(10, wireCm, 0, 1, 3);
if (!compact) {
  throw new Error('Compact search failed to find a candidate');
}
if (compact.ratio > 3 || compact.bareDiameterCm < 1 || compact.actualMicroHenry < 10) {
  throw new Error(`Compact candidate outside constraints: ${JSON.stringify(compact)}`);
}

const rfCapacitanceF = 100e-12;
const rfFrequencyHz = 13.56e6;
const rfInductance = resonanceInductanceMicroHenry(rfCapacitanceF, rfFrequencyHz);
const rfReactance = rfReactanceOhm(rfCapacitanceF, rfFrequencyHz);
const rfCompact = findCompactCoil(rfInductance, wireCm, 0, 1, 3);
const tapFraction = Math.sqrt(50 / 1000);
if (!closeEnough(rfInductance, 1.377592863281322, 1e-12)) {
  throw new Error(`RF resonance inductance failed: ${rfInductance}`);
}
if (!closeEnough(tapFraction, 0.22360679774997896, 1e-12)) {
  throw new Error(`Tap ratio failed: ${tapFraction}`);
}
if (!rfCompact || rfCompact.actualMicroHenry < rfInductance) {
  throw new Error(`RF compact search failed: ${JSON.stringify(rfCompact)}`);
}

console.log(`Ornek 1: olusturma capi=2 cm, tel=0.8 mm, formul capi=2.08 cm, l=1 cm, N=10 => ${directExample.toFixed(6)} uH`);
console.log(`Ornek 2: hedef=10 uH, olusturma capi=3 cm, tel=0.8 mm => ${turns.toFixed(6)} tur, pratik ${roundedTurns} tur => ${roundedInductance.toFixed(6)} uH`);
console.log(`Ornek 3: hedef=10 uH, tel=0.8 mm, min olusturma capi=10 mm, L/Ddis<=3 => olusturma D=${(compact.bareDiameterCm * 10).toFixed(2)} mm, formul D=${(compact.centerDiameterCm * 10).toFixed(2)} mm, dis D=${(compact.outerDiameterCm * 10).toFixed(2)} mm, N=${compact.roundedTurns}, l=${(compact.coilLengthCm * 10).toFixed(2)} mm, L=${compact.actualMicroHenry.toFixed(6)} uH, V=${compact.volumeCm3.toFixed(6)} cm3`);
console.log(`Ornek 4 RF: C=100 pF, f=13.56 MHz => L=${rfInductance.toFixed(6)} uH, X=${rfReactance.toFixed(3)} ohm, Ntotal=${rfCompact.roundedTurns}, N1=${(rfCompact.roundedTurns * tapFraction).toFixed(3)}, N2=${(rfCompact.roundedTurns * (1 - tapFraction)).toFixed(3)}`);
