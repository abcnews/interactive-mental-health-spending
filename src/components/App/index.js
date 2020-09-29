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

export default props => {
  const [lineKey, setLineKey] = useState(storyKeys.lineDefault);
  const [dotKey, setDotKey] = useState(storyKeys.dotDefault);
  const [configKey, setConfigKey] = useState(null)
  const [userSelection, setUserSelection] = useState(null);

  const onMarker = config => {
    console.log("Config:", config);

    if (!config.key) return;
    if (typeof storyKeys[config.key] === "undefined") return;

    if (storyKeys[config.key].chartType === "line") setLineKey(storyKeys[config.key]);
    if (storyKeys[config.key].chartType === "dot") setDotKey(storyKeys[config.key]);

    setConfigKey(config.key)
  };

  const handleSelection = data => {
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
          panelComponent={CustomPanel}>
          <BackgroundStage>
            <MultiChart
              chartType={lineKey.chartType}
              dataKey={lineKey.dataKey}
              yMax={lineKey.yMax}
              highlightBars={lineKey.highlightBars}
              highlightOwnBar={lineKey.highlightOwnBar}
              lines={lineKey.lines}
              triggerOnDock={true}
              markKey={configKey}
            />
          </BackgroundStage>
        </Scrollyteller>
      </Portal>

      <Portal node={document.querySelector(".scrollystagemount2")}>
        <Scrollyteller
          panels={props.scrollyData2.panels}
          onMarker={() => {}}
          panelComponent={CustomPanel}>
          <BackgroundStage>
            <MultiChart
              chartType={"dot"}
              dataKey={dotKey.dataKey}
              yMax={dotKey.yMax}
              highlightBars={dotKey.highlightBars}
              highlightOwnBar={dotKey.highlightOwnBar}
              dots={dotKey.dots}
              triggerOnDock={true}
              markKey={configKey}
              showLowHighDots={dotKey.showLowHighDots}
            />
          </BackgroundStage>
        </Scrollyteller>
      </Portal>
    </>
  );
};
