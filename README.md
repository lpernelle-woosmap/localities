# Woosmap Localities API - Testing & Demo Application

An interactive web application for testing and demonstrating the [Woosmap Localities API](https://developers.woosmap.com/products/localities/). This tool provides a visual interface to explore autocomplete, search, geocoding features with real-time API comparison between development and production environments.

## Features

- **Real-time Autocomplete Search** - Search for addresses, localities, postal codes, and points of interest
- **Location Details** - Retrieve detailed information about selected locations
- **Reverse Geocoding** - Click on the map to get address information from coordinates
- **Multi-Environment Support** - Compare results between development, production, and PR deployments
- **Advanced Filtering** - Filter by country, location type, and geographical bias
- **Interactive Map** - Visual display of locations with markers and viewport overlays

## Quick Start

### Run Locally with npx serve

The easiest way to run this application locally is using `npx serve`:

```bash
# From the project root directory
npx serve
```

Then open your browser to the URL shown (typically `http://localhost:3000` or `http://localhost:5000`).

**Note:** This method serves static files directly without building. Since the app uses ES6 modules, it works in modern browsers without a build step.

### Alternative: Run with Parcel (Development)

If you want to use the development server with hot-reload:

```bash
# Install dependencies
npm install

# Start development server
npm start
```

This will open the application in your browser at `http://localhost:1234`.

### Build for Production

To create a production build:

```bash
# Install dependencies (if not already done)
npm install

# Build the project
npm run build
```

The built files will be in the `dist/` directory.

## Deploy to GitHub Pages

### Option 1: Manual Deployment

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Create a `gh-pages` branch:**
   ```bash
   git checkout --orphan gh-pages
   git reset --hard
   ```

3. **Copy built files to root:**
   ```bash
   cp -r dist/* .
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin gh-pages --force
   ```

4. **Configure GitHub Pages:**
   - Go to your repository on GitHub
   - Navigate to Settings > Pages
   - Select `gh-pages` branch as the source
   - Save and wait for deployment

### Option 2: Using gh-pages Package

1. **Install gh-pages:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add deploy script to package.json:**
   ```json
   "scripts": {
     "deploy": "npm run build && gh-pages -d dist"
   }
   ```

3. **Deploy:**
   ```bash
   npm run deploy
   ```

Your site will be available at: `https://<username>.github.io/<repository-name>/`

## Project Structure

```
localities/
├── index.html              # Main HTML entry point
├── package.json            # Project configuration and dependencies
├── README.md              # This file
├── src/
│   ├── index.js           # Main application entry point (297 lines)
│   │                      # - Initializes the app and coordinates all modules
│   │                      # - Manages application state
│   │                      # - Handles user interactions and events
│   │                      # - Loads Woosmap SDK
│   │
│   ├── api-service.js     # Unified API service (161 lines)
│   │                      # - Handles all Woosmap API calls
│   │                      # - Autocomplete, search, details, and geocoding
│   │                      # - Unified error handling
│   │                      # - Supports both dev and production environments
│   │
│   ├── map-manager.js     # Map and marker management (112 lines)
│   │                      # - Initializes and manages Woosmap map
│   │                      # - Displays markers and viewport overlays
│   │                      # - Handles map interactions
│   │
│   ├── ui-manager.js      # UI rendering (197 lines)
│   │                      # - Renders search results
│   │                      # - Displays location details
│   │                      # - Handles result click interactions
│   │                      # - XSS-safe HTML rendering
│   │
│   ├── utils.js           # Shared utilities (95 lines)
│   │                      # - buildQueryString() - URL parameter encoding
│   │                      # - debounce() - Function debouncing
│   │                      # - escapeHtml() - XSS protection
│   │                      # - boldMatchedSubstring() - Safe text highlighting
│   │
│   ├── config.js          # Configuration constants (46 lines)
│   │                      # - Map settings (zoom levels, colors, icons)
│   │                      # - API configuration
│   │                      # - Woosmap SDK settings
│   │
│   ├── environment_select.js  # Environment management (52 lines)
│   │                          # - Manages dev/prod/PR environments
│   │                          # - Stores API keys
│   │                          # - Handles environment switching
│   │
│   ├── endpoint_select.js     # Endpoint selection (11 lines)
│   │                          # - Gets current selected endpoint
│   │                          # - Supports autocomplete/search/geocode
│   │
│   ├── countries.js       # Country data (22 lines)
│   │                      # - ISO country codes and names
│   │                      # - Used for country filtering
│   │
│   └── styles.css         # Application styles (4504 lines)
│                          # - UI styling and layout
│                          # - Map container styles
│                          # - Result list styling
```

## Usage

### Basic Search

1. Select an environment (Dev/Production/PR)
2. Choose an endpoint (Autocomplete/Search/Geocode)
3. Type an address or location in the search box
4. View results in real-time from both dev and production APIs
5. Click on a result to see detailed information

### Advanced Options

- **Country Restrictions**: Click "Set country restriction" to filter by countries
- **Types**: Select location types (locality, postal code, address, airport, etc.)
- **Fields**: Choose which fields to retrieve in details (geometry only)
- **Extended Postal Codes**: Enable to get extended postal code information
- **Geographical Bias**: Use map center as search bias (10km radius)

### Reverse Geocoding

Click anywhere on the map to perform reverse geocoding and get the address for that location.

## Configuration

### API Keys

API keys are configured in [src/environment_select.js](src/environment_select.js). For production deployments, consider moving these to environment variables.

```javascript
const environments = {
  prod: {
    woosmap_key: "your-production-key",
    url: "https://api.woosmap.com/localities/"
  },
  dev: {
    woosmap_key: "your-dev-key",
    url: "https://develop-api.woosmap.com/localities/"
  }
};
```

### Map Settings

Map configuration can be adjusted in [src/config.js](src/config.js):

```javascript
export const CONFIG = {
  MAP: {
    DEFAULT_CENTER: { lat: 48.8534, lng: 2.3488 }, // Paris
    DEFAULT_ZOOM: 5,
    // ... more settings
  }
};
```

## Technologies

- **Woosmap SDK** - Interactive maps and location services
- **jQuery 3.6.0** - DOM manipulation
- **Selectize.js** - Enhanced select dropdowns
- **Flag Icon CSS** - Country flag icons
- **Parcel** - Module bundler (for development)
- **ES6 Modules** - Modern JavaScript module system

## Browser Support

Modern browsers with ES6 module support:
- Chrome/Edge 61+
- Firefox 60+
- Safari 11+

## Security Notes

- HTML content is properly escaped to prevent XSS attacks
- API keys are currently in client-side code (consider backend proxy for production)
- All user inputs are sanitized before rendering

## Contributing

This is a demo/testing application for the Woosmap Localities API. Feel free to customize it for your needs.

## License

See [LICENSE](LICENSE) file for details.

## Resources

- [Woosmap Localities API Documentation](https://developers.woosmap.com/products/localities/)
- [Woosmap Developer Portal](https://developers.woosmap.com/)
