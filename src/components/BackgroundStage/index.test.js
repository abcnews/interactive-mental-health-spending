import React from 'react';
import renderer from 'react-test-renderer';

import BackgroundStage from '.';

describe('BackgroundStage', () => {
  test('It renders', () => {
    const component = renderer.create(<BackgroundStage />);

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
