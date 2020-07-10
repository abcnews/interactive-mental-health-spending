import React from "react";
import styles from "./styles.scss";
import AsyncSelect from "react-select/async";
import postcodes from "./postcodes.json";

const options = postcodes.map(postcode => ({
  value: postcode,
  label: postcode
}));

const handleChange = d => {
  console.log(d);
};

const filterPostcodes = inputValue => {
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

export default props => {
  return (
    <div className={styles.root}>
      <AsyncSelect
        placeholder={"Enter postcode..."}
        cacheOptions
        loadOptions={promiseOptions}
        onChange={handleChange}
      />
    </div>
  );
};
