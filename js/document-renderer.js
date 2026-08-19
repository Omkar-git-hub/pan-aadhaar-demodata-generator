// js/document-renderer.js - Exact Match to Reference Images

// ============================================================
// CONSTANTS
// ============================================================

const CANVAS_CONFIG = {
    width: 856,
    height: 539,
};

const PHOTO_CONFIG = {
    x: 610,
    y: 155,
    width: 180,
    height: 220,
};

// ============================================================
// MAIN RENDERER
// ============================================================

function drawSyntheticDocument(canvas, person, type = "PAN", photoDataUrl = null) {
    const ctx = canvas.getContext("2d");

    if (canvas.width !== CANVAS_CONFIG.width || canvas.height !== CANVAS_CONFIG.height) {
        canvas.width = CANVAS_CONFIG.width;
        canvas.height = CANVAS_CONFIG.height;
    }

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    ctx.save();

    if (type === "PAN") {
        renderPanCard(ctx, person);
    } else {
        renderAadhaarCard(ctx, person);
    }

    // Draw photo for both cards
    drawPhoto(ctx, photoDataUrl);

    ctx.restore();
}

// ============================================================
// PHOTO RENDERER
// ============================================================

function drawPhoto(ctx, photoDataUrl) {
    const { x, y, width, height } = PHOTO_CONFIG;

    ctx.save();

    // White background for photo area
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x, y, width, height);

    // Border
    ctx.strokeStyle = "#999";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);

    if (photoDataUrl) {
        const img = new Image();
        img.onload = () => {
            ctx.save();
            ctx.beginPath();
            ctx.rect(x, y, width, height);
            ctx.clip();
            ctx.drawImage(img, x, y, width, height);
            ctx.restore();
        };
        img.src = photoDataUrl;
    } else {
        // Default silhouette
        ctx.fillStyle = "#e8e8e8";
        ctx.fillRect(x, y, width, height);

        ctx.fillStyle = "#aaa";
        // Body
        ctx.beginPath();
        ctx.moveTo(x + width * 0.15, y + height * 0.85);
        ctx.lineTo(x + width * 0.85, y + height * 0.85);
        ctx.lineTo(x + width * 0.75, y + height * 0.55);
        ctx.quadraticCurveTo(x + width / 2, y + height * 0.45, x + width * 0.25, y + height * 0.55);
        ctx.closePath();
        ctx.fill();
        // Head
        ctx.beginPath();
        ctx.arc(x + width / 2, y + height * 0.32, width * 0.2, 0, Math.PI * 2);
        ctx.fill();

        // "PHOTO" text
        ctx.fillStyle = "#888";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText("PHOTO", x + width / 2, y + height - 15);
    }

    ctx.restore();
}

// ============================================================
// PAN CARD - EXACT MATCH TO REFERENCE
// ============================================================

function renderPanCard(ctx, person) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    // === WHITE BACKGROUND ===
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);

    // === MAIN BORDER ===
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.strokeRect(15, 15, w - 30, h - 30);

    // === TOP HEADER ===
    ctx.textAlign = "left";

    // Hindi - Income Tax Department
    ctx.fillStyle = "#000";
    ctx.font = "bold 22px 'Arial Unicode MS', 'Noto Sans Devanagari', Arial, sans-serif";
    ctx.fillText("आयवकर विभाग", 45, 50);

    // Hindi - Government of India (on same line, right aligned)
    ctx.textAlign = "right";
    ctx.fillStyle = "#000";
    ctx.font = "bold 22px 'Arial Unicode MS', 'Noto Sans Devanagari', Arial, sans-serif";
    ctx.fillText("मारत सरकार", w - 45, 50);

    // === MAIN TITLE ===
    ctx.textAlign = "center";
    ctx.fillStyle = "#000";
    ctx.font = "bold 20px 'Arial Unicode MS', 'Noto Sans Devanagari', Arial, sans-serif";
    ctx.fillText("स्थायी लेखा संख्या कार्ड", w / 2, 90);

    ctx.fillStyle = "#000";
    ctx.font = "bold 16px Arial, sans-serif";
    ctx.fillText("Permanent Account Number Card", w / 2, 115);

    // === PAN NUMBER ===
    const panNumber = person.pan || "ABCDE1234F";
    ctx.textAlign = "center";
    ctx.fillStyle = "#000";
    ctx.font = "bold 28px 'Courier New', monospace";
    ctx.fillText(panNumber, w / 2, 165);

    // === FIELDS ===
    const startX = 50;
    let yPos = 200;
    const lineGap = 35;

    function drawPanField(label, value, y) {
        // Label (Hindi first, then English)
        ctx.textAlign = "left";
        ctx.fillStyle = "#000";
        ctx.font = "bold 14px 'Arial Unicode MS', 'Noto Sans Devanagari', Arial, sans-serif";
        ctx.fillText(label, startX, y);

        // Value (bold, slightly larger)
        ctx.fillStyle = "#000";
        ctx.font = "bold 16px Arial, sans-serif";
        const displayValue = value || "NOT AVAILABLE";
        ctx.fillText(displayValue, startX + 200, y);
    }

    // Name
    drawPanField("नाम / Name", String(person.name || "").toUpperCase(), yPos);
    yPos += lineGap;

    // Father's Name
    drawPanField("पिता का नाम / Father's Name", String(person.parentName || "APPLICANT'S FATHER NAME").toUpperCase(), yPos);
    yPos += lineGap;

    // Date of Birth
    drawPanField("जन्म की तारीख / Date of Birth", person.dob || "01/01/1990", yPos);
    yPos += lineGap + 5;

    // === SIGNATURE ===
    ctx.textAlign = "left";
    ctx.fillStyle = "#000";
    ctx.font = "bold 14px 'Arial Unicode MS', 'Noto Sans Devanagari', Arial, sans-serif";
    ctx.fillText("स्वतः / Signature", startX, yPos);

    // Signature line
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(startX + 200, yPos - 5);
    ctx.lineTo(startX + 200 + 200, yPos - 5);
    ctx.stroke();

    // Signature text (cursive style)
    ctx.fillStyle = "#000";
    ctx.font = "italic 18px 'Brush Script MT', 'Segoe Script', cursive";
    const sigName = String(person.name || "Applicant").split(" ")[0];
    ctx.fillText(sigName, startX + 203, yPos - 8);

    // === ADDRESS (Optional - add if needed) ===
    if (person.address) {
        yPos += 45;
        ctx.textAlign = "left";
        ctx.fillStyle = "#000";
        ctx.font = "bold 14px 'Arial Unicode MS', 'Noto Sans Devanagari', Arial, sans-serif";
        ctx.fillText("पता / Address", startX, yPos);

        ctx.fillStyle = "#000";
        ctx.font = "15px Arial, sans-serif";
        const address = person.address || "Latur, Maharashtra";
        wrapText(ctx, address, startX + 200, yPos, 380, 20);
    }
}

// ============================================================
// AADHAAR CARD - EXACT MATCH TO REFERENCE
// ============================================================

function renderAadhaarCard(ctx, person) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    // === WHITE BACKGROUND ===
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);

    // === BORDER ===
    ctx.strokeStyle = "#1a3c6e";
    ctx.lineWidth = 2;
    ctx.strokeRect(15, 15, w - 30, h - 30);

    // === HEADER ===
    ctx.textAlign = "center";

    // Government of India (Hindi)
    ctx.fillStyle = "#1a3c6e";
    ctx.font = "bold 24px 'Arial Unicode MS', 'Noto Sans Devanagari', Arial, sans-serif";
    ctx.fillText("भारत सरकार", w / 2, 55);

    // Government of India (English)
    ctx.fillStyle = "#1a3c6e";
    ctx.font = "bold 16px Arial, sans-serif";
    ctx.fillText("GOVERNMENT OF INDIA", w / 2, 82);

    // === AADHAAR TITLE ===
    ctx.fillStyle = "#000";
    ctx.font = "bold 28px 'Arial Unicode MS', 'Noto Sans Devanagari', Arial, sans-serif";
    ctx.fillText("आधार", w / 2, 130);

    ctx.fillStyle = "#000";
    ctx.font = "bold 18px Arial, sans-serif";
    ctx.fillText("AADHAAR", w / 2, 158);

    // === FIELDS (NAME, DOB, GENDER) ===
    const startX = 60;
    let yPos = 200;
    const lineGap = 30;

    function drawAadharField(label, value, y) {
        ctx.textAlign = "left";
        ctx.fillStyle = "#000";
        ctx.font = "bold 16px Arial, sans-serif";
        ctx.fillText(label + " :", startX, y);

        ctx.fillStyle = "#000";
        ctx.font = "bold 16px Arial, sans-serif";
        ctx.fillText(value || "XXXX", startX + 100, y);
    }

    // Name
    drawAadharField("NAME", String(person.name || "").toUpperCase(), yPos);
    yPos += lineGap;

    // DOB
    drawAadharField("DOB", person.dob || "XX/XX/XXXX", yPos);
    yPos += lineGap;

    // Gender
    drawAadharField("GENDER", person.gender || "XXXX", yPos);
    yPos += 40;

    // === AADHAAR NUMBER (Large, centered) ===
    const aadhaarNumber = person.aadhaar || "4444 3333 6666";
    ctx.textAlign = "center";
    ctx.fillStyle = "#000";
    ctx.font = "bold 36px 'Courier New', monospace";
    ctx.fillText(aadhaarNumber, w / 2, yPos + 20);

    yPos += 70;

    // === FOOTER ===
    ctx.textAlign = "center";
    ctx.fillStyle = "#000";
    ctx.font = "bold 16px 'Arial Unicode MS', 'Noto Sans Devanagari', Arial, sans-serif";
    ctx.fillText("आधार - भारतीय विशिष्ट पहचान प्राधिकरण", w / 2, yPos);

    // === ADDRESS (Optional - add if needed) ===
    if (person.address) {
        yPos += 35;
        ctx.textAlign = "left";
        ctx.fillStyle = "#000";
        ctx.font = "bold 14px Arial, sans-serif";
        ctx.fillText("Address:", startX, yPos);

        ctx.fillStyle = "#000";
        ctx.font = "14px Arial, sans-serif";
        wrapText(ctx, person.address || "", startX + 100, yPos, 500, 20);
    }
}

// ============================================================
// TEXT WRAP UTILITY
// ============================================================

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    if (!text) return;

    const words = text.split(/\s+/);
    let line = "";

    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        if (ctx.measureText(testLine).width > maxWidth && n > 0) {
            ctx.fillText(line, x, y);
            line = words[n] + " ";
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, x, y);
}

// ============================================================
// EXPORT
// ============================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        drawSyntheticDocument,
        renderPanCard,
        renderAadhaarCard,
    };
}