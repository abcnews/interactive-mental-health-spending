import "./polyfills";
import { selectMounts } from "@abcnews/mount-utils";
import { loadScrollyteller } from "@abcnews/scrollyteller";
import * as d3Selection from "d3-selection";
import jankdefer from "jankdefer";
import React from "react";
import { render } from "react-dom";
import App from "./components/App";
import { addClass } from "./lib/classHelpers";

const d3 = { ...d3Selection };

const MOUNT_IDS = [
  "postcodesearch",
  "scrollytellerNAMEone",
  "scrollytellerNAMEtwo",
  "scrollytellerNAMEthree",
  "accessingcaregraphic",
  "timegraphic",
  "distancegraphic",
  "averagechartmount",
  "postcodetext",
  "itsavedmegraphic",
  "affordablecaregraphic",
  "whatsgoingongraphic",
  "taxdollarsgraphic",
];

let root; // Will be [id="postcodesearch"] (all others are <Portal/>s inside <App/>)
let scrollyData1;
let scrollyData2;
let scrollyData3;

const init = () => {
  MOUNT_IDS.forEach(id => {
    const [mountEl] = selectMounts(id, { markAsUsed: false });

    switch (id) {
      case "scrollytellerNAMEone":
      case "scrollytellerNAMEtwo":
      case "scrollytellerNAMEthree":
        addClass(mountEl, "no-margin-collapse");
        break;
      case "accessingcaregraphic":
      case "timegraphic":
        addClass(mountEl, "no-margin-bottom");
        break;
      case "postcodetext":
        // Some text in the article only for interactives
        const parentEl = mountEl.parentNode;
        const headingEl = document.createElement("h2");
        const paragraphEl = document.createElement("p");
        headingEl.textContent = "Is your area getting care?";
        paragraphEl.textContent = `We're about to show you some fancy charts, but to make them more relevant for you we'll need your postcode, or a postcode you're curious about. Don't worry, we're not storing or re-using this information.`;
        parentEl.insertBefore(headingEl, mountEl);
        parentEl.insertBefore(paragraphEl, mountEl);
        parentEl.removeChild(mountEl);
        break;
      default:
        break;
    }
  });

  const heroEl = d3.select(".Header").insert("div", ":first-child");
  heroEl.attr("id", "pre-header-hero");

  // Remove spaces from the gallery count
  const galleryIndex = document.querySelectorAll(".Gallery-index");

  setTimeout(() => {
    galleryIndex.forEach(el => {
      el.innerHTML = el.innerHTML.replace(/\s/g, "");
    });
  }, 100);

  const mutationObserver = new MutationObserver(removeSpacesInCount);

  for (const el of galleryIndex) {
    mutationObserver.observe(el, {
      characterData: true,
      attributes: false,
      childList: false,
      subtree: true,
    });
  }

  function removeSpacesInCount(mutations) {
    mutations.forEach(function (mutation) {
      mutation.target.parentElement.innerHTML = mutation.target.parentElement.innerHTML.replace(
        /\s/g,
        ""
      );
    });
  }

  root = document.getElementById("postcodesearch");
  scrollyData1 = loadScrollyteller("one", "u-full");
  scrollyData2 = loadScrollyteller("two", "u-full");
  scrollyData3 = loadScrollyteller("three", "u-full");

  renderApp();
};

const renderApp = () => {
  render(
    <App
      scrollyData1={scrollyData1}
      scrollyData2={scrollyData2}
      scrollyData3={scrollyData3}
    />,
    root
  );
};

if (window.__ODYSSEY__) {
  jankdefer(init);
} else {
  window.addEventListener("odyssey:api", init);
}

if (module.hot) {
  module.hot.accept("./components/App", async () => {
    try {
      renderApp();
    } catch (err) {
      const imported = await import("./components/ErrorBox");
      const ErrorBox = imported.default;
      render(<ErrorBox error={err} />, root);
    }
  });
}

if (process.env.NODE_ENV === "development") {
  console.debug(
    `[MENTAL HEALTH INTERACTIVE] public path: ${__webpack_public_path__}`
  );
}
