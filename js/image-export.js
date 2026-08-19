// js/image-export.js

/**
 * Convert canvas to JPG blob
 * Quality set to 0.78 keeps full image downloads well under 100 KB (~45 KB)
 */
function canvasToJpgBlob(canvas, quality = 0.78) {
  return new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", quality));
}

/**
 * Download canvas as JPG image
 * Creates a temporary link and triggers download
 */
async function downloadCanvas(canvas, filename, quality = 0.78) {
  const blob = await canvasToJpgBlob(canvas, quality);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}