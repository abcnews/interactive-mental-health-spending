import React, { useEffect } from "react";
import styles from "./styles.scss";
import * as d3Selection from "d3-selection";

const d3 = { ...d3Selection };

import MultiChart from "../MultiChart";

export default props => {
  useEffect(() => {
    // Override width to account for scroll bar
    const root = d3.select("." + styles.root);
    const scrollyStage = root.select(function() {
      return this.parentNode;
    });
    scrollyStage.style("width", "100%");
  });

  return (
    <div className={styles.root}>
      {props.children}
      {/* <MultiChart /> */}
    </div>
  );
};
