# StreetPassRSS

A web extension that automatically discovers and records RSS feeds from visited pages, with options to manage and export your feed list.

## Features
- Detects RSS/Atom feeds on any visited page
- Records and manages discovered feeds
- Extension settings page
- Build and release automation for Firefox

## Prerequisites
- Node.js & npm

## Build & Release

1. Install dependencies (first time only):
   ```
   npm install
   ```
2. Build and package for Firefox:
   ```
   npm run build:firefox
   npm run package:firefox
   # Find .xpi in releases/
   ```

## Clean build artifacts
   ```
   npm run clean
   ```

## License
MIT
