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
import heroImage from "./images/hero-top.png";
import pregnantLady from "./images/pregnant-lady.png";

let storyKeys = require("./story-keys.json");

// Using the React context API for global state
import { AppContext } from "../../AppContext";

const WAYPOINT = 90;

export default props => {
  const [lineKey, setLineKey] = useState(storyKeys.lineDefault);
  const [dotKey, setDotKey] = useState(storyKeys.dotDefault);
  const [dot2Key, setDot2Key] = useState(storyKeys.dotDefault);
  const [configKey, setConfigKey] = useState(null);
  const [userSelection, setUserSelection] = useState(null);
  const [postcodeToDecile, setPostcodeToDecile] = useState(null);
  const [postcodeToSa3, setPostcodeToSa3] = useState(null);
  const [sa3s, setSa3s] = useState(null);
  const [sa3ToRegionLookup, setSa3ToRegionLookup] = useState(null);
  const [userQuintile, setUserQuintile] = useState(null);
  const [userSa3, setUserSa3] = useState(null);
  const [userRegion, setUserRegion] = useState(null);

  const onMarker = config => {
    console.log("Config:", config);

    if (!config.key) return;
    if (typeof storyKeys[config.key] === "undefined") return;

    if (storyKeys[config.key].chartType === "line")
      setLineKey(storyKeys[config.key]);
    if (storyKeys[config.key].chartType === "dot")
      setDotKey(storyKeys[config.key]);
    if (storyKeys[config.key].chartType === "dot2")
      setDot2Key(storyKeys[config.key]);

    setConfigKey(config.key);
  };

  const handleSelection = data => {
    // Process when user selects either postcode or suburb
    if (!data) return;

    if (!postcodeToDecile || !postcodeToSa3) {
      console.error("Data not loaded correctly.");
      return;
    }

    setUserSelection(data);

    // Calculate quintile
    const decile = postcodeToDecile[data.postcode];
    const quintile = Math.ceil(decile / 2);

    console.log("User quintile:", quintile);
    setUserQuintile(quintile);

    // Calculate user SA3

    // Filter matches
    const filteredPostcodes = postcodeToSa3.filter(entry => {
      return +entry.postcode === +data.postcode;
    });

    // Array of only sa3s for difference comparison
    const matchingSa3s = filteredPostcodes.map(postcode => postcode.sa3);

    // Filter our select box final options
    const filteredSa3s = sa3s.filter(sa3 => {
      return matchingSa3s.includes(sa3.SA3_CODE);
    });

    // Add postcode ratio to the options object
    const sa3sWithRatio = filteredSa3s.map(sa3 => {
      const ratio = filteredPostcodes.find(entry => entry.sa3 === sa3.SA3_CODE)
        .ratio;

      return {
        code: sa3.SA3_CODE,
        name: sa3.SA3_NAME,
        state: sa3.STATE_NAME,
        ratio: ratio,
      };
    });

    // Sort by ratio
    const sorted = sa3sWithRatio.sort((a, b) => b.ratio - a.ratio);

    // Choose one for the user
    // TODO: Maybe find a way to let the user select
    const topSa3 = sorted[0];
    setUserSa3(topSa3);

    setUserRegion(sa3ToRegionLookup[topSa3.code]);
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

  // INIT EFFECT!!!!!
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

    axios
      .get(`${__webpack_public_path__}sa3-codes-and-names-and-states.json`)
      .then(result => {
        setSa3s(result.data);
      });

    axios.get(`${__webpack_public_path__}sa3-to-region.json`).then(result => {
      setSa3ToRegionLookup(result.data);
    });
  }, []);

  return (
    <AppContext.Provider value={{ userSelection, userQuintile, userSa3 }}>
      <>
        {/* Header image up above the H1 */}
        <Portal node={document.querySelector(".pre-header-hero")}>
          <div>
            <img src={heroImage} />
          </div>
        </Portal>

        <Portal node={document.querySelector(".accessingcaregraphic")}>
          <div className={styles.illustrationContainer}>
            <img className={styles.illustration} src={pregnantLady} />
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
            config={{ waypoint: WAYPOINT }}
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
                userSa3={userSa3}
                userRegion={userRegion}
              />
            </BackgroundStage>
          </Scrollyteller>
        </Portal>

        <Portal node={document.querySelector(".scrollystagemount2")}>
          <Scrollyteller
            panels={props.scrollyData2.panels}
            onMarker={() => {}}
            panelComponent={CustomPanel}
            config={{ waypoint: WAYPOINT }}
          >
            <BackgroundStage>
              <MultiChart
                chartType={dotKey.chartType}
                dataKey={dotKey.dataKey}
                yMax={dotKey.yMax}
                highlightBars={dotKey.highlightBars}
                highlightOwnBar={dotKey.highlightOwnBar}
                labelOwnDot={dotKey.labelOwnDot}
                dots={dotKey.dots}
                averages={dotKey.averages}
                triggerOnDock={true}
                markKey={configKey}
                showLowHighDots={dotKey.showLowHighDots}
                userQuintile={userQuintile}
                userSa3={userSa3}
                userRegion={userRegion}
              />
            </BackgroundStage>
          </Scrollyteller>
        </Portal>

        <Portal node={document.querySelector(".scrollystagemount3")}>
          <Scrollyteller
            panels={props.scrollyData3.panels}
            onMarker={() => {}}
            panelComponent={CustomPanel}
            config={{ waypoint: WAYPOINT }}
          >
            <BackgroundStage>
              <MultiChart
                chartType={"dot"}
                dataKey={dot2Key.dataKey}
                yMax={dot2Key.yMax}
                highlightBars={dot2Key.highlightBars}
                highlightOwnBar={dot2Key.highlightOwnBar}
                labelOwnDot={dot2Key.labelOwnDot}
                dots={dot2Key.dots}
                averages={dot2Key.averages}
                triggerOnDock={true}
                markKey={configKey}
                showLowHighDots={dot2Key.showLowHighDots}
                userQuintile={userQuintile}
                userSa3={userSa3}
                userRegion={userRegion}
              />
            </BackgroundStage>
          </Scrollyteller>
        </Portal>
      </>
    </AppContext.Provider>
  );
};
