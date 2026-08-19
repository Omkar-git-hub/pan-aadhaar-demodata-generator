// js/document-renderer.js - PAN Card with Light Blue Shade

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

    drawPhoto(ctx, photoDataUrl);

    ctx.restore();
}

// ============================================================
// PHOTO RENDERER
// ============================================================

function drawPhoto(ctx, photoDataUrl) {
    const { x, y, width, height } = PHOTO_CONFIG;

    ctx.save();

    // White background for photo
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x, y, width, height);

    // Border
    ctx.strokeStyle = "#666";
    ctx.lineWidth = 1.5;
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
        const grad = ctx.createLinearGradient(x, y, x, y + height);
        grad.addColorStop(0, "#d4d4d4");
        grad.addColorStop(1, "#e8e8e8");
        ctx.fillStyle = grad;
        ctx.fillRect(x, y, width, height);

        ctx.fillStyle = "#999";
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

        ctx.fillStyle = "#777";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText("PHOTO", x + width / 2, y + height - 15);
    }

    ctx.restore();
}

// ============================================================
// REALISTIC PAN CARD - LIGHT BLUE SHADE
// ============================================================

function renderPanCard(ctx, person) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    // === BACKGROUND - LIGHT BLUE GRADIENT ===
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, "#e8f0fe");
    bgGrad.addColorStop(0.3, "#f0f5ff");
    bgGrad.addColorStop(0.7, "#f0f5ff");
    bgGrad.addColorStop(1, "#dce8f5");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // === OUTER BORDER (Dark Red) ===
    ctx.strokeStyle = "#8b1a1a";
    ctx.lineWidth = 3;
    ctx.strokeRect(12, 12, w - 24, h - 24);

    // === INNER BORDER (Gold/Brown) ===
    ctx.strokeStyle = "#c4a060";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(20, 20, w - 40, h - 40);

    // === WATERMARK / SEAL ===
    ctx.save();
    ctx.globalAlpha = 0.05;
    ctx.textAlign = "center";
    ctx.fillStyle = "#8b1a1a";
    ctx.font = "bold 120px 'Arial Unicode MS', sans-serif";
    ctx.fillText("आयकर", w / 2, h / 2 + 30);
    ctx.restore();

    // === TOP HEADER ===
    // Left: Income Tax Department (Hindi)
    ctx.textAlign = "left";
    ctx.fillStyle = "#8b1a1a";
    ctx.font = "bold 22px 'Arial Unicode MS', 'Noto Sans Devanagari', Arial, sans-serif";
    ctx.fillText("आयकर विभाग", 40, 50);

    // Left: Income Tax Department (English)
    ctx.fillStyle = "#4a4a4a";
    ctx.font = "bold 12px Arial, sans-serif";
    ctx.fillText("INCOME TAX DEPARTMENT", 40, 70);

    // Right: Government of India (Hindi)
    ctx.textAlign = "right";
    ctx.fillStyle = "#8b1a1a";
    ctx.font = "bold 20px 'Arial Unicode MS', 'Noto Sans Devanagari', Arial, sans-serif";
    ctx.fillText("भारत सरकार", w - 40, 50);

    // Right: Government of India (English)
    ctx.fillStyle = "#4a4a4a";
    ctx.font = "bold 11px Arial, sans-serif";
    ctx.fillText("GOVERNMENT OF INDIA", w - 40, 70);

    // === DIVIDER LINE ===
    ctx.strokeStyle = "#8b1a1a";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(35, 82);
    ctx.lineTo(w - 35, 82);
    ctx.stroke();

    // === MAIN TITLE ===
    ctx.textAlign = "center";
    ctx.fillStyle = "#1a1a1a";
    ctx.font = "bold 18px 'Arial Unicode MS', 'Noto Sans Devanagari', Arial, sans-serif";
    ctx.fillText("स्थायी लेखा संख्या कार्ड", w / 2, 112);

    ctx.fillStyle = "#4a4a4a";
    ctx.font = "bold 13px Arial, sans-serif";
    ctx.fillText("Permanent Account Number Card", w / 2, 133);

    // === PAN NUMBER ===
    const panNumber = person.pan || "ABCDE1234F";
    ctx.textAlign = "center";
    ctx.fillStyle = "#8b1a1a";
    ctx.font = "bold 32px 'Courier New', monospace";
    ctx.fillText(panNumber, w / 2, 182);

    // Decorative line under PAN
    ctx.strokeStyle = "#c4a060";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 130, 190);
    ctx.lineTo(w / 2 + 130, 190);
    ctx.stroke();

    // === FIELDS ===
    const startX = 45;
    let yPos = 215;
    const lineGap = 32;

    function drawPanField(label, value, y) {
        // Label (Hindi + English)
        ctx.textAlign = "left";
        ctx.fillStyle = "#5a5a5a";
        ctx.font = "11px Arial, sans-serif";
        ctx.fillText(label, startX, y);

        // Value (Bold, Dark)
        ctx.fillStyle = "#1a1a1a";
        ctx.font = "bold 16px Arial, sans-serif";
        const displayValue = value || "NOT AVAILABLE";
        ctx.fillText(displayValue, startX + 175, y);
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
    ctx.fillStyle = "#5a5a5a";
    ctx.font = "11px Arial, sans-serif";
    ctx.fillText("स्वतः / Signature", startX, yPos);

    // Signature line
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(startX + 175, yPos - 4);
    ctx.lineTo(startX + 175 + 190, yPos - 4);
    ctx.stroke();

    // Signature text (cursive)
    ctx.fillStyle = "#1a1a1a";
    ctx.font = "italic 18px 'Brush Script MT', 'Segoe Script', cursive";
    const sigName = String(person.name || "Applicant").split(" ")[0];
    ctx.fillText(sigName, startX + 178, yPos - 8);

    // === ADDRESS ===
    if (person.address) {
        yPos += 45;
        ctx.textAlign = "left";
        ctx.fillStyle = "#5a5a5a";
        ctx.font = "11px Arial, sans-serif";
        ctx.fillText("पता / Address", startX, yPos);

        ctx.fillStyle = "#1a1a1a";
        ctx.font = "14px Arial, sans-serif";
        wrapText(ctx, person.address || "", startX + 175, yPos, 370, 20);
    }

    // === BOTTOM TEXT ===
    ctx.textAlign = "center";
    ctx.fillStyle = "#8b1a1a";
    ctx.font = "bold 10px Arial, sans-serif";
    ctx.fillText("This is a synthetic test document - Not for official use", w / 2, h - 16);
}

// ============================================================
// REALISTIC AADHAAR CARD
// ============================================================

function renderAadhaarCard(ctx, person) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    // === BACKGROUND WITH SUBTLE GRADIENT ===
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, "#f8fafc");
    bgGrad.addColorStop(0.5, "#ffffff");
    bgGrad.addColorStop(1, "#f1f5f9");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // === MAIN BORDER (Dark Blue) ===
    ctx.strokeStyle = "#1a3c6e";
    ctx.lineWidth = 2.5;
    ctx.strokeRect(12, 12, w - 24, h - 24);

    // === INNER BORDER (Light Blue) ===
    ctx.strokeStyle = "#93b5d9";
    ctx.lineWidth = 1;
    ctx.strokeRect(20, 20, w - 40, h - 40);

    // === WATERMARK ===
    ctx.save();
    ctx.globalAlpha = 0.03;
    ctx.textAlign = "center";
    ctx.fillStyle = "#1a3c6e";
    ctx.font = "bold 140px Arial, sans-serif";
    ctx.fillText("आधार", w / 2, h / 2 + 40);
    ctx.restore();

    // === HEADER ===
    ctx.textAlign = "center";

    // Government of India (Hindi) - Orange/Brown
    ctx.fillStyle = "#b45309";
    ctx.font = "bold 24px 'Arial Unicode MS', 'Noto Sans Devanagari', Arial, sans-serif";
    ctx.fillText("भारत सरकार", w / 2, 50);

    // Government of India (English) - Dark Green
    ctx.fillStyle = "#166534";
    ctx.font = "bold 15px Arial, sans-serif";
    ctx.fillText("GOVERNMENT OF INDIA", w / 2, 76);

    // === TRICOLOR RIBBON ===
    const ribbonY = 88;
    const ribbonW = w - 100;
    const ribbonX = 50;
    const segmentW = ribbonW / 3;

    ctx.fillStyle = "#f97316";
    ctx.fillRect(ribbonX, ribbonY, segmentW, 4);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(ribbonX + segmentW, ribbonY, segmentW, 4);

    ctx.fillStyle = "#16a34a";
    ctx.fillRect(ribbonX + 2 * segmentW, ribbonY, segmentW, 4);

    // === AADHAAR TITLE ===
    ctx.fillStyle = "#d97706";
    ctx.font = "bold 28px 'Arial Unicode MS', 'Noto Sans Devanagari', Arial, sans-serif";
    ctx.fillText("आधार", w / 2, 130);

    ctx.fillStyle = "#4b5563";
    ctx.font = "bold 18px Arial, sans-serif";
    ctx.fillText("AADHAAR", w / 2, 158);

    // === FIELDS (NAME, DOB, GENDER) ===
    const startX = 60;
    let yPos = 200;
    const lineGap = 30;

    function drawAadharField(label, value, y) {
        ctx.textAlign = "left";
        ctx.fillStyle = "#4b5563";
        ctx.font = "bold 14px Arial, sans-serif";
        ctx.fillText(label + " :", startX, y);

        ctx.fillStyle = "#1f2937";
        ctx.font = "bold 16px Arial, sans-serif";
        ctx.fillText(value || "XXXX", startX + 110, y);
    }

    // Name
    drawAadharField("NAME", String(person.name || "").toUpperCase(), yPos);
    yPos += lineGap;

    // DOB
    drawAadharField("DOB", person.dob || "XX/XX/XXXX", yPos);
    yPos += lineGap;

    // Gender
    drawAadharField("GENDER", person.gender || "XXXX", yPos);
    yPos += 45;

    // === AADHAAR NUMBER ===
    const aadhaarNumber = person.aadhaar || "4444 3333 6666";
    ctx.textAlign = "center";
    ctx.fillStyle = "#1a3c6e";
    ctx.font = "bold 38px 'Courier New', monospace";
    ctx.fillText(aadhaarNumber, w / 2, yPos + 15);

    yPos += 80;

    // === FOOTER ===
    ctx.textAlign = "center";
    ctx.fillStyle = "#b91c1c";
    ctx.font = "bold 16px 'Arial Unicode MS', 'Noto Sans Devanagari', Arial, sans-serif";
    ctx.fillText("आधार - भारतीय विशिष्ट पहचान प्राधिकरण", w / 2, yPos);

    ctx.fillStyle = "#6b7280";
    ctx.font = "12px Arial, sans-serif";
    ctx.fillText("Unique Identification Authority of India", w / 2, yPos + 22);

    // === ADDRESS ===
    if (person.address) {
        yPos += 45;
        ctx.textAlign = "left";
        ctx.fillStyle = "#4b5563";
        ctx.font = "bold 13px Arial, sans-serif";
        ctx.fillText("Address:", startX, yPos);

        ctx.fillStyle = "#1f2937";
        ctx.font = "14px Arial, sans-serif";
        wrapText(ctx, person.address || "", startX + 110, yPos, 500, 20);
    }

    // === BOTTOM DISCLAIMER ===
    ctx.textAlign = "center";
    ctx.fillStyle = "#9ca3af";
    ctx.font = "9px Arial, sans-serif";
    ctx.fillText("Synthetic test document - Not for official use", w / 2, h - 16);
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