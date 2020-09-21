import React, { useState, useEffect, useLayoutEffect } from "react";
import styles from "./styles.scss";
import { Portal } from "react-portal";
import Scrollyteller from "@abcnews/scrollyteller";

import PostcodeSearch from "../PostcodeSearch";
import BackgroundStage from "../BackgroundStage";
import CustomPanel from "../CustomPanel";
import MultiChart from "../MultiChart";

// Load up our hero URL (or data)
import heroImage from "./hero-top.png";

let storyKeys = require("./story-keys.json");

export default (props) => {
  const [currentKey, setCurrentKey] = useState(storyKeys.one);
  const [userSelection, setUserSelection] = useState(null);

  const onMarker = (config) => {
    // console.log(config);

    if (config.key) {
      // console.log(storyKeys[config.key]);
      setCurrentKey(storyKeys[config.key]);
      // setChartData(dataObject[storyKeys[config.key].dataKey]);
    }
  };

  const handleSelection = (data) => {
    console.log(`App data:`);
    console.log(data);

    setUserSelection(data);
  };

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
      {/* Header image up above the H1 */}
      <Portal node={document.querySelector(".pre-header-hero")}>
        <div>
          <img src={heroImage} />
        </div>
      </Portal>

      <div className={styles.root}>
        <PostcodeSearch handleSelection={handleSelection} />
      </div>

      <Portal node={document.querySelector(".scrollystagemount")}>
        <Scrollyteller
          panels={props.scrollyData1.panels}
          onMarker={onMarker}
          panelComponent={CustomPanel}
        >
          <BackgroundStage>
            <MultiChart
              chartType={currentKey.chartType}
              dataKey={currentKey.dataKey}
              yMax={currentKey.yMax}
              dotColor={currentKey.dotColor}
              xField={currentKey.xField}
              yField={currentKey.yField}
              solidLine={currentKey.solidLine}
              averageLine={currentKey.averageLine}
            />
          </BackgroundStage>
        </Scrollyteller>
      </Portal>

      <Portal node={document.querySelector(".scrollystagemount2")}>
        <Scrollyteller
          panels={props.scrollyData2.panels}
          onMarker={() => {}}
          panelComponent={CustomPanel}
        >
          <BackgroundStage>
            <MultiChart
              chartType={currentKey.chartType}
              dataKey={currentKey.dataKey}
              yMax={currentKey.yMax}
              dotColor={currentKey.dotColor}
              xField={currentKey.xField}
              yField={currentKey.yField}
              solidLine={currentKey.solidLine}
              averageLine={currentKey.averageLine}
            />
          </BackgroundStage>
        </Scrollyteller>
      </Portal>
    </>
  );
};
