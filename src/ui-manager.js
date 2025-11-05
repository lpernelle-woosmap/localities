// ui-manager.js - UI rendering and interaction management

import { escapeHtml, boldMatchedSubstring } from "./utils.js";
import { getTargetEnpoint } from "./endpoint_select.js";

/**
 * Renders search results in the UI
 * @param {Object} response - API response
 * @param {boolean} isProduction - Whether this is production results
 * @param {Function} onResultClick - Callback when result is clicked
 */
export function renderSearchResults(response, isProduction, onResultClick) {
  const resultsId = isProduction ? "autocomplete-results-compare" : "autocomplete-results";
  const results = document.getElementById(resultsId);

  if (!results) return;

  const endpoint = getTargetEnpoint();
  results.innerHTML = "";
  results.style.display = "none";
  results.parentElement.style.display = "none";

  const items = endpoint === "search" || endpoint === "geocode"
    ? response.results
    : response.localities;

  if (!items || items.length === 0) return;

  const html = items.map(item => createResultItem(item, endpoint, isProduction)).join("");

  results.innerHTML = html;
  results.style.display = "block";
  results.parentElement.style.display = "flex";

  // Add click listeners (only for non-production results)
  if (!isProduction) {
    attachResultClickListeners(results, onResultClick);
  }
}

/**
 * Creates HTML for a single result item
 * @param {Object} item - Result item
 * @param {string} endpoint - Current endpoint
 * @param {boolean} isProduction - Whether this is production result
 * @returns {string} HTML string
 */
function createResultItem(item, endpoint, isProduction) {
  const predictionId = escapeHtml(item.public_id);
  const predictionTypes = item.types.join(" | ");

  let formattedName = "";
  let formattedDescription = "";

  if (endpoint === "search") {
    formattedName = escapeHtml(item.title || "");
    formattedDescription = escapeHtml(item.description || "");
  } else if (endpoint === "geocode") {
    formattedName = escapeHtml(item.formatted_address || "");
  } else if (item.matched_substrings?.description) {
    formattedName = boldMatchedSubstring(item.description, item.matched_substrings.description);
  } else {
    formattedName = escapeHtml(item.description || "");
  }

  // Add postal codes if available
  if (item.postal_codes && item.postal_codes.length > 0) {
    const postalCodes = item.postal_codes.map(escapeHtml).join(", ");
    formattedName += ` (${postalCodes})`;
  }

  const typeClass = item.categories ? "category" : "type";
  const typeValue = item.categories
    ? escapeHtml(item.categories[0])
    : escapeHtml(predictionTypes);

  return `
    <li prediction-id="${predictionId}" class="prediction ${isProduction ? "disabled" : ""}">
      <div class="localities-result-title">
        <span class="localities-result-name">${formattedName}</span>
        <span class="localities-result-description">${formattedDescription}</span>
        <span class="localities-result-${typeClass}">${typeValue}</span>
      </div>
    </li>`;
}

/**
 * Attaches click listeners to result items
 * @param {HTMLElement} resultsContainer - Results container
 * @param {Function} onResultClick - Click callback
 */
function attachResultClickListeners(resultsContainer, onResultClick) {
  const predictions = resultsContainer.querySelectorAll(".prediction:not(.disabled)");

  predictions.forEach(result => {
    const titleElement = result.querySelector('.localities-result-title');
    if (!titleElement) return;

    const nameElement = titleElement.querySelector('.localities-result-name');
    const descriptionElement = titleElement.querySelector('.localities-result-description');

    let name = nameElement?.textContent || "";
    if (descriptionElement && descriptionElement.textContent) {
      name += `, ${descriptionElement.textContent}`;
    }

    result.addEventListener("click", () => {
      const predictionId = result.getAttribute("prediction-id");
      onResultClick(predictionId, name, resultsContainer);
    });
  });
}

/**
 * Displays location details in the details panel
 * @param {Object} result - Location result
 */
export function displayLocationDetails(result) {
  const detailsHTML = document.querySelector(".addressDetails");
  if (!detailsHTML) return;

  const parts = [];

  if (result.public_id) {
    parts.push(`<p>Public id: <br /><span class='bold'>${escapeHtml(result.public_id)}</span></p>`);
  }

  if (result.formatted_address) {
    parts.push(`<p>Formatted Address: <span class='bold'>${escapeHtml(result.formatted_address)}</span></p>`);
  }

  if (result.title) {
    parts.push(`<p>Title: <span class='bold'>${escapeHtml(result.title)}</span></p>`);
  }

  if (result.name) {
    parts.push(`<p>Name: <span class='bold'>${escapeHtml(result.name)}</span></p>`);
  }

  if (result.description) {
    parts.push(`<p>Description: <span class='bold'>${escapeHtml(result.description)}</span></p>`);
  }

  if (result.types && result.types.length > 0) {
    const typeText = escapeHtml(result.types[0].replace("_", " "));
    parts.push(`<p>Types: <span class='bold'>${typeText}</span></p>`);
  }

  if (result.categories && result.categories.length > 0) {
    const categoryText = escapeHtml(result.categories[0].replace("_", " "));
    parts.push(`<p>Categories: <span class='bold'>${categoryText}</span></p>`);
  }

  if (result.geometry) {
    if (result.geometry.accuracy) {
      const accuracyText = escapeHtml(result.geometry.accuracy.replace("_", " ").toLowerCase());
      parts.push(`<p>Location type: <span class='bold'>${accuracyText}</span></p>`);
    }

    const lat = result.geometry.location.lat.toString();
    const lng = result.geometry.location.lng.toString();
    parts.push(`<p>Latitude: <span class='bold'>${escapeHtml(lat)}</span> <br>Longitude: <span class='bold'>${escapeHtml(lng)}</span></p>`);

    if (result.address_components && result.address_components.length > 0) {
      const componentsHtml = result.address_components.map(compo => {
        const type = escapeHtml(compo.types[0]);
        const name = escapeHtml(compo.long_name);
        return `${type}: <span class='bold'>${name}</span>`;
      }).join("<br>");
      parts.push(`<b>Address components:</b><p>${componentsHtml}</p>`);
    }
  }

  detailsHTML.innerHTML = parts.join("");
  detailsHTML.style.display = "block";
}

/**
 * Hides search results
 */
export function hideSearchResults() {
  const results = document.getElementById("autocomplete-results");
  if (results) {
    results.style.display = "none";
    results.parentElement.style.display = "none";
  }
}

/**
 * Clears search results
 */
export function clearSearchResults() {
  const results = document.getElementById("autocomplete-results");
  if (results) {
    results.innerHTML = "";
  }
}
