// Polyfills
import "regenerator-runtime/runtime.js";
import 'whatwg-fetch'

// Imports
import React from "react";
import { render } from "react-dom";
import App from "./components/App";
import { loadScrollyteller } from "@abcnews/scrollyteller";

import buildMountPoints from "./lib/buildMountPoints";
import { addClass } from "./lib/classHelpers";

buildMountPoints(["postcodesearch", "scrollystagemount"]);

// Make stage full width
const stage = document.querySelector(".scrollystagemount");
addClass(stage, "u-full")

async function init() {
  const scrollyData = loadScrollyteller(
    "", // If set to eg. "one" use #scrollytellerNAMEone in CoreMedia
    "u-full", // Class to apply to mount point u-full makes it full width in Odyssey
    "mark" // Name of marker in CoreMedia eg. for "point" use #point default: #mark
  );

  render(
    <App projectName={"Mental Health"} scrollyData={scrollyData} />,
    document.querySelector(".postcodesearch")
  );
}

init();

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
