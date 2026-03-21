# Adding New Templates

This guide explains how to create and add new sticker templates to the generator.

## Overview

Each template consists of three parts:

1. **HTML file** (`templates/<id>.html`) - The sticker structure with placeholders
2. **CSS file** (`templates/<id>.css`) - The sticker styles
3. **Registry entry** (`templates/index.json`) - Registers the template in the dropdown

## Step-by-Step Guide

### Step 1: Create the HTML Template

Create a new file `templates/your-garage.html`:

```html
<div class="sticker sticker-your-garage">
    <div class="sticker-header">
        <span class="reg-number">{{regNumber}}</span>
    </div>
    <div class="sticker-barcode-row">
        <span class="barcode-number">{{barcodeNumber}}</span>
        <svg class="barcode"></svg>
    </div>
    <div class="sticker-body">
        <div class="sticker-info">
            <div><strong>From:</strong> {{fromDate}}</div>
            <div><strong>To:</strong> {{toDate}}</div>
            <div>{{modelNumber}}</div>
            <div>{{chassisNumber}}</div>
            <div>{{engineSerial}}</div>
            <div>{{engineCapacity}} cc</div>
        </div>
        <!-- Optional: Add logo section -->
        <div class="sticker-logo">
            <img src="path/to/logo.png" alt="Logo">
        </div>
    </div>
    <div class="sticker-footer">Your Garage Name, TEL: XXX XXXX</div>
</div>
```

### Step 2: Create the CSS Styles

Create a new file `templates/your-garage.css`:

```css
/* Your Garage Template Styles */
.sticker-your-garage {
    width: 280px;
    border: 2px solid #000;
    font-family: Arial, sans-serif;
    font-size: 11px;
    background: #fff;
    color: #000;
}

.sticker-your-garage .sticker-header {
    background-color: #000;
    color: #fff;
    text-align: center;
    padding: 6px 8px;
    font-size: 18px;
    font-weight: bold;
    letter-spacing: 4px;
}

.sticker-your-garage .sticker-barcode-row {
    display: flex;
    align-items: center;
    border-bottom: 1px solid #000;
    padding: 4px 8px;
    gap: 8px;
}

.sticker-your-garage .sticker-barcode-row .barcode-number {
    font-size: 11px;
    font-weight: 500;
}

.sticker-your-garage .sticker-barcode-row .barcode {
    height: 30px;
    flex: 1;
}

.sticker-your-garage .sticker-body {
    display: flex;
    border-bottom: 1px solid #000;
}

.sticker-your-garage .sticker-info {
    flex: 1;
    padding: 6px 8px;
    font-size: 10px;
    line-height: 1.4;
}

.sticker-your-garage .sticker-logo {
    width: 80px;
    border-left: 1px solid #000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
}

.sticker-your-garage .sticker-footer {
    text-align: center;
    padding: 4px 8px;
    font-size: 10px;
    font-weight: 500;
}
```

### Step 3: Register the Template

Add your template to `templates/index.json`:

```json
{
  "templates": [
    {
      "id": "rs-auto",
      "name": "RS AUTO"
    },
    {
      "id": "motca",
      "name": "Min. of Transport & Civil Aviation"
    },
    {
      "id": "your-garage",
      "name": "Your Garage Name"
    }
  ]
}
```

**Important:** The `id` must match your filename (without extension).

## Available Placeholders

Use these placeholders in your HTML template. They will be replaced with user input:

| Placeholder | Description | Example Output |
|-------------|-------------|----------------|
| `{{regNumber}}` | Registration number (with spaces) | `A 0 F 7 9 3 0` |
| `{{barcodeNumber}}` | Auto-generated 10-digit number | `1162603748` |
| `{{fromDate}}` | Start date | `21-03-2026` |
| `{{toDate}}` | End date | `20-03-2027` |
| `{{modelNumber}}` | Vehicle model | `55S400-010C` |
| `{{chassisNumber}}` | Chassis/VIN | `MH355S004DK117181` |
| `{{engineSerial}}` | Engine serial | `55S-118388` |
| `{{engineCapacity}}` | Engine CC | `135.000` |

## Barcode Element

To include a barcode in your template, add an SVG element with the class `barcode`:

```html
<svg class="barcode"></svg>
```

The app will automatically generate and render the barcode into this element.

## Tips

### Naming Convention
- Use lowercase kebab-case for IDs: `my-garage`, `auto-shop-123`
- Use the same ID for HTML filename, CSS filename, and registry entry

### Scoping Styles
Always prefix your CSS rules with your template's class to avoid conflicts:

```css
/* Good - scoped to template */
.sticker-your-garage .sticker-header { ... }

/* Bad - affects all templates */
.sticker-header { ... }
```

### Logo Options

**SVG (inline):**
```html
<svg viewBox="0 0 80 80" class="logo-svg">
    <circle cx="40" cy="40" r="38" fill="none" stroke="#000" stroke-width="2"/>
    <text x="40" y="45" text-anchor="middle" font-size="20">LOGO</text>
</svg>
```

**Image file:**
```html
<img src="templates/logos/your-logo.png" alt="Logo" class="logo-img">
```

**No logo:**
Simply omit the logo section from your HTML.

### Testing

1. Add your template files
2. Update `index.json`
3. Refresh the browser
4. Select your template from the dropdown
5. Fill in test data and verify the preview
6. Generate a PDF to test the output

## Example Templates

Study the existing templates for reference:

- `rs-auto.html` / `rs-auto.css` - Template with logo
- `motca.html` / `motca.css` - Template without logo, different layout

## Troubleshooting

**Template not appearing in dropdown:**
- Check `index.json` syntax (valid JSON)
- Verify the `id` matches your filename

**Styles not loading:**
- Check CSS filename matches the `id`
- Check browser console for 404 errors

**Barcode not showing:**
- Ensure you have `<svg class="barcode"></svg>` in your HTML
- Check browser console for errors

**PDF looks different from preview:**
- Ensure all styles are in the template CSS file
- Avoid using external images that might not load
