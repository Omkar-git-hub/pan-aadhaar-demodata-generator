# OCR Test Data Generator

Simple client-side web app for generating synthetic OCR test document images.

## Run
Open `index.html` in a modern browser. An internet connection is required for the SheetJS CDN used for Excel parsing.

## Excel
Download the sample template from the app. Required headers:
- Name
- DOB
- Gender
- Address

PAN/Aadhaar fields are synthetic test identifiers and are not valid government IDs.

## Deploy
This is a static site. Deploy the folder to any static hosting service or serve it from an existing web server.

## Notes
The generated image is deliberately marked as synthetic/test data and does not reproduce an official PAN/Aadhaar card design.


## Identifier behavior
PAN test values use the standard PAN-shaped pattern (5 letters, 4 digits, 1 letter).
Aadhaar test values use 12 digits but are intentionally invalid for Aadhaar checksum validation.
They are displayed as synthetic test values and must only be used for OCR/automation testing.
