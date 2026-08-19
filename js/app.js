// js/app.js - Complete Updated Version with Combined Download

// ============================================================
// STATE MANAGEMENT
// ============================================================

const AppState = {
    excelRows: [],
    currentPerson: null,
    photoDataUrl: null,
    currentType: "PAN"
};

// ============================================================
// DOM HELPERS
// ============================================================

const $ = id => document.getElementById(id);
const canvas = $("documentCanvas");

// ============================================================
// PHOTO HANDLING
// ============================================================

function handlePhotoUpload(file) {
    if (!file) {
        AppState.photoDataUrl = null;
        refreshPreview();
        return;
    }

    const reader = new FileReader();
    reader.onload = () => {
        AppState.photoDataUrl = reader.result;
        refreshPreview();
    };
    reader.readAsDataURL(file);
}

$("photo").addEventListener("change", e => {
    handlePhotoUpload(e.target.files[0]);
});

// ============================================================
// PREVIEW SYSTEM
// ============================================================

function getDefaultPerson() {
    return {
        name: $("name").value.trim() || "OMKAR GUNDARE",
        dob: $("dob").value ? normalizeDate($("dob").value) : "11/08/2002",
        gender: $("gender").value || "Male",
        address: $("address").value.trim() || "Latur, Maharashtra",
        parentName: $("parentName").value.trim() || "Test Parent",
        ...makeTestIds(0)
    };
}

function refreshPreview(type = AppState.currentType) {
    AppState.currentType = type;
    const person = AppState.currentPerson || getDefaultPerson();
    drawSyntheticDocument(canvas, person, type, AppState.photoDataUrl);
}

// Preview button handlers
$("previewPan").onclick = () => refreshPreview("PAN");
$("previewAadhaar").onclick = () => refreshPreview("AADHAAR");

// ============================================================
// FORM HANDLING
// ============================================================

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

function handleFormSubmit(e) {
    e.preventDefault();
    
    const ids = makeTestIds(0);
    
    AppState.currentPerson = {
        ...readForm(),
        pan: ids.pan,
        aadhaar: ids.aadhaar
    };
    
    refreshPreview("PAN");
    enableButtons(true);
    setStatus("✅ PAN and Aadhar generated successfully!");
}

$("personForm").addEventListener("submit", handleFormSubmit);

// ============================================================
// CLEAR FUNCTIONALITY
// ============================================================

function handleClear() {
    $("personForm").reset();
    AppState.photoDataUrl = null;
    AppState.currentPerson = null;
    AppState.excelRows = [];
    
    if ($("rowsBody")) $("rowsBody").innerHTML = "";
    if ($("rowCount")) $("rowCount").textContent = "0 rows";
    
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    enableButtons(false);
    setStatus("Cleared all data");
}

$("clearBtn").onclick = handleClear;

// ============================================================
// EXCEL TEMPLATE DOWNLOAD
// ============================================================

function downloadTemplate() {
    if (typeof generateSampleExcel === 'function') {
        generateSampleExcel();
        return;
    }
    
    if (!window.OCR_TEMPLATE_BASE64) {
        setStatus("Sample Excel template is not available.");
        return;
    }

    const binary = atob(window.OCR_TEMPLATE_BASE64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }

    const blob = new Blob([bytes], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ocr-test-data-template.xlsx";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus("Sample Excel downloaded.");
}

$("downloadTemplate").onclick = downloadTemplate;

// ============================================================
// EXCEL UPLOAD
// ============================================================

function processExcelData(rows, keys) {
    return rows.map((r, i) => {
        const find = h => {
            const key = keys.find(k => k.trim().toLowerCase() === h.toLowerCase());
            return key ? r[key] : "";
        };

        const parentKey = keys.find(k => {
            const normalized = k.trim().toLowerCase();
            return normalized === "parentname" || normalized === "fathername";
        });

        const panKey = keys.find(k => k.trim().toLowerCase() === "pan");
        const aadhaarKey = keys.find(k => k.trim().toLowerCase() === "aadhaar");

        const ids = makeTestIds(i);

        return {
            name: String(find("Name")).trim(),
            dob: normalizeDate(find("DOB")),
            gender: String(find("Gender")).trim(),
            address: String(find("Address")).trim(),
            parentName: parentKey ? String(r[parentKey] || "").trim() : "",
            pan: panKey ? String(r[panKey] || "").trim() || ids.pan : ids.pan,
            aadhaar: aadhaarKey ? String(r[aadhaarKey] || "").trim() || ids.aadhaar : ids.aadhaar
        };
    }).filter(x => x.name);
}

async function handleExcelUpload(file) {
    if (!file) return;

    try {
        const data = await file.arrayBuffer();
        const wb = XLSX.read(data, { type: "array", cellDates: true });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        if (!rows.length) {
            setStatus("Excel contains no data rows.");
            return;
        }

        const keys = Object.keys(rows[0]);
        const required = ["Name", "DOB", "Gender", "Address"];
        const missing = required.filter(h => 
            !keys.some(k => k.trim().toLowerCase() === h.toLowerCase())
        );

        if (missing.length) {
            setStatus("Missing headers: " + missing.join(", "));
            return;
        }

        AppState.excelRows = processExcelData(rows, keys);
        renderRows();
        setStatus(`✅ ${AppState.excelRows.length} rows loaded. PAN and Aadhar generated.`);

        if (AppState.excelRows.length) {
            AppState.currentPerson = AppState.excelRows[0];
            refreshPreview("PAN");
            enableButtons(true);
        }

    } catch (err) {
        setStatus("Could not read Excel: " + err.message);
    }
}

$("excelFile").addEventListener("change", async e => {
    await handleExcelUpload(e.target.files[0]);
});

// ============================================================
// DOWNLOAD FUNCTIONS
// ============================================================

function getPersonForDownload() {
    return AppState.currentPerson || {
        name: $("name").value.trim() || "OMKAR GUNDARE",
        dob: $("dob").value ? normalizeDate($("dob").value) : "11/08/2002",
        gender: $("gender").value || "Male",
        address: $("address").value.trim() || "Latur, Maharashtra",
        parentName: $("parentName").value.trim() || "Test Parent",
        ...makeTestIds(0)
    };
}

async function downloadPerson(type) {
    const person = getPersonForDownload();
    
    drawSyntheticDocument(canvas, person, type, AppState.photoDataUrl);
    await new Promise(resolve => setTimeout(resolve, 100));

    const safeName = person.name.replace(/\s+/g, '_').toUpperCase();
    const id = type === "PAN" ? person.pan : person.aadhaar;
    const docType = type.toLowerCase();
    
    await downloadCanvas(canvas, `${safeName}_${id}_${docType}.jpg`);
    setStatus(`Downloaded ${type} card for ${person.name}`);
}

$("downloadPan").onclick = () => downloadPerson("PAN");
$("downloadAadhaar").onclick = () => downloadPerson("AADHAAR");

// ============================================================
// BULK DOWNLOAD - INDIVIDUAL IMAGES
// ============================================================

async function downloadAll(type) {
    if (!AppState.excelRows.length) {
        setStatus("No Excel rows available.");
        return;
    }

    setStatus(`Generating ${AppState.excelRows.length} ${type} images...`);

    for (let i = 0; i < AppState.excelRows.length; i++) {
        const person = AppState.excelRows[i];
        
        drawSyntheticDocument(canvas, person, type, AppState.photoDataUrl);
        await new Promise(resolve => setTimeout(resolve, 80));
        
        const safeName = person.name.replace(/\s+/g, '_').toUpperCase();
        const id = type === "PAN" ? person.pan : person.aadhaar;
        const docType = type.toLowerCase();
        const seq = String(i + 1).padStart(3, "0");
        
        await downloadCanvas(canvas, `${seq}_${safeName}_${id}_${docType}.jpg`);
        setStatus(`Generated ${i + 1} / ${AppState.excelRows.length} ${type} images`);
    }

    setStatus(`Completed: ${AppState.excelRows.length} ${type} images`);
}

$("downloadAllPan").onclick = () => downloadAll("PAN");
$("downloadAllAadhaar").onclick = () => downloadAll("AADHAAR");

// ============================================================
// BULK DOWNLOAD - ZIP
// ============================================================

async function downloadAllZip(type) {
    if (!AppState.excelRows.length) {
        setStatus("No Excel rows available.");
        return;
    }

    if (typeof JSZip === "undefined") {
        setStatus("ZIP library is not available. Please check the JSZip CDN.");
        return;
    }

    const zip = new JSZip();
    const folderName = type === "PAN" ? "PAN_Test_Documents" : "Aadhaar_Test_Documents";
    const folder = zip.folder(folderName);

    setStatus(`Preparing ${AppState.excelRows.length} ${type} images...`);

    for (let i = 0; i < AppState.excelRows.length; i++) {
        const person = AppState.excelRows[i];
        
        drawSyntheticDocument(canvas, person, type, AppState.photoDataUrl);
        await new Promise(resolve => setTimeout(resolve, 100));

        const blob = await canvasToJpgBlob(canvas, 0.78);
        if (!blob) {
            setStatus(`Failed to generate ${type} image ${i + 1}.`);
            return;
        }

        const safeName = person.name.replace(/\s+/g, '_').toUpperCase();
        const id = type === "PAN" ? person.pan : person.aadhaar;
        const docType = type.toLowerCase();
        const seq = String(i + 1).padStart(3, "0");
        
        const filename = `${seq}_${safeName}_${id}_${docType}.jpg`;
        folder.file(filename, blob);
        setStatus(`Added ${i + 1} / ${AppState.excelRows.length} ${type} images to ZIP`);
    }

    setStatus(`Creating ${type} ZIP file...`);
    const zipBlob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 6 }
    });

    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${folderName}.zip`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus(`Completed: ${AppState.excelRows.length} ${type} images downloaded as ZIP.`);
}

$("downloadPanZip").onclick = () => downloadAllZip("PAN");
$("downloadAadhaarZip").onclick = () => downloadAllZip("AADHAAR");

// ============================================================
// ✅ NEW: COMBINED DOWNLOAD - BOTH PAN AND AADHAAR IN ONE ZIP
// ============================================================

async function downloadBothZip() {
    if (!AppState.excelRows.length) {
        setStatus("No Excel rows available.");
        return;
    }

    if (typeof JSZip === "undefined") {
        setStatus("ZIP library is not available. Please check the JSZip CDN.");
        return;
    }

    const zip = new JSZip();
    
    // Create separate folders for PAN and Aadhaar
    const panFolder = zip.folder("PAN_Cards");
    const aadhaarFolder = zip.folder("Aadhaar_Cards");

    setStatus(`Preparing ${AppState.excelRows.length} records for both PAN and Aadhaar...`);

    // Store original type to restore later
    const originalType = AppState.currentType;

    for (let i = 0; i < AppState.excelRows.length; i++) {
        const person = AppState.excelRows[i];
        const seq = String(i + 1).padStart(3, "0");
        const safeName = person.name.replace(/\s+/g, '_').toUpperCase();

        // === Generate PAN ===
        AppState.currentType = "PAN";
        drawSyntheticDocument(canvas, person, "PAN", AppState.photoDataUrl);
        await new Promise(resolve => setTimeout(resolve, 80));

        let blob = await canvasToJpgBlob(canvas, 0.78);
        if (blob) {
            const panFilename = `${seq}_${safeName}_${person.pan}_pan.jpg`;
            panFolder.file(panFilename, blob);
        }

        // === Generate Aadhaar ===
        AppState.currentType = "AADHAAR";
        drawSyntheticDocument(canvas, person, "AADHAAR", AppState.photoDataUrl);
        await new Promise(resolve => setTimeout(resolve, 80));

        blob = await canvasToJpgBlob(canvas, 0.78);
        if (blob) {
            const aadhaarFilename = `${seq}_${safeName}_${person.aadhaar.replace(/\s/g, '_')}_aadhaar.jpg`;
            aadhaarFolder.file(aadhaarFilename, blob);
        }

        setStatus(`Generated ${i + 1} / ${AppState.excelRows.length} records (PAN + Aadhaar)`);
    }

    // Restore original type
    AppState.currentType = originalType;

    setStatus(`Creating combined ZIP file with PAN and Aadhaar cards...`);
    const zipBlob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 6 }
    });

    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `PAN_and_Aadhaar_Cards.zip`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    
    setStatus(`✅ Completed: ${AppState.excelRows.length} records downloaded as combined ZIP (PAN + Aadhaar).`);
}

// Add event listener for the new button
$("downloadBothZip").onclick = () => downloadBothZip();

// ============================================================
// UI HELPERS
// ============================================================

function enableButtons(on) {
    const buttons = [
        "downloadPan", "downloadAadhaar",
        "downloadAllPan", "downloadAllAadhaar",
        "downloadPanZip", "downloadAadhaarZip",
        "downloadBothZip"
    ];
    
    buttons.forEach(id => {
        if ($(id)) $(id).disabled = !on;
    });
}

function setStatus(message) {
    if ($("fileStatus")) {
        $("fileStatus").textContent = message;
    }
}

function renderRows() {
    if ($("rowCount")) {
        $("rowCount").textContent = `${AppState.excelRows.length} rows`;
    }

    if ($("rowsBody")) {
        $("rowsBody").innerHTML = AppState.excelRows
            .map((p, i) => `
                <tr>
                    <td>${i + 1}</td>
                    <td>${esc(p.name)}</td>
                    <td>${esc(p.dob)}</td>
                    <td>${esc(p.gender)}</td>
                    <td>${esc(p.address)}</td>
                    <td>${esc(p.pan)} / ${esc(p.aadhaar)}</td>
                </tr>
            `)
            .join("");
    }
}

function safeName(s) {
    return String(s)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "document";
}

function esc(s) {
    return String(s).replace(/[&<>"']/g, m => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[m]));
}

// ============================================================
// BULK GENERATION
// ============================================================

function generateBulkData(count = 10) {
    const firstNames = ["RAHUL", "PRIYA", "AMIT", "SUNITA", "VIKRAM", "NEHA", "RAJ", "ANJALI"];
    const lastNames = ["SHARMA", "VERMA", "PATEL", "KUMAR", "SINGH", "REDDY", "RAO", "GUPTA"];
    const fatherNames = ["RAM", "MOHAN", "RAJ", "SURESH", "DINESH", "MAHESH", "RAMESH"];
    const cities = ["MUMBAI", "DELHI", "BANGALORE", "HYDERABAD", "CHENNAI"];
    const streets = ["MG Road", "Park Street", "Main Road", "Church Street"];
    
    const bulkData = [];
    
    for (let i = 0; i < count; i++) {
        const ids = makeTestIds(i);
        const first = firstNames[Math.floor(Math.random() * firstNames.length)];
        const last = lastNames[Math.floor(Math.random() * lastNames.length)];
        const father = fatherNames[Math.floor(Math.random() * fatherNames.length)];
        const city = cities[Math.floor(Math.random() * cities.length)];
        const street = streets[Math.floor(Math.random() * streets.length)];
        
        const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
        const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
        const year = 1990 + Math.floor(Math.random() * 15);
        
        bulkData.push({
            name: `${first} ${last}`,
            dob: `${day}/${month}/${year}`,
            gender: Math.random() > 0.5 ? "Male" : "Female",
            address: `${Math.floor(Math.random() * 999) + 1}, ${street}, ${city}`,
            parentName: `${father} ${last}`,
            pan: ids.pan,
            aadhaar: ids.aadhaar
        });
    }
    
    return bulkData;
}

const bulkBtn = $("generateBulkBtn");
if (bulkBtn) {
    bulkBtn.addEventListener("click", () => {
        const count = 10;
        AppState.excelRows = generateBulkData(count);
        renderRows();
        setStatus(`✅ Generated ${count} random records with PAN and Aadhar`);
        
        if (AppState.excelRows.length) {
            AppState.currentPerson = AppState.excelRows[0];
            refreshPreview("PAN");
            enableButtons(true);
        }
    });
}

// ============================================================
// INITIALIZATION
// ============================================================

window.addEventListener("DOMContentLoaded", () => {
    refreshPreview("PAN");
    setStatus("Ready. Enter details and click Generate Preview.");
});