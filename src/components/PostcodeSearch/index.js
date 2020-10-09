import React, { useEffect, useState } from "react";
import styles from "./styles.scss";
import AsyncSelect from "react-select/async";
import axios from "axios";

// Import images
import mapPin from "./DLS_NAV_ICON.png";

const MIN_INPUT_LENGTH = 2;

// Start of React component
export default props => {
  const [suburbToPostcodeData, setSuburbToPostcodeData] = useState(null);
  const [options, setOptions] = useState(null);
  const [postcodeToSa3, setPostcodeToSa3] = useState(null);

  const init = async () => {
    // Get some data on mount
    // TODO: Maybe make sure we actually have this data
    // and print an error or something
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

    setPostcodeToSa3(result);

    result = await axios.get(
      `${__webpack_public_path__}suburb-to-postcode.json`
    );

    setSuburbToPostcodeData(result.data);
  };

  const customStyles = {
    menu: (provided, state) => ({
      ...provided,
      zIndex: 2, // So Scrolly stage doesn't go over the top
    }),
    control: (provided, state) => ({
      ...provided,
      fontFamily: "ABCSans, sans-serif",
      borderRadius: 0,
      borderWidth: "2px",
      // borderColor: "#999",
      // backgroundColor: "#999",
      backgroundImage: `url(${mapPin})`,
      backgroundRepeat: "no-repeat",
      backgroundSize: "auto 75%",
      backgroundPosition: "6px 45%",
      fontSize: "16px",
      cursor: "pointer",
      padding: "5px 4px 3px 30px",
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

  const promiseOptions = async inputValue => {
    console.log(`Input value: ${inputValue}`);

    // Don't process yet
    // TODO: maybe make this a debounce
    if (inputValue.length < MIN_INPUT_LENGTH) return [];

    // Detect postcode
    // if (inputValue.length === 4) {
    // Check if string is a postcode
    if (/^[0-9]{4}$/.test(inputValue)) {
      console.log(`Maybe postcode!`);

      // Filter matches
      const filteredPostcodes = postcodeToSa3.filter(
        entry => entry.postcode.toString() === inputValue
      );

      // Array of only sa3s for difference comparison
      const matchingSa3s = filteredPostcodes.map(postcode => postcode.sa3);

      // Filter our select box final options
      const filteredOptions = options.filter(option =>
        matchingSa3s.includes(option.value)
      );

      // Add postcode ratio to the options object
      const optionsWithPostcode = filteredOptions.map(option => {
        const ratio = filteredPostcodes.find(
          entry => entry.sa3 === option.value
        ).ratio;

        return {
          value: option.value,
          label: option.label,
          ratio: ratio,
        };
      });

      // Sort by ratio
      const sortedOptions = optionsWithPostcode.sort(
        (a, b) => b.ratio - a.ratio
      );

      console.log(sortedOptions);
      return sortedOptions;
    }

    // If not a postcode just search the options
    const filteredOptions = options.filter(option => {
      return option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1;
    });

    return filteredOptions;

    // TODO: If filtered options is zero then assume a suburb/place search
    // and return appropriate data
  };

  // Initial effect run once at start
  useEffect(() => {
    init();
  }, []);

  return (
    <div className={styles.root}>
      <AsyncSelect
        placeholder={"Enter postcode or search area..."}
        cacheOptions
        loadOptions={promiseOptions}
        onChange={handleChange}
        styles={customStyles}
        formatOptionLabel={formatOptionLabel}
        isClearable={true}
        noOptionsMessage={() => "Enter your postcode or local area..."}
        defaultOptions={options}
      />
    </div>
  );
};
