# Roadworthiness Sticker Generator

A web-based tool for generating vehicle roadworthiness stickers. Built with vanilla HTML, CSS, and JavaScript - no backend required. Perfect for hosting on GitHub Pages.

## Features

- Material Design UI with dark/light theme (follows system preference)
- Mobile and desktop responsive
- Multiple garage/template support
- Live sticker preview
- PDF export
- Auto-generated barcodes
- Easy template system (HTML + CSS per template)

## Quick Start

1. Clone the repository
2. Serve the files with any static server:
   ```bash
   # Python
   python -m http.server 8080

   # Node.js
   npx serve
   ```
3. Open `http://localhost:8080` in your browser

## Deployment

### GitHub Pages

1. Push to your GitHub repository
2. Go to **Settings** > **Pages**
3. Select your branch (e.g., `main`) and click **Save**
4. Access at `https://<username>.github.io/<repo-name>/`

### Other Static Hosts

Works with any static hosting: Netlify, Vercel, Cloudflare Pages, etc. Just upload the files.

## Project Structure

```
├── index.html          # Main application
├── styles.css          # App styles (Material Design)
├── app.js              # Application logic
├── templates/          # Sticker templates
│   ├── index.json      # Template registry
│   ├── rs-auto.html    # RS AUTO template
│   ├── rs-auto.css     # RS AUTO styles
│   ├── motca.html      # Ministry template
│   └── motca.css       # Ministry styles
└── docs/               # Documentation
    └── adding-templates.md
```

## Adding New Templates

See [docs/adding-templates.md](docs/adding-templates.md) for detailed instructions.

**Quick version:**

1. Create `templates/your-template.html` with placeholders like `{{regNumber}}`
2. Create `templates/your-template.css` with styles
3. Add entry to `templates/index.json`

## Available Placeholders

| Placeholder | Description |
|-------------|-------------|
| `{{regNumber}}` | Vehicle registration (formatted with spaces) |
| `{{barcodeNumber}}` | Generated barcode number |
| `{{fromDate}}` | Start date (DD-MM-YYYY) |
| `{{toDate}}` | End date (DD-MM-YYYY) |
| `{{modelNumber}}` | Vehicle model number |
| `{{chassisNumber}}` | Chassis/VIN number |
| `{{engineSerial}}` | Engine serial number |
| `{{engineCapacity}}` | Engine capacity (CC) |

## Browser Support

Modern browsers with ES6+ support:
- Chrome/Edge 80+
- Firefox 75+
- Safari 13+

## Dependencies

All loaded via CDN (no npm required):
- [JsBarcode](https://github.com/lindell/JsBarcode) - Barcode generation
- [jsPDF](https://github.com/parallax/jsPDF) - PDF creation
- [html2canvas](https://html2canvas.hertzen.com/) - HTML to image conversion
- [Google Fonts](https://fonts.google.com/) - Roboto font & Material Icons

## License

MIT
