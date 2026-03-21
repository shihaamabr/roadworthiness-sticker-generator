// Template cache
const templateCache = {
    html: {},
    css: {}
};

// Current template ID
let currentTemplateId = null;
let currentBarcodeNumber = null;

// DOM Elements
const form = document.getElementById('stickerForm');
const garageSelect = document.getElementById('garage');
const regNumberInput = document.getElementById('regNumber');
const fromDateInput = document.getElementById('fromDate');
const toDateInput = document.getElementById('toDate');
const modelNumberInput = document.getElementById('modelNumber');
const chassisNumberInput = document.getElementById('chassisNumber');
const engineSerialInput = document.getElementById('engineSerial');
const engineCapacityInput = document.getElementById('engineCapacity');
const stickerPreview = document.getElementById('stickerPreview');

// Initialize the application
async function init() {
    setDefaultDates();
    await loadTemplateList();
    setupEventListeners();
    generateBarcodeNumber();
    await loadTemplate(garageSelect.value);
}

// Load template list from index.json
async function loadTemplateList() {
    try {
        const response = await fetch('templates/index.json');
        const data = await response.json();

        garageSelect.innerHTML = '';
        data.templates.forEach(template => {
            const option = document.createElement('option');
            option.value = template.id;
            option.textContent = template.name;
            garageSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to load template list:', error);
        showSnackbar('Failed to load templates', 'error');
    }
}

// Load a specific template (HTML + CSS)
async function loadTemplate(templateId) {
    if (currentTemplateId === templateId && templateCache.html[templateId]) {
        renderTemplate(templateId);
        return;
    }

    try {
        // Load HTML if not cached
        if (!templateCache.html[templateId]) {
            const htmlResponse = await fetch(`templates/${templateId}.html`);
            templateCache.html[templateId] = await htmlResponse.text();
        }

        // Load CSS if not cached
        if (!templateCache.css[templateId]) {
            const cssResponse = await fetch(`templates/${templateId}.css`);
            templateCache.css[templateId] = await cssResponse.text();

            // Inject CSS into head
            const styleId = `template-style-${templateId}`;
            let styleEl = document.getElementById(styleId);
            if (!styleEl) {
                styleEl = document.createElement('style');
                styleEl.id = styleId;
                document.head.appendChild(styleEl);
            }
            styleEl.textContent = templateCache.css[templateId];
        }

        currentTemplateId = templateId;
        renderTemplate(templateId);
    } catch (error) {
        console.error('Failed to load template:', error);
        showSnackbar('Failed to load template', 'error');
    }
}

// Render template with current form values
function renderTemplate(templateId) {
    const html = templateCache.html[templateId];
    if (!html) return;

    // Get current values - show empty placeholders if no input
    const values = {
        regNumber: regNumberInput.value ? formatRegNumber(regNumberInput.value) : 'X 0 X 0 0 0 0',
        barcodeNumber: currentBarcodeNumber || 'XXXXXXXXXX',
        fromDate: formatDateForDisplay(fromDateInput.value) || 'XX-XX-XXXX',
        toDate: formatDateForDisplay(toDateInput.value) || 'XX-XX-XXXX',
        modelNumber: modelNumberInput.value || 'XXX000-000X',
        chassisNumber: chassisNumberInput.value || 'XXXXXXXXXXXXXXXXX',
        engineSerial: engineSerialInput.value || 'XXX-XXXXXX',
        engineCapacity: engineCapacityInput.value || 'XXX.XXX'
    };

    // Replace placeholders
    let rendered = html;
    for (const [key, value] of Object.entries(values)) {
        rendered = rendered.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    stickerPreview.innerHTML = rendered;

    // Generate barcode
    const barcodeEl = stickerPreview.querySelector('.barcode');
    if (barcodeEl && currentBarcodeNumber) {
        try {
            JsBarcode(barcodeEl, currentBarcodeNumber, {
                format: 'CODE128',
                width: 1.5,
                height: 25,
                displayValue: false,
                margin: 0,
                background: 'transparent'
            });
        } catch (e) {
            console.error('Barcode generation failed:', e);
        }
    }
}

// Set default dates (today and 1 year from today minus 1 day)
function setDefaultDates() {
    const today = new Date();
    fromDateInput.value = formatDateForInput(today);
    updateToDate();
}

// Calculate to date (1 year from from date minus 1 day)
function updateToDate() {
    const fromDate = new Date(fromDateInput.value);
    const toDate = new Date(fromDate);
    toDate.setFullYear(toDate.getFullYear() + 1);
    toDate.setDate(toDate.getDate() - 1);
    toDateInput.value = formatDateForInput(toDate);
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
    currentBarcodeNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

// Setup event listeners
function setupEventListeners() {
    // Template change
    garageSelect.addEventListener('change', async () => {
        await loadTemplate(garageSelect.value);
    });

    // Real-time preview updates
    const updatePreview = () => renderTemplate(currentTemplateId);

    regNumberInput.addEventListener('input', updatePreview);
    fromDateInput.addEventListener('change', updatePreview);
    modelNumberInput.addEventListener('input', updatePreview);
    chassisNumberInput.addEventListener('input', updatePreview);
    engineSerialInput.addEventListener('input', updatePreview);
    engineCapacityInput.addEventListener('input', updatePreview);

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
        updateToDate();
        renderTemplate(currentTemplateId);
    });
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.classList.add('loading');
    submitBtn.querySelector('.material-icons').textContent = 'autorenew';

    try {
        // Generate new barcode for final PDF
        generateBarcodeNumber();
        renderTemplate(currentTemplateId);

        // Wait for render
        await new Promise(resolve => setTimeout(resolve, 100));

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
    const stickerElement = stickerPreview.querySelector('.sticker, [class^="sticker-"]');

    if (!stickerElement) {
        throw new Error('No sticker element found');
    }

    // Capture the sticker as an image
    const canvas = await html2canvas(stickerElement, {
        scale: 4,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false
    });

    // Create PDF with A4 dimensions
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    // Sticker size on A4 (approximately 55mm wide)
    const stickerWidth = 55;
    const stickerHeight = (canvas.height / canvas.width) * stickerWidth;

    // Position at top-left with small margin
    const x = 10;
    const y = 10;

    pdf.addImage(imgData, 'PNG', x, y, stickerWidth, stickerHeight);

    // Generate filename
    const regNumber = regNumberInput.value || 'sticker';
    const filename = `roadworthiness-${regNumber.replace(/\s/g, '')}-${Date.now()}.pdf`;

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

// Set PDF.js worker
if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

// Handle PDF import
async function setupPdfImport() {
    const pdfInput = document.getElementById('pdfInput');
    const importBtn = document.getElementById('importPdfBtn');

    if (!pdfInput || !importBtn) return;

    pdfInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        importBtn.classList.add('loading');

        try {
            const text = await extractTextFromPdf(file);
            const data = parseRegistrationData(text);

            // Check if any data was extracted
            if (Object.keys(data).length === 0) {
                showSnackbar('Failed to import data. Make sure PDF was exported from SIMS portal.', 'error');
            } else {
                fillFormWithData(data);
                showSnackbar('Data imported successfully!', 'success');
            }
        } catch (error) {
            console.error('PDF import failed:', error);
            showSnackbar('Failed to import PDF', 'error');
        } finally {
            importBtn.classList.remove('loading');
            pdfInput.value = ''; // Reset input
        }
    });
}

// Extract text from PDF using PDF.js
async function extractTextFromPdf(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
    }

    return fullText;
}

// Parse registration data from extracted text
function parseRegistrationData(text) {
    const data = {};

    // Registry Number
    const regMatch = text.match(/Registry Number\s*([A-Z0-9]+)/i);
    if (regMatch) data.regNumber = regMatch[1];

    // Model Number
    const modelMatch = text.match(/Model Number\s*([A-Z0-9\-\.]+)/i);
    if (modelMatch) data.modelNumber = modelMatch[1];

    // Chassis Number
    const chassisMatch = text.match(/Chassis Number\s*([A-Z0-9]+)/i);
    if (chassisMatch) data.chassisNumber = chassisMatch[1];

    // Engine Number/Motor Serial No
    const engineMatch = text.match(/Engine Number\/Motor Serial No\s*([A-Z0-9\-]+)/i);
    if (engineMatch) data.engineSerial = engineMatch[1];

    // Engine/Motor Capacity
    const capacityMatch = text.match(/Engine\/Motor Capacity\s*(\d+)/i);
    if (capacityMatch) data.engineCapacity = capacityMatch[1] + '.000';

    return data;
}

// Fill form with parsed data
function fillFormWithData(data) {
    if (data.regNumber) {
        regNumberInput.value = data.regNumber;
    }
    if (data.modelNumber) {
        modelNumberInput.value = data.modelNumber;
    }
    if (data.chassisNumber) {
        chassisNumberInput.value = data.chassisNumber;
    }
    if (data.engineSerial) {
        engineSerialInput.value = data.engineSerial;
    }
    if (data.engineCapacity) {
        engineCapacityInput.value = data.engineCapacity;
    }

    // Update preview
    if (currentTemplateId) {
        renderTemplate(currentTemplateId);
    }
}

// Handle disclaimer modal
function setupDisclaimer() {
    const modal = document.getElementById('disclaimerModal');
    const closeBtn = document.getElementById('disclaimerClose');
    const dontAskCheckbox = document.getElementById('dontAskAgain');

    // Check if user previously chose "don't ask again"
    if (localStorage.getItem('disclaimerAccepted') === 'true') {
        modal.classList.add('hidden');
        return;
    }

    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => {
            if (dontAskCheckbox && dontAskCheckbox.checked) {
                localStorage.setItem('disclaimerAccepted', 'true');
            }
            modal.classList.add('hidden');
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setupDisclaimer();
    setupPdfImport();
    init();
});
