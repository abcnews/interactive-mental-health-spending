// Polyfills
import "core-js/features/symbol";
import "regenerator-runtime/runtime.js";
import "intersection-observer";

// Imports
import React from "react";
import { render } from "react-dom";
import App from "./components/App";
import { loadScrollyteller } from "@abcnews/scrollyteller";
import jankdefer from "jankdefer"

import * as d3Selection from "d3-selection";
const d3 = { ...d3Selection };

import buildMountPoints from "./lib/buildMountPoints";
import { addClass } from "./lib/classHelpers";

buildMountPoints(["postcodesearch", "scrollystagemount", "scrollystagemount2"]);

// Make stage full width
const stage = document.querySelector(".scrollystagemount");
addClass(stage, "u-full");
addClass(stage, "no-margin-collapse");

const stage2 = document.querySelector(".scrollystagemount2");
addClass(stage2, "u-full");
addClass(stage2, "no-margin-collapse");

const preInit = () => {
  // Handle stuff that we don't want to hot reload
  // (but do want to wait for Odyssey)
  const heroEl = d3.select(".Header").insert("div", ":first-child");
  heroEl.classed("pre-header-hero", true);
};

const init = async () => {
  // Let's mount our scrollytellers
  const scrollyData1 = loadScrollyteller(
    "one", // If set to eg. "one" use #scrollytellerNAMEone in CoreMedia
    "u-full", // Class to apply to mount point u-full makes it full width in Odyssey
    "mark" // Name of marker in CoreMedia eg. for "point" use #point default: #mark
  );

  const scrollyData2 = loadScrollyteller(
    "two", // If set to eg. "one" use #scrollytellerNAMEone in CoreMedia
    "u-full", // Class to apply to mount point u-full makes it full width in Odyssey
    "mark" // Name of marker in CoreMedia eg. for "point" use #point default: #mark
  );

  render(
    <App
      projectName={"Mental Health"}
      scrollyData1={scrollyData1}
      scrollyData2={scrollyData2}
    />,
    document.querySelector(".postcodesearch")
  );
};

if (window.__ODYSSEY__) {
  jankdefer(preInit);
  init();
} else {
  window.addEventListener("odyssey:api", preInit);
  window.addEventListener("odyssey:api", init);
}

if (module.hot) {
  module.hot.accept("./components/App", async () => {
    try {
      init();
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
