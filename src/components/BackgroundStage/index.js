import React from "react";
import styles from "./styles.scss";

import MultiChart from "../MultiChart";

export default props => {
  return (
    <div className={styles.root}>
      <MultiChart />
    </div>
  );
};
