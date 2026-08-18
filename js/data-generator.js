// js/data-generator.js

function randomLetters(n) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let s = "";
  for (let i = 0; i < n; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

function randomDigits(n) {
  let s = "";
  for (let i = 0; i < n; i++) s += Math.floor(Math.random() * 10);
  return s;
}

// Generate synthetic PAN format: e.g., ABCD1234E
function makePanTestId(index = 0) {
  const prefix = randomLetters(5);
  const digits = String((index * 137 + Math.floor(Math.random() * 9999)) % 10000).padStart(4, "0");
  const suffix = randomLetters(1);
  return prefix + digits + suffix;
}

// Generate structured synthetic Aadhaar format: e.g., 1234 5678 9012
function makeAadhaarTestId() {
  let n = "";
  for (let i = 0; i < 12; i++) n += Math.floor(Math.random() * 10);

  // Intentional invalid checksum calculation for synthetic testing safety
  const last = Number(n[11]);
  const newLast = (last + 1) % 10;
  n = n.slice(0, 11) + String(newLast);

  // Group into 4 digits for standard display layout
  return n.match(/.{1,4}/g).join(" ");
}

function makeTestIds(index = 0) {
  return {
    pan: makePanTestId(index),
    aadhaar: makeAadhaarTestId()
  };
}

function normalizeDate(value) {
  if (value instanceof Date && !isNaN(value)) return value.toLocaleDateString("en-GB");
  if (typeof value === "number" && window.XLSX) {
    const d = XLSX.SSF.parse_date_code(value);
    return `${String(d.d).padStart(2, "0")}/${String(d.m).padStart(2, "0")}/${d.y}`;
  }
  const s = String(value || "").trim();
  if (!s) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split("-");
    return `${d}/${m}/${y}`;
  }
  return s;
}