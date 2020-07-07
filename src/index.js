import "regenerator-runtime/runtime.js";
import React from "react";
import { render } from "react-dom";
import App from "./components/App";

import buildMountPoints from "./lib/buildMountPoints";

import("./module").then(test => {
  test.default();
});

buildMountPoints(["postcodesearch"]);

async function init() {
  console.log(":)");
  render(
    <App projectName={"Mental Health"} />,
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
