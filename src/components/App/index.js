import React, { useState, useEffect, useLayoutEffect } from "react";
import styles from "./styles.scss";
import { Portal } from "react-portal";
import Scrollyteller from "@abcnews/scrollyteller";
import axios from "axios";

import PostcodeSearch from "../PostcodeSearch";
import BackgroundStage from "../BackgroundStage";
import CustomPanel from "../CustomPanel";
import MultiChart from "../MultiChart";

// Load up our hero URL (or data)
import heroImage from "./hero-top.png";

let storyKeys = require("./story-keys.json");

// Using the React context API for global state
import { AppContext } from "../../AppContext";

export default props => {
  const [lineKey, setLineKey] = useState(storyKeys.lineDefault);
  const [dotKey, setDotKey] = useState(storyKeys.dotDefault);
  const [configKey, setConfigKey] = useState(null);
  const [userSelection, setUserSelection] = useState(null);
  const [postcodeToDecile, setPostcodeToDecile] = useState(null);
  const [postcodeToSa3, setPostcodeToSa3] = useState(null);
  const [userQuintile, setUserQuintile] = useState(null);

  const onMarker = config => {
    console.log("Config:", config);

    if (!config.key) return;
    if (typeof storyKeys[config.key] === "undefined") return;

    if (storyKeys[config.key].chartType === "line")
      setLineKey(storyKeys[config.key]);
    if (storyKeys[config.key].chartType === "dot")
      setDotKey(storyKeys[config.key]);

    setConfigKey(config.key);
  };

  const handleSelection = data => {
    if (!data) return;

    if (!postcodeToDecile) {
      console.error("Data not loaded correctly.");
      return;
    }

    setUserSelection(data);

    // Process when user selects either postcode or suburb
    console.log(`App data:`);
    console.log(data);

    const decile = postcodeToDecile[data.postcode];
    const quintile = Math.ceil(decile / 2);

    console.log("User quintile:", quintile);
    setUserQuintile(quintile);
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

  useEffect(() => {
    // Fetch some data
    axios
      .get(`${__webpack_public_path__}postcode-to-decile.json`)
      .then(result => {
        setPostcodeToDecile(result.data);
      });

    axios
      .get(`${__webpack_public_path__}postcode-to-sa3-lookup.json`)
      .then(result => {
        setPostcodeToSa3(result.data);
      });
  }, []);

  return (
    <AppContext.Provider value={{ userSelection, setUserSelection }}>
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
                chartType={lineKey.chartType}
                dataKey={lineKey.dataKey}
                yMax={lineKey.yMax}
                highlightBars={lineKey.highlightBars}
                highlightOwnBar={lineKey.highlightOwnBar}
                lines={lineKey.lines}
                triggerOnDock={true}
                markKey={configKey}
                userQuintile={userQuintile}
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
                chartType={dotKey.chartType}
                dataKey={dotKey.dataKey}
                yMax={dotKey.yMax}
                highlightBars={dotKey.highlightBars}
                highlightOwnBar={dotKey.highlightOwnBar}
                dots={dotKey.dots}
                averages={dotKey.averages}
                triggerOnDock={true}
                markKey={configKey}
                showLowHighDots={dotKey.showLowHighDots}
                userQuintile={userQuintile}
              />
            </BackgroundStage>
          </Scrollyteller>
        </Portal>
      </>
    </AppContext.Provider>
  );
};
