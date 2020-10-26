import React, { useState, useEffect, useRef, useContext } from "react";
// import JsxParser from "react-jsx-parser/lib/es5/react-jsx-parser.min.js";

// CSS Styles
import styles from "./styles.scss";

import { AppContext } from "../../AppContext";

// To get distressed percentage from quintile
const quintileLookup = { 1: 18.3, 2: 13.7, 3: 12.4, 4: 12.5, 5: 9.0 };
const alliedServicesLookup = require("./allied-mental-health.json");

export default props => {
  const base = useRef();
  const [hidePanel, setHidePanel] = useState(false);
  const [suburb, setSuburb] = useState(null);
  const [postcode, setPostcode] = useState(null);
  const [distressedPercent, setDistressedPercent] = useState(null);
  const [alliedService, setAlliedService] = useState({});

  // Global context
  const { userSelection, userQuintile, userSa3 } = useContext(AppContext);

  // Once on mount we append Core text to the panels/pars
  useEffect(() => {
    if (!base.current) return;
    if (!props.nodes) return;

    // Tell scrollyteller that this is a panel
    props.reference(base.current);

    if (!props.config.swap) {
      const isMobile = window.innerWidth < 440;

      // Append CoreMedia nodes
      props.nodes.forEach(node => {
        // Make sure images fit inside the panels
        if (
          node.className.indexOf("ImageEmbed") > -1 ||
          node.tagName === "IMG"
        ) {
          node.style.setProperty("display", "block");
          node.style.setProperty("margin", "auto");
          node.style.setProperty(
            "width",
            isMobile ? "83.333333%" : "66.66667%"
          );
          node.style.setProperty("padding-left", "0.875rem");
          node.style.setProperty("padding-right", "0.875rem");
          if (node.hasAttribute("height")) {
            node.removeAttribute("height");
          }
        } else if (node.querySelector("img")) {
          node.style.setProperty("margin", "auto");
          node.style.setProperty(
            "width",
            isMobile ? "83.333333%" : "66.66667%"
          );
          node.style.setProperty("padding-left", "0.875rem");
          node.style.setProperty("padding-right", "0.875rem");
          [].slice.call(node.querySelectorAll("img")).forEach(img => {
            img.removeAttribute("height");
          });
        }

        base.current.appendChild(node);
      });
    }

    // On unmount
    return () => {
      if (!base.current) return;
      if (!props.nodes) return;

      props.nodes.forEach(node => {
        if (base.current.contains(node)) {
          base.current.removeChild(node);
        }
      });
    };
  }, []);

  // Handle a change in the user selection
  useEffect(() => {
    if (!props.config.swap) return;

    if (!userSelection) {
      setHidePanel(true);
      return;
    }

    setHidePanel(false);
    setPostcode(userSelection.postcode);

    // Set suburb if suburb selected
    if (userSelection.type === "suburb") {
      setSuburb(userSelection.value);
    } else {
      setSuburb(null);
    }

    // Calculate distressed percent of user quintile
    setDistressedPercent(quintileLookup[userQuintile]);

    setAlliedService(alliedServicesLookup[userSa3.code]);
    console.log(alliedServicesLookup[userSa3.code]);
  }, [userSelection, userQuintile, userSa3]);

  return (
    <div
      className={`${styles.base} ${styles.light} ${styles.right} ${
        hidePanel ? styles.hidden : ""
      }`}
      ref={base}
    >
      {/* First interactive panel */}
      {props.config.swap &&
        props.config.key === "yourquintile" &&
        (suburb ? (
          <p>
            Your suburb of <strong>{suburb}</strong> is in quintile{" "}
            <strong>{userQuintile}</strong> with{" "}
            <strong>{distressedPercent} per cent</strong> of people experiencing
            a high level of distress.
          </p>
        ) : (
          <p>
            Your postcode <strong>{postcode}</strong> is in quintile{" "}
            <strong>{userQuintile}</strong> with{" "}
            <strong>{distressedPercent} per cent</strong> of people experiencing
            a high level of distress.{" "}
            {/* {alliedService.percentOfPeople} <-- move to next panel */}
          </p>
        ))}
    </div>
  );
};
