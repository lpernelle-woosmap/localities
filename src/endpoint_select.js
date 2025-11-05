// endpoint_select.js

/**
 * Gets the currently selected endpoint
 * @returns {string} Selected endpoint value
 */
export function getTargetEnpoint() {
  const selectedEndpoint = document.getElementById("endpoint-select").value;
  console.log(`**endpoint: ${selectedEndpoint.toUpperCase()} **`);
  return selectedEndpoint;
}
