// @flow
import mockReact from 'react';
import {mount} from 'enzyme';
import {observable} from 'mobx';
import FormOverlayList from '../FormOverlayList';
import List from '../../List';
import ResourceStore from '../../../stores/ResourceStore';
import ResourceFormStore from '../../../containers/Form/stores/ResourceFormStore';
import FormOverlay from '../../../containers/FormOverlay';
import Router, {Route} from '../../../services/Router';

const React = mockReact;

jest.mock('../../List', () => class ListMock extends mockReact.Component<*> {
    render() {
        return <div>list view mock</div>;
    }
});

jest.mock('../../../containers/Form/Form', () => class FormMock extends mockReact.Component<*> {
    render() {
        return <div>form container mock</div>;
    }
});

jest.mock('../../../utils/Translator', () => ({
    translate: jest.fn((key) => key),
}));

jest.mock('../../../stores/ResourceStore', () => jest.fn(
    (resourceKey, itemId) => {
        return {
            id: itemId,
        };
    }
));
jest.mock('../../../containers/Form/stores/ResourceFormStore', () => jest.fn(
    (resourceStore, formKey, options, metadataOptions) => {
        return {
            id: resourceStore.id,
            metadataOptions,
        };
    }
));

test('View should render with closed overlay', () => {
    const route: Route = ({}: any);
    const router: Router = ({
        route: {
            options: {},
        },
    }: any);

    const formOverlayList = mount(<FormOverlayList route={route} router={router} />);

    expect(formOverlayList.render()).toMatchSnapshot();
});

test('View should render with opened overlay', () => {
    const route: Route = ({}: any);
    const router: Router = ({
        route: {
            options: {
                addOverlayTitle: 'app.add_overlay_title',
                formKey: 'test-form-key',
            },
        },
    }: any);

    const formOverlayList = mount(<FormOverlayList route={route} router={router} />);

    // open form overlay for new item
    formOverlayList.find(List).props().onItemAdd();
    formOverlayList.update();

    expect(formOverlayList.render()).toMatchSnapshot();
});

test('Should pass correct props to List view', () => {
    const route: Route = ({}: any);
    const router: Router = ({
        attributes: {
            id: 'test-id',
            category: 'category-id',
        },
        route: {
            options: {
                adapters: ['table'],
                addRoute: 'addRoute',
                listKey: 'test-list-key',
                formKey: 'test-form-key',
                addOverlayTitle: 'app.add_overlay_title',
                editOverlayTitle: 'app.edit_overlay_title',
                overlaySize: 'large',
                resourceKey: 'test-resource-key',
                toolbarActions: ['sulu_admin.add'],
                routerAttributesToListRequest: {'0': 'category', 'id': 'parentId'},
                routerAttributesToFormRequest: {'0': 'category', 'id': 'parentId'},
            },
        },
    }: any);

    const formOverlayList = mount(<FormOverlayList route={route} router={router} />);
    const list = formOverlayList.find(List);

    expect(list.props()).toEqual(expect.objectContaining(formOverlayList.props()));
    expect(list.props().locale).toBeDefined();
    expect(list.props().onItemAdd).toBeDefined();
    expect(list.props().onItemClick).toBeDefined();
});

test('Should construct ResourceStore and ResourceFormStore with correct parameters on item-add callback', () => {
    const route: Route = ({}: any);
    const router: Router = ({
        attributes: {
            id: 'test-id',
            category: 'category-id',
        },
        route: {
            options: {
                formKey: 'test-form-key',
                resourceKey: 'test-resource-key',
                routerAttributesToFormRequest: {'0': 'category', 'id': 'parentId'},
                resourceStorePropertiesToFormRequest: {'0': 'webspace', 'dimension': 'dimensionId'},
            },
        },
    }: any);

    const testResourceStore = new ResourceStore('test');
    testResourceStore.data = {
        webspace: 'test-webspace',
        dimension: 'test-dimension',
    };

    const formOverlayList = mount(<FormOverlayList resourceStore={testResourceStore} route={route} router={router} />);
    formOverlayList.find(List).props().onItemAdd();

    expect(ResourceStore).toBeCalledWith('test-resource-key', undefined, {}, {
        category: 'category-id',
        parentId: 'test-id',
        webspace: 'test-webspace',
        dimensionId: 'test-dimension',
    });
    expect(ResourceFormStore).toBeCalledWith(expect.anything(), 'test-form-key', {
        category: 'category-id',
        parentId: 'test-id',
        webspace: 'test-webspace',
        dimensionId: 'test-dimension',
    }, {});
});

test('Should construct ResourceStore and ResourceFormStore with correct parameters on item-click callback', () => {
    const route: Route = ({}: any);
    const router: Router = ({
        attributes: {
            id: 'test-id',
            category: 'category-id',
        },
        route: {
            options: {
                formKey: 'test-form-key',
                resourceKey: 'test-resource-key',
                routerAttributesToFormRequest: {'0': 'category', 'id': 'parentId'},
                resourceStorePropertiesToFormRequest: {'0': 'webspace', 'dimension': 'dimensionId'},
            },
        },
    }: any);

    const testResourceStore = new ResourceStore('test');
    testResourceStore.data = {
        webspace: 'test-webspace',
        dimension: 'test-dimension',
    };

    const formOverlayList = mount(<FormOverlayList resourceStore={testResourceStore} route={route} router={router} />);

    const locale = observable.box('en');
    formOverlayList.instance().locale = locale;

    formOverlayList.find(List).props().onItemClick('item-id');

    expect(ResourceStore).toBeCalledWith('test-resource-key', 'item-id', {locale}, {
        category: 'category-id',
        parentId: 'test-id',
        webspace: 'test-webspace',
        dimensionId: 'test-dimension',
    });
    expect(ResourceFormStore).toBeCalledWith(expect.anything(), 'test-form-key', {
        category: 'category-id',
        parentId: 'test-id',
        webspace: 'test-webspace',
        dimensionId: 'test-dimension',
    }, {});
});

test('Should construct ResourceFormStore with correct metadataOptions on item-add callback', () => {
    const route: Route = ({}: any);
    const router: Router = ({
        attributes: {
            id: 'test-id',
            webspace: 'webspace-attribute-value',
            template: 'template-attribute-value',
        },
        route: {
            options: {
                formKey: 'test-form-key',
                resourceKey: 'test-resource-key',
                metadataRequestParameters: {'staticParam': 'staticValue'},
                routerAttributesToFormMetadata: {'0': 'webspace', 'template': 'pageTemplate'},
            },
        },
    }: any);

    const formOverlayList = mount(<FormOverlayList route={route} router={router} />);

    formOverlayList.instance().locale = observable.box('en');
    formOverlayList.find(List).props().onItemAdd();

    expect(ResourceFormStore).toBeCalledWith(expect.anything(), 'test-form-key', {}, {
        staticParam: 'staticValue',
        webspace: 'webspace-attribute-value',
        pageTemplate: 'template-attribute-value',
    });
});

test('Should open FormOverlay with correct props when List fires the item-add callback', () => {
    const route: Route = ({}: any);
    const router: Router = ({
        route: {
            options: {
                formKey: 'test-form-key',
                addOverlayTitle: 'app.add_overlay_title',
                overlaySize: 'large',
            },
        },
    }: any);

    const formOverlayList = mount(<FormOverlayList route={route} router={router} />);
    formOverlayList.find(List).props().onItemAdd();

    formOverlayList.update();
    const overlay = formOverlayList.find(FormOverlay);

    expect(overlay.props()).toEqual(expect.objectContaining({
        confirmText: 'sulu_admin.save',
        formStore: formOverlayList.instance().formStore,
        open: true,
        size: 'large',
        title: 'app.add_overlay_title',
    }));
});

test('Should open FormOverlay with correct props when List fires the item-click callback', () => {
    const route: Route = ({}: any);
    const router: Router = ({
        route: {
            options: {
                formKey: 'test-form-key',
                editOverlayTitle: 'app.edit_overlay_title',
            },
        },
    }: any);

    const formOverlayList = mount(<FormOverlayList route={route} router={router} />);
    formOverlayList.find(List).props().onItemClick('item-id');

    formOverlayList.update();
    const overlay = formOverlayList.find(FormOverlay);

    expect(overlay.props()).toEqual(expect.objectContaining({
        confirmText: 'sulu_admin.save',
        formStore: formOverlayList.instance().formStore,
        open: true,
        size: 'small',
        title: 'app.edit_overlay_title',
    }));
});

test('Should destroy ResourceFormStore without reloading List when FormOverlay is closed', () => {
    const route: Route = ({}: any);
    const router: Router = ({
        route: {
            options: {
                formKey: 'test-form-key',
            },
        },
    }: any);

    const formOverlayList = mount(<FormOverlayList route={route} router={router} />);

    // open form overlay for new item
    formOverlayList.find(List).props().onItemAdd();
    formOverlayList.update();

    const destroySpy = jest.fn();
    formOverlayList.instance().formStore.destroy = destroySpy;

    const reloadSpy = jest.fn();
    formOverlayList.find(List).instance().reload = reloadSpy;

    formOverlayList.find(FormOverlay).props().onClose();
    expect(destroySpy).toBeCalled();
    expect(reloadSpy).not.toBeCalled();
});

test('Should destroy ResourceFormStore and reload List view when FormOverlay is confirmed', () => {
    const route: Route = ({}: any);
    const router: Router = ({
        route: {
            options: {
                formKey: 'test-form-key',
            },
        },
    }: any);

    const formOverlayList = mount(<FormOverlayList route={route} router={router} />);

    // open form overlay for new item
    formOverlayList.find(List).props().onItemAdd();
    formOverlayList.update();

    const destroySpy = jest.fn();
    formOverlayList.instance().formStore.destroy = destroySpy;

    const reloadSpy = jest.fn();
    formOverlayList.find(List).instance().reload = reloadSpy;

    formOverlayList.find(FormOverlay).props().onConfirm();
    expect(destroySpy).toBeCalled();
    expect(reloadSpy).toBeCalled();
});

test('Should destroy ResourceFormStore when component is unmounted', () => {
    const route: Route = ({}: any);
    const router: Router = ({
        route: {
            options: {
                formKey: 'test-form-key',
            },
        },
    }: any);

    const formOverlayList = mount(<FormOverlayList route={route} router={router} />);

    // open form overlay for new item
    formOverlayList.find(List).props().onItemAdd();
    formOverlayList.update();

    const destroySpy = jest.fn();
    formOverlayList.instance().formStore.destroy = destroySpy;

    formOverlayList.unmount();
    expect(destroySpy).toBeCalled();
});
