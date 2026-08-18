import streamlit as st
import pandas as pd

st.title("🛡️ PAN & Aadhaar Synthetic Data Generator")
st.write("Upload your template to generate mock images.")

uploaded_file = st.file_uploader("Choose an Excel file (.xlsx)", type=["xlsx"])
if uploaded_file is not None:
    df = pd.read_excel(uploaded_file)
    st.success("File uploaded successfully!")
    st.write(df.head())
