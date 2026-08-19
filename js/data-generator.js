// js/data-generator.js

// ============================================================
// PAN NUMBER GENERATION
// ============================================================

function generatePANNumber() {
    const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let letters = '';
    for (let i = 0; i < 3; i++) {
        letters += alpha[Math.floor(Math.random() * alpha.length)];
    }
    const fourthChars = ['P', 'C', 'H', 'F', 'A', 'T', 'B', 'L', 'J', 'G'];
    letters += fourthChars[Math.floor(Math.random() * fourthChars.length)];
    letters += alpha[Math.floor(Math.random() * alpha.length)];
    
    let digits = '';
    for (let i = 0; i < 4; i++) {
        digits += Math.floor(Math.random() * 10);
    }
    const lastLetter = alpha[Math.floor(Math.random() * alpha.length)];
    return letters + digits + lastLetter;
}

// ============================================================
// AADHAR NUMBER GENERATION
// ============================================================

function generateAadharNumber() {
    let number = '';
    for (let i = 0; i < 12; i++) {
        number += Math.floor(Math.random() * 10);
    }
    return number.match(/.{1,4}/g).join(' ');
}

// ============================================================
// NAME GENERATION (for bulk creation)
// ============================================================

function generateRandomName() {
    const firstNames = [
        "RAHUL", "PRIYA", "AMIT", "SUNITA", "VIKRAM", "NEHA", "RAJ", "ANJALI",
        "SURESH", "KAVITA", "MANOJ", "POOJA", "DEEPAK", "RITU", "SANJAY", "NISHA",
        "ASHOK", "MEERA", "VIVEK", "SAPNA", "RAJESH", "SWATI", "ANAND", "SUMAN",
        "JOHN", "MARY", "PETER", "SARA", "MICHAEL", "EMMA", "DAVID", "OLIVIA"
    ];
    
    const lastNames = [
        "SHARMA", "VERMA", "PATEL", "KUMAR", "SINGH", "REDDY", "RAO", "GUPTA",
        "JOSHI", "NAIR", "MENON", "PILLAI", "MEHTA", "CHAWLA", "MALHOTRA", "SETH",
        "SMITH", "JOHNSON", "WILLIAMS", "BROWN", "JONES", "GARCIA", "MILLER", "DAVIS"
    ];
    
    const first = firstNames[Math.floor(Math.random() * firstNames.length)];
    const last = lastNames[Math.floor(Math.random() * lastNames.length)];
    return `${first} ${last}`;
}

function generateRandomFatherName() {
    const fatherNames = [
        "RAM", "MOHAN", "RAJ", "SURESH", "DINESH", "MAHESH", "RAMESH", "KISHAN",
        "HARI", "GOPAL", "PREM", "CHANDER", "BHUPESH", "RAJENDRA", "MAHENDRA",
        "JOHN", "MICHAEL", "DAVID", "ROBERT", "JAMES", "WILLIAM", "CHARLES"
    ];
    
    const lastNames = [
        "SHARMA", "VERMA", "PATEL", "KUMAR", "SINGH", "REDDY", "RAO", "GUPTA",
        "JOSHI", "NAIR", "MENON", "PILLAI", "MEHTA", "CHAWLA", "MALHOTRA",
        "SMITH", "JOHNSON", "WILLIAMS", "BROWN", "JONES", "GARCIA"
    ];
    
    const first = fatherNames[Math.floor(Math.random() * fatherNames.length)];
    const last = lastNames[Math.floor(Math.random() * lastNames.length)];
    return `${first} ${last}`;
}

function generateRandomDOB(minAge = 18, maxAge = 85) {
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());
    const minDate = new Date(today.getFullYear() - maxAge, today.getMonth(), today.getDate());
    
    const randomTime = minDate.getTime() + Math.random() * (maxDate.getTime() - minDate.getTime());
    const dob = new Date(randomTime);
    
    const day = String(dob.getDate()).padStart(2, '0');
    const month = String(dob.getMonth() + 1).padStart(2, '0');
    const year = dob.getFullYear();
    
    return `${day}/${month}/${year}`;
}

function generateRandomAddress() {
    const streets = ["MG Road", "Park Street", "Main Road", "Church Street", "Commercial Street", "Residency Road"];
    const cities = ["MUMBAI", "DELHI", "BANGALORE", "HYDERABAD", "CHENNAI", "KOLKATA", "PUNE", "AHMEDABAD"];
    const states = ["MAHARASHTRA", "DELHI", "KARNATAKA", "TELANGANA", "TAMIL NADU", "WEST BENGAL", "GUJARAT"];
    const pincodes = ["560001", "110001", "400001", "500001", "600001", "700001", "411001", "380001"];
    
    const house = Math.floor(Math.random() * 999) + 1;
    const street = streets[Math.floor(Math.random() * streets.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const state = states[Math.floor(Math.random() * states.length)];
    const pincode = pincodes[Math.floor(Math.random() * pincodes.length)];
    
    return `${house}, ${street}, ${city}, ${state} - ${pincode}`;
}

function generateRandomGender() {
    return Math.random() > 0.5 ? "Male" : "Female";
}

// ============================================================
// BULK DATA GENERATION
// ============================================================

function generateBulkTestData(count = 10) {
    const bulkData = [];
    
    for (let i = 0; i < count; i++) {
        const ids = makeTestIds(i);
        
        bulkData.push({
            name: generateRandomName(),
            dob: generateRandomDOB(),
            gender: generateRandomGender(),
            address: generateRandomAddress(),
            parentName: generateRandomFatherName(),
            pan: ids.pan,
            aadhaar: ids.aadhaar
        });
    }
    
    return bulkData;
}

// ============================================================
// EXISTING FUNCTIONS (Keep these)
// ============================================================

function makePanTestId(index = 0) {
    return generatePANNumber();
}

function makeAadhaarTestId() {
    return generateAadharNumber();
}

function makeTestIds(index = 0) {
    return {
        pan: makePanTestId(index),
        aadhaar: makeAadhaarTestId()
    };
}

function randomLetters(n) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let s = "";
    for (let i = 0; i < n; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return s;
}

function randomDigits(n) {
    let s = "";
    for (let i = 0; i < n; i++) s += Math.floor(Math.random() * 10);
    return s;
}

function normalizeDate(value) {
    if (value instanceof Date && !isNaN(value)) {
        return value.toLocaleDateString("en-GB");
    }
    if (typeof value === "number" && window.XLSX) {
        try {
            const d = XLSX.SSF.parse_date_code(value);
            return `${String(d.d).padStart(2, "0")}/${String(d.m).padStart(2, "0")}/${d.y}`;
        } catch (e) {}
    }
    const s = String(value || "").trim();
    if (!s) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
        const [y, m, d] = s.split("-");
        return `${d}/${m}/${y}`;
    }
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
        const parts = s.split('/');
        if (parseInt(parts[0]) > 12) return s;
        return `${parts[1]}/${parts[0]}/${parts[2]}`;
    }
    return s;
}

// ============================================================
// EXPORT FOR MODULE USE (if needed)
// ============================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generatePANNumber,
        generateAadharNumber,
        generateRandomName,
        generateRandomFatherName,
        generateRandomDOB,
        generateRandomAddress,
        generateRandomGender,
        generateBulkTestData,
        makePanTestId,
        makeAadhaarTestId,
        makeTestIds,
        normalizeDate,
        randomLetters,
        randomDigits
    };
}