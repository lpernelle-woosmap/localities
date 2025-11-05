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
  const headerId = isProduction ? "prod-header" : "dev-header";
  const results = document.getElementById(resultsId);
  const header = document.getElementById(headerId);
  const wrapper = document.getElementById("results-wrapper");

  if (!results) return;

  const endpoint = getTargetEnpoint();
  results.innerHTML = "";

  const items = endpoint === "search" || endpoint === "geocode"
    ? response.results
    : response.localities;

  if (!items || items.length === 0) {
    if (header) header.classList.add("hidden");
    // Check if both lists are empty to hide wrapper
    checkAndHideWrapper();
    return;
  }

  const html = items.map(item => createResultItem(item, endpoint, isProduction)).join("");

  results.innerHTML = html;
  if (header) header.classList.remove("hidden");
  if (wrapper) wrapper.classList.remove("hidden");

  // Add click listeners (only for non-production results)
  if (!isProduction) {
    attachResultClickListeners(results, onResultClick);
  }
}

/**
 * Checks if both result lists are empty and hides wrapper if so
 */
function checkAndHideWrapper() {
  const devResults = document.getElementById("autocomplete-results");
  const prodResults = document.getElementById("autocomplete-results-compare");
  const wrapper = document.getElementById("results-wrapper");

  if (!devResults || !prodResults || !wrapper) return;

  const devEmpty = !devResults.innerHTML.trim();
  const prodEmpty = !prodResults.innerHTML.trim();

  if (devEmpty && prodEmpty) {
    wrapper.classList.add("hidden");
  }
}

/**
 * Creates HTML for a single result item with Tailwind classes
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
    formattedName += ` <span class="text-blue-600 font-medium">(${postalCodes})</span>`;
  }

  const typeClass = item.categories ? "category" : "type";
  const typeValue = item.categories
    ? escapeHtml(item.categories[0])
    : escapeHtml(predictionTypes);

  const cursorClass = isProduction ? "" : "cursor-pointer hover:bg-blue-50";
  const opacityClass = isProduction ? "opacity-60" : "";

  return `
    <li
      prediction-id="${predictionId}"
      class="prediction px-3 py-2 border-b border-gray-200 last:border-b-0 ${cursorClass} ${opacityClass} ${isProduction ? "disabled" : ""} transition-colors"
    >
      <div class="localities-result-title">
        <div class="localities-result-name text-sm text-gray-900 mb-0.5">${formattedName}</div>
        ${formattedDescription ? `<div class="localities-result-description text-xs text-gray-600 mb-0.5">${formattedDescription}</div>` : ''}
        <div class="localities-result-${typeClass} text-xs text-gray-500">${typeValue}</div>
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
      onResultClick(predictionId, name);
    });
  });
}

/**
 * Displays location details in the details panel with Tailwind styling
 * @param {Object} result - Location result
 */
export function displayLocationDetails(result) {
  const detailsHTML = document.querySelector(".addressDetails");
  const placeholder = document.querySelector(".addressDetails-placeholder");

  if (!detailsHTML) return;

  const parts = [];

  if (result.public_id) {
    parts.push(`
      <div class="bg-gray-50 p-3 rounded-lg border border-gray-200">
        <div class="text-xs text-gray-500 font-medium uppercase mb-1">Public ID</div>
        <div class="text-sm text-gray-900 font-mono break-all">${escapeHtml(result.public_id)}</div>
      </div>
    `);
  }

  if (result.formatted_address) {
    parts.push(`
      <div class="bg-blue-50 p-3 rounded-lg border border-blue-200">
        <div class="text-xs text-blue-700 font-medium uppercase mb-1">Formatted Address</div>
        <div class="text-sm text-gray-900">${escapeHtml(result.formatted_address)}</div>
      </div>
    `);
  }

  if (result.title) {
    parts.push(`
      <div>
        <div class="text-xs text-gray-500 font-medium uppercase mb-1">Title</div>
        <div class="text-sm text-gray-900">${escapeHtml(result.title)}</div>
      </div>
    `);
  }

  if (result.name) {
    parts.push(`
      <div>
        <div class="text-xs text-gray-500 font-medium uppercase mb-1">Name</div>
        <div class="text-sm text-gray-900">${escapeHtml(result.name)}</div>
      </div>
    `);
  }

  if (result.description) {
    parts.push(`
      <div>
        <div class="text-xs text-gray-500 font-medium uppercase mb-1">Description</div>
        <div class="text-sm text-gray-900">${escapeHtml(result.description)}</div>
      </div>
    `);
  }

  if (result.types && result.types.length > 0) {
    const typeText = escapeHtml(result.types[0].replace("_", " "));
    parts.push(`
      <div>
        <div class="text-xs text-gray-500 font-medium uppercase mb-1">Type</div>
        <div class="text-sm text-gray-900 bg-green-100 text-green-800 inline-block px-2 py-1 rounded">${typeText}</div>
      </div>
    `);
  }

  if (result.categories && result.categories.length > 0) {
    const categoryText = escapeHtml(result.categories[0].replace("_", " "));
    parts.push(`
      <div>
        <div class="text-xs text-gray-500 font-medium uppercase mb-1">Category</div>
        <div class="text-sm text-gray-900 bg-purple-100 text-purple-800 inline-block px-2 py-1 rounded">${categoryText}</div>
      </div>
    `);
  }

  if (result.geometry) {
    if (result.geometry.accuracy) {
      const accuracyText = escapeHtml(result.geometry.accuracy.replace("_", " ").toLowerCase());
      parts.push(`
        <div>
          <div class="text-xs text-gray-500 font-medium uppercase mb-1">Location Type</div>
          <div class="text-sm text-gray-900">${accuracyText}</div>
        </div>
      `);
    }

    const lat = result.geometry.location.lat.toString();
    const lng = result.geometry.location.lng.toString();
    parts.push(`
      <div class="bg-gray-50 p-3 rounded-lg border border-gray-200">
        <div class="text-xs text-gray-500 font-medium uppercase mb-2">Coordinates</div>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div>
            <div class="text-xs text-gray-500">Latitude</div>
            <div class="font-mono text-gray-900">${escapeHtml(lat)}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Longitude</div>
            <div class="font-mono text-gray-900">${escapeHtml(lng)}</div>
          </div>
        </div>
      </div>
    `);

    if (result.address_components && result.address_components.length > 0) {
      const componentsHtml = result.address_components.map(compo => {
        const type = escapeHtml(compo.types[0]);
        const name = escapeHtml(compo.long_name);
        return `
          <div class="flex justify-between py-1 border-b border-gray-100 last:border-b-0">
            <span class="text-xs text-gray-500">${type}</span>
            <span class="text-xs text-gray-900 font-medium">${name}</span>
          </div>
        `;
      }).join("");

      parts.push(`
        <div class="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <div class="text-xs text-gray-700 font-medium uppercase mb-2">Address Components</div>
          <div>${componentsHtml}</div>
        </div>
      `);
    }
  }

  detailsHTML.innerHTML = parts.join("");
  detailsHTML.classList.remove("hidden");

  if (placeholder) {
    placeholder.classList.add("hidden");
  }
}

/**
 * Hides search results
 */
export function hideSearchResults() {
  const wrapper = document.getElementById("results-wrapper");
  const devHeader = document.getElementById("dev-header");
  const prodHeader = document.getElementById("prod-header");

  if (wrapper) {
    wrapper.classList.add("hidden");
  }

  if (devHeader) {
    devHeader.classList.add("hidden");
  }

  if (prodHeader) {
    prodHeader.classList.add("hidden");
  }
}

/**
 * Clears search results
 */
export function clearSearchResults() {
  const results = document.getElementById("autocomplete-results");
  const resultsCompare = document.getElementById("autocomplete-results-compare");
  const wrapper = document.getElementById("results-wrapper");
  const devHeader = document.getElementById("dev-header");
  const prodHeader = document.getElementById("prod-header");

  if (results) {
    results.innerHTML = "";
  }

  if (resultsCompare) {
    resultsCompare.innerHTML = "";
  }

  if (wrapper) {
    wrapper.classList.add("hidden");
  }

  if (devHeader) {
    devHeader.classList.add("hidden");
  }

  if (prodHeader) {
    prodHeader.classList.add("hidden");
  }
}
