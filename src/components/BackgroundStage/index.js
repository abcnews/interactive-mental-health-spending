import React, { useEffect, useRef } from "react";
import styles from "./styles.scss";
import * as d3Selection from "d3-selection";

const d3 = { ...d3Selection };

const BackgroundStage = (props) => {
  const stageRef = useRef();

  useEffect(() => {
    // Override width to account for scroll bar
    const root = d3.select(stageRef.current);
    const scrollyStage = root.select(function () {
      return this.parentNode;
    });

    scrollyStage.style("width", "100%");
  });

  return (
    <div className={styles.root} ref={stageRef}>
      {props.children}
      {/* <MultiChart /> */}
    </div>
  );
};

export default BackgroundStage;
