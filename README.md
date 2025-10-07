# YTMovies

A YouTube clone with a dark theme and responsive design. This project uses the YouTube Data API v3 to fetch and display videos.

## Features

- Responsive design that works on both desktop and mobile devices
- Dark theme interface
- YouTube video integration
- Sidebar with quick links
- Support links (Buy Me A Coffee and Example.com)
- Search functionality
- Video cards with thumbnails, view counts, and timestamps

## Setup

1. Replace `YOUR_YOUTUBE_API_KEY` in `script.js` with your actual YouTube Data API key
2. Add your logo image as `logo.png`
3. Add support link images:
   - `coffee.png` for Buy Me A Coffee
   - `example.png` for Example.com website

## Required API Key

To use this application, you need to:
1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the YouTube Data API v3
4. Create credentials (API key)
5. Replace the placeholder in script.js with your API key

## Usage

Simply open `index.html` in a web browser to start using the application. The site will load trending videos by default.

## Responsive Design

The site is fully responsive and will adapt to:
- Desktop screens (> 900px)
- Tablet screens (600px - 900px)
- Mobile screens (< 600px)

## Support Links

The sidebar includes two external links:
1. Buy Me A Coffee - Opens in a new tab
2. Example.com - Opens in a new tab
