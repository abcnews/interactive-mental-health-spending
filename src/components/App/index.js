import React, { useState, useEffect } from "react";
import styles from "./styles.scss";
import PostcodeSearch from "../PostcodeSearch";
import { Portal } from "react-portal";
import Scrollyteller from "@abcnews/scrollyteller";

let lookupData;

export default props => {
  const [userPostcode, setUserPostcode] = useState();

  const loadLookupData = async () => {
    const response = await fetch(
      `${__webpack_public_path__}postcode-to-sa3-lookup.json`
    );
    lookupData = await response.json();
  };

  const onMarker = config => {
    console.log(config);
  };

  useEffect(() => {
    // Load initial data
    loadLookupData();
  }, []);

  useEffect(() => {
    if (!userPostcode) return;
    if (typeof lookupData === "undefined") {
      console.error("There was a problem loading lookup data...")
      return;
    }

    const filteredLookup = lookupData.filter(entry => {
      if (entry.postcode.toString() === userPostcode) {
        return true;
      } else return false;
      
    });

    console.log(filteredLookup);

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
