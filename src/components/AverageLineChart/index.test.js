import React from 'react';
import renderer from 'react-test-renderer';

import AverageLineChart from '.';

describe('AverageLineChart', () => {
  test('It renders', () => {
    const component = renderer.create(<AverageLineChart />);

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
