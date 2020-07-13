import React from "react";
import styles from "./styles.scss";
import AsyncSelect from "react-select/async";
import postcodes from "./postcodes.json";

const options = postcodes.map(postcode => ({
  value: postcode,
  label: postcode
}));

export default props => {
  const customStyles = {
    menu: (provided, state) => ({
      ...provided,
      zIndex: 2 // So Scrolly stage doesn't go over the top
    })
  };

  // Fires when user sets postcode
  const handleChange = option => {
    console.log(option);
    props.setUserPostcode(option.value);
  };

  const filterPostcodes = inputValue => {
    // Only search if user enters at least 2 characters
    if (inputValue.length < 2) return [];

    // Otherwise filter the postcodes and returns
    return options.filter(i =>
      i.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  const promiseOptions = inputValue =>
    new Promise(resolve => {
      setTimeout(() => {
        resolve(filterPostcodes(inputValue));
      }, 200);
    });

  return (
    <div className={styles.root}>
      <AsyncSelect
        placeholder={"Enter postcode..."}
        cacheOptions
        loadOptions={promiseOptions}
        onChange={handleChange}
        styles={customStyles}
      />
    </div>
  );
};
