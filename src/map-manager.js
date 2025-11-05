// map-manager.js - Map and marker management

import { CONFIG } from "./config.js";

let mapInstance = null;
let detailsMarker = null;
let viewportPolygon = null;

/**
 * Initializes the Woosmap map
 * @param {HTMLElement} container - Map container element
 * @returns {Object} Map instance
 */
export function initializeMap(container) {
  mapInstance = new woosmap.map.Map(container, {
    center: CONFIG.MAP.DEFAULT_CENTER,
    zoom: CONFIG.MAP.DEFAULT_ZOOM,
    gestureHandling: CONFIG.MAP.GESTURE_HANDLING,
    disableDefaultUI: true,
    styles: CONFIG.MAP.STYLES
  });

  return mapInstance;
}

/**
 * Gets the current map instance
 * @returns {Object} Map instance
 */
export function getMap() {
  return mapInstance;
}

/**
 * Displays a location on the map with marker and optional viewport
 * @param {Object} result - Location result with geometry
 */
export function displayLocationOnMap(result) {
  if (!mapInstance || !result.geometry) return;

  const { lat, lng } = result.geometry.location;
  const markerPosition = { lat, lng };

  // Clear previous polygon
  if (viewportPolygon) {
    viewportPolygon.setMap(null);
    viewportPolygon = null;
  }

  // Display viewport if available
  if (result.geometry.viewport) {
    const { northeast, southwest } = result.geometry.viewport;
    const shape = [
      { lat: northeast.lat, lng: northeast.lng },
      { lat: southwest.lat, lng: northeast.lng },
      { lat: southwest.lat, lng: southwest.lng },
      { lat: northeast.lat, lng: southwest.lng },
      { lat: northeast.lat, lng: northeast.lng }
    ];

    viewportPolygon = new woosmap.map.Polygon({
      paths: [shape],
      strokeColor: CONFIG.MAP.POLYGON_STYLE.STROKE_COLOR,
      strokeOpacity: CONFIG.MAP.POLYGON_STYLE.STROKE_OPACITY,
      strokeWeight: CONFIG.MAP.POLYGON_STYLE.STROKE_WEIGHT,
      fillColor: CONFIG.MAP.POLYGON_STYLE.FILL_COLOR,
      fillOpacity: CONFIG.MAP.POLYGON_STYLE.FILL_OPACITY
    });
    viewportPolygon.setMap(mapInstance);
  } else {
    // Set zoom based on type
    const type = result.types?.[0];
    let zoom = CONFIG.MAP.ZOOM_LEVELS.ADDRESS;

    if (type === "locality") {
      zoom = CONFIG.MAP.ZOOM_LEVELS.LOCALITY;
    } else if (type === "postal_code") {
      zoom = CONFIG.MAP.ZOOM_LEVELS.POSTAL_CODE;
    }

    mapInstance.setZoom(zoom);
  }

  // Pan to location
  mapInstance.panTo(markerPosition);

  // Clear previous marker
  if (detailsMarker) {
    detailsMarker.setMap(null);
    detailsMarker = null;
  }

  // Create new marker
  detailsMarker = new woosmap.map.Marker({
    position: markerPosition,
    icon: {
      url: CONFIG.MAP.MARKER_ICON.URL,
      scaledSize: CONFIG.MAP.MARKER_ICON.SCALED_SIZE
    }
  });
  detailsMarker.setMap(mapInstance);
}

/**
 * Adds click listener to map
 * @param {Function} callback - Click handler
 */
export function addMapClickListener(callback) {
  if (mapInstance) {
    mapInstance.addListener("click", callback);
  }
}
