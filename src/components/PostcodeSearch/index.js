import React, { useEffect, useState, useRef } from "react";
import styles from "./styles.scss";
import AsyncSelect from "react-select/async";
import axios from "axios";
import Fuse from "fuse.js";
import debounce from "debounce-promise";

// Import images
import mapPin from "./nav-icon-white.png";

const MIN_INPUT_LENGTH = 3;
const BOUNCE_TIMEOUT = 250;

// Start of React component
export default props => {
  // Use Refs as component vars
  const componentRef = useRef({});
  const { current: component } = componentRef;

  // const [postcodes, setPostcodes] = useState(null);
  const [suburbToPostcodeData, setSuburbToPostcodeData] = useState(null);
  const [options, setOptions] = useState(null);
  const [postcodeToSa3, setPostcodeToSa3] = useState(null);

  const init = async () => {
    
    // Get some data on mount
    // TODO: Maybe make sure we actually have this data
    // and print an error or something
    // NOTE: We're using let vars here (for some reason)
    let result = await axios.get(
      `${__webpack_public_path__}sa3-codes-and-names-and-states.json`
    );

    // Sort SA3 areas
    const sa3s = result.data.sort((a, b) =>
      a.SA3_NAME.localeCompare(b.SA3_NAME)
    );

    // Map to options that React select can use
    const sa3sAsOptions = sa3s.map(sa3 => ({
      value: sa3.SA3_CODE,
      label: sa3.SA3_NAME,
    }));

    setOptions(sa3sAsOptions);

    result = await axios.get(
      `${__webpack_public_path__}postcode-to-sa3-lookup.json`
    );

    setPostcodeToSa3(result.data);

    result = await axios.get(
      `${__webpack_public_path__}suburb-to-postcode.json`
    );

    const s2pLookup = result.data;
    let suburbPostcodes = [];

    // Turn into array
    for (const suburb in s2pLookup) {
      const newSuburbObject = { suburb: suburb, postcode: s2pLookup[suburb] };
      suburbPostcodes.push(newSuburbObject);
    }

    setSuburbToPostcodeData(suburbPostcodes);

    result = await axios.get(`${__webpack_public_path__}postcodes.json`);

    // setPostcodes(result.data);
    // For some reason the debounce has a problem with component state
    // so let's use this component object thing.
    component.postcodes = result.data;
  };

  const customStyles = {
    container: provided => ({
      ...provided,
      fontFamily: "ABCSans, sans-serif",
      backgroundImage:
        "linear-gradient(90deg, rgba(57,103,123,1) 0%, rgba(57,103,123,1) 44px, rgba(8,29,134,0) 44px, rgba(0,212,255,0) 100%);",
    }),
    input: () => ({
      fontFamily: "ABCSans, sans-serif",
      "& input": {
        font: "inherit",
      },
    }),
    menu: (provided, state) => ({
      ...provided,
      borderRadius: 0,
      zIndex: 2, // So Scrolly stage doesn't go over the top
    }),
    control: (provided, state) => ({
      ...provided,
      // fontFamily: "ABCSans, sans-serif",
      borderRadius: 0,
      borderWidth: "2px",
      borderColor: "#39677B",
      backgroundColor: "transparent",
      backgroundImage: `url(${mapPin})`,
      backgroundRepeat: "no-repeat",
      backgroundSize: "auto 75%",
      backgroundPosition: "6px 45%",
      fontSize: "16px",
      cursor: "pointer",
      padding: "5px 4px 3px 40px",
      "&:focused": {
        borderColor: "red",
      },
      boxShadow: "none",
    }),
    dropdownIndicator: (provided, state) => ({
      ...provided,
      display: "none",
    }),
    indicatorSeparator: (provided, state) => ({
      ...provided,
      display: "none",
    }),
    valueContainer: (provided, state) => ({
      ...provided,
      minHeight: "40px",
    }),
  };

  const formatOptionLabel = ({ value, label, ratio }) => {
    const calculatedPercent =
      Math.round(ratio * 100) < 1 ? "<1" : Math.round(ratio * 100);
    return (
      <div style={{ display: "flex" }}>
        <div>{label}</div>
        {/* {ratio && (
          <div style={{ marginLeft: "12px", color: "#666" }}>
           <small>{calculatedPercent === 100 ? "100" : calculatedPercent}&#37;</small>
          </div>
        )} */}
      </div>
    );
  };

  // Fires when user sets postcode
  const handleChange = option => {
    props.handleSelection(option);
  };

  const promiseOptions = async (inputValue) => {
    // TODO: maybe make this a debounce
    // if (inputValue.length < MIN_INPUT_LENGTH) return [];

    // Detect postcode
    // Return sorted SA3s that match postcode by area
    // if (inputValue.length === 4) {
    // Check if string is a postcode
    // NOTE: We are using straight suburb OR postcode search now
    // if (/^[0-9]{4}$/.test(inputValue)) {
    //   console.log(`Maybe postcode!`);

    //   // Filter matches
    //   const filteredPostcodes = postcodeToSa3.filter(
    //     entry => entry.postcode.toString() === inputValue
    //   );

    //   // Array of only sa3s for difference comparison
    //   const matchingSa3s = filteredPostcodes.map(postcode => postcode.sa3);

    //   // Filter our select box final options
    //   const filteredOptions = options.filter(option =>
    //     matchingSa3s.includes(option.value)
    //   );

    //   // Add postcode ratio to the options object
    //   const optionsWithPostcode = filteredOptions.map(option => {
    //     const ratio = filteredPostcodes.find(
    //       entry => entry.sa3 === option.value
    //     ).ratio;

    //     return {
    //       value: option.value,
    //       label: option.label,
    //       ratio: ratio,
    //     };
    //   });

    //   // Sort by ratio
    //   const sortedOptions = optionsWithPostcode.sort(
    //     (a, b) => b.ratio - a.ratio
    //   );

    //   return sortedOptions;
    // }

    // // If not a postcode just search the options
    // const filteredOptions = options.filter(option => {
    //   return option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1;
    // });

    // return filteredOptions;

    console.log("Searching...")

    // If user enters digits assume postcode search
    if (/^\d{0,4}$/.test(inputValue)) {


      const filteredPostcodes = component.postcodes.filter(entry =>
        entry.toString().startsWith(inputValue)
      );

      const mappedOptions = filteredPostcodes.map(postcode => ({
        value: postcode,
        label: postcode,
        postcode: postcode,
      }));

      // await wait(250);

      return mappedOptions;
    }

    // Otherwise we do a fuzzy suburb search
    const fuzzyOptions = component.fuse.search(inputValue).map(entry => {
      return {
        value: entry.item.suburb,
        label: entry.item.suburb,
        postcode: entry.item.postcode,
      };
    });

    // Fake a delay
    // await wait(750);

    console.log("Done!")
    return fuzzyOptions;
  };

  // Initial effect run once at start
  useEffect(() => {
    init();
    component.debouncedPromiseOptions = debounce(promiseOptions, BOUNCE_TIMEOUT);
  }, []);

  useEffect(() => {
    if (!suburbToPostcodeData) return;

    component.fuse = new Fuse(suburbToPostcodeData, {
      // isCaseSensitive: false,
      // includeScore: false,
      // shouldSort: true,
      // includeMatches: false,
      // findAllMatches: false,
      minMatchCharLength: 3,
      // location: 0,
      threshold: 0.4,
      distance: 50,
      // useExtendedSearch: false,
      // ignoreLocation: false,
      // ignoreFieldNorm: false,
      keys: [
        "suburb",
        // "postcode"
      ],
    });
  }, [suburbToPostcodeData]);

  return (
    <div className={styles.root}>
      <AsyncSelect
        placeholder={"Search your suburb or postcode"}
        cacheOptions={false}
        loadOptions={component.debouncedPromiseOptions}
        onChange={handleChange}
        styles={customStyles}
        formatOptionLabel={formatOptionLabel}
        isClearable={true}
        noOptionsMessage={({ inputValue }) => {
          if (inputValue.length < 3) return "Search your suburb or postcode";
          return "Nothing found...";
        }}
        // defaultOptions={options}
      />
    </div>
  );
};

async function wait(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}
