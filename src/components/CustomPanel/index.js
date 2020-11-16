import React, { useState, useEffect, useRef, useContext } from "react";
import JsxParser from "react-jsx-parser/lib/es5/react-jsx-parser.min.js";
// import JsxParser from "react-jsx-parser";
// import JsxParser from "react-jsx-parser/dist/es5/react-jsx-parser.min.js";
import * as d3Format from "d3-format";

const d3 = { ...d3Format };
const commaFormatter = d3.format(",");

// CSS Styles
import styles from "./styles.scss";

import { AppContext } from "../../AppContext";

// To get distressed percentage from quintile
const quintileLookup = { 1: 18.3, 2: 13.7, 3: 12.4, 4: 12.5, 5: 9.0 };
const quintileWording = {
  1: "in the most disadvantaged fifth of suburbs",
  2: "somewhat disadvantaged",
  3: "in the middle of the disadvantage scale",
  4: "less disadvantaged",
  5: "among the least disadvantaged",
};
const spendingLookup = spending => {
  const difference = 22.87 - spending;

  if (Math.abs(difference) < 2) return "around";

  if (difference < -8) return "a much higher spend";
  if (difference > 8) return "a much lower spend";

  if (difference < -2) return "a higher spend";
  if (difference > 2) return "a lower spend";
};

// TODO: maybe remove unnecessary data
const alliedServicesLookup = require("./allied-mental-health.json");
const otherAlliedLookup = require("./other-allied.json");
const clinicalPsychLookup = require("./clinical-psych.json");

import cathy from "./images/cathy.png";
import mike from "./images/mike.png";
import laura from "./images/laura.png";

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

      // Highlight text to match charts
      if (props.config.key === "psychiatrists") {
        const highlighted = node.querySelector("strong");

        if (
          highlighted &&
          highlighted.innerText === "psychiatrists in private practice"
        ) {
          highlighted.style.setProperty("color", "#980400");
        }
      }

      if (props.config.key === "clinicalpsychologists") {
        const highlighted = node.querySelector("strong");

        if (highlighted && highlighted.innerText.includes("clinical")) {
          highlighted.style.setProperty("color", "#db4731");
        }
      }

      if (props.config.key === "gpmentalhealth") {
        const highlighted = node.querySelector("strong");

        if (
          highlighted &&
          highlighted.innerText === "GPs for mental health reasons"
        ) {
          highlighted.style.setProperty("color", "#C54F9A");
        }
      }

      if (props.config.key === "otherallied") {
        const highlighted = node.querySelector("strong");

        if (
          highlighted &&
          highlighted.innerText.includes("allied mental health")
        ) {
          highlighted.style.setProperty("color", "#8569D3");
        }
      }

      if (props.config.key === "gpfocus") {
        const highlighted = node.querySelectorAll("strong");

        if (highlighted) {
          highlighted.forEach(text => {
            text.style.setProperty("color", "#db4731");
          });
        }
      }

      // Finally attach the node to the panel
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
            Your suburb of <strong>{suburb}</strong> is{" "}
            <strong>{quintileWording[userQuintile]}</strong>
            {userQuintile === 1 ? ", where" : " so"}{" "}
            <strong>{distressedPercent} per cent</strong> of people are likely
            to be highly distressed.
          </p>
        ) : (
          <p>
            Your postcode <strong>{postcode}</strong> is{" "}
            <strong>{quintileWording[userQuintile]}</strong>
            {userQuintile === 1 ? ", where" : " so"}{" "}
            <strong>{distressedPercent} per cent</strong> of people are likely
            to be highly distressed.
          </p>
        ))}

      {/* ---------- */}

      {/* Second interactive panel (First dots scrolly stage) */}
      {props.config.swap &&
        props.config.panel === "alliedself" &&
        alliedService.servicesPer100 !== "" && (
          <p>
            In your area of <strong>{alliedService.name}</strong>, taxpayers
            funded <strong>{alliedService.servicesPer100} sessions</strong> of
            care per 100 people in 2017-18, which cost{" "}
            <strong>${commaFormatter(alliedService.dollarsPer100)}</strong>.
            That's{" "}
            <strong>{spendingLookup(alliedService.servicesPer100)}</strong>{" "}
            {spendingLookup(alliedService.servicesPer100) !== "around" &&
              "than "}
            the national average of <strong>22.87</strong> sessions for{" "}
            <strong>$2,375</strong>.
          </p>
        )}

      {/* Second panel fallback text if NP data */}
      {props.config.swap &&
        props.config.panel === "alliedself" &&
        alliedService.servicesPer100 === "" && (
          <p>
            Taxpayers spent the most on people in{" "}
            <strong>Darebin - South</strong> area, spending
            <strong>$4912</strong> for <strong>46.49</strong> sessions of care
            per 100 people. In <strong>Katherine</strong>, we spent{" "}
            <strong>$147</strong> for
            <strong>1.49</strong> sessions.
          </p>
        )}

      {/* Third interactive panel (Subsequent on dots scrolly stage) */}
      {props.config.swap &&
        props.config.panel === "alliedself2" &&
        alliedService.servicesPer100 !== "" && (
          <p>
            This allowed{" "}
            <strong>{alliedService.percentOfPeople} per cent</strong> of people
            in your area to access subsidised mental health care, which is{" "}
            <strong>
              {Math.abs(alliedService.percentOfPeople - 5.06) < 0.3
                ? "around"
                : alliedService.percentOfPeople > 5.06
                ? "more than"
                : "less than"}
            </strong>{" "}
            the national average of <strong>5.06 per cent</strong>.
          </p>
        )}

      {/* This care was used more in the south of WA’s Wheat Belt region than anywhere else, but still, just X% of people received it, compared with X% who saw a clinical psychologist. */}

      {props.config.swap &&
        props.config.panel === "alliedself2" &&
        alliedService.servicesPer100 === "" && (
          <p>
            This allowed <strong>8.94 per cent</strong> of people in{" "}
            <strong>Darebin - South</strong> to access subsidised care, compared
            with <strong>0.45 per cent</strong> in <strong>Katherine</strong>.
          </p>
        )}

      {/* ------------ */}

      {/* Third interactive panel (Subsequent on dots scrolly stage) */}
      {props.config.swap &&
        props.config.panel === "otherallied" &&
        otherAlliedService.percentOfPeople !== "" && (
          <p>
            In your area of <strong>{otherAlliedService.name}</strong>, just{" "}
            <strong>{otherAlliedService.percentOfPeople} per cent</strong> of
            people received this kind of care, compared with{" "}
            <strong>{clinicalService.percentOfPeople} per cent</strong> who saw
            a clinical psychologist.
          </p>
        )}

      {props.config.swap &&
        props.config.panel === "otherallied" &&
        otherAlliedService.percentOfPeople === "" && (
          <p>
            <strong>Limestone</strong> is the place using it the most and yet
            just <strong>1.7 per cent</strong> are getting care.
          </p>
        )}

      {props.config.custom && props.config.panel === "kayeinitial" && (
        <>
          <div className={styles.imageHolder}>
            <img src={cathy} />
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
            <img src={mike} />
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

      {props.config.custom && props.config.panel === "laurainitial" && (
        <>
          <div className={styles.imageHolder}>
            <img src={laura} />
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
