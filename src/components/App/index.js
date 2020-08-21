import React, { useState, useEffect, useLayoutEffect } from "react";
import styles from "./styles.scss";
import { Portal } from "react-portal";
import Scrollyteller from "@abcnews/scrollyteller";


import PostcodeSearch from "../PostcodeSearch";
import BackgroundStage from "../BackgroundStage";
import CustomPanel from "../CustomPanel";
import MultiChart from "../MultiChart";

// Load up our hero URL (or data)
import heroImage from "./hero-top.png"

let storyKeys = require("./story-keys.json");

const dataObject = {
  data1: require("./data/allied-data.json"),
  // data1: require("./data/distressed-data.json"),
  data2: require("./data/gp-focus.json")
};

export default props => {
  const [userSa3, setUserSa3] = useState(null);
  const [chartData, setChartData] = useState(storyKeys.one.dataKey);
  const [currentKey, setCurrentKey] = useState(storyKeys.one);

  const onMarker = config => {
    console.log(config);

    if (config.key) {
      console.log(storyKeys[config.key]);
      setCurrentKey(storyKeys[config.key]);
      setChartData(dataObject[storyKeys[config.key].dataKey]);
    }
  };

  useLayoutEffect(() => {}, []); // Init effect

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
    <>
      <div className={styles.root}>
        <PostcodeSearch />
      </div>

      <Portal node={document.querySelector(".scrollystagemount")}>
        <Scrollyteller
          panels={props.scrollyData.panels}
          onMarker={onMarker}
          panelComponent={CustomPanel}
        >
          <BackgroundStage>
            <MultiChart
              data={chartData}
              yMax={currentKey.yMax}
              xNumberOfTicks={currentKey.xNumberOfTicks}
              style={"line"}
            />
          </BackgroundStage>
        </Scrollyteller>
      </Portal>

      <Portal node={document.querySelector(".pre-header-hero")}>
        <div><img src={heroImage} /></div>
      </Portal>
    </>
  );
};
