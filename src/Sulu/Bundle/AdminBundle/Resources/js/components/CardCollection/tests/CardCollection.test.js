// @flow
import React from 'react';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CardCollection from '../CardCollection';

jest.mock('../../../utils/Translator', () => ({
    translate: jest.fn((key) => key),
}));

test('Render empty CardCollection', () => {
    const {container} = render(<CardCollection />);
    expect(container).toMatchSnapshot();
});

test('Render passed card components', () => {
    const {container} = render(
        <CardCollection>
            <CardCollection.Card>
                <h1>Content 1</h1>
            </CardCollection.Card>
            <CardCollection.Card>
                <h2>Content 2</h2>
            </CardCollection.Card>
        </CardCollection>
    );
    expect(container).toMatchSnapshot();
});

test('Call onAdd callback when add button is clicked', async() => {
    const addSpy = jest.fn();

    render(<CardCollection onAdd={addSpy} />);

    const icon = screen.queryByLabelText('su-plus');

    await userEvent.click(icon);

    expect(addSpy).toBeCalled();
});

test('Call onEdit callback when edit icon is clicked', async() => {
    const editSpy = jest.fn();

    render(
        <CardCollection onEdit={editSpy}>
            <CardCollection.Card>
                <h1>Content 1</h1>
            </CardCollection.Card>
            <CardCollection.Card>
                <h2>Content 2</h2>
            </CardCollection.Card>
        </CardCollection>
    );

    const icon = screen.queryAllByLabelText('su-pen')[1];

    await userEvent.click(icon);

    expect(editSpy).toBeCalledWith(1);
});

test('Call onRemove callback when remove icon is clicked', async() => {
    const removeSpy = jest.fn();

    render(
        <CardCollection onRemove={removeSpy}>
            <CardCollection.Card>
                <h1>Content 1</h1>
            </CardCollection.Card>
            <CardCollection.Card>
                <h2>Content 2</h2>
            </CardCollection.Card>
        </CardCollection>
    );

    const icon = screen.queryAllByLabelText('su-trash-alt')[1];

    await userEvent.click(icon);

    expect(removeSpy).toBeCalledWith(1);
});
