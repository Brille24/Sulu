// @flow
import React from 'react';
import {render} from '@testing-library/react';
import Badge from '../Badge';

test('Render a badge', () => {
    const {container} = render(<Badge>Hello world</Badge>);

    expect(container).toMatchSnapshot();
});
