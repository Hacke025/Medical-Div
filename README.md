# Careway — Accessible Healthcare Navigator

Careway is an early-stage accessibility and healthcare-navigation prototype. Its goal is to make healthcare websites and administrative information easier to navigate, read, and understand.

## Current prototype

- Responsive healthcare-navigation landing page.
- Accessibility settings for text size, color themes, a dyslexia-friendly system font, increased spacing, and reduced motion.
- Preferences saved in the current browser using local storage.
- Browser text-to-speech for reading the main page and supported document text.
- Task-oriented healthcare guide, glossary, and plain-language form navigator.
- Reading Companion for organizing pasted non-sensitive text, plus a local text/Markdown document reader with text-to-speech and detail spotting.
- Appointment question builder, preparation checklist, Access Passport, and printable appointment pack.
- English/Spanish sample phrases and Spanish/English printable appointment pack. Personal notes are not automatically translated.
- GitHub Actions workflow for automatic GitHub Pages deployment.

## Important boundaries

This is a demonstration, not a medical service or a real patient portal.

- Do not enter real medical information or identifying patient details.
- The sample preparation form does not submit data to a server.
- Language support is limited to reviewed English and Spanish phrases and a bilingual appointment-pack template; it is not live translation or interpretation.
- The document reader currently accepts .txt and .md files only (up to 1 MB). It does not read PDFs, scanned images, or handwriting.
- The Reading Companion and Document Reader organize text and identify possible patterns; they do not interpret or validate healthcare instructions.
- No medical advice, diagnosis, or treatment recommendations are provided.
- Accessibility settings are a prototype and do not guarantee WCAG conformance.
- The current app is a standalone demo. It does not modify other healthcare websites.
- Browser speech features depend on browser and device support.

## Technology

- React
- TypeScript
- Vite
- Lucide icons
- GitHub Actions and GitHub Pages

## Run locally (optional)

This project is designed to be maintained through GitHub. If you later want to run it on your own computer, install Node.js and run:

```bash
npm install
npm run dev
```

## Deployment

The workflow in `.github/workflows/deploy.yml` builds the app whenever code is pushed to `main`.

In the repository's GitHub settings, open **Pages** and set the build and deployment source to **GitHub Actions**. Once the workflow completes, the site will be available at:

https://hacke025.github.io/Medical-Div/

## Roadmap

1. Improve the accessibility settings and keyboard experience.
2. Add a user-controlled accessibility and communication-preferences profile using fictional demo data.
3. Build healthcare navigation tools and plain-language explainers.
4. Explore optional AI assistance with clear consent and privacy boundaries.
5. Test with accessibility tools and people with varied access needs.

## Contributing

Keep changes focused, explain accessibility trade-offs, and never add real patient information, credentials, API keys, or private records to this repository.
