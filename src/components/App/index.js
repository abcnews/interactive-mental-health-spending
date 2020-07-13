import React, { useState, useEffect } from "react";
import styles from "./styles.scss";
import PostcodeSearch from "../PostcodeSearch";
import { Portal } from "react-portal";
import Scrollyteller from "@abcnews/scrollyteller";

export default props => {
  const [userPostcode, setUserPostcode] = useState();

  const onMarker = config => {
    console.log(config);
  };

  useEffect(() => {
    if (!userPostcode) return;
    
    console.log(userPostcode);
  }, [userPostcode]);

  return (
    <div className={styles.root}>
      <PostcodeSearch setUserPostcode={setUserPostcode} />

      <Portal node={document.querySelector(".scrollystagemount")}>
        <Scrollyteller panels={props.scrollyData.panels} onMarker={onMarker} />
      </Portal>
    </div>
  );
};
