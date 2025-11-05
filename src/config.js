// config.js - Application configuration and constants

export const CONFIG = {
  // Map configuration
  MAP: {
    DEFAULT_CENTER: { lat: 48.8534, lng: 2.3488 }, // Paris
    DEFAULT_ZOOM: 5,
    ZOOM_LEVELS: {
      LOCALITY: 8,
      POSTAL_CODE: 6,
      ADDRESS: 16
    },
    GESTURE_HANDLING: "greedy",
    MARKER_ICON: {
      URL: "https://images.woosmap.com/dot-marker.png",
      SCALED_SIZE: { height: 64, width: 46 }
    },
    POLYGON_STYLE: {
      STROKE_COLOR: "#b71c1c",
      STROKE_OPACITY: 0.8,
      STROKE_WEIGHT: 2,
      FILL_COLOR: "#b71c1c",
      FILL_OPACITY: 0.5
    },
    STYLES: [
      {
        featureType: "point_of_interest",
        elementType: "all",
        stylers: [{ visibility: "on" }]
      }
    ]
  },

  // API configuration
  API: {
    DEFAULT_LANGUAGE: "fr",
    DEBOUNCE_DELAY: 300, // milliseconds
    GEOGRAPHICAL_BIAS_RADIUS: 10000 // meters
  },

  // Woosmap SDK
  WOOSMAP: {
    SDK_KEY: "woos-afefb9b4-238c-3c6a-a036-9b630b6ca775",
    SDK_URL: "https://sdk.woosmap.com/map/map.js"
  }
};
