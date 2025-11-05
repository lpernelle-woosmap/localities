// index.js - Main application entry point

import { isoCountries } from "./countries.js";
import { debounce } from "./utils.js";
import { autocompleteSearch, getDetails, reverseGeocode } from "./api-service.js";
import { initializeMap, getMap, displayLocationOnMap, addMapClickListener } from "./map-manager.js";
import { renderSearchResults, displayLocationDetails, hideSearchResults, clearSearchResults } from "./ui-manager.js";
import { CONFIG } from "./config.js";

// Application state
let componentsRestriction = [];
let extended = false;
let biasEnabled = false;

/**
 * Requests and displays details for a location
 * @param {string} publicId - Public ID of the location
 */
async function requestDetails(publicId) {
  const fields = [...document.querySelectorAll('input[name="fields"]:checked')]
    .map(e => e.value)
    .join("|");

  try {
    const response = await getDetails(publicId, fields, false);
    if (response?.result) {
      displayLocationDetails(response.result);
      displayLocationOnMap(response.result);
    }
  } catch (error) {
    console.error("Error fetching details:", error);
  }
}

/**
 * Performs search and displays results from both dev and prod
 */
async function performSearch() {
  const input = document.getElementById("input");
  if (!input) return;

  const value = input.value.trim();
  if (!value) {
    clearSearchResults();
    return;
  }

  const typesSelect = document.getElementById("types-select");
  const components = componentsRestriction
    .map(({ id }) => `country:${id}`)
    .join("|");
  const types = Array.from(typesSelect.selectedOptions)
    .map(o => o.value)
    .join("|");

  const map = getMap();
  const searchParams = {
    input: value,
    components,
    types,
    extended,
    location: biasEnabled && map ? map.getCenter() : null,
    radius: biasEnabled ? CONFIG.API.GEOGRAPHICAL_BIAS_RADIUS : null
  };

  // Perform both dev and prod searches in parallel
  try {
    const [devResponse, prodResponse] = await Promise.all([
      autocompleteSearch(searchParams, false),
      autocompleteSearch(searchParams, true)
    ]);

    renderSearchResults(devResponse, false, handleResultClick);
    renderSearchResults(prodResponse, true, handleResultClick);
  } catch (error) {
    console.error("Error performing search:", error);
  }
}

/**
 * Handles click on a search result
 * @param {string} predictionId - ID of the clicked prediction
 * @param {string} name - Display name of the prediction
 */
function handleResultClick(predictionId, name) {
  hideSearchResults();
  const input = document.getElementById("input");
  if (input) {
    input.value = name;
  }
  requestDetails(predictionId);
}

/**
 * Handles reverse geocoding from map click
 * @param {Object} event - Map click event
 */
async function handleMapClick(event) {
  const typesSelect = document.getElementById("types-select");
  const components = componentsRestriction
    .map(({ id }) => `country:${id}`)
    .join("|");
  const types = Array.from(typesSelect.selectedOptions)
    .map(o => o.value)
    .join("|");

  try {
    const response = await reverseGeocode(event.latlng, components, types);
    if (response?.results?.[0]) {
      console.log("Reverse geocode result:", response.results[0].formatted_address);
      displayLocationDetails(response.results[0]);
    }
  } catch (error) {
    console.error("Error during reverse geocoding:", error);
  }
}

/**
 * Toggles country selection
 * @param {HTMLElement} countryElement - Country element
 */
function toggleCountry(countryElement) {
  countryElement.classList.toggle("active");
  componentsRestriction = [];

  document.querySelectorAll(".country.active").forEach(({ dataset }) => {
    componentsRestriction.push({
      id: dataset.countrycode,
      text: dataset.countrytext
    });
  });

  const activeCountryList = componentsRestriction.map(
    ({ id, text }) =>
      `<div class="country"><span class="flag-icon flag-icon-${id.toLowerCase()}"></span><span class="flag-text">${text}</span></div>`
  );

  const activeRestrictionsEl = document.querySelector("#active-restrictions");
  if (activeRestrictionsEl) {
    activeRestrictionsEl.innerHTML = activeCountryList.length > 0
      ? activeCountryList.join("")
      : "No active restrictions...";
  }
}

/**
 * Initializes UI components and event listeners
 */
function initUI() {
  const multiSelect = document.querySelector(".multiselect");
  const countries = document.getElementById("countries");
  const overlayCb = document.getElementById("bgOverlay");
  const input = document.querySelector(".autocomplete-input > input");
  const extendedCheckbox = document.getElementById("extended-checkbox");
  const biasCheckbox = document.getElementById("bias-checkbox");
  const typesSelect = document.getElementById("types-select");

  // Initialize selectize for types
  if (typesSelect) {
    $(typesSelect).selectize({
      create: true,
      maxItems: null,
      plugins: ["remove_button"],
      sortField: {
        field: "text",
        direction: "asc"
      },
      dropdownParent: "body"
    });
  }

  let componentExpanded = false;

  // Input search listener with debounce
  if (input) {
    input.addEventListener(
      "input",
      debounce(() => {
        performSearch();
      }, CONFIG.API.DEBOUNCE_DELAY)
    );
  }

  // Country selection dropdown
  const showCountriesList = () => {
    if (countries) countries.style.display = "flex";
    if (overlayCb) overlayCb.style.display = "block";
    componentExpanded = true;
  };

  const hideCountriesList = () => {
    if (countries) countries.style.display = "none";
    if (overlayCb) overlayCb.style.display = "none";
    componentExpanded = false;
  };

  if (multiSelect) {
    multiSelect.addEventListener(
      "click",
      (e) => {
        if (!componentExpanded) {
          showCountriesList();
        } else {
          hideCountriesList();
        }
        e.stopPropagation();
      },
      true
    );
  }

  // Bias checkbox
  if (biasCheckbox) {
    biasCheckbox.addEventListener("change", () => {
      biasEnabled = biasCheckbox.checked;
      performSearch();
    });
  }

  // Extended checkbox
  if (extendedCheckbox) {
    extendedCheckbox.addEventListener("change", () => {
      extended = extendedCheckbox.checked;
      performSearch();
    });
  }

  // Overlay click
  if (overlayCb) {
    overlayCb.addEventListener("click", () => {
      if (componentExpanded) {
        hideCountriesList();
        performSearch();
      }
    });
  }

  // Populate countries list
  if (countries) {
    const countryList = isoCountries.map(
      ({ id, text }) =>
        `<div class="country" data-countrycode="${id}" data-countrytext="${text}">
          <span class="flag-icon flag-icon-${id.toLowerCase()}"></span>
          <span class="flag-text">${text}</span>
          <div class='active-icon-wrapper'></div>
        </div>`
    );

    countries.innerHTML = countryList.join("") + "<button id='btnRestrict'>Apply restrictions</button>";

    const btnRestrict = document.querySelector("#btnRestrict");
    if (btnRestrict) {
      btnRestrict.addEventListener("click", () => {
        hideCountriesList();
        performSearch();
      });
    }

    document.querySelectorAll(".country").forEach(country => {
      country.addEventListener("click", () => toggleCountry(country));
    });
  }

  // Error modal close button
  const closeErrorModal = document.getElementById("close-error-modal");
  if (closeErrorModal) {
    closeErrorModal.addEventListener("click", () => {
      const errorModal = document.getElementById("error-modal");
      if (errorModal) {
        errorModal.classList.add("hidden");
      }
    });
  }
}

/**
 * Initializes the Woosmap map
 */
window.initMap = function () {
  const mapContainer = document.getElementById("map");
  if (!mapContainer) {
    console.error("Map container not found");
    return;
  }

  initializeMap(mapContainer);
  addMapClickListener(handleMapClick);
};

// Load Woosmap SDK
const script = document.createElement("script");
script.src = `${CONFIG.WOOSMAP.SDK_URL}?key=${CONFIG.WOOSMAP.SDK_KEY}&callback=initMap`;
script.defer = true;
document.head.appendChild(script);

// Initialize UI when ready
initUI();
