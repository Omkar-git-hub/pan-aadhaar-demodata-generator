// js/app.js

let excelRows = [], currentPerson = null, photoDataUrl = null, currentType = "PAN";
const $ = id => document.getElementById(id);
const canvas = $("documentCanvas");

$("photo").addEventListener("change", e => {
  const f = e.target.files[0];
  if (!f) { photoDataUrl = null; refreshPreview(); return; }
  const r = new FileReader();
  r.onload = () => { photoDataUrl = r.result; refreshPreview(); };
  r.readAsDataURL(f);
});

function refreshPreview(type = currentType) {
  currentType = type;
  const person = currentPerson || {
    name: $("name").value.trim() || "OMKAR GUNDARE",
    dob: $("dob").value ? normalizeDate($("dob").value) : "11/08/2002",
    gender: $("gender").value || "Male",
    address: $("address").value.trim() || "Latur, Maharashtra",
    parentName: $("parentName").value.trim() || "Test Parent",
    ...makeTestIds(0)
  };
  drawSyntheticDocument(canvas, person, type, photoDataUrl);
}

$("previewPan").onclick = () => refreshPreview("PAN");
$("previewAadhaar").onclick = () => refreshPreview("AADHAAR");

$("personForm").addEventListener("submit", e => {
  e.preventDefault();
  currentPerson = { ...readForm(), ...makeTestIds(0) };
  refreshPreview("PAN");
  enableButtons(true);
});

$("clearBtn").onclick = () => {
  $("personForm").reset();
  photoDataUrl = null;
  currentPerson = null;
  excelRows = [];
  if ($("rowsBody")) $("rowsBody").innerHTML = "";
  if ($("rowCount")) $("rowCount").textContent = "0 rows";
  canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  enableButtons(false);
};

$("downloadPan").onclick = () => downloadPerson("PAN");
$("downloadAadhaar").onclick = () => downloadPerson("AADHAAR");
$("downloadAllPan").onclick = () => downloadAll("PAN");
$("downloadAllAadhaar").onclick = () => downloadAll("AADHAAR");

async function downloadPerson(type) {
  const person = currentPerson || {
    name: $("name").value.trim() || "OMKAR GUNDARE",
    dob: $("dob").value ? normalizeDate($("dob").value) : "11/08/2002",
    gender: $("gender").value || "Male",
    address: $("address").value.trim() || "Latur, Maharashtra",
    parentName: $("parentName").value.trim() || "Test Parent",
    ...makeTestIds(0)
  };
  
  drawSyntheticDocument(canvas, person, type, photoDataUrl);
  await new Promise(r => setTimeout(r, 100));
  const id = type === "PAN" ? person.pan : "aadhaar-card";
  await downloadCanvas(canvas, `synthetic-${type.toLowerCase()}-${safeName(person.name)}-${id}.jpg`);
}

async function downloadAll(type) {
  if (!excelRows.length) return;
  setStatus(`Generating ${excelRows.length} ${type} images...`);
  for (let i = 0; i < excelRows.length; i++) {
    const p = excelRows[i];
    drawSyntheticDocument(canvas, p, type, photoDataUrl);
    await new Promise(r => setTimeout(r, 80));
    await downloadCanvas(canvas, `synthetic-${type.toLowerCase()}-${String(i + 1).padStart(3, "0")}-${safeName(p.name)}.jpg`);
    setStatus(`Generated ${i + 1} / ${excelRows.length} ${type} images`);
  }
  setStatus(`Completed: ${excelRows.length} ${type} images`);
}

$("excelFile").addEventListener("change", async e => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = await file.arrayBuffer();
    const wb = XLSX.read(data, { type: "array", cellDates: true });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    if (!rows.length) { setStatus("Excel contains no data rows."); return; }

    const keys = Object.keys(rows[0]);
    const required = ["Name", "DOB", "Gender", "Address"];
    const missing = required.filter(h => !keys.some(k => k.trim().toLowerCase() === h.toLowerCase()));
    if (missing.length) { setStatus("Missing headers: " + missing.join(", ")); return; }

    excelRows = rows.map((r, i) => {
      const find = h => r[keys.find(k => k.trim().toLowerCase() === h.toLowerCase())] ?? "";
      const parentKey = keys.find(k => k.trim().toLowerCase() === "parentname" || k.trim().toLowerCase() === "fathername");
      return {
        name: String(find("Name")).trim(),
        dob: normalizeDate(find("DOB")),
        gender: String(find("Gender")).trim(),
        address: String(find("Address")).trim(),
        parentName: parentKey ? String(r[parentKey] || "").trim() : "",
        ...makeTestIds(i)
      };
    }).filter(x => x.name);

    renderRows();
    setStatus(`${excelRows.length} rows loaded.`);
    if (excelRows.length) {
      currentPerson = excelRows[0];
      refreshPreview("PAN");
      enableButtons(true);
    }
  } catch (err) { setStatus("Could not read Excel: " + err.message); }
});

function enableButtons(on) {
  ["downloadPan", "downloadAadhaar", "downloadAllPan", "downloadAllAadhaar"].forEach(id => {
    if ($(id)) $(id).disabled = !on;
  });
}

function readForm() {
  const date = $("dob").value;
  return {
    name: $("name").value.trim(),
    dob: date ? normalizeDate(date) : "",
    gender: $("gender").value,
    address: $("address").value.trim(),
    parentName: $("parentName")?.value.trim() || ""
  };
}

function safeName(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "document";
}

function renderRows() {
  if ($("rowCount")) $("rowCount").textContent = `${excelRows.length} rows`;
  if ($("rowsBody")) {
    $("rowsBody").innerHTML = excelRows.map((p, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${esc(p.name)}</td>
        <td>${esc(p.dob)}</td>
        <td>${esc(p.gender)}</td>
        <td>${esc(p.address)}</td>
        <td>${esc(p.pan)} / Redacted</td>
      </tr>`).join("");
  }
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}

function setStatus(s) { if ($("fileStatus")) $("fileStatus").textContent = s; }

// Initial rendering load
window.addEventListener("DOMContentLoaded", () => {
  refreshPreview("PAN");
});