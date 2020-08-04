import React from 'react';
import renderer from 'react-test-renderer';

import CustomPanel from '.';

describe('CustomPanel', () => {
  test('It renders', () => {
    const component = renderer.create(<CustomPanel />);

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
