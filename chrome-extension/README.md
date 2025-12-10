# ProposalForge Chrome Extension

Chrome extension for generating AI-powered proposals directly from job platforms.

## Features

- One-click proposal generation from Upwork, Thumbtack, Fiverr, and Houzz
- Automatic job data extraction
- Opens ProposalForge with pre-filled RFP text

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `chrome-extension` folder
5. The extension icon will appear in your toolbar

## Usage

1. Navigate to a job posting on Upwork, Thumbtack, Fiverr, or Houzz
2. Click the ProposalForge extension icon
3. Click "Generate Proposal"
4. ProposalForge will open with the extracted job data pre-filled

## Development

To modify the extension:

1. Edit files in this directory
2. Go to `chrome://extensions/`
3. Click the refresh icon on the ProposalForge extension
4. Test your changes

## Icons

Place icon files (16x16, 48x48, 128x128 PNG) in the `icons/` directory:
- `icon16.png`
- `icon48.png`
- `icon128.png`

## Notes

- Make sure you're logged into ProposalForge before using the extension
- The extension extracts job data from the page - accuracy depends on platform structure
- Some platforms may require manual copy-paste if extraction fails

