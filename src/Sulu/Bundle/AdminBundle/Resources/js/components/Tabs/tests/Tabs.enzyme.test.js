/* eslint-disable flowtype/require-valid-file-annotation */
import {shallow} from 'enzyme';
import React from 'react';
import debounce from 'debounce';
import Tabs from '../Tabs.js';

jest.mock('debounce', () => jest.fn((callback) => callback));

window.ResizeObserver = jest.fn(function() {
    this.observe = jest.fn();
    this.disconnect = jest.fn();
});

Object.defineProperty(window, 'getComputedStyle', {
    value: () => ({
        paddingLeft: 20.0,
        paddingRight: 20.0,
    }),
});

test('Clicking on several non- and collapsed tabs', () => {
    const resizeFunction = jest.fn();
    debounce.mockReturnValue(resizeFunction);

    const changeSpy = jest.fn();
    const selectedTabIndex = 0;

    const tabs = shallow(
        <Tabs onSelect={changeSpy} selectedIndex={selectedTabIndex}>
            <Tabs.Tab>Tab 1</Tabs.Tab>
            <Tabs.Tab>Tab 2</Tabs.Tab>
            <Tabs.Tab>Tab 3</Tabs.Tab>
            <Tabs.Tab>Tab 4</Tabs.Tab>
            <Tabs.Tab>Tab 5</Tabs.Tab>
            <Tabs.Tab>Tab 6</Tabs.Tab>
            <Tabs.Tab>Tab 7</Tabs.Tab>
            <Tabs.Tab>Tab 8</Tabs.Tab>
            <Tabs.Tab>Tab 9</Tabs.Tab>
            <Tabs.Tab>Tab 10</Tabs.Tab>
        </Tabs>
    );

    tabs.instance().tabsRef = {
        offsetWidth: 129,
    };

    tabs.instance().tabsContainerWrapperRef = {
        offsetWidth: 55,
    };

    tabs.instance().tabsContainerRef = {
        offsetWidth: 100,
    };

    tabs.instance().setDimensions();
    tabs.instance().tabWidths = new Map([
        [0, 10],
        [1, 10],
        [2, 10],
        [3, 10],
        [4, 10],
        [5, 10],
        [6, 10],
        [7, 10],
        [8, 10],
        [9, 10],
    ]);

    tabs.update();

    // Initial state
    expect(tabs.instance().visibleTabIndices).toEqual([0, 1, 2, 3, 4]);
    expect(tabs.instance().collapsedTabIndices).toEqual([5, 6, 7, 8, 9]);

    // Click on already visible tab
    tabs.instance().handleTabClick(4);
    expect(changeSpy).toBeCalledWith(4);
    tabs.setProps({selectedIndex: 4});

    expect(tabs.instance().visibleTabIndices).toEqual([0, 1, 2, 3, 4]);
    expect(tabs.instance().collapsedTabIndices).toEqual([5, 6, 7, 8, 9]);

    // Click on hidden tab
    tabs.instance().handleCollapsedTabClick(6);
    expect(changeSpy).toBeCalledWith(6);
    tabs.setProps({selectedIndex: 6});

    expect(tabs.instance().visibleTabIndices).toEqual([0, 1, 2, 3, 6]);
    expect(tabs.instance().collapsedTabIndices).toEqual([4, 5, 7, 8, 9]);

    // Click on another hidden tab
    tabs.instance().handleCollapsedTabClick(8);
    expect(changeSpy).toBeCalledWith(8);
    tabs.setProps({selectedIndex: 8});

    expect(tabs.instance().visibleTabIndices).toEqual([0, 1, 2, 3, 8]);
    expect(tabs.instance().collapsedTabIndices).toEqual([4, 5, 6, 7, 9]);

    // Click on visible tab again
    tabs.instance().handleTabClick(2);
    expect(changeSpy).toBeCalledWith(2);
    tabs.setProps({selectedIndex: 2});

    expect(tabs.instance().visibleTabIndices).toEqual([0, 1, 2, 3, 8]);
    expect(tabs.instance().collapsedTabIndices).toEqual([4, 5, 6, 7, 9]);

    // Click again on another visible tab
    tabs.instance().handleTabClick(3);
    expect(changeSpy).toBeCalledWith(3);
    tabs.setProps({selectedIndex: 3});

    expect(tabs.instance().visibleTabIndices).toEqual([0, 1, 2, 3, 8]);
    expect(tabs.instance().collapsedTabIndices).toEqual([4, 5, 6, 7, 9]);
});
