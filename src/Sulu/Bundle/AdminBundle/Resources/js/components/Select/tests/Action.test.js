// @flow
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import Action from '../Action';

test('The component should render', () => {
    const onClick = jest.fn();
    const afterAction = jest.fn();
    const {container} = render(
        <Action afterAction={afterAction} onClick={onClick} value="my-option">My action</Action>
    );

    expect(container).toMatchSnapshot();
});

test('The component should call the callbacks after a click', async() => {
    const onClick = jest.fn();
    const afterAction = jest.fn();
    render(<Action afterAction={afterAction} onClick={onClick} value="my-option">My action</Action>);

    const button = screen.queryByText('My action');
    await userEvent.click(button);

    expect(onClick).toBeCalled();
    expect(afterAction).toBeCalled();
});

test('The component should call the onClick callbacks without a value', async() => {
    const onClick = jest.fn();
    render(<Action onClick={onClick}>My action</Action>);

    const button = screen.queryByText('My action');
    await userEvent.click(button);

    expect(onClick).toBeCalledWith(undefined);
});

test('The component should call the onClick callbacks with its value', async() => {
    const onClick = jest.fn();
    render(<Action onClick={onClick} value="my-value">My action</Action>);

    const button = screen.queryByText('My action');
    await userEvent.click(button);

    expect(onClick).toBeCalledWith('my-value');
});

test('A hover on the component should fire the callback', async() => {
    const onClick = jest.fn();
    const requestFocusSpy = jest.fn();
    render(
        <Action onClick={onClick} requestFocus={requestFocusSpy} value="my-value">My action</Action>
    );

    const item = screen.queryByRole('listitem');
    await userEvent.hover(item);

    expect(requestFocusSpy).toBeCalled();
});
