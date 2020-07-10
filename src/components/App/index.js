import React from "react";
import styles from "./styles.scss";
import PostcodeSearch from "../PostcodeSearch";
import { Portal } from "react-portal";
import Scrollyteller from "@abcnews/scrollyteller";

export default props => {
  const onMarker = config => {
    console.log(config);
  };

  return (
    <div className={styles.root}>
      <PostcodeSearch />

      <Portal node={document.querySelector(".scrollystagemount")}>
        <Scrollyteller panels={props.scrollyData.panels} onMarker={onMarker} />
      </Portal>
    </div>
  );
};
