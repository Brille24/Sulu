// @flow
import React from 'react';
import {mount} from 'enzyme';
import {webspaceStore} from 'sulu-page-bundle/stores';
import {defaultWebspace} from 'sulu-admin-bundle/utils/TestHelper';
import Permissions from '../Permissions';
import securityContextStore from '../../../stores/securityContextStore/securityContextStore';
import PermissionMatrix from '../PermissionMatrix';
import type {ContextPermission} from '../types';
import type {SecurityContextGroups} from '../../../stores/securityContextStore/types';

jest.mock('sulu-page-bundle/stores/webspaceStore', () => ({
    allWebspaces: [],
}));

jest.mock('../../../stores/securityContextStore/securityContextStore', () => ({
    getSecurityContextGroups: jest.fn(() => Promise.resolve()),
}));

jest.mock('sulu-admin-bundle/utils/Translator', () => ({
    translate: (key) => key,
}));

test('Render with minimal', () => {
    const value: Array<ContextPermission> = [
        {
            id: 1,
            context: 'sulu.contact.people',
            permissions: {
                'view': true,
                'delete': true,
                'add': true,
                'edit': true,
            },
        },
        {
            id: 2,
            context: 'sulu.contact.organizations',
            permissions: {
                'view': true,
                'delete': true,
                'add': true,
                'edit': true,
            },
        },
    ];

    const securityContextGroups: SecurityContextGroups = {
        'Contacts': {
            'sulu.contact.people': ['view', 'add', 'edit', 'delete'],
            'sulu.contact.organizations': ['view', 'add', 'edit', 'delete'],
        },
    };
    securityContextStore.getSecurityContextGroups.mockReturnValue(securityContextGroups);

    const permissions = mount(
        <Permissions
            onChange={jest.fn()}
            system="Sulu"
            value={value}
        />
    );

    expect(securityContextStore.getSecurityContextGroups).toBeCalledWith('Sulu');
    permissions.update();
    expect(permissions.render()).toMatchSnapshot();
});

test('Render in disabled state', () => {
    const value: Array<ContextPermission> = [
        {
            id: 1,
            context: 'sulu.contact.people',
            permissions: {
                'view': true,
                'delete': true,
                'add': true,
                'edit': true,
            },
        },
        {
            id: 2,
            context: 'sulu.contact.organizations',
            permissions: {
                'view': true,
                'delete': true,
                'add': true,
                'edit': true,
            },
        },
    ];

    const securityContextGroups: SecurityContextGroups = {
        'Contacts': {
            'sulu.contact.people': ['view', 'add', 'edit', 'delete'],
            'sulu.contact.organizations': ['view', 'add', 'edit', 'delete'],
        },
    };
    securityContextStore.getSecurityContextGroups.mockReturnValue(securityContextGroups);

    const permissions = mount(
        <Permissions
            disabled={true}
            onChange={jest.fn()}
            system="Sulu"
            value={value}
        />
    );

    expect(securityContextStore.getSecurityContextGroups).toBeCalledWith('Sulu');
    permissions.update();
    expect(permissions.render()).toMatchSnapshot();
});

test('Should trigger onChange correctly', () => {
    const value: Array<ContextPermission> = [
        {
            id: 1,
            context: 'sulu.contact.people',
            permissions: {
                'view': true,
                'delete': true,
                'add': true,
                'edit': true,
            },
        },
        {
            id: 2,
            context: 'sulu.contact.organizations',
            permissions: {
                'view': true,
                'delete': true,
                'add': true,
                'edit': true,
            },
        },
    ];

    const securityContextGroups: SecurityContextGroups = {
        'Contacts': {
            'sulu.contact.people': ['view', 'add', 'edit', 'delete'],
            'sulu.contact.organizations': ['view', 'add', 'edit', 'delete'],
        },
    };
    securityContextStore.getSecurityContextGroups.mockReturnValue(securityContextGroups);

    const onChange = jest.fn();
    const permissions = mount(
        <Permissions
            onChange={onChange}
            system="Sulu"
            value={value}
        />
    );

    const newContextPermissions: Array<ContextPermission> = [
        {
            id: 1,
            context: 'sulu.contact.people',
            permissions: {
                'view': true,
                'delete': true,
                'add': true,
                'edit': true,
            },
        },
        {
            id: 2,
            context: 'sulu.contact.organizations',
            permissions: {
                'view': true,
                'delete': true,
                'add': true,
                'edit': false,
            },
        },
    ];
    permissions.find(PermissionMatrix).at(0).instance().props.onChange(newContextPermissions);
    expect(onChange).toBeCalledWith(newContextPermissions);
});

test('Render with empty webspace section', () => {
    const value: Array<ContextPermission> = [
        {
            id: 1,
            context: 'sulu.contact.people',
            permissions: {
                'view': true,
                'delete': true,
                'add': true,
                'edit': true,
            },
        },
        {
            id: 2,
            context: 'sulu.contact.organizations',
            permissions: {
                'view': true,
                'delete': true,
                'add': true,
                'edit': true,
            },
        },
    ];

    const securityContextGroups: SecurityContextGroups = {
        'Contacts': {
            'sulu.contact.people': ['view', 'add', 'edit', 'delete'],
            'sulu.contact.organizations': ['view', 'add', 'edit', 'delete'],
        },
        'Webspaces': {
            'sulu.webspaces.#webspace#': ['view', 'add', 'edit', 'delete', 'live', 'security'],
            'sulu.webspaces.#webspace#.analytics': ['view', 'add', 'edit', 'delete'],
            'sulu.webspaces.#webspace#.default-snippets': ['view', 'add', 'edit', 'delete'],
        },
    };
    securityContextStore.getSecurityContextGroups.mockReturnValue(securityContextGroups);

    webspaceStore.allWebspaces = [
        {
            ...defaultWebspace,
            'key': 'example',
            'name': 'Example',
        },
        {
            ...defaultWebspace,
            'key': 'example2',
            'name': 'Example 2',
        },
        {
            ...defaultWebspace,
            'key': 'example3',
            'name': 'Example 3!',
        },
    ];

    const permissions = mount(
        <Permissions
            onChange={jest.fn()}
            system="Sulu"
            value={value}
        />
    );

    expect(securityContextStore.getSecurityContextGroups).toBeCalledWith('Sulu');

    // Currently we have to load each child separately, because of a bug in enzyme.
    // TODO: https://github.com/airbnb/enzyme/issues/1213
    const permissionChildren = permissions.children();
    expect(permissionChildren.at(0).render()).toMatchSnapshot();
    expect(permissionChildren.at(1).render()).toMatchSnapshot();
    expect(permissionChildren.at(2).render()).toMatchSnapshot();
    expect(permissionChildren.at(3).render()).toMatchSnapshot();
});

test('Render with webspace section', () => {
    const value: Array<ContextPermission> = [
        {
            id: 1,
            context: 'sulu.contact.people',
            permissions: {
                'view': true,
                'delete': true,
                'add': true,
                'edit': true,
            },
        },
        {
            id: 2,
            context: 'sulu.contact.organizations',
            permissions: {
                'view': true,
                'delete': true,
                'add': true,
                'edit': true,
            },
        },
        {
            id: 3,
            context: 'sulu.webspaces.example',
            permissions: {
                'view': true,
                'delete': true,
                'add': true,
                'edit': true,
                'live': false,
                'security': false,
            },
        },
    ];

    const securityContextGroups: SecurityContextGroups = {
        'Contacts': {
            'sulu.contact.people': ['view', 'add', 'edit', 'delete'],
            'sulu.contact.organizations': ['view', 'add', 'edit', 'delete'],
        },
        'Webspaces': {
            'sulu.webspaces.#webspace#': ['view', 'add', 'edit', 'delete', 'live', 'security'],
            'sulu.webspaces.#webspace#.analytics': ['view', 'add', 'edit', 'delete'],
            'sulu.webspaces.#webspace#.default-snippets': ['view', 'add', 'edit', 'delete'],
        },
    };
    securityContextStore.getSecurityContextGroups.mockReturnValue(securityContextGroups);

    webspaceStore.allWebspaces = [
        {
            ...defaultWebspace,
            'key': 'example',
            'name': 'Example',
        },
        {
            ...defaultWebspace,
            'key': 'example2',
            'name': 'Example 2',
        },
        {
            ...defaultWebspace,
            'key': 'example3',
            'name': 'Example 3!',
        },
    ];

    const permissions = mount(
        <Permissions
            onChange={jest.fn()}
            system="Sulu"
            value={value}
        />
    );

    expect(securityContextStore.getSecurityContextGroups).toBeCalledWith('Sulu');
    permissions.update();

    // Currently we have to load each child separately, because of a bug in enzyme.
    // TODO: https://github.com/airbnb/enzyme/issues/1213
    const permissionChildren = permissions.children();
    expect(permissionChildren.at(0).render()).toMatchSnapshot();
    expect(permissionChildren.at(1).render()).toMatchSnapshot();
    expect(permissionChildren.at(2).render()).toMatchSnapshot();
    expect(permissionChildren.at(3).render()).toMatchSnapshot();
});

test('Should trigger onChange correctly when changing something in the webspace section', () => {
    const value: Array<ContextPermission> = [
        {
            id: 1,
            context: 'sulu.contact.people',
            permissions: {
                'view': true,
                'delete': true,
                'add': true,
                'edit': true,
            },
        },
        {
            id: 2,
            context: 'sulu.contact.organizations',
            permissions: {
                'view': true,
                'delete': true,
                'add': true,
                'edit': true,
            },
        },
        {
            id: 3,
            context: 'sulu.webspaces.example',
            permissions: {
                'view': true,
                'delete': true,
                'add': true,
                'edit': true,
                'live': false,
                'security': false,
            },
        },
    ];

    const securityContextGroups: SecurityContextGroups = {
        'Contacts': {
            'sulu.contact.people': ['view', 'add', 'edit', 'delete'],
            'sulu.contact.organizations': ['view', 'add', 'edit', 'delete'],
        },
        'Webspaces': {
            'sulu.webspaces.#webspace#': ['view', 'add', 'edit', 'delete', 'live', 'security'],
            'sulu.webspaces.#webspace#.analytics': ['view', 'add', 'edit', 'delete'],
            'sulu.webspaces.#webspace#.default-snippets': ['view', 'add', 'edit', 'delete'],
        },
    };
    securityContextStore.getSecurityContextGroups.mockReturnValue(securityContextGroups);

    webspaceStore.allWebspaces = [
        {
            ...defaultWebspace,
            'key': 'example',
            'name': 'Example',
        },
        {
            ...defaultWebspace,
            'key': 'example2',
            'name': 'Example 2',
        },
        {
            ...defaultWebspace,
            'key': 'example3',
            'name': 'Example 3!',
        },
    ];

    const onChange = jest.fn();
    const permissions = mount(
        <Permissions
            onChange={onChange}
            system="Sulu"
            value={value}
        />
    );

    const newContextPermissions: Array<ContextPermission> = [
        {
            id: 1,
            context: 'sulu.contact.people',
            permissions: {
                'view': true,
                'delete': true,
                'add': true,
                'edit': true,
            },
        },
        {
            id: 2,
            context: 'sulu.contact.organizations',
            permissions: {
                'view': true,
                'delete': true,
                'add': true,
                'edit': true,
            },
        },
        {
            id: 3,
            context: 'sulu.webspaces.example',
            permissions: {
                'view': true,
                'delete': true,
                'add': false,
                'edit': true,
                'live': false,
                'security': false,
            },
        },
    ];
    permissions.find(PermissionMatrix).at(0).instance().props.onChange(newContextPermissions);
    expect(onChange).toBeCalledWith(newContextPermissions);
});

test('Should trigger onChange correctly when a webspace is added', () => {
    const value: Array<ContextPermission> = [
        {
            id: 1,
            context: 'sulu.contact.people',
            permissions: {
                'view': true,
                'delete': true,
                'add': true,
                'edit': true,
            },
        },
        {
            id: 2,
            context: 'sulu.contact.organizations',
            permissions: {
                'view': true,
                'delete': true,
                'add': true,
                'edit': true,
            },
        },
        {
            id: 3,
            context: 'sulu.webspaces.example',
            permissions: {
                'view': true,
                'delete': true,
                'add': true,
                'edit': true,
                'live': false,
                'security': false,
            },
        },
    ];

    const securityContextGroups: SecurityContextGroups = {
        'Contacts': {
            'sulu.contact.people': ['view', 'add', 'edit', 'delete'],
            'sulu.contact.organizations': ['view', 'add', 'edit', 'delete'],
        },
        'Webspaces': {
            'sulu.webspaces.#webspace#': ['view', 'add', 'edit', 'delete', 'live', 'security'],
            'sulu.webspaces.#webspace#.analytics': ['view', 'add', 'edit', 'delete'],
            'sulu.webspaces.#webspace#.default-snippets': ['view', 'add', 'edit', 'delete'],
        },
    };
    securityContextStore.getSecurityContextGroups.mockReturnValue(securityContextGroups);

    webspaceStore.allWebspaces = [
        {
            ...defaultWebspace,
            'key': 'example',
            'name': 'Example',
        },
        {
            ...defaultWebspace,
            'key': 'example2',
            'name': 'Example 2',
        },
        {
            ...defaultWebspace,
            'key': 'example3',
            'name': 'Example 3!',
        },
    ];

    const onChange = jest.fn();
    const permissions = mount(
        <Permissions
            onChange={onChange}
            system="Sulu"
            value={value}
        />
    );

    permissions.find('MultiSelect').prop('onChange')(['example', 'example3']);

    const expectedNewValue: Array<ContextPermission> = [
        {
            id: 1,
            context: 'sulu.contact.people',
            permissions: {
                'view': true,
                'delete': true,
                'add': true,
                'edit': true,
            },
        },
        {
            id: 2,
            context: 'sulu.contact.organizations',
            permissions: {
                'view': true,
                'delete': true,
                'add': true,
                'edit': true,
            },
        },
        {
            id: 3,
            context: 'sulu.webspaces.example',
            permissions: {
                'view': true,
                'delete': true,
                'add': true,
                'edit': true,
                'live': false,
                'security': false,
            },
        },
        {
            id: undefined,
            context: 'sulu.webspaces.example3',
            permissions: {
                'view': false,
                'delete': false,
                'add': false,
                'edit': false,
                'live': false,
                'security': false,
            },
        },
        {
            id: undefined,
            context: 'sulu.webspaces.example3.analytics',
            permissions: {
                'view': false,
                'delete': false,
                'add': false,
                'edit': false,
            },
        },
        {
            id: undefined,
            context: 'sulu.webspaces.example3.default-snippets',
            permissions: {
                'view': false,
                'delete': false,
                'add': false,
                'edit': false,
            },
        },
    ];

    expect(onChange).toBeCalledWith(expectedNewValue);
});

test('Should trigger onChange correctly when a webspace is removed', () => {
    const value: Array<ContextPermission> = [
        {
            id: 1,
            context: 'sulu.contact.people',
            permissions: {
                'view': true,
                'delete': true,
                'add': true,
                'edit': true,
            },
        },
        {
            id: 2,
            context: 'sulu.contact.organizations',
            permissions: {
                'view': true,
                'delete': true,
                'add': true,
                'edit': true,
            },
        },
        {
            id: 3,
            context: 'sulu.webspaces.example',
            permissions: {
                'view': true,
                'delete': true,
                'add': true,
                'edit': true,
                'live': false,
                'security': false,
            },
        },
        {
            id: 4,
            context: 'sulu.webspaces.example3',
            permissions: {
                'view': true,
                'delete': true,
                'add': true,
                'edit': true,
                'live': false,
                'security': true,
            },
        },
    ];

    const securityContextGroups: SecurityContextGroups = {
        'Contacts': {
            'sulu.contact.people': ['view', 'add', 'edit', 'delete'],
            'sulu.contact.organizations': ['view', 'add', 'edit', 'delete'],
        },
        'Webspaces': {
            'sulu.webspaces.#webspace#': ['view', 'add', 'edit', 'delete', 'live', 'security'],
            'sulu.webspaces.#webspace#.analytics': ['view', 'add', 'edit', 'delete'],
            'sulu.webspaces.#webspace#.default-snippets': ['view', 'add', 'edit', 'delete'],
        },
    };
    securityContextStore.getSecurityContextGroups.mockReturnValue(securityContextGroups);

    webspaceStore.allWebspaces = [
        {
            ...defaultWebspace,
            'key': 'example',
            'name': 'Example',
        },
        {
            ...defaultWebspace,
            'key': 'example2',
            'name': 'Example 2',
        },
        {
            ...defaultWebspace,
            'key': 'example3',
            'name': 'Example 3!',
        },
    ];

    const onChange = jest.fn();
    const permissions = mount(
        <Permissions
            onChange={onChange}
            system="Sulu"
            value={value}
        />
    );

    permissions.find('MultiSelect').prop('onChange')(['example3']);

    const expectedNewValue: Array<ContextPermission> = [
        {
            id: 1,
            context: 'sulu.contact.people',
            permissions: {
                'view': true,
                'delete': true,
                'add': true,
                'edit': true,
            },
        },
        {
            id: 2,
            context: 'sulu.contact.organizations',
            permissions: {
                'view': true,
                'delete': true,
                'add': true,
                'edit': true,
            },
        },
        {
            id: 4,
            context: 'sulu.webspaces.example3',
            permissions: {
                'view': true,
                'delete': true,
                'add': true,
                'edit': true,
                'live': false,
                'security': true,
            },
        },
    ];

    expect(onChange).toBeCalledWith(expectedNewValue);
});

test('Should trigger a mobx autorun if the prop system changes', () => {
    const value: Array<ContextPermission> = [
        {
            id: 1,
            context: 'sulu.contact.people',
            permissions: {
                'view': true,
                'delete': true,
                'add': true,
                'edit': true,
            },
        },
        {
            id: 2,
            context: 'sulu.contact.organizations',
            permissions: {
                'view': true,
                'delete': true,
                'add': true,
                'edit': true,
            },
        },
    ];

    const securityContextGroups: SecurityContextGroups = {
        'Contacts': {
            'sulu.contact.people': ['view', 'add', 'edit', 'delete'],
            'sulu.contact.organizations': ['view', 'add', 'edit', 'delete'],
        },
    };
    securityContextStore.getSecurityContextGroups.mockReturnValue(securityContextGroups);

    const permissions = mount(
        <Permissions
            onChange={jest.fn()}
            system="Sulu"
            value={value}
        />
    );

    // update with the same system, nothing should happen
    // update it with a other system it should trigger a reload
    permissions.setProps({system: 'Sulu'});
    permissions.setProps({system: 'Other-System'});

    expect(securityContextStore.getSecurityContextGroups).toHaveBeenCalledWith('Sulu');
    expect(securityContextStore.getSecurityContextGroups).toHaveBeenCalledWith('Other-System');
    expect(securityContextStore.getSecurityContextGroups).toHaveBeenCalledTimes(2);
});

test('Pass disabled state to MultiSelect', () => {
    const securityContextGroups: SecurityContextGroups = {
        'Webspaces': {
            'sulu.webspaces.#webspace#': ['view'],
        },
    };
    securityContextStore.getSecurityContextGroups.mockReturnValue(securityContextGroups);

    const permissions = mount(
        <Permissions
            disabled={true}
            onChange={jest.fn()}
            system="Sulu"
            value={[]}
        />
    );

    expect(permissions.find('MultiSelect').prop('disabled')).toEqual(true);
});

test('Dispose autorun on unmount', () => {
    const value: Array<ContextPermission> = [
        {
            id: 1,
            context: 'sulu.contact.people',
            permissions: {
                'view': true,
                'delete': true,
                'add': true,
                'edit': true,
            },
        },
        {
            id: 2,
            context: 'sulu.contact.organizations',
            permissions: {
                'view': true,
                'delete': true,
                'add': true,
                'edit': true,
            },
        },
    ];

    const securityContextGroups: SecurityContextGroups = {
        'Contacts': {
            'sulu.contact.people': ['view', 'add', 'edit', 'delete'],
            'sulu.contact.organizations': ['view', 'add', 'edit', 'delete'],
        },
    };
    securityContextStore.getSecurityContextGroups.mockReturnValue(securityContextGroups);

    const permissions = mount(
        <Permissions
            onChange={jest.fn()}
            system="Sulu"
            value={value}
        />
    );

    permissions.update();

    const systemDisposerSpy = jest.fn();
    permissions.instance().systemDisposer = systemDisposerSpy;
    permissions.unmount();

    expect(systemDisposerSpy).toBeCalledWith();
});
