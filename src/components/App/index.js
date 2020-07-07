import React from "react";
import styles from "./styles.scss";
import PostcodeSearch from "../PostcodeSearch";

export default props => {
  return (
    <div className={styles.root}>
      
      <PostcodeSearch />
    </div>
  );
};
