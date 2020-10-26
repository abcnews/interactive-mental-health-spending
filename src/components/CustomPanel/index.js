import React, { useState, useEffect, useRef, useContext } from "react";
import JsxParser from "react-jsx-parser/lib/es5/react-jsx-parser.min.js";

// CSS Styles
import styles from "./styles.scss";

import { AppContext } from "../../AppContext";

export default props => {
  const base = useRef();
  const [hidePanel, setHidePanel] = useState(false);

  // Global context
  const { userSelection, setUserSelection } = useContext(AppContext);

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
    console.log(userSelection)
    if (props.config.swap && !userSelection) {
      setHidePanel(true);
    } else {
      setHidePanel(false);
    }
  }, [userSelection]);

  return (
    <div
      className={`${styles.base} ${styles.light} ${styles.right} ${
        hidePanel ? styles.hidden : ""
      }`}
      ref={base}
    >
      {/* {props.config.swap &&
        props.nodes.map((node, index) => {
          return (
            <JsxParser
              key={index}
              renderInWrapper={false}
              bindings={{
                testValue: userSelection && userSelection.label,
                yourQuintile:
                  "This is your quintile NOTE FROM JOSH: CHANGE THIS TO CALCULATED VALUES IF USER SELECTS AN AREA.",
              }}
              jsx={node.outerHTML}
            />
          );
        })} */}

      {props.config.swap && true /*props.config.key === "yourquintile"*/ && (
        <p>Custom text!!!</p>
      )}
    </div>
  );
};
