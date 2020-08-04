import React from 'react';
import renderer from 'react-test-renderer';

import MultiChart from '.';

describe('MultiChart', () => {
  test('It renders', () => {
    const component = renderer.create(<MultiChart />);

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
