import base64
from pathlib import Path

import streamlit as st
import streamlit.components.v1 as components


# ---------------------------------------------------------
# Streamlit page configuration
# ---------------------------------------------------------

st.set_page_config(
    page_title="PAN & Aadhaar Synthetic Data Generator",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="collapsed",
)


# ---------------------------------------------------------
# Project paths
# ---------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent

INDEX_FILE = BASE_DIR / "index.html"
CSS_FILE = BASE_DIR / "css" / "style.css"

JS_FILES = [
    BASE_DIR / "js" / "data-generator.js",
    BASE_DIR / "js" / "document-renderer.js",
    BASE_DIR / "js" / "image-export.js",
    BASE_DIR / "js" / "app.js",
]

TEMPLATE_FILE = BASE_DIR / "sample" / "ocr-test-data-template.xlsx"


# ---------------------------------------------------------
# Validate required files
# ---------------------------------------------------------

required_files = [
    INDEX_FILE,
    CSS_FILE,
    TEMPLATE_FILE,
    *JS_FILES,
]

missing_files = [
    str(file.relative_to(BASE_DIR))
    for file in required_files
    if not file.exists()
]

if missing_files:
    st.error("Required project files are missing:")

    for file in missing_files:
        st.code(file)

    st.stop()


# ---------------------------------------------------------
# Read existing HTML
# ---------------------------------------------------------

html = INDEX_FILE.read_text(encoding="utf-8")


# ---------------------------------------------------------
# Read existing CSS
# ---------------------------------------------------------

css = CSS_FILE.read_text(encoding="utf-8")


# ---------------------------------------------------------
# Read existing JavaScript files
# ---------------------------------------------------------

javascript = ""

for js_file in JS_FILES:
    javascript += "\n\n"
    javascript += f"// ===== {js_file.name} =====\n"
    javascript += js_file.read_text(encoding="utf-8")


# ---------------------------------------------------------
# Convert sample Excel to Base64
# ---------------------------------------------------------

template_bytes = TEMPLATE_FILE.read_bytes()

template_base64 = base64.b64encode(template_bytes).decode("utf-8")


# ---------------------------------------------------------
# Inject CSS + template data
# ---------------------------------------------------------

injected_css = f"""
<style>
{css}
</style>
"""

template_script = f"""
<script>
window.OCR_TEMPLATE_BASE64 = "{template_base64}";
</script>
"""


# ---------------------------------------------------------
# Remove external CSS and local JS references
#
# We inject them directly so that the application works
# correctly inside Streamlit's iframe.
# ---------------------------------------------------------

html = html.replace(
    '<link rel="stylesheet" href="css/style.css">',
    ""
)

html = html.replace(
    '<script src="js/data-generator.js"></script>',
    ""
)

html = html.replace(
    '<script src="js/document-renderer.js"></script>',
    ""
)

html = html.replace(
    '<script src="js/image-export.js"></script>',
    ""
)

html = html.replace(
    '<script src="js/app.js"></script>',
    ""
)


# ---------------------------------------------------------
# Build final application
# ---------------------------------------------------------

final_html = f"""
<!DOCTYPE html>

<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>
        PAN & Aadhaar Synthetic Data Generator
    </title>

    <script
        src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"
    ></script>

    {injected_css}

</head>

<body>

    {html}

    {template_script}

    <script>
    {javascript}
    </script>

</body>

</html>
"""


# ---------------------------------------------------------
# Render the existing application
# ---------------------------------------------------------

components.html(
    final_html,
    height=2200,
    scrolling=True,
)