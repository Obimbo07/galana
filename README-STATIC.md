# Galana static site (`galana_group_index.html`)

Open this site with a **local HTTP server** so the browser can `fetch('data/data.json')` (opening the HTML file directly as `file://` often blocks fetch).

Example from the project root:

```bash
python3 -m http.server 8080
```

Then visit `http://127.0.0.1:8080/galana_group_index.html`.

Files:

- **Canonical page:** `galana_group_index.html` (repo root)
- **Data:** `data/data.json` (calculator defaults, products, FAQ, `contact.quoteEmail`, WhatsApp digits)
- **Widget styles:** `galana-widgets.css`

Quotes use **`mailto:`** to the address in `contact.quoteEmail` (no SMTP credentials in the browser). Optionally set **`QUOTE_API_URL`** in the script block of the HTML to POST JSON to your own backend.
