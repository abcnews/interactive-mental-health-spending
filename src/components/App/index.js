import React, { useState, useEffect } from "react";
import styles from "./styles.scss";
import { Portal } from "react-portal";
import Scrollyteller from "@abcnews/scrollyteller";

import PostcodeSearch from "../PostcodeSearch";
import MultiChart from "../MultiChart";
import BackgroundStage from "../BackgroundStage";
import CustomPanel from "../CustomPanel";

// let lookupData;

export default props => {
  // const [userPostcode, setUserPostcode] = useState();
  const [userSa3, setUserSa3] = useState();

  // const loadLookupData = async () => {
  //   const response = await fetch(
  //     `${__webpack_public_path__}postcode-to-sa3-lookup.json`
  //   );
  //   lookupData = await response.json();
  // };

  const onMarker = config => {
    console.log(config);
  };

  useEffect(() => {
    // Load initial data
    // loadLookupData();
  }, []);

  // useEffect(() => {
  //   if (!userPostcode) return;
  //   if (typeof lookupData === "undefined") {
  //     console.error("There was a problem loading lookup data...");
  //     return;
  //   }

  //   const filteredLookup = lookupData.filter(entry => {
  //     if (entry.postcode.toString() === userPostcode) {
  //       return true;
  //     } else return false;
  //   });

  //   // Get the single largest ratio area
  //   const largestRatio = filteredLookup.reduce((prev, current) =>
  //     prev.ratio > current.ratio ? prev : current
  //   );

  //   console.log(filteredLookup);
  //   console.log(largestRatio);

  //   setUserSa3(largestRatio.sa3);
  // }, [userPostcode]);

  return (
    <div className={styles.root}>
      <PostcodeSearch />

      <br></br>
      <br></br>

      <MultiChart />

      <Portal node={document.querySelector(".scrollystagemount")}>
        <Scrollyteller panels={props.scrollyData.panels} onMarker={onMarker} panelComponent={CustomPanel}>
          <BackgroundStage />
        </Scrollyteller>
      </Portal>
    </div>
  );
};
