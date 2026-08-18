// js/document-renderer.js

/**
 * Main rendering orchestrator maintaining precise ID-1 canvas aspect ratio (856x539).
 */
function drawSyntheticDocument(canvas, person, type = "PAN", photoDataUrl = null) {
  const ctx = canvas.getContext("2d");

  // Fix dimensions once on canvas element
  if (canvas.width !== 856 || canvas.height !== 539) {
    canvas.width = 856;
    canvas.height = 539;
  }

  const w = canvas.width;
  const h = canvas.height;

  // Clear previous frame completely
  ctx.clearRect(0, 0, w, h);

  const photoX = 580;
  const photoY = 140;
  const photoW = 210;
  const photoH = 260;

  ctx.save();
  roundRectClip(ctx, 0, 0, w, h, 24);

  if (type === "PAN") {
    renderPanCard(ctx, person);
  } else if (type === "AADHAAR") {
    renderAadhaarCard(ctx, person);
  }

  // Draw user photo or default silhouette
  if (photoDataUrl) {
    const img = new Image();
    img.onload = () => {
      ctx.save();
      roundRectClip(ctx, photoX, photoY, photoW, photoH, 12);
      ctx.drawImage(img, photoX, photoY, photoW, photoH);
      ctx.restore();
    };
    img.src = photoDataUrl;
  } else {
    drawAvatarSilhouette(ctx, photoX, photoY, photoW, photoH);
  }

  ctx.restore();
}

/**
 * Render PAN format
 */
function renderPanCard(ctx, person) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;

  // Background Gradient
  const bgGradient = ctx.createLinearGradient(0, 0, w, h);
  bgGradient.addColorStop(0, "#f2f7fc");
  bgGradient.addColorStop(1, "#ffffff");
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, w, h);

  // Decorative waves
  drawWavePattern(ctx, 180, 200, "rgba(165, 204, 247, 0.2)");

  // Outer Border Line
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, w, h);

  // Top Left Headers
  ctx.fillStyle = "#8a0c0c";
  ctx.font = "bold 20px 'Arial Unicode MS', sans-serif";
  ctx.fillText("आयकर विभाग", 40, 45);

  ctx.fillStyle = "#1e293b";
  ctx.font = "bold 16px Arial, sans-serif";
  ctx.fillText("INCOME TAX DEPARTMENT", 40, 70);

  // Top Right Headers
  ctx.fillStyle = "#8a0c0c";
  ctx.font = "bold 18px 'Arial Unicode MS', sans-serif";
  ctx.fillText("भारत सरकार", 680, 45);

  ctx.fillStyle = "#1e293b";
  ctx.font = "bold 15px Arial, sans-serif";
  ctx.fillText("GOVT. OF INDIA", 680, 70);

  // Central Pillar Emblem (Vector Pillared Crest)
  drawPillarEmblem(ctx, w / 2 - 20, 20, 40, 55, "#3b82f6");

  // Hologram Box with QR Code rendered inside
  drawHologramBox(ctx, 420, 140, 130, 130);
  drawMockQrCode(ctx, 425, 145, 120, 120);

  // Dynamic Form Data Styles
  const labelStyle = { font: "12px Arial", color: "#64748b" };
  const valueStyle = { font: "bold 18px Arial, sans-serif", color: "#0f172a" };

  drawField(ctx, "NAME", String(person.name || "").toUpperCase(), 150, 40, labelStyle, valueStyle);
  drawField(ctx, "FATHER / PARENT NAME", String(person.parentName || "TEST PARENT").toUpperCase(), 220, 40, labelStyle, valueStyle);
  drawField(ctx, "DATE OF BIRTH", person.dob || "", 290, 40, labelStyle, valueStyle);
  drawField(ctx, "PAN TEST NUMBER", person.pan || "", 360, 40, labelStyle, valueStyle);

  // Address
  ctx.fillStyle = labelStyle.color;
  ctx.font = labelStyle.font;
  ctx.fillText("ADDRESS", 40, 430);
  ctx.fillStyle = valueStyle.color;
  ctx.font = "15px Arial, sans-serif";
  wrapText(ctx, person.address || "", 40, 452, 680, 20);

  drawDisclaimerText(ctx, w / 2, h - 16);
}

/**
 * Render Aadhaar format
 */
function renderAadhaarCard(ctx, person) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);

  // Header Text
  ctx.fillStyle = "#d97706";
  ctx.font = "bold 18px 'Arial Unicode MS', sans-serif";
  ctx.fillText("भारत सरकार", w / 2 - 40, 40);

  ctx.fillStyle = "#15803d";
  ctx.font = "bold 15px Arial, sans-serif";
  ctx.fillText("GOVERNMENT OF INDIA", w / 2 - 80, 65);

  // Tri-color Ribbon Strip
  ctx.fillStyle = "#f97316"; ctx.fillRect(30, 80, (w - 60) / 3, 4);
  ctx.fillStyle = "#cbd5e1"; ctx.fillRect(30 + (w - 60) / 3, 80, (w - 60) / 3, 4);
  ctx.fillStyle = "#16a34a"; ctx.fillRect(30 + (2 * (w - 60) / 3), 80, (w - 60) / 3, 4);

  drawPillarEmblem(ctx, 40, 20, 35, 50, "#334155");
  drawFingerprintIcon(ctx, 740, 20, 45, 45);

  const labelStyle = { font: "14px Arial", color: "#475569" };
  const valueStyle = { font: "bold 17px Arial, sans-serif", color: "#0f172a" };

  drawField(ctx, "NAME", String(person.name || "").toUpperCase(), 140, 40, labelStyle, valueStyle);
  drawField(ctx, "DOB", person.dob || "", 190, 40, labelStyle, valueStyle);
  drawField(ctx, "GENDER", person.gender || "", 240, 40, labelStyle, valueStyle);

  // Address Line
  ctx.fillStyle = labelStyle.color;
  ctx.font = labelStyle.font;
  ctx.fillText("ADDRESS: ", 40, 290);
  ctx.fillStyle = valueStyle.color;
  ctx.font = valueStyle.font;
  ctx.fillText(person.address || "", 120, 290);

  // Centered ID Number
  ctx.font = "bold 32px Arial, sans-serif";
  ctx.fillStyle = "#0f172a";
  const str = person.aadhaar || "[Aadhaar Redacted]";
  const numX = w / 2 - ctx.measureText(str).width / 2;
  ctx.fillText(str, numX, 410);

  drawMockQrCode(ctx, 580, 140, 150, 150);

  ctx.font = "18px 'Arial Unicode MS', sans-serif";
  ctx.fillStyle = "#991b1b";
  ctx.fillText("आधार - भारतीय विशिष्ट पहचान प्राधिकरण", w / 2 - 150, 475);

  drawDisclaimerText(ctx, w / 2, h - 16, "#94a3b8", "11px");
}

// Vector Drawing Helper Routines

function drawField(ctx, label, value, y, startX, labelStyle, valueStyle) {
  ctx.fillStyle = labelStyle.color;
  ctx.font = labelStyle.font;
  ctx.fillText(label, startX, y);

  ctx.fillStyle = valueStyle.color;
  ctx.font = valueStyle.font;
  ctx.fillText(value || "XXXX", startX, y + 22);
}

function drawDisclaimerText(ctx, x, y, color = "#94a3b8", font = "11px Arial") {
  ctx.save();
  ctx.font = `bold ${font}`;
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.fillText("मेरा आधार, मेरी पहचान", x, y);
  ctx.restore();
}

/**
 * Modern vector emblem drawing (3 vertical pillars + base)
 */
function drawPillarEmblem(ctx, x, y, w, h, color) {
  ctx.save();
  ctx.fillStyle = color;

  // Base
  ctx.fillRect(x, y + h * 0.85, w, h * 0.15);

  // Top Cap
  ctx.fillRect(x + 2, y, w - 4, h * 0.12);

  // 3 Central Pillars
  const pillarW = w * 0.2;
  ctx.fillRect(x + w * 0.1, y + h * 0.15, pillarW, h * 0.68);
  ctx.fillRect(x + w * 0.4, y + h * 0.15, pillarW, h * 0.68);
  ctx.fillRect(x + w * 0.7, y + h * 0.15, pillarW, h * 0.68);

  ctx.restore();
}

function drawAvatarSilhouette(ctx, x, y, w, h) {
  ctx.save();
  roundRectClip(ctx, x, y, w, h, 10);
  ctx.fillStyle = "#e2e8f0";
  ctx.fillRect(x, y, w, h);

  ctx.fillStyle = "#94a3b8";

  // Shoulder Body
  ctx.beginPath();
  ctx.moveTo(x + w * 0.1, y + h);
  ctx.lineTo(x + w * 0.9, y + h);
  ctx.lineTo(x + w * 0.8, y + h * 0.6);
  ctx.quadraticCurveTo(x + w / 2, y + h * 0.5, x + w * 0.2, y + h * 0.6);
  ctx.closePath();
  ctx.fill();

  // Head Circle
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h * 0.35, w * 0.22, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);
  ctx.restore();
}

function drawFingerprintIcon(ctx, x, y, w, h) {
  ctx.save();
  ctx.strokeStyle = "#d97706";
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2, (w / 2) - (i * 5), 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawHologramBox(ctx, x, y, w, h) {
  ctx.save();
  ctx.fillStyle = "#f1f5f9";
  ctx.strokeStyle = "#cbd5e1";
  ctx.fillRect(x, y, w, h);
  ctx.strokeRect(x, y, w, h);
  ctx.restore();
}

function drawMockQrCode(ctx, x, y, w, h) {
  ctx.save();
  ctx.fillStyle = "#1e293b";
  const size = 10;
  for (let r = 0; r < h / size; r++) {
    for (let c = 0; c < w / size; c++) {
      if ((r + c) % 2 === 0) {
        ctx.fillRect(x + (c * size), y + (r * size), size, size);
      }
    }
  }
  ctx.restore();
}

function drawWavePattern(ctx, xStart, yStart, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  for (let i = 0; i < 50; i += 8) {
    ctx.beginPath();
    ctx.moveTo(xStart + i, yStart);
    ctx.bezierCurveTo(xStart + i + 80, yStart + 40, xStart + i - 80, yStart + 120, xStart + i, yStart + 160);
    ctx.stroke();
  }
  ctx.restore();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(/\s+/);
  let line = "";
  for (let n = 0; n < words.length; n++) {
    let testLine = line + words[n] + " ";
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

function roundRectClip(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.clip();
}