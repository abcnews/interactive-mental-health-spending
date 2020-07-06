import React from "react";
import { render } from "react-dom";
import App from "./components/App";

import buildMountPoints from "./lib/buildMountPoints"

function init() {
  console.log(":)");
  buildMountPoints(["postcodesearch"])
  render(<App projectName={"Mental Health"} />, document.querySelector(".postcodesearch"));
}

init();

if (module.hot) {
  module.hot.accept("./components/App", () => {
    try {
      init();
    } catch (err) {
      import("./components/ErrorBox").then(exports => {
        const ErrorBox = exports.default;
        render(<ErrorBox error={err} />, root);
      });
    }
  });
}

if (process.env.NODE_ENV === "development") {
  console.debug(`[MENTAL HEALTH INTERACTIVE] public path: ${__webpack_public_path__}`);
}

