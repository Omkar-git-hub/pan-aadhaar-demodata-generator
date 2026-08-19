// js/app.js

let excelRows = [];
let currentPerson = null;
let photoDataUrl = null;
let currentType = "PAN";

const $ = id => document.getElementById(id);
const canvas = $("documentCanvas");


// ============================================================
// PHOTO UPLOAD
// ============================================================

$("photo").addEventListener("change", e => {
  const f = e.target.files[0];

  if (!f) {
    photoDataUrl = null;
    refreshPreview();
    return;
  }

  const r = new FileReader();

  r.onload = () => {
    photoDataUrl = r.result;
    refreshPreview();
  };

  r.readAsDataURL(f);
});


// ============================================================
// PREVIEW
// ============================================================

function refreshPreview(type = currentType) {
  currentType = type;

  const person = currentPerson || {
    name: $("name").value.trim() || "OMKAR GUNDARE",
    dob: $("dob").value
      ? normalizeDate($("dob").value)
      : "11/08/2002",
    gender: $("gender").value || "Male",
    address: $("address").value.trim() || "Latur, Maharashtra",
    parentName: $("parentName").value.trim() || "Test Parent",
    ...makeTestIds(0)
  };

  drawSyntheticDocument(
    canvas,
    person,
    type,
    photoDataUrl
  );
}


// ============================================================
// PREVIEW BUTTONS
// ============================================================

$("previewPan").onclick = () => refreshPreview("PAN");

$("previewAadhaar").onclick = () => refreshPreview("AADHAAR");


// ============================================================
// PERSON FORM
// ============================================================

$("personForm").addEventListener("submit", e => {
  e.preventDefault();

  currentPerson = {
    ...readForm(),
    ...makeTestIds(0)
  };

  refreshPreview("PAN");

  enableButtons(true);
});


// ============================================================
// CLEAR BUTTON
// ============================================================

$("clearBtn").onclick = () => {
  $("personForm").reset();

  photoDataUrl = null;
  currentPerson = null;
  excelRows = [];

  if ($("rowsBody")) {
    $("rowsBody").innerHTML = "";
  }

  if ($("rowCount")) {
    $("rowCount").textContent = "0 rows";
  }

  canvas
    .getContext("2d")
    .clearRect(0, 0, canvas.width, canvas.height);

  enableButtons(false);
};


// ============================================================
// SAMPLE EXCEL DOWNLOAD
// ============================================================

$("downloadTemplate").onclick = () => {
  if (!window.OCR_TEMPLATE_BASE64) {
    setStatus("Sample Excel template is not available.");
    return;
  }

  const binary = atob(window.OCR_TEMPLATE_BASE64);

  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  const blob = new Blob(
    [bytes],
    {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    }
  );

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");

  a.href = url;
  a.download = "ocr-test-data-template.xlsx";

  document.body.appendChild(a);

  a.click();

  a.remove();

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);

  setStatus("Sample Excel downloaded.");
};


// ============================================================
// DOWNLOAD BUTTONS
// ============================================================

$("downloadPan").onclick = () => {
  downloadPerson("PAN");
};

$("downloadAadhaar").onclick = () => {
  downloadPerson("AADHAAR");
};

$("downloadAllPan").onclick = () => {
  downloadAll("PAN");
};

$("downloadAllAadhaar").onclick = () => {
  downloadAll("AADHAAR");
};


// ============================================================
// NEW ZIP DOWNLOAD BUTTONS
// ============================================================

$("downloadPanZip").onclick = () => {
  downloadAllZip("PAN");
};

$("downloadAadhaarZip").onclick = () => {
  downloadAllZip("AADHAAR");
};


// ============================================================
// DOWNLOAD SINGLE DOCUMENT
// ============================================================

async function downloadPerson(type) {
  const person = currentPerson || {
    name: $("name").value.trim() || "OMKAR GUNDARE",

    dob: $("dob").value
      ? normalizeDate($("dob").value)
      : "11/08/2002",

    gender: $("gender").value || "Male",

    address: $("address").value.trim()
      || "Latur, Maharashtra",

    parentName: $("parentName").value.trim()
      || "Test Parent",

    ...makeTestIds(0)
  };

  drawSyntheticDocument(
    canvas,
    person,
    type,
    photoDataUrl
  );

  await new Promise(resolve => {
    setTimeout(resolve, 100);
  });

  const id =
    type === "PAN"
      ? person.pan
      : "aadhaar-card";

  await downloadCanvas(
    canvas,
    `synthetic-${type.toLowerCase()}-${safeName(person.name)}-${id}.jpg`
  );
}


// ============================================================
// DOWNLOAD ALL INDIVIDUAL IMAGES
// ============================================================

async function downloadAll(type) {
  if (!excelRows.length) {
    setStatus("No Excel rows available.");
    return;
  }

  setStatus(
    `Generating ${excelRows.length} ${type} images...`
  );

  for (let i = 0; i < excelRows.length; i++) {
    const p = excelRows[i];

    drawSyntheticDocument(
      canvas,
      p,
      type,
      photoDataUrl
    );

    await new Promise(resolve => {
      setTimeout(resolve, 80);
    });

    await downloadCanvas(
      canvas,
      `synthetic-${type.toLowerCase()}-${String(i + 1).padStart(3, "0")}-${safeName(p.name)}.jpg`
    );

    setStatus(
      `Generated ${i + 1} / ${excelRows.length} ${type} images`
    );
  }

  setStatus(
    `Completed: ${excelRows.length} ${type} images`
  );
}


// ============================================================
// DOWNLOAD ALL IMAGES AS ZIP
// ============================================================

async function downloadAllZip(type) {
  if (!excelRows.length) {
    setStatus("No Excel rows available.");
    return;
  }

  // Check whether JSZip is loaded
  if (typeof JSZip === "undefined") {
    setStatus(
      "ZIP library is not available. Please check the JSZip CDN."
    );
    return;
  }

  const zip = new JSZip();

  const folderName =
    type === "PAN"
      ? "PAN_Test_Documents"
      : "Aadhaar_Test_Documents";

  const folder = zip.folder(folderName);

  setStatus(
    `Preparing ${excelRows.length} ${type} images...`
  );

  for (let i = 0; i < excelRows.length; i++) {
    const person = excelRows[i];

    // Render document on existing canvas
    drawSyntheticDocument(
      canvas,
      person,
      type,
      photoDataUrl
    );

    // Wait for canvas rendering
    await new Promise(resolve => {
      setTimeout(resolve, 100);
    });

    // Convert canvas to JPG
    const blob = await canvasToJpgBlob(
      canvas,
      0.78
    );

    if (!blob) {
      setStatus(
        `Failed to generate ${type} image ${i + 1}.`
      );
      return;
    }

    const filename =
      `synthetic-${type.toLowerCase()}-` +
      `${String(i + 1).padStart(3, "0")}-` +
      `${safeName(person.name)}.jpg`;

    // Add image to ZIP
    folder.file(
      filename,
      blob
    );

    setStatus(
      `Added ${i + 1} / ${excelRows.length} ${type} images to ZIP`
    );
  }

  // Generate ZIP file
  setStatus(
    `Creating ${type} ZIP file...`
  );

  const zipBlob = await zip.generateAsync({
    type: "blob",

    compression: "DEFLATE",

    compressionOptions: {
      level: 6
    }
  });

  // Download ZIP
  const url = URL.createObjectURL(zipBlob);

  const a = document.createElement("a");

  a.href = url;

  a.download = `${folderName}.zip`;

  document.body.appendChild(a);

  a.click();

  a.remove();

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);

  setStatus(
    `Completed: ${excelRows.length} ${type} images downloaded as ZIP.`
  );
}


// ============================================================
// EXCEL UPLOAD
// ============================================================

$("excelFile").addEventListener(
  "change",
  async e => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    try {
      const data = await file.arrayBuffer();

      const wb = XLSX.read(
        data,
        {
          type: "array",
          cellDates: true
        }
      );

      const sheet =
        wb.Sheets[wb.SheetNames[0]];

      const rows =
        XLSX.utils.sheet_to_json(
          sheet,
          {
            defval: ""
          }
        );

      if (!rows.length) {
        setStatus(
          "Excel contains no data rows."
        );

        return;
      }

      const keys =
        Object.keys(rows[0]);

      const required = [
        "Name",
        "DOB",
        "Gender",
        "Address"
      ];

      const missing =
        required.filter(
          h =>
            !keys.some(
              k =>
                k.trim().toLowerCase()
                === h.toLowerCase()
            )
        );

      if (missing.length) {
        setStatus(
          "Missing headers: "
          + missing.join(", ")
        );

        return;
      }

      excelRows =
        rows
          .map((r, i) => {

            const find = h => {
              const key =
                keys.find(
                  k =>
                    k.trim().toLowerCase()
                    === h.toLowerCase()
                );

              return key
                ? r[key]
                : "";
            };

            const parentKey =
              keys.find(
                k => {
                  const normalized =
                    k.trim().toLowerCase();

                  return (
                    normalized === "parentname"
                    ||
                    normalized === "fathername"
                  );
                }
              );

            return {
              name:
                String(
                  find("Name")
                ).trim(),

              dob:
                normalizeDate(
                  find("DOB")
                ),

              gender:
                String(
                  find("Gender")
                ).trim(),

              address:
                String(
                  find("Address")
                ).trim(),

              parentName:
                parentKey
                  ? String(
                      r[parentKey] || ""
                    ).trim()
                  : "",

              ...makeTestIds(i)
            };
          })
          .filter(
            x => x.name
          );

      renderRows();

      setStatus(
        `${excelRows.length} rows loaded.`
      );

      if (excelRows.length) {
        currentPerson =
          excelRows[0];

        refreshPreview("PAN");

        enableButtons(true);
      }

    } catch (err) {
      setStatus(
        "Could not read Excel: "
        + err.message
      );
    }
  }
);


// ============================================================
// ENABLE / DISABLE BUTTONS
// ============================================================

function enableButtons(on) {
  [
    "downloadPan",
    "downloadAadhaar",
    "downloadAllPan",
    "downloadAllAadhaar",

    // New ZIP buttons
    "downloadPanZip",
    "downloadAadhaarZip"

  ].forEach(id => {

    if ($(id)) {
      $(id).disabled = !on;
    }

  });
}


// ============================================================
// READ FORM
// ============================================================

function readForm() {
  const date = $("dob").value;

  return {
    name:
      $("name").value.trim(),

    dob:
      date
        ? normalizeDate(date)
        : "",

    gender:
      $("gender").value,

    address:
      $("address").value.trim(),

    parentName:
      $("parentName")?.value.trim()
      || ""
  };
}


// ============================================================
// SAFE FILE NAME
// ============================================================

function safeName(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    || "document";
}


// ============================================================
// RENDER EXCEL ROWS
// ============================================================

function renderRows() {
  if ($("rowCount")) {
    $("rowCount").textContent =
      `${excelRows.length} rows`;
  }

  if ($("rowsBody")) {

    $("rowsBody").innerHTML =
      excelRows
        .map((p, i) => `
          <tr>
            <td>${i + 1}</td>

            <td>
              ${esc(p.name)}
            </td>

            <td>
              ${esc(p.dob)}
            </td>

            <td>
              ${esc(p.gender)}
            </td>

            <td>
              ${esc(p.address)}
            </td>

            <td>
              ${esc(p.pan)} / Redacted
            </td>
          </tr>
        `)
        .join("");
  }
}


// ============================================================
// HTML ESCAPE
// ============================================================

function esc(s) {
  return String(s).replace(
    /[&<>"']/g,
    m =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[m])
  );
}


// ============================================================
// STATUS
// ============================================================

function setStatus(s) {
  if ($("fileStatus")) {
    $("fileStatus").textContent = s;
  }
}


// ============================================================
// INITIAL RENDER
// ============================================================

window.addEventListener(
  "DOMContentLoaded",
  () => {
    refreshPreview("PAN");
  }
);