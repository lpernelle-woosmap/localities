// environment_select.js - Environment and API key management

const environments = {
  prod: {
    woosmap_key: "woos-afefb9b4-238c-3c6a-a036-9b630b6ca775",
    url: "https://api.woosmap.com/localities/"
  },
  dev: {
    woosmap_key: "woos-f3399eaa-1f01-33cd-a0db-ce1e23b7320d",
    url: "https://develop-api.woosmap.com/localities/"
  },
  pr: {
    woosmap_key: "woos-f3399eaa-1f01-33cd-a0db-ce1e23b7320d",
    url: ""
  }
};

/**
 * Gets the currently selected environment configuration
 * @returns {Object} Environment configuration with woosmap_key and url
 */
export function getTargetEnvironment() {
  const selectedEnvironment = document.getElementById("env-select").value;
  console.log(
    `** ${selectedEnvironment.toUpperCase()} ** ${environments[selectedEnvironment].url}`
  );
  return environments[selectedEnvironment];
}

/**
 * Gets the production environment configuration
 * @returns {Object} Production environment configuration
 */
export function getProdEnvironment() {
  return environments.prod;
}

// Handle PR environment selection
document.getElementById("env-select").addEventListener("change", () => {
  if (document.getElementById("env-select").value === "pr") {
    const targetPR = prompt("Which PR should we target today?");

    if (targetPR) {
      const prNumber = /\d+/.exec(targetPR);
      environments.pr.url = `https://develop-api.woosmap.com/${targetPR}/localities/`;
      const prDeployEl = document.getElementById("pr-deploy");
      if (prDeployEl) {
        prDeployEl.innerText = `PR ${prNumber}`;
      }
    }
  }
});
