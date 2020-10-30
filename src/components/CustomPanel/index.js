import React, { useState, useEffect, useRef, useContext } from "react";
import JsxParser from "react-jsx-parser/lib/es5/react-jsx-parser.min.js";
import * as d3Format from "d3-format";

const d3 = { ...d3Format };
const commaFormatter = d3.format(",");

// CSS Styles
import styles from "./styles.scss";

import { AppContext } from "../../AppContext";

// To get distressed percentage from quintile
const quintileLookup = { 1: 18.3, 2: 13.7, 3: 12.4, 4: 12.5, 5: 9.0 };

// TODO: maybe remove unnecessary data
const alliedServicesLookup = require("./allied-mental-health.json");
const otherAlliedLookup = require("./other-allied.json");
const clinicalPsychLookup = require("./clinical-psych.json");

import kayeGraphic from "./images/kaye-graphic.png";
import mikeGraphic from "./images/mike-graphic.png";

export default props => {
  const base = useRef();
  const [hidePanel, setHidePanel] = useState(false);
  const [suburb, setSuburb] = useState(null);
  const [postcode, setPostcode] = useState(null);
  const [distressedPercent, setDistressedPercent] = useState(null);
  const [alliedService, setAlliedService] = useState({});
  const [otherAlliedService, setOtherAlliedService] = useState({});
  const [clinicalService, setClinicalService] = useState({});

  // Global context
  const { userSelection, userQuintile, userSa3 } = useContext(AppContext);

  // Once on mount we append Core text to the panels/pars
  useEffect(() => {
    if (!base.current) return;
    if (!props.nodes) return;

    // Tell scrollyteller that this is a panel
    props.reference(base.current);

    if (props.config.swap) return;
    if (props.config.custom) return;

    const isMobile = window.innerWidth < 440;

    // Append CoreMedia nodes
    props.nodes.forEach(node => {
      // Make sure images fit inside the panels
      if (node.className.indexOf("ImageEmbed") > -1 || node.tagName === "IMG") {
        node.style.setProperty("display", "block");
        node.style.setProperty("margin", "auto");
        node.style.setProperty("width", isMobile ? "83.333333%" : "66.66667%");
        node.style.setProperty("padding-left", "0.875rem");
        node.style.setProperty("padding-right", "0.875rem");
        if (node.hasAttribute("height")) {
          node.removeAttribute("height");
        }
      } else if (node.querySelector("img")) {
        node.style.setProperty("margin", "auto");
        node.style.setProperty("width", isMobile ? "83.333333%" : "66.66667%");
        node.style.setProperty("padding-left", "0.875rem");
        node.style.setProperty("padding-right", "0.875rem");
        [].slice.call(node.querySelectorAll("img")).forEach(img => {
          img.removeAttribute("height");
        });
      }

      base.current.appendChild(node);
    });

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
    setOtherAlliedService(otherAlliedLookup[userSa3.code]);
    setClinicalService(clinicalPsychLookup[userSa3.code]);
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
        props.config.panel === "yourquintile" &&
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

      {/* ---------- */}

      {/* Second interactive panel (First dots scrolly stage) */}
      {props.config.swap && props.config.panel === "alliedself" && (
        <p>
          In your area of <strong>{alliedService.name}</strong>, taxpayers
          funded <strong>{alliedService.servicesPer100} sessions</strong> of
          care per 100 people, which cost{" "}
          <strong>${commaFormatter(alliedService.dollarsPer100)}</strong>.
          That's{" "}
          <strong>
            {alliedService.servicesPer100 === 22.87
              ? "the same as"
              : alliedService.servicesPer100 > 22.87
              ? "more than"
              : "less than"}
          </strong>{" "}
          the national average of <strong>22.87</strong> sessions for{" "}
          <strong>$2,375</strong>.
        </p>
      )}

      {/* Third interactive panel (Subsequent on dots scrolly stage) */}
      {props.config.swap && props.config.panel === "alliedself2" && (
        <p>
          This allowed <strong>{alliedService.percentOfPeople} per cent</strong>{" "}
          of people in your area to access subsidised mental health care, which
          is{" "}
          <strong>
            {alliedService.percentOfPeople === 5.06
              ? "the same as"
              : alliedService.percentOfPeople > 5.06
              ? "more than"
              : "less than"}
          </strong>{" "}
          the national average of <strong>5.06 per cent</strong>.
        </p>
      )}

      {/* ------------ */}

      {/* Third interactive panel (Subsequent on dots scrolly stage) */}
      {props.config.swap && props.config.panel === "otherallied" && (
        <p>
          In your area of <strong>{otherAlliedService.name}</strong>, just{" "}
          <strong>{otherAlliedService.percentOfPeople} per cent</strong> of
          people received this kind of care, compared with{" "}
          <strong>{clinicalService.percentOfPeople} per cent</strong> who saw a
          clinical psychologist.
        </p>
      )}

      {props.config.custom && props.config.panel === "kayeinitial" && (
        <>
          <div className={styles.imageHolder}>
            <div className={styles.label}>
              <span>Kaye, South Coast (NSW)</span>
            </div>
            <img src={kayeGraphic} />
          </div>
          {props.nodes.map((node, index) => (
            <JsxParser
              key={index}
              renderInWrapper={false}
              bindings={{}}
              jsx={node.outerHTML}
            />
          ))}
        </>
      )}

      {props.config.custom && props.config.panel === "mikeinitial" && (
        <>
          <div className={styles.imageHolder}>
          <div className={styles.label}>
              <span>Mike, Wollongong</span>
            </div>
            <img src={mikeGraphic} />
          </div>
          {props.nodes.map((node, index) => (
            <JsxParser
              key={index}
              renderInWrapper={false}
              bindings={{}}
              jsx={node.outerHTML}
            />
          ))}
        </>
      )}
    </div>
  );
};

// TODO: handle NP not published data
