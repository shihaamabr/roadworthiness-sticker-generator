// Garage Templates Configuration
const garageTemplates = {
    'rs-auto': {
        name: 'RS AUTO',
        phone: '775 8999',
        logo: {
            type: 'svg',
            content: `
                <svg viewBox="0 0 80 80" class="logo-svg">
                    <circle cx="40" cy="40" r="38" fill="none" stroke="#000" stroke-width="2"/>
                    <text x="40" y="18" text-anchor="middle" font-size="8" font-weight="bold">RS AUTO</text>
                    <text x="40" y="45" text-anchor="middle" font-size="24" font-weight="bold">S</text>
                    <path d="M20 50 Q40 35 60 50" fill="none" stroke="#000" stroke-width="2"/>
                    <text x="40" y="58" text-anchor="middle" font-size="6">P:0085037</text>
                    <text x="40" y="70" text-anchor="middle" font-size="8" font-weight="bold">MALDIVES</text>
                </svg>
            `
        }
    }
    // Add more garage templates here as needed
};

// DOM Elements
const form = document.getElementById('stickerForm');
const garageSelect = document.getElementById('garage');
const regNumberInput = document.getElementById('regNumber');
const fromDateInput = document.getElementById('fromDate');
const toDateInput = document.getElementById('toDate');
const modelNumberInput = document.getElementById('modelNumber');
const chassisNumberInput = document.getElementById('chassisNumber');
const engineSerialInput = document.getElementById('engineSerial');
const staticValueInput = document.getElementById('staticValue');

// Preview Elements
const previewRegNumber = document.getElementById('previewRegNumber');
const previewBarcodeNumber = document.getElementById('previewBarcodeNumber');
const previewBarcode = document.getElementById('previewBarcode');
const previewFromDate = document.getElementById('previewFromDate');
const previewToDate = document.getElementById('previewToDate');
const previewModelNumber = document.getElementById('previewModelNumber');
const previewChassisNumber = document.getElementById('previewChassisNumber');
const previewEngineSerial = document.getElementById('previewEngineSerial');
const previewStaticValue = document.getElementById('previewStaticValue');
const previewGarageInfo = document.getElementById('previewGarageInfo');
const garageLogo = document.getElementById('garageLogo');

// Initialize the application
function init() {
    setDefaultDates();
    setupEventListeners();
    updatePreview();
    generateBarcode();
}

// Set default dates (today and 1 year from today)
function setDefaultDates() {
    const today = new Date();
    const nextYear = new Date(today);
    nextYear.setFullYear(nextYear.getFullYear() + 1);

    fromDateInput.value = formatDateForInput(today);
    toDateInput.value = formatDateForInput(nextYear);
}

// Format date for input field (YYYY-MM-DD)
function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Format date for display (DD-MM-YYYY)
function formatDateForDisplay(dateString) {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
}

// Format registration number with spaces
function formatRegNumber(regNumber) {
    return regNumber.toUpperCase().split('').join(' ');
}

// Generate a random barcode number (10 digits)
function generateBarcodeNumber() {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

// Setup event listeners
function setupEventListeners() {
    // Real-time preview updates
    regNumberInput.addEventListener('input', updatePreview);
    fromDateInput.addEventListener('change', updatePreview);
    toDateInput.addEventListener('change', updatePreview);
    modelNumberInput.addEventListener('input', updatePreview);
    chassisNumberInput.addEventListener('input', updatePreview);
    engineSerialInput.addEventListener('input', updatePreview);
    garageSelect.addEventListener('change', updatePreview);

    // Auto-uppercase for certain fields
    regNumberInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.toUpperCase();
    });

    chassisNumberInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.toUpperCase();
    });

    // Form submission
    form.addEventListener('submit', handleFormSubmit);

    // From date change updates To date
    fromDateInput.addEventListener('change', () => {
        const fromDate = new Date(fromDateInput.value);
        const toDate = new Date(fromDate);
        toDate.setFullYear(toDate.getFullYear() + 1);
        toDateInput.value = formatDateForInput(toDate);
        updatePreview();
    });
}

// Update the sticker preview
function updatePreview() {
    const garage = garageTemplates[garageSelect.value];

    // Update registration number
    const regNumber = regNumberInput.value || 'A0F7930';
    previewRegNumber.textContent = formatRegNumber(regNumber);

    // Update dates
    previewFromDate.textContent = formatDateForDisplay(fromDateInput.value) || '21-03-2026';
    previewToDate.textContent = formatDateForDisplay(toDateInput.value) || '20-03-2027';

    // Update vehicle info
    previewModelNumber.textContent = modelNumberInput.value || '55S400-010C';
    previewChassisNumber.textContent = chassisNumberInput.value || 'MH355S004DK117181';
    previewEngineSerial.textContent = engineSerialInput.value || '55S-118388';
    previewStaticValue.textContent = staticValueInput.value || '135.000';

    // Update garage info
    if (garage) {
        previewGarageInfo.textContent = `${garage.name}, TEL: ${garage.phone}`;
        garageLogo.innerHTML = garage.logo.content;
    }
}

// Generate barcode
function generateBarcode() {
    const barcodeNumber = generateBarcodeNumber();
    previewBarcodeNumber.textContent = barcodeNumber;

    try {
        JsBarcode(previewBarcode, barcodeNumber, {
            format: 'CODE128',
            width: 1.5,
            height: 30,
            displayValue: false,
            margin: 0
        });
    } catch (e) {
        console.error('Barcode generation failed:', e);
    }
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.classList.add('loading');
    submitBtn.querySelector('.material-icons').textContent = 'autorenew';

    try {
        await generatePDF();
        showSnackbar('Sticker generated successfully!', 'success');
    } catch (error) {
        console.error('PDF generation failed:', error);
        showSnackbar('Failed to generate sticker. Please try again.', 'error');
    } finally {
        submitBtn.classList.remove('loading');
        submitBtn.querySelector('.material-icons').textContent = 'picture_as_pdf';
    }
}

// Generate PDF
async function generatePDF() {
    const { jsPDF } = window.jspdf;
    const stickerElement = document.querySelector('.sticker');

    // Generate a new barcode number for this sticker
    generateBarcode();

    // Wait for barcode to render
    await new Promise(resolve => setTimeout(resolve, 100));

    // Capture the sticker as an image
    const canvas = await html2canvas(stickerElement, {
        scale: 3, // Higher resolution
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false
    });

    // Create PDF with sticker dimensions
    const imgData = canvas.toDataURL('image/png');

    // Calculate dimensions (sticker is approximately 280px wide)
    const pdfWidth = 100; // mm
    const pdfHeight = (canvas.height / canvas.width) * pdfWidth;

    const pdf = new jsPDF({
        orientation: pdfHeight > pdfWidth ? 'portrait' : 'landscape',
        unit: 'mm',
        format: [pdfWidth + 10, pdfHeight + 10]
    });

    // Center the sticker
    const x = 5;
    const y = 5;

    pdf.addImage(imgData, 'PNG', x, y, pdfWidth, pdfHeight);

    // Generate filename
    const regNumber = regNumberInput.value || 'sticker';
    const filename = `roadworthiness-${regNumber.replace(/\s/g, '')}-${Date.now()}.pdf`;

    // Save the PDF
    pdf.save(filename);
}

// Show snackbar notification
function showSnackbar(message, type = '') {
    const snackbar = document.getElementById('snackbar');
    snackbar.textContent = message;
    snackbar.className = 'snackbar show';
    if (type) {
        snackbar.classList.add(type);
    }

    setTimeout(() => {
        snackbar.className = 'snackbar';
    }, 3000);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
