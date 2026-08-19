import streamlit as st
import streamlit.components.v1 as components
from pathlib import Path
import base64

st.set_page_config(
    page_title="PAN & Aadhaar Synthetic Data Generator",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="collapsed",
)

BASE_DIR = Path(__file__).parent


def load_file(path):
    return path.read_text(encoding="utf-8")


html = load_file(BASE_DIR / "index.html")
css = load_file(BASE_DIR / "css" / "style.css")
app_js = load_file(BASE_DIR / "js" / "app.js")
data_generator_js = load_file(BASE_DIR / "js" / "data-generator.js")
document_renderer_js = load_file(BASE_DIR / "js" / "document-renderer.js")
image_export_js = load_file(BASE_DIR / "js" / "image-export.js")


# Read the existing Excel template
template_path = BASE_DIR / "sample" / "ocr-test-data-template.xlsx"

with open(template_path, "rb") as f:
    template_base64 = base64.b64encode(f.read()).decode("utf-8")


# Inject CSS
html = html.replace(
    '<link rel="stylesheet" href="css/style.css">',
    f"<style>{css}</style>"
)

# Inject JavaScript
html = html.replace(
    '<script src="js/data-generator.js"></script>',
    f"<script>{data_generator_js}</script>"
)

html = html.replace(
    '<script src="js/document-renderer.js"></script>',
    f"<script>{document_renderer_js}</script>"
)

html = html.replace(
    '<script src="js/image-export.js"></script>',
    f"<script>{image_export_js}</script>"
)

html = html.replace(
    '<script src="js/app.js"></script>',
    f"<script>{app_js}</script>"
)


# Inject existing Excel template into the page
template_script = f"""
<script>
window.OCR_TEMPLATE_BASE64 = "{template_base64}";
</script>
"""

html = html.replace("</head>", template_script + "</head>")


components.html(
    html,
    height=1500,
    scrolling=True,
)