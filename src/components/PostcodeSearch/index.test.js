import React from "react";
import renderer from "react-test-renderer";

import PostcodeSearch from ".";

describe("PostcodeSearch", () => {
  test("It renders", () => {
    const component = renderer.create(<PostcodeSearch />);

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
