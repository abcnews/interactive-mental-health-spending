import React from "react";
import styles from "./styles.scss";
import AsyncSelect from "react-select/async";
import Select from "react-select";
import postcodes from "./postcodes.json";
import sa3s from "./sa3-codes-and-names-and-states.json";
import postcodeToSa3 from "./postcode-to-sa3-lookup.json";

const options = sa3s.map(sa3 => ({
  value: sa3.SA3_CODE,
  label: sa3.SA3_NAME
}));

export default props => {
  const customStyles = {
    menu: (provided, state) => ({
      ...provided,
      zIndex: 2 // So Scrolly stage doesn't go over the top
    }),
    control: (provided, state) => ({
      ...provided,
      borderRadius: 0,
      borderWidth: "2px",
      borderColor: "#39677B",
      fontSize: "16px",
      cursor: "pointer",
      padding: "4px 4px 3px"
    })
  };

  // Fires when user sets postcode
  const handleChange = option => {
    // props.setUserPostcode(option.value);

    console.log(option);
  };

  const filterPostcodes = inputValue => {
    // Only search if user enters at least 2 characters
    // if (inputValue.length < 2) return [];

    return options;

    // Otherwise filter the postcodes and returns
    // return options.filter(i =>
    //   i.label.toLowerCase().includes(inputValue.toLowerCase())
    // );
  };

  const promiseOptions = inputValue =>
    new Promise(resolve => {
      setTimeout(() => {
        resolve(filterPostcodes(inputValue));
      }, 200);
    });

  return (
    <div className={styles.root}>
      <Select
        options={options}
        placeholder={"Search for your area..."}
        styles={customStyles}
        isClearable={true}
        onChange={handleChange}
      />
      {/* <AsyncSelect
        placeholder={"Enter postcode..."}
        cacheOptions
        loadOptions={promiseOptions}
        onChange={handleChange}
        styles={customStyles}
      /> */}
    </div>
  );
};
