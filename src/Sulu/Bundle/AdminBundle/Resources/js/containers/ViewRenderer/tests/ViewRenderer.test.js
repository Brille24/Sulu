/* eslint-disable flowtype/require-valid-file-annotation */
import React from 'react';
import {mount, render, shallow} from 'enzyme';
import ViewRenderer from '../ViewRenderer';
import viewRegistry from '../registries/viewRegistry';

jest.mock('../registries/viewRegistry', () => ({
    get: jest.fn(),
    getConfig: jest.fn(),
}));

test('Render view returned from ViewRegistry', () => {
    const router = {
        addUpdateRouteHook: jest.fn(),
        route: {type: 'test'},
    };
    viewRegistry.get.mockReturnValue(() => (<h1>Test</h1>));
    viewRegistry.getConfig.mockReturnValue({});
    const view = mount(<ViewRenderer router={router} />);
    expect(render(view)).toMatchSnapshot();
    expect(viewRegistry.get).toBeCalledWith('test');
});

test('Render view returned from ViewRegistry with disableDefaultSpacing true', () => {
    const router = {
        addUpdateRouteHook: jest.fn(),
        route: {type: 'test'},
    };
    viewRegistry.get.mockReturnValue(() => (<h1>Test</h1>));
    viewRegistry.getConfig.mockReturnValue({disableDefaultSpacing: true});
    const view = mount(<ViewRenderer router={router} />);
    expect(render(view)).toMatchSnapshot();
    expect(viewRegistry.get).toBeCalledWith('test');
});

test('Render view returned from ViewRegistry with passed router', () => {
    const router = {
        route: {
            type: 'test',
        },
        attributes: {
            value: 'Test attribute',
        },
    };

    viewRegistry.get.mockReturnValue((props) => (<h1>{props.router.attributes.value}</h1>));
    viewRegistry.getConfig.mockReturnValue({});
    const view = render(<ViewRenderer router={router} />);
    expect(view).toMatchSnapshot();
    expect(viewRegistry.get).toBeCalledWith('test');
});

test('Render view with parents should nest rendered views', () => {
    const router = {
        route: {
            name: 'sulu_admin.form_tab',
            type: 'form_tab',
            parent: {
                name: 'sulu_admin.form',
                type: 'form',
                parent: {
                    name: 'sulu_admin.app',
                    type: 'app',
                },
            },
        },
    };

    viewRegistry.get.mockImplementation((view) => {
        switch (view) {
            case 'form_tab':
                return function FormTab(props) {
                    return (
                        <div>
                            <h3>Form Tab</h3>
                            {props.route.name}
                        </div>
                    );
                };
            case 'form':
                return function Form(props) {
                    return (
                        <div>
                            <h2>Form</h2>
                            {props.route.name}
                            {props.children()}
                        </div>
                    );
                };
            case 'app':
                return function App(props) {
                    return (
                        <div>
                            <h1>App</h1>
                            {props.route.name}
                            {props.children()}
                        </div>
                    );
                };
        }
    });
    viewRegistry.getConfig.mockReturnValue({});

    expect(render(<ViewRenderer router={router} />)).toMatchSnapshot();
});

test('Render view with parents should nest rendered views and correctly pass children arguments', () => {
    const router = {
        route: {
            name: 'sulu_admin.form_tab',
            type: 'form_tab',
            parent: {
                name: 'sulu_admin.form',
                type: 'form',
                parent: {
                    name: 'sulu_admin.app',
                    type: 'app',
                },
            },
        },
    };

    viewRegistry.get.mockImplementation((view) => {
        switch (view) {
            case 'form_tab':
                return function FormTab(props) {
                    return (
                        <div>
                            <h3>Form Tab</h3>
                            <p>{props.route.name}</p>
                            <p>{props.form}</p>
                        </div>
                    );
                };
            case 'form':
                return function Form(props) {
                    return (
                        <div>
                            <h2>Form</h2>
                            <p>{props.route.name}</p>
                            <p>{props.app}</p>
                            {props.children({form: 'Form'})}
                        </div>
                    );
                };
            case 'app':
                return function App(props) {
                    return (
                        <div>
                            <h1>App</h1>
                            <p>{props.route.name}</p>
                            {props.children({app: 'App'})}
                        </div>
                    );
                };
        }
    });
    viewRegistry.getConfig.mockReturnValue({disableDefaultSpacing: true});

    expect(render(<ViewRenderer router={router} />)).toMatchSnapshot();
});

test('Render view with route that has no rerenderAttributes', () => {
    const router = {
        addUpdateRouteHook: jest.fn(),
        route: {
            name: 'route',
            type: 'webspaceOverview',
        },
        attributes: {
            webspace: 'test',
        },
    };

    viewRegistry.get.mockImplementation((view) => {
        switch (view) {
            case 'webspaceOverview':
                return function WebspaceOverview() {
                    return (
                        <div>
                            <h3>Webspace</h3>
                        </div>
                    );
                };
        }
    });
    viewRegistry.getConfig.mockReturnValue({disableDefaultSpacing: true});

    const viewRenderer = shallow(<ViewRenderer router={router} />);
    expect(viewRenderer.key()).toBe('route');
});

test('Render view with route that has rerenderAttributes', () => {
    const router = {
        addUpdateRouteHook: jest.fn(),
        route: {
            name: 'route',
            type: 'webspaceOverview',
            rerenderAttributes: [
                'webspace',
            ],
        },
        attributes: {
            webspace: 'test',
        },
    };

    viewRegistry.get.mockImplementation((view) => {
        switch (view) {
            case 'webspaceOverview':
                return function WebspaceOverview() {
                    return (
                        <div>
                            <h3>Webspace</h3>
                        </div>
                    );
                };
        }
    });
    viewRegistry.getConfig.mockReturnValue({disableDefaultSpacing: true});

    const viewRenderer = shallow(<ViewRenderer router={router} />);
    expect(viewRenderer.key()).toBe('route-test');
});

test('Render view with route that has more than one rerenderAttributes', () => {
    const router = {
        addUpdateRouteHook: jest.fn(),
        route: {
            name: 'route',
            type: 'webspaceOverview',
            rerenderAttributes: [
                'webspace',
                'locale',
            ],
        },
        attributes: {
            webspace: 'test',
            locale: 'de',
        },
    };

    viewRegistry.get.mockImplementation((view) => {
        switch (view) {
            case 'webspaceOverview':
                return function WebspaceOverview() {
                    return (
                        <div>
                            <h3>Webspace</h3>
                        </div>
                    );
                };
        }
    });
    viewRegistry.getConfig.mockReturnValue({disableDefaultSpacing: true});

    const viewRenderer = shallow(<ViewRenderer router={router} />);
    expect(viewRenderer.key()).toBe('route-test__de');
});

test('Clear bindings of router everytime a new view is rendered', () => {
    viewRegistry.get.mockReturnValue(() => (<h1>Test</h1>));
    viewRegistry.getConfig.mockReturnValue({});

    const route1 = {
        name: 'test1',
        type: 'test',
    };

    const route2 = {
        name: 'test2',
        type: 'test',
    };

    const router = {
        addUpdateRouteHook: jest.fn(),
        clearBindings: jest.fn(),
        route: route1,
    };

    shallow(<ViewRenderer router={router} />);
    expect(router.addUpdateRouteHook).toBeCalledWith(expect.anything(), 1024);

    const updateRouteHook = router.addUpdateRouteHook.mock.calls[0][0];

    updateRouteHook(route1, {});
    expect(router.clearBindings).not.toBeCalled();

    updateRouteHook(route2, {});
    expect(router.clearBindings).toBeCalledWith();
});

test('Clear bindings of router when same view with a different rerender attribute is rendered', () => {
    viewRegistry.get.mockReturnValue(() => (<h1>Test</h1>));
    viewRegistry.getConfig.mockReturnValue({});

    const route = {
        name: 'test1',
        type: 'test',
        rerenderAttributes: ['webspace'],
    };

    const router = {
        addUpdateRouteHook: jest.fn(),
        attributes: {
            locale: 'de',
            webspace: 'sulu',
        },
        clearBindings: jest.fn(),
        route,
    };

    shallow(<ViewRenderer router={router} />);
    expect(router.addUpdateRouteHook).toBeCalledWith(expect.anything(), 1024);

    const updateRouteHook = router.addUpdateRouteHook.mock.calls[0][0];

    updateRouteHook(route, {locale: 'en', webspace: 'sulu'});
    expect(router.clearBindings).not.toBeCalled();

    updateRouteHook(route, {locale: 'de', webspace: 'example'});
    expect(router.clearBindings).toBeCalledWith();
});
