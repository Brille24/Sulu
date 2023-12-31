// @flow
import {observable, extendObservable as mockExtendObservable, toJS, when} from 'mobx';
import ResourceFormStore from '../../stores/ResourceFormStore';
import ResourceStore from '../../../../stores/ResourceStore';
import metadataStore from '../../stores/metadataStore';
import conditionDataProviderRegistry from '../../registries/conditionDataProviderRegistry';

jest.mock('loglevel', () => ({
    warn: jest.fn(),
    info: jest.fn(),
}));

beforeEach(() => {
    conditionDataProviderRegistry.clear();
});

jest.mock('../../../../stores/ResourceStore', () => function(resourceKey, id, options) {
    this.id = id;
    this.resourceKey = resourceKey;
    this.save = jest.fn().mockReturnValue(Promise.resolve());
    this.delete = jest.fn().mockReturnValue(Promise.resolve());
    this.requestRemoteData = jest.fn().mockReturnValue(Promise.resolve());
    this.set = jest.fn(function(path, value) {
        this.data[path] = value;
    });
    this.setMultiple = jest.fn(function(data) {
        this.data = {...this.data, ...data};
    });
    this.change = jest.fn(function(path, value) {
        this.data[path] = value;
    });
    this.remove = jest.fn();
    this.changeMultiple = jest.fn(function(data) {
        this.data = {...this.data, ...data};
    });
    this.copyFromLocale = jest.fn();

    if (options) {
        this.locale = options.locale;
    }

    mockExtendObservable(this, {
        data: {},
        loading: false,
    });
});

jest.mock('../../stores/metadataStore', () => ({}));

beforeEach(() => {
    // $FlowFixMe
    metadataStore.getSchema = jest.fn().mockReturnValue(Promise.resolve({}));
    // $FlowFixMe
    metadataStore.getJsonSchema = jest.fn().mockReturnValue(Promise.resolve({}));
    // $FlowFixMe
    metadataStore.getSchemaTypes = jest.fn().mockReturnValue(Promise.resolve(null));
});

test('Create data object for schema', (done) => {
    const metadata = {
        title: {
            label: 'Title',
            type: 'text_line',
        },
        description: {
            label: 'Description',
            type: 'text_line',
        },
        'ext/seo/title': {
            label: 'Description',
            type: 'text_line',
        },
    };

    const metadataPromise = Promise.resolve(metadata);
    metadataStore.getSchema.mockReturnValue(metadataPromise);

    const resourceStore = new ResourceStore('snippets', '1');
    const resourceFormStore = new ResourceFormStore(resourceStore, 'snippets');
    expect(resourceFormStore.schemaLoading).toEqual(true);

    setTimeout(() => {
        expect(resourceFormStore.schemaLoading).toEqual(false);
        expect(resourceStore.set).not.toBeCalledWith('template', expect.anything());
        expect(resourceFormStore.data).toEqual({
            title: undefined,
            description: undefined,
            ext: {
                seo: {
                    title: undefined,
                },
            },
        });
        resourceFormStore.destroy();
        done();
    }, 0);
});

test('Read resourceKey from ResourceStore', () => {
    const resourceStore = new ResourceStore('snippets');
    const resourceFormStore = new ResourceFormStore(resourceStore, 'snippets');

    expect(resourceFormStore.resourceKey).toEqual('snippets');
});

test('Read locale from ResourceStore', () => {
    const resourceStore = new ResourceStore('snippets', '1', {locale: observable.box('en')});
    const resourceFormStore = new ResourceFormStore(resourceStore, 'snippets');

    expect(resourceFormStore.locale && resourceFormStore.locale.get()).toEqual('en');
});

test('Read id from ResourceStore', () => {
    const resourceStore = new ResourceStore('snippets', '1', {locale: observable.box('en')});
    const resourceFormStore = new ResourceFormStore(resourceStore, 'snippets');

    expect(resourceFormStore.id).toEqual('1');
});

test('Read saving flag from ResourceStore', () => {
    const resourceStore = new ResourceStore('snippets', '1', {locale: observable.box('en')});
    resourceStore.saving = true;
    const resourceFormStore = new ResourceFormStore(resourceStore, 'snippets');

    expect(resourceFormStore.saving).toEqual(true);
});

test('Read deleting flag from ResourceStore', () => {
    const resourceStore = new ResourceStore('snippets', '1', {locale: observable.box('en')});
    resourceStore.deleting = true;
    const resourceFormStore = new ResourceFormStore(resourceStore, 'snippets');

    expect(resourceFormStore.deleting).toEqual(true);
});

test('Read dirty flag from ResourceStore', () => {
    const resourceStore = new ResourceStore('snippets', '1', {locale: observable.box('en')});
    resourceStore.dirty = true;
    const resourceFormStore = new ResourceFormStore(resourceStore, 'snippets');

    expect(resourceFormStore.dirty).toEqual(true);
});

test('Set dirty flag from ResourceStore', () => {
    const resourceStore = new ResourceStore('snippets', '1', {locale: observable.box('en')});
    const resourceFormStore = new ResourceFormStore(resourceStore, 'snippets');
    resourceFormStore.dirty = true;

    expect(resourceFormStore.dirty).toEqual(true);
});

test('Create data object for schema with sections', () => {
    const metadata = {
        section1: {
            label: 'Section 1',
            type: 'section',
            items: {
                item11: {
                    label: 'Item 1.1',
                    type: 'text_line',
                },
                section11: {
                    label: 'Section 1.1',
                    type: 'section',
                },
            },
        },
        section2: {
            label: 'Section 2',
            type: 'section',
            items: {
                item21: {
                    label: 'Item 2.1',
                    type: 'text_line',
                },
            },
        },
    };

    const schemaTypesPromise = Promise.resolve(null);
    metadataStore.getSchemaTypes.mockReturnValue(schemaTypesPromise);

    const metadataPromise = Promise.resolve(metadata);
    metadataStore.getSchema.mockReturnValue(metadataPromise);

    const resourceFormStore = new ResourceFormStore(new ResourceStore('snippets', '1'), 'snippets');

    return Promise.all([schemaTypesPromise, metadataPromise]).then(() => {
        expect(resourceFormStore.data).toEqual({
            item11: undefined,
            item21: undefined,
        });
        resourceFormStore.destroy();
    });
});

test('Change schema should keep data', (done) => {
    const metadata = {
        title: {
            label: 'Title',
            type: 'text_line',
        },
        description: {
            label: 'Description',
            type: 'text_line',
        },
    };

    const resourceStore = new ResourceStore('snippets', '1');
    resourceStore.data = observable({
        title: 'Title',
        slogan: 'Slogan',
    });

    const metadataPromise = Promise.resolve(metadata);
    metadataStore.getSchema.mockReturnValue(metadataPromise);

    const resourceFormStore = new ResourceFormStore(resourceStore, 'snippets');

    setTimeout(() => {
        expect(Object.keys(resourceFormStore.data)).toHaveLength(3);
        expect(resourceFormStore.data).toEqual({
            title: 'Title',
            description: undefined,
            slogan: 'Slogan',
        });
        resourceFormStore.destroy();
        done();
    }, 0);
});

test('Change type should update schema and data', (done) => {
    const sidebarMetadata = {
        title: {
            label: 'Title',
            type: 'text_line',
        },
        description: {
            label: 'Description',
            type: 'text_line',
        },
    };
    const sidebarPromise = Promise.resolve(sidebarMetadata);
    const jsonSchemaPromise = Promise.resolve({});

    const resourceStore = new ResourceStore('snippets', '1');
    resourceStore.data = observable({
        title: 'Title',
        slogan: 'Slogan',
    });

    metadataStore.getSchema.mockReturnValue(sidebarPromise);
    metadataStore.getJsonSchema.mockReturnValue(jsonSchemaPromise);
    const resourceFormStore = new ResourceFormStore(resourceStore, 'snippets');
    const cachedPathsByTag = resourceFormStore.pathsByTag;

    setTimeout(() => {
        expect(resourceFormStore.schema).toEqual(sidebarMetadata);
        expect(resourceFormStore.pathsByTag).not.toBe(cachedPathsByTag);
        expect(resourceFormStore.data).toEqual({
            title: 'Title',
            description: undefined,
            slogan: 'Slogan',
        });
        resourceFormStore.destroy();
        done();
    }, 0);
});

test('Change schema should update data and use remoteData for invalid blocks', (done) => {
    const oldSchema = {
        title: {
            label: 'Title',
            type: 'text_line',
        },
        description: {
            label: 'Description',
            type: 'text_line',
        },
        blocks: {
            defaultType: 'headline',
            type: 'block',
            types: {
                headline: {
                    name: 'headline',
                    title: 'Headline',
                    form: {
                        title: {
                            label: 'Title',
                            type: 'text_line',
                        },
                        description: {
                            label: 'Description',
                            type: 'text_area',
                        },
                    },
                },
                textEditor: {
                    name: 'textEditor',
                    title: 'Text Editor',
                    form: {
                        text: {
                            label: 'Text',
                            type: 'text_editor',
                        },
                    },
                },
                block_in_block: {
                    name: 'block_in_block',
                    title: 'Block in Block',
                    form: {
                        inlineBlock: {
                            defaultType: 'headline',
                            type: 'block',
                            types: {
                                headline: {
                                    name: 'headline',
                                    title: 'Headline',
                                    form: {
                                        title: {
                                            label: 'Title',
                                            type: 'text_line',
                                        },
                                        description: {
                                            label: 'Description',
                                            type: 'text_area',
                                        },
                                    },
                                },
                                textBlock: {
                                    name: 'textBlock',
                                    title: 'Text Block',
                                    form: {
                                        text: {
                                            label: 'Text',
                                            type: 'text_editor',
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    };

    const newSchema = {
        title: {
            label: 'Title',
            type: 'text_line',
        },
        blocks: {
            defaultType: 'textEditor',
            type: 'block',
            types: {
                textEditor: {
                    name: 'textEditor',
                    title: 'Text Editor',
                    form: {
                        text: {
                            label: 'Text',
                            type: 'text_editor',
                        },
                    },
                },
                block_in_block: {
                    name: 'block_in_block',
                    title: 'Block in Block',
                    form: {
                        inlineBlock: {
                            defaultType: 'textBlock',
                            type: 'block',
                            types: {
                                textBlock: {
                                    name: 'textBlock',
                                    title: 'Text Block',
                                    form: {
                                        text: {
                                            label: 'Text',
                                            type: 'text_editor',
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    };
    const newSchemaPromise = Promise.resolve(newSchema);
    const jsonSchemaPromise = Promise.resolve({});

    const resourceStore = new ResourceStore('pages', '1');
    resourceStore.data = observable({
        title: 'Title',
        blocks: [
            {title: 'block1_title', description: 'block1_description', type: 'headline'},
            {title: 'block2_title', description: 'block2_description', type: 'headline'},
            {text: 'block3_text', type: 'textEditor'},
            {text: 'block4_text', type: 'textEditor'},
            {
                type: 'block_in_block',
                inlineBlock: [
                    {title: 'block_in_block1_title', description: 'block_in_block1_description', type: 'headline'},
                    {text: 'block_in_block3_text', type: 'textBlock'},
                    {text: 'block_in_block4_text', type: 'textBlock'},
                ],
            },
        ],
    });

    const remoteData = {
        title: 'Title_remote',
        blocks: [
            {text: 'block1_text_remote', type: 'textEditor'},
            {text: 'block2_text_remote', type: 'textEditor'},
            {
                type: 'block_in_block',
                inlineBlock: [
                    {
                        title: 'block_in_block1_title_remote',
                        description: 'block_in_block1_description',
                        type: 'headline',
                    },
                    {
                        title: 'block_in_block2_title_remote',
                        description: 'block_in_block2_description',
                        type: 'headline',
                    },
                    {text: 'block_in_block3_text', type: 'textBlock'},
                    {text: 'block_in_block4_text', type: 'textBlock'},
                ],
            },
        ],
    };

    // $FlowFixMe
    resourceStore.requestRemoteData.mockReturnValue(Promise.resolve(remoteData));
    metadataStore.getSchema.mockReturnValue(newSchemaPromise);
    metadataStore.getJsonSchema.mockReturnValue(jsonSchemaPromise);
    const resourceFormStore = new ResourceFormStore(resourceStore, 'pages');
    resourceFormStore.schema = oldSchema;

    setTimeout(() => {
        expect(resourceFormStore.schema).toEqual(newSchema);
        expect(resourceStore.setMultiple).toHaveBeenCalledWith({
            title: 'Title',
            blocks: [
                {text: 'block1_text_remote', type: 'textEditor'},
                {text: 'block2_text_remote', type: 'textEditor'},
                {text: 'block3_text', type: 'textEditor'},
                {text: 'block4_text', type: 'textEditor'},
                {
                    type: 'block_in_block',
                    inlineBlock: [
                        {
                            description: 'block_in_block1_description',
                            title: 'block_in_block1_title',
                            type: 'headline',
                        },
                        {text: 'block_in_block3_text', type: 'textBlock'},
                        {text: 'block_in_block4_text', type: 'textBlock'},
                    ],
                },
            ],
        });
        resourceFormStore.destroy();
        done();
    }, 0);
});

test('Change schema should update data and use default-type for unknown block types', (done) => {
    const oldSchema = {
        title: {
            label: 'Title',
            type: 'text_line',
        },
        blocks: {
            defaultType: 'headline',
            type: 'block',
            types: {
                headline: {
                    name: 'headline',
                    title: 'Headline',
                    form: {
                        title: {
                            label: 'Title',
                            type: 'text_line',
                        },
                    },
                },
                description: {
                    name: 'description',
                    title: 'Description',
                    form: {
                        description: {
                            label: 'Description',
                            type: 'text_area',
                        },
                    },
                },
            },
        },
    };

    const newSchema = {
        title: {
            label: 'Title',
            type: 'text_line',
        },
        blocks: {
            defaultType: 'description',
            type: 'block',
            types: {
                description: {
                    name: 'description',
                    title: 'Description',
                    form: {
                        description: {
                            label: 'Description',
                            type: 'text_area',
                        },
                    },
                },
            },
        },
    };
    const newSchemaPromise = Promise.resolve(newSchema);
    const jsonSchemaPromise = Promise.resolve({});

    const resourceStore = new ResourceStore('pages', '1');
    resourceStore.data = observable({
        title: 'Title',
        blocks: [
            {title: 'block1_title', type: 'headline'},
            {title: 'block2_title', type: 'headline'},
        ],
    });

    const remoteData = {
        title: 'Title',
        blocks: [
            {title: 'block1_description', type: 'description'},
            {title: 'block2_description', type: 'description'},
        ],
    };

    // $FlowFixMe
    resourceStore.requestRemoteData.mockReturnValue(Promise.resolve(remoteData));
    metadataStore.getSchema.mockReturnValue(newSchemaPromise);
    metadataStore.getJsonSchema.mockReturnValue(jsonSchemaPromise);
    const resourceFormStore = new ResourceFormStore(resourceStore, 'pages');
    resourceFormStore.schema = oldSchema;

    setTimeout(() => {
        expect(resourceFormStore.schema).toEqual(newSchema);
        expect(resourceStore.setMultiple).toHaveBeenCalledWith({
            title: 'Title',
            blocks: [
                {
                    description: undefined,
                    type: 'description',
                },
                {
                    description: undefined,
                    type: 'description',
                },
            ],
        });
        resourceFormStore.destroy();
        done();
    }, 0);
});

test('Change schema should merge locale and remote data', (done) => {
    const newSchema = {
        title: {
            label: 'Title',
            type: 'text_line',
        },
        description: {
            label: 'Description',
            type: 'text_line',
        },
        blocks: {
            defaultType: 'headline',
            type: 'block',
            types: {
                headline: {
                    name: 'headline',
                    title: 'Headline',
                    form: {
                        title: {
                            label: 'Title',
                            type: 'text_line',
                        },
                    },
                },
                description: {
                    name: 'description',
                    title: 'Description',
                    form: {
                        description: {
                            label: 'Description',
                            type: 'text_area',
                        },
                    },
                },
            },
        },
    };

    const oldSchema = {
        title: {
            label: 'Title',
            type: 'text_line',
        },
    };
    const newSchemaPromise = Promise.resolve(newSchema);
    const jsonSchemaPromise = Promise.resolve({});

    const resourceStore = new ResourceStore('pages', '1');
    resourceStore.data = observable({
        title: 'Title',
    });

    const remoteData = {
        title: 'Title',
        description: 'Origin Description',
        blocks: [
            {title: 'block1_title', type: 'headline'},
            {title: 'block2_title', type: 'headline'},
            {description: 'block3_description', type: 'description'},
            {description: 'block4_description', type: 'description'},
        ],
    };

    // $FlowFixMe
    resourceStore.requestRemoteData.mockReturnValue(Promise.resolve(remoteData));
    metadataStore.getSchema.mockReturnValue(newSchemaPromise);
    metadataStore.getJsonSchema.mockReturnValue(jsonSchemaPromise);
    const resourceFormStore = new ResourceFormStore(resourceStore, 'pages');
    resourceFormStore.schema = oldSchema;

    setTimeout(() => {
        expect(resourceFormStore.schema).toEqual(newSchema);
        expect(resourceStore.setMultiple).toHaveBeenNthCalledWith(1,
            {
                title: 'Title',
                description: 'Origin Description',
                blocks: [
                    {title: 'block1_title', type: 'headline'},
                    {title: 'block2_title', type: 'headline'},
                    {description: 'block3_description', type: 'description'},
                    {description: 'block4_description', type: 'description'},
                ],
            }
        );
        resourceFormStore.destroy();
        done();
    }, 0);
});

test('Change schema should merge current and origin data partially in block', (done) => {
    const oldSchema = {
        title: {
            label: 'Title',
            type: 'text_line',
        },
        blocks: {
            defaultType: 'headline',
            type: 'block',
            types: {
                headline: {
                    name: 'headline',
                    title: 'Headline',
                    form: {
                        title: {
                            label: 'Title',
                            type: 'text_line',
                        },
                    },
                },
            },
        },
    };

    const newSchema = {
        title: {
            label: 'Title',
            type: 'text_line',
        },
        description: {
            label: 'Description',
            type: 'text_line',
        },
        blocks: {
            defaultType: 'headline',
            type: 'block',
            types: {
                headline: {
                    name: 'headline',
                    title: 'Headline',
                    form: {
                        title: {
                            label: 'Title',
                            type: 'text_line',
                        },
                    },
                },
                description: {
                    name: 'description',
                    title: 'Description',
                    form: {
                        description: {
                            label: 'Description',
                            type: 'text_area',
                        },
                    },
                },
            },
        },
    };

    const newSchemaPromise = Promise.resolve(newSchema);
    const jsonSchemaPromise = Promise.resolve({});

    const resourceStore = new ResourceStore('pages', '1');
    resourceStore.data = observable({
        title: 'Title',
        blocks: [
            {title: 'block1_title', type: 'headline'},
            {title: 'block2_title', type: 'headline'},
        ],
    });

    const remoteData = {
        title: 'Title',
        description: 'Origin Description',
        blocks: [
            {title: 'block1_title', type: 'headline'},
            {title: 'block2_title', type: 'headline'},
            {description: 'block3_description_origin', type: 'description'},
            {description: 'block4_description_origin', type: 'description'},
        ],
    };

    // $FlowFixMe
    resourceStore.requestRemoteData.mockReturnValue(Promise.resolve(remoteData));
    metadataStore.getSchema.mockReturnValue(newSchemaPromise);
    metadataStore.getJsonSchema.mockReturnValue(jsonSchemaPromise);
    const resourceFormStore = new ResourceFormStore(resourceStore, 'pages');
    resourceFormStore.schema = oldSchema;

    setTimeout(() => {
        expect(resourceFormStore.schema).toEqual(newSchema);
        expect(resourceStore.setMultiple).toHaveBeenCalledWith( {
            title: 'Title',
            description: 'Origin Description',
            blocks: [
                {title: 'block1_title', type: 'headline'},
                {title: 'block2_title', type: 'headline'},
                {description: 'block3_description_origin', type: 'description'},
                {description: 'block4_description_origin', type: 'description'},
            ],
        } );
        resourceFormStore.destroy();
        done();
    }, 0);
});

test('Change schema should merge current and origin data partially block in blocks', (done) => {
    const oldSchema = {
        title: {
            label: 'Title',
            type: 'text_line',
        },
        description: {
            label: 'Description',
            type: 'text_line',
        },
        blocks: {
            defaultType: 'headline',
            type: 'block',
            types: {
                headline: {
                    name: 'headline',
                    title: 'Headline',
                    form: {
                        title: {
                            label: 'Title',
                            type: 'text_line',
                        },
                        description: {
                            label: 'Description',
                            type: 'text_area',
                        },
                    },
                },
                textEditor: {
                    name: 'textEditor',
                    title: 'Text Editor',
                    form: {
                        text: {
                            label: 'Text',
                            type: 'text_editor',
                        },
                    },
                },
                block_in_block: {
                    name: 'block_in_block',
                    title: 'Block in Block',
                    form: {
                        inlineBlock: {
                            defaultType: 'headline',
                            type: 'block',
                            types: {
                                headline: {
                                    name: 'headline',
                                    title: 'Headline',
                                    form: {
                                        title: {
                                            label: 'Title',
                                            type: 'text_line',
                                        },
                                        description: {
                                            label: 'Description',
                                            type: 'text_area',
                                        },
                                    },
                                },
                                textBlock: {
                                    name: 'textBlock',
                                    title: 'Text Block',
                                    form: {
                                        text: {
                                            label: 'Text',
                                            type: 'text_editor',
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    };

    const newSchema = {
        title: {
            label: 'Title',
            type: 'text_line',
        },
        description: {
            label: 'Description',
            type: 'text_line',
        },
        blocks: {
            defaultType: 'headline',
            type: 'block',
            types: {
                headline: {
                    name: 'headline',
                    title: 'Headline',
                    form: {
                        title: {
                            label: 'Title',
                            type: 'text_line',
                        },
                        description: {
                            label: 'Description',
                            type: 'text_area',
                        },
                    },
                },
                textEditor: {
                    name: 'textEditor',
                    title: 'Text Editor',
                    form: {
                        text: {
                            label: 'Text',
                            type: 'text_editor',
                        },
                    },
                },
                block_in_block: {
                    name: 'block_in_block',
                    title: 'Block in Block',
                    form: {
                        inlineBlock: {
                            defaultType: 'headline',
                            type: 'block',
                            types: {
                                headline: {
                                    name: 'headline',
                                    title: 'Headline',
                                    form: {
                                        title: {
                                            label: 'Title',
                                            type: 'text_line',
                                        },
                                        description: {
                                            label: 'Description',
                                            type: 'text_area',
                                        },
                                    },
                                },
                                textBlock: {
                                    name: 'textBlock',
                                    title: 'Text Block',
                                    form: {
                                        text: {
                                            label: 'Text',
                                            type: 'text_editor',
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    };

    const newSchemaPromise = Promise.resolve(newSchema);
    const jsonSchemaPromise = Promise.resolve({});

    const resourceStore = new ResourceStore('pages', '1');
    resourceStore.data = observable({
        title: 'Title',
        blocks: [
            {title: 'block1_title', description: 'block1_description', type: 'headline'},
            {text: 'block4_text', type: 'textEditor'},
            {
                type: 'block_in_block',
                inlineBlock: [
                    {text: 'block_in_block4_text', type: 'textBlock'},
                ],
            },
        ],
    });

    const remoteData = {
        title: 'Title',
        blocks: [
            {title: 'block1_title_remote', description: 'block1_description_remote', type: 'headline'},
            {title: 'block2_title_remote', description: 'block2_description_remote', type: 'headline'},
            {text: 'block3_text_remote', type: 'textEditor'},
            {text: 'block4_text_remote', type: 'textEditor'},
            {
                type: 'block_in_block',
                inlineBlock: [
                    {
                        title: 'block_in_block1_title_remote',
                        description: 'block_in_block1_description',
                        type: 'headline',
                    },
                    {
                        title: 'block_in_block2_title_remote',
                        description: 'block_in_block2_description',
                        type: 'headline',
                    },
                    {text: 'block_in_block3_text_remote', type: 'textBlock'},
                    {text: 'block_in_block4_text_remote', type: 'textBlock'},
                ],
            },
        ],
    };

    // $FlowFixMe
    resourceStore.requestRemoteData.mockReturnValue(Promise.resolve(remoteData));
    metadataStore.getSchema.mockReturnValue(newSchemaPromise);
    metadataStore.getJsonSchema.mockReturnValue(jsonSchemaPromise);
    const resourceFormStore = new ResourceFormStore(resourceStore, 'pages');
    resourceFormStore.schema = oldSchema;

    setTimeout(() => {
        expect(resourceFormStore.schema).toEqual(newSchema);
        expect(resourceStore.setMultiple).toHaveBeenCalledWith( {
            description: undefined,
            title: 'Title',
            blocks: [
                {title: 'block1_title', description: 'block1_description', type: 'headline'},
                {text: 'block4_text', type: 'textEditor'},
                {
                    type: 'block_in_block',
                    inlineBlock: [
                        {text: 'block_in_block4_text', type: 'textBlock'},
                    ],
                },
                {text: 'block4_text_remote', type: 'textEditor'},
                {
                    type: 'block_in_block',
                    inlineBlock: [
                        {
                            title: 'block_in_block1_title_remote',
                            description: 'block_in_block1_description',
                            type: 'headline',
                        },
                        {
                            title: 'block_in_block2_title_remote',
                            description: 'block_in_block2_description',
                            type: 'headline',
                        },
                        {text: 'block_in_block3_text_remote', type: 'textBlock'},
                        {text: 'block_in_block4_text_remote', type: 'textBlock'},
                    ],
                },
            ],
        });
        resourceFormStore.destroy();
        done();
    }, 0);
});

test('Change type should throw an error if no types are available', () => {
    const promise = Promise.resolve({});
    metadataStore.getSchema.mockReturnValue(promise);

    const resourceStore = new ResourceStore('snippets', '1');
    const resourceFormStore = new ResourceFormStore(resourceStore, 'snippets');

    return promise.then(() => {
        expect(() => resourceFormStore.changeType('test')).toThrow(/cannot handle types/);
    });
});

test('types property should be returning types from server', () => {
    const types = {
        sidebar: {key: 'sidebar', title: 'Sidebar'},
        footer: {key: 'footer', title: 'Footer'},
    };
    const promise = Promise.resolve({defaultType: 'sidebar', types});
    metadataStore.getSchemaTypes.mockReturnValue(promise);

    const resourceFormStore = new ResourceFormStore(new ResourceStore('snippets', '1'), 'snippets');
    expect(toJS(resourceFormStore.types)).toEqual({});
    expect(resourceFormStore.typesLoading).toEqual(true);

    return promise.then(() => {
        expect(toJS(resourceFormStore.types)).toEqual(types);
        expect(resourceFormStore.typesLoading).toEqual(false);
        resourceFormStore.destroy();
    });
});

test('type property should be returning type from ResourceStore', () => {
    const resourceStore = new ResourceStore('snippets', '1');
    resourceStore.data = observable({
        template: 'sidebar',
    });

    const schemaTypesPromise = Promise.resolve({
        defaultType: 'sidebar',
        types: {
            sidebar: {},
            other: {},
        },
    });
    metadataStore.getSchemaTypes.mockReturnValue(schemaTypesPromise);
    const resourceFormStore = new ResourceFormStore(resourceStore, 'snippets');

    return schemaTypesPromise.then(() => {
        expect(resourceFormStore.type).toEqual('sidebar');
    });
});

test('type property should return undefined if ResourceStore has a type but schema does not include any types', () => {
    const resourceStore = new ResourceStore('snippets', '1');
    resourceStore.data = observable({
        template: 'sidebar',
    });

    const schemaTypesPromise = Promise.resolve({
        defaultType: 'sidebar',
        types: undefined,
    });
    metadataStore.getSchemaTypes.mockReturnValue(schemaTypesPromise);
    const resourceFormStore = new ResourceFormStore(resourceStore, 'snippets');

    return schemaTypesPromise.then(() => {
        expect(resourceFormStore.type).toBeUndefined();
    });
});

test('Changing type should set the appropriate property in the ResourceStore', () => {
    const resourceStore = new ResourceStore('snippets', '1');
    resourceStore.data = observable({
        template: 'sidebar',
    });

    const schemaTypesPromise = Promise.resolve({
        defaultType: 'sidebar',
        types: {
            sidebar: {},
            footer: {},
        },
    });
    metadataStore.getSchemaTypes.mockReturnValue(schemaTypesPromise);

    const metadataPromise = Promise.resolve({});
    metadataStore.getSchema.mockReturnValue(metadataPromise);

    const resourceFormStore = new ResourceFormStore(resourceStore, 'snippets');

    return metadataPromise.then(() => {
        expect(resourceStore.change).not.toBeCalled();

        resourceFormStore.changeType('footer');

        expect(resourceStore.change).toBeCalledWith('template', 'footer');
        expect(resourceFormStore.type).toEqual('footer');
    });
});

test('Changing type should throw an exception if types are not supported', () => {
    const resourceStore = new ResourceStore('snippets', '1');

    const schemaTypesPromise = Promise.resolve(null);
    metadataStore.getSchemaTypes.mockReturnValue(schemaTypesPromise);

    const resourceFormStore = new ResourceFormStore(resourceStore, 'snippets');

    return schemaTypesPromise.then(() => {
        expect(() => resourceFormStore.changeType('sidebar'))
            .toThrow(/"snippets" handled by this ResourceFormStore cannot handle types/);
    });
});

test('Loading flag should be set to true as long as schema is loading', () => {
    const resourceFormStore = new ResourceFormStore(
        new ResourceStore('snippets', '1', {locale: observable.box()}),
        'snippets'
    );
    resourceFormStore.resourceStore.loading = false;

    expect(resourceFormStore.loading).toBe(true);
    resourceFormStore.destroy();
});

test('Loading flag should be set to true as long as data is loading', () => {
    const resourceFormStore = new ResourceFormStore(
        new ResourceStore('snippets', '1', {locale: observable.box()}),
        'snippets'
    );
    resourceFormStore.resourceStore.loading = true;
    resourceFormStore.schemaLoading = false;

    expect(resourceFormStore.loading).toBe(true);
    resourceFormStore.destroy();
});

test('Loading flag should be set to false after data and schema have been loading', () => {
    const resourceFormStore = new ResourceFormStore(
        new ResourceStore('snippets', '1', {locale: observable.box()}),
        'snippets'
    );
    resourceFormStore.resourceStore.loading = false;
    resourceFormStore.schemaLoading = false;

    expect(resourceFormStore.loading).toBe(false);
    resourceFormStore.destroy();
});

test('Loading flag should be set to false after types have been loaded but currently set type is invalid', () => {
    const types = {
        sidebar: {key: 'sidebar', title: 'Sidebar'},
    };
    const promise = Promise.resolve({defaultType: 'sidebar', types});
    metadataStore.getSchemaTypes.mockReturnValue(promise);

    const resourceStore = new ResourceStore('snippets', '1');
    resourceStore.data.template = 'not-existing';
    const resourceFormStore = new ResourceFormStore(resourceStore, 'snippets');
    expect(toJS(resourceFormStore.types)).toEqual({});
    expect(resourceFormStore.typesLoading).toEqual(true);

    return promise.then(() => {
        expect(toJS(resourceFormStore.types)).toEqual(types);
        expect(resourceFormStore.loading).toEqual(false);
        resourceFormStore.destroy();
    });
});

test.each([true, false])('Forbidden flag should be set as %s', (forbidden) => {
    const resourceStore = new ResourceStore('snippets', '1', {locale: observable.box()});
    const resourceFormStore = new ResourceFormStore(resourceStore, 'snippets');

    resourceStore.forbidden = forbidden;

    expect(resourceFormStore.forbidden).toBe(forbidden);
    resourceFormStore.destroy();
});

test('Save the store should call the resourceStore save function', () => {
    const resourceFormStore = new ResourceFormStore(
        new ResourceStore('snippets', '3', {locale: observable.box()}),
        'snippets'
    );

    resourceFormStore.save();
    expect(resourceFormStore.resourceStore.save).toBeCalledWith({});
    resourceFormStore.destroy();
});

test('Save the store should call the resourceStore save function with the passed options', () => {
    const resourceFormStore = new ResourceFormStore(
        new ResourceStore('snippets', '3', {locale: observable.box()}),
        'snippets',
        {option1: 'value1', option2: 'value2'}
    );

    resourceFormStore.save({option: 'value'});
    expect(resourceFormStore.resourceStore.save)
        .toBeCalledWith({option: 'value', option1: 'value1', option2: 'value2'});
    resourceFormStore.destroy();
});

test('Save the store should reject if request has failed', (done) => {
    const jsonSchemaPromise = Promise.resolve({});
    metadataStore.getJsonSchema.mockReturnValue(jsonSchemaPromise);

    const resourceStore = new ResourceStore('snippets', '3');
    const error = {
        text: 'Something failed',
    };
    const errorResponse = {
        json: jest.fn().mockReturnValue(Promise.resolve(error)),
    };
    resourceStore.save.mockReturnValue(Promise.reject(errorResponse));
    const resourceFormStore = new ResourceFormStore(resourceStore, 'snippets');

    resourceStore.data = observable({
        blocks: [
            {
                text: 'Test',
            },
            {
                text: 'T',
            },
        ],
    });

    when(
        () => !resourceFormStore.schemaLoading,
        (): void => {
            const savePromise = resourceFormStore.save();
            savePromise.catch(() => {
                expect(toJS(resourceFormStore.errors)).toEqual({});
            });

            // $FlowFixMe
            expect(savePromise).rejects.toEqual(error).then(() => done());
        }
    );
});

test('Validate should return true if no errors occured', (done) => {
    const jsonSchemaPromise = Promise.resolve({
        type: 'object',
        required: ['title'],
    });
    metadataStore.getJsonSchema.mockReturnValue(jsonSchemaPromise);

    const resourceStore = new ResourceStore('snippets', '3');
    const resourceFormStore = new ResourceFormStore(resourceStore, 'snippets');

    resourceStore.data = observable({
        title: 'Test',
    });

    when(
        () => !resourceFormStore.schemaLoading,
        (): void => {
            expect(resourceFormStore.validate()).toEqual(true);
            expect(resourceFormStore.hasErrors).toEqual(false);
            done();
        }
    );
});

test('Validate should return false if errors occured', (done) => {
    const jsonSchemaPromise = Promise.resolve({
        type: 'object',
        required: ['title'],
    });
    metadataStore.getJsonSchema.mockReturnValue(jsonSchemaPromise);

    const resourceStore = new ResourceStore('snippets', '3');
    const resourceFormStore = new ResourceFormStore(resourceStore, 'snippets');

    resourceStore.data = observable({});
    when(
        () => !resourceFormStore.schemaLoading,
        (): void => {
            expect(resourceFormStore.validate()).toEqual(false);
            expect(resourceFormStore.hasErrors).toEqual(true);
            done();
        }
    );
});

test('Validate should not return incorrect errors', (done) => {
    // This test ensures that https://github.com/sulu/sulu/issues/5709 has been fixed

    const jsonSchemaPromise = Promise.resolve({
        type: 'object',
        properties: {
            blocks: {
                type: 'array',
                items: {
                    allOf: [
                        {
                            if: {
                                type: 'object',
                                properties: {
                                    type: {
                                        const: 'text',
                                    },
                                },
                            },
                            then: {
                                type: 'object',
                                required: ['text'],
                            },
                        },
                        {
                            if: {
                                type: 'object',
                                properties: {
                                    type: {
                                        const: 'image',
                                    },
                                },
                            },
                            then: {
                                type: 'object',
                                required: ['title'],
                            },
                        },
                    ],
                },
            },
        },
    });
    metadataStore.getJsonSchema.mockReturnValue(jsonSchemaPromise);

    const resourceStore = new ResourceStore('snippets', '3');
    const resourceFormStore = new ResourceFormStore(resourceStore, 'snippets');

    resourceStore.data = observable({
        blocks: [
            {
                type: 'text',
                text: undefined,
            },
            {
                type: 'image',
                title: 'this is block 2',
            },
        ],
    });

    when(
        () => !resourceFormStore.schemaLoading,
        (): void => {
            expect(resourceFormStore.validate()).toEqual(false);
            expect(toJS(resourceFormStore.errors.blocks)[0]).toHaveProperty('text');
            expect(toJS(resourceFormStore.errors.blocks)[0]).not.toHaveProperty('title');
            expect(toJS(resourceFormStore.errors.blocks)[0]).not.toHaveProperty('type');
            done();
        }
    );
});

test('Save the store should validate the current data and an oneOf', (done) => {
    const jsonSchemaPromise = Promise.resolve({
        type: 'object',
        required: ['title', 'blocks'],
        properties: {
            blocks: {
                type: 'array',
                items: {
                    type: 'object',
                    oneOf: [
                        {
                            type: 'object',
                            properties: {
                                text: {
                                    type: 'string',
                                    minLength: 3,
                                },
                            },
                        },
                    ],
                },
            },
        },
    });
    metadataStore.getJsonSchema.mockReturnValue(jsonSchemaPromise);

    const resourceStore = new ResourceStore('snippets', '3');
    const resourceFormStore = new ResourceFormStore(resourceStore, 'snippets');

    resourceStore.data = observable({
        blocks: [
            {
                text: 'Test',
            },
            {
                text: 'T',
            },
        ],
    });

    when(
        () => !resourceFormStore.schemaLoading,
        (): void => {
            const savePromise = resourceFormStore.save();
            savePromise.catch(() => {
                expect(toJS(resourceFormStore.errors)).toEqual({
                    title: {
                        keyword: 'required',
                        parameters: {
                            missingProperty: 'title',
                        },
                    },
                    blocks: [
                        undefined,
                        {
                            text: {
                                keyword: 'minLength',
                                parameters: {
                                    limit: 3,
                                },
                            },
                        },
                    ],
                });
            });

            // $FlowFixMe
            expect(savePromise).rejects.toEqual(expect.any(String)).then(() => done());
        }
    );
});

test('Save the store should validate the current data and an anyOf', (done) => {
    const jsonSchemaPromise = Promise.resolve({
        type: 'object',
        required: ['title', 'blocks'],
        properties: {
            blocks: {
                type: 'array',
                items: {
                    type: 'object',
                    anyOf: [
                        {
                            properties: {
                                text: {
                                    type: 'string',
                                    minLength: 3,
                                },
                            },
                        },
                    ],
                },
            },
        },
    });
    metadataStore.getJsonSchema.mockReturnValue(jsonSchemaPromise);

    const resourceStore = new ResourceStore('snippets', '3');
    const resourceFormStore = new ResourceFormStore(resourceStore, 'snippets');

    resourceStore.data = observable({
        blocks: [
            {
                text: 'Test',
            },
            {
                text: 'T',
            },
        ],
    });

    when(
        () => !resourceFormStore.schemaLoading,
        (): void => {
            const savePromise = resourceFormStore.save();
            savePromise.catch(() => {
                expect(toJS(resourceFormStore.errors)).toEqual({
                    title: {
                        keyword: 'required',
                        parameters: {
                            missingProperty: 'title',
                        },
                    },
                    blocks: [
                        undefined,
                        {
                            text: {
                                keyword: 'minLength',
                                parameters: {
                                    limit: 3,
                                },
                            },
                        },
                    ],
                });
            });

            // $FlowFixMe
            expect(savePromise).rejects.toEqual(expect.any(String)).then(() => done());
        }
    );
});

test('Save the store should validate the current data and skip type errors', (done) => {
    const jsonSchemaPromise = Promise.resolve({
        type: 'object',
        properties: {
            images: {
                anyOf: [
                    {
                        type: 'null',
                    },
                    {
                        type: 'object',
                        properties: {
                            ids: {
                                anyOf: [
                                    {
                                        type: 'array',
                                        maxItems: 0,
                                    },
                                    {
                                        type: 'array',
                                        items: {
                                            type: 'number',
                                        },
                                        minItems: 2,
                                        maxItems: 2,
                                        uniqueItems: true,
                                    },
                                ],
                            },
                            displayOption: {
                                type: 'string',
                            },
                        },
                    },
                ],
            },
        },
    });
    metadataStore.getJsonSchema.mockReturnValue(jsonSchemaPromise);

    const resourceStore = new ResourceStore('snippets', '3');
    const resourceFormStore = new ResourceFormStore(resourceStore, 'snippets');

    resourceStore.data = observable({
        images: {
            ids: [
                1,
            ],
            displayOption: undefined,
        },
    });

    when(
        () => !resourceFormStore.schemaLoading,
        (): void => {
            const savePromise = resourceFormStore.save();
            savePromise.catch(() => {
                expect(toJS(resourceFormStore.errors)).toEqual({
                    images: {
                        ids: {
                            keyword: 'minItems',
                            parameters: {
                                limit: 2,
                            },
                        },
                        // if "type" wouldn't be skipped, there would be `keyword: 'type'` here,
                        // which would have precendence over 'minItems'.
                    },
                });
            });

            // $FlowFixMe
            expect(savePromise).rejects.toEqual(expect.any(String)).then(() => done());
        }
    );
});

test('Delete should delegate the call to resourceStore', () => {
    const deletePromise = Promise.resolve();
    const resourceStore = new ResourceStore('snippets', 3);
    resourceStore.delete.mockReturnValue(deletePromise);

    const resourceFormStore = new ResourceFormStore(resourceStore, 'snippets');
    const returnedDeletePromise = resourceFormStore.delete();

    expect(resourceStore.delete).toBeCalledWith({});
    expect(returnedDeletePromise).toBe(deletePromise);
});

test('Delete should delegate the call to resourceStore with options', () => {
    const deletePromise = Promise.resolve();
    const resourceStore = new ResourceStore('snippets', 3);
    resourceStore.delete.mockReturnValue(deletePromise);

    const resourceFormStore = new ResourceFormStore(resourceStore, 'snippets', {webspace: 'sulu_io'});
    const returnedDeletePromise = resourceFormStore.delete({force: true});

    expect(resourceStore.delete).toBeCalledWith({force: true, webspace: 'sulu_io'});
    expect(returnedDeletePromise).toBe(deletePromise);
});

test('Data attribute should return the data from the resourceStore', () => {
    const resourceFormStore = new ResourceFormStore(new ResourceStore('snippets', '3'), 'snippets');
    resourceFormStore.resourceStore.data = observable({
        title: 'Title',
    });

    expect(resourceFormStore.data).toBe(resourceFormStore.resourceStore.data);
    resourceFormStore.destroy();
});

test('Set should be passed to resourceStore', () => {
    const resourceFormStore = new ResourceFormStore(new ResourceStore('snippets', '3'), 'snippets');
    resourceFormStore.set('title', 'Title');

    expect(resourceFormStore.resourceStore.set).toBeCalledWith('title', 'Title');
    resourceFormStore.destroy();
});

test('SetMultiple should be passed to resourceStore', () => {
    const resourceFormStore = new ResourceFormStore(new ResourceStore('snippets', '3'), 'snippets');
    const data = {
        title: 'Title',
        description: 'Description',
    };
    resourceFormStore.setMultiple(data);

    expect(resourceFormStore.resourceStore.setMultiple).toBeCalledWith(data);
    resourceFormStore.destroy();
});

test('Should call change method of ResourceStore', () => {
    const resourceFormStore = new ResourceFormStore(new ResourceStore('snippets', '3'), 'snippets');
    resourceFormStore.change('title', 'Title');

    expect(resourceFormStore.resourceStore.change).toBeCalledWith('title', 'Title');
    resourceFormStore.destroy();
});

test('Should call set method of ResourceStore for server data', () => {
    const resourceFormStore = new ResourceFormStore(new ResourceStore('snippets', '3'), 'snippets');
    resourceFormStore.change('title', 'Title', {isDefaultValue: true});

    expect(resourceFormStore.resourceStore.set).toBeCalledWith('title', 'Title');
    resourceFormStore.destroy();
});

test('Should call set method of ResourceStore for default data', () => {
    const resourceFormStore = new ResourceFormStore(new ResourceStore('snippets', '3'), 'snippets');
    resourceFormStore.change('title', 'Title', {isDefaultValue: true});

    expect(resourceFormStore.resourceStore.set).toBeCalledWith('title', 'Title');
    resourceFormStore.destroy();
});

test('Should call changeMultiple method of ResourceStore', () => {
    const resourceFormStore = new ResourceFormStore(new ResourceStore('snippets', '3'), 'snippets');
    resourceFormStore.changeMultiple({title: 'test1', description: 'test2'});

    expect(resourceFormStore.resourceStore.changeMultiple).toBeCalledWith({title: 'test1', description: 'test2'});
    resourceFormStore.destroy();
});

test('Should call setMultiple method of ResourceStore for server data', () => {
    const resourceFormStore = new ResourceFormStore(new ResourceStore('snippets', '3'), 'snippets');
    resourceFormStore.changeMultiple({title: 'test1', description: 'test2'}, {isDefaultValue: true});

    expect(resourceFormStore.resourceStore.setMultiple).toBeCalledWith({title: 'test1', description: 'test2'});
    resourceFormStore.destroy();
});

test('Should call setMultiple method of ResourceStore for default data', () => {
    const resourceFormStore = new ResourceFormStore(new ResourceStore('snippets', '3'), 'snippets');
    resourceFormStore.changeMultiple({title: 'test1', description: 'test2'}, {isDefaultValue: true});

    expect(resourceFormStore.resourceStore.setMultiple).toBeCalledWith({title: 'test1', description: 'test2'});
    resourceFormStore.destroy();
});

test('Destroying the store should call all the disposers', () => {
    const resourceFormStore = new ResourceFormStore(new ResourceStore('snippets', '2'), 'snippets');
    resourceFormStore.schemaDisposer = jest.fn();

    resourceFormStore.destroy();

    expect(resourceFormStore.schemaDisposer).toBeCalled();
});

test('Destroying the store should not fail if no disposers are available', () => {
    const resourceFormStore = new ResourceFormStore(new ResourceStore('snippets', '2'), 'snippets');
    resourceFormStore.schemaDisposer = undefined;

    resourceFormStore.destroy();
});

test('Should return value for property path', () => {
    const resourceStore = new ResourceStore('test', 3);
    resourceStore.data = observable({test: 'value'});

    const resourceFormStore = new ResourceFormStore(resourceStore, 'snippets');

    expect(resourceFormStore.getValueByPath('/test')).toEqual('value');
});

test('Return all the values for a given tag', () => {
    const resourceStore = new ResourceStore('test', 3);
    resourceStore.data = observable({
        title: 'Value 1',
        description: 'Value 2',
        flag: true,
    });

    const resourceFormStore = new ResourceFormStore(resourceStore, 'snippets');
    resourceFormStore.schema = {
        title: {
            tags: [
                {name: 'sulu.resource_locator_part'},
            ],
            type: 'text_line',
        },
        description: {
            tags: [
                {name: 'sulu.resource_locator_part'},
            ],
            type: 'text_area',
        },
        flag: {
            type: 'checkbox',
            tags: [
                {name: 'sulu.other'},
            ],
        },
    };

    expect(resourceFormStore.getValuesByTag('sulu.resource_locator_part')).toEqual(['Value 1', 'Value 2']);
});

test('Return all the values for a given tag sorted by priority', () => {
    const resourceStore = new ResourceStore('test', 3);
    resourceStore.data = observable({
        title: 'Value 1',
        description: 'Value 2',
        flag: true,
    });

    const resourceFormStore = new ResourceFormStore(resourceStore, 'snippets');
    resourceFormStore.schema = {
        title: {
            tags: [
                {name: 'sulu.resource_locator_part', priority: 10},
            ],
            type: 'text_line',
        },
        description: {
            tags: [
                {name: 'sulu.resource_locator_part', priority: 100},
            ],
            type: 'text_area',
        },
        flag: {
            type: 'checkbox',
        },
    };

    expect(resourceFormStore.getValuesByTag('sulu.resource_locator_part')).toEqual(['Value 2', 'Value 1']);
});

test('Return all the values for a given tag within sections', () => {
    const resourceStore = new ResourceStore('test', 3);
    resourceStore.data = observable({
        title: 'Value 1',
        description: 'Value 2',
        flag: true,
        article: 'Value 3',
    });

    const resourceFormStore = new ResourceFormStore(resourceStore, 'snippets');
    resourceFormStore.schema = {
        highlight: {
            items: {
                title: {
                    tags: [
                        {name: 'sulu.resource_locator_part'},
                    ],
                    type: 'text_line',
                },
                description: {
                    tags: [
                        {name: 'sulu.resource_locator_part'},
                    ],
                    type: 'text_area',
                },
                flag: {
                    type: 'checkbox',
                },
            },
            type: 'section',
        },
        article: {
            tags: [
                {name: 'sulu.resource_locator_part'},
            ],
            type: 'text_area',
        },
    };

    expect(resourceFormStore.getValuesByTag('sulu.resource_locator_part')).toEqual(['Value 1', 'Value 2', 'Value 3']);
});

test('Return all the values for a given tag with empty blocks', () => {
    const resourceStore = new ResourceStore('test', 3);
    resourceStore.data = observable({
        title: 'Value 1',
        description: 'Value 2',
    });

    const resourceFormStore = new ResourceFormStore(resourceStore, 'snippets');
    resourceFormStore.schema = {
        title: {
            tags: [
                {name: 'sulu.resource_locator_part'},
            ],
            type: 'text_line',
        },
        description: {
            type: 'text_area',
        },
        block: {
            type: 'block',
            types: {
                default: {
                    form: {
                        text: {
                            tags: [
                                {name: 'sulu.resource_locator_part'},
                            ],
                            type: 'text_line',
                        },
                        description: {
                            type: 'text_line',
                        },
                    },
                    title: 'Default',
                },
            },
        },
    };

    expect(resourceFormStore.getValuesByTag('sulu.resource_locator_part')).toEqual(['Value 1']);
});

test('Return all the values for a given tag within blocks', () => {
    const resourceStore = new ResourceStore('test', 3);
    resourceStore.data = observable({
        title: 'Value 1',
        description: 'Value 2',
        block: [
            {type: 'default', text: 'Block 1', description: 'Block Description 1'},
            {type: 'default', text: 'Block 2', description: 'Block Description 2'},
            {type: 'other', text: 'Block 3', description: 'Block Description 2'},
        ],
        image_map: {
            hotspots: [
                {type: 'default', text: 'Image Map', description: 'Image Map Description 1'},
            ],
        },
    });

    const resourceFormStore = new ResourceFormStore(resourceStore, 'snippets');
    resourceFormStore.schema = {
        title: {
            tags: [
                {name: 'sulu.resource_locator_part'},
            ],
            type: 'text_line',
        },
        description: {
            type: 'text_area',
        },
        block: {
            type: 'block',
            types: {
                default: {
                    form: {
                        text: {
                            tags: [
                                {name: 'sulu.resource_locator_part'},
                            ],
                            type: 'text_line',
                        },
                        description: {
                            type: 'text_line',
                        },
                    },
                    title: 'Default',
                },
                other: {
                    form: {
                        text: {
                            type: 'text_line',
                        },
                    },
                    title: 'Other',
                },
            },
        },
        image_map: {
            type: 'image_map',
            types: {
                default: {
                    form: {
                        text: {
                            tags: [
                                {name: 'sulu.resource_locator_part'},
                            ],
                            type: 'text_line',
                        },
                        description: {
                            type: 'text_line',
                        },
                    },
                    title: 'Default',
                },
                other: {
                    form: {
                        text: {
                            type: 'text_line',
                        },
                    },
                    title: 'Other',
                },
            },
        },
    };

    expect(resourceFormStore.getValuesByTag('sulu.resource_locator_part')).toEqual(['Value 1', 'Block 1', 'Block 2']);
});

test('Return SchemaEntry for given schemaPath', (done) => {
    const metadataPromise = Promise.resolve(
        {
            title: {
                tags: [
                    {name: 'sulu.resource_locator_part'},
                ],
                type: 'text_line',
            },
            description: {
                type: 'text_area',
            },
            block: {
                type: 'block',
                types: {
                    default: {
                        form: {
                            text: {
                                tags: [
                                    {name: 'sulu.resource_locator_part'},
                                ],
                                type: 'text_line',
                            },
                            description: {
                                type: 'text_line',
                            },
                        },
                        title: 'Default',
                    },
                },
            },
        }
    );
    metadataStore.getSchema.mockReturnValue(metadataPromise);

    const resourceFormStore = new ResourceFormStore(new ResourceStore('test'), 'snippets');

    setTimeout(() => {
        expect(resourceFormStore.getSchemaEntryByPath('/block/types/default/form/text')).toEqual({
            tags: [
                {name: 'sulu.resource_locator_part'},
            ],
            type: 'text_line',
        });
        resourceFormStore.destroy();
        done();
    });
});

test('Remember fields being finished as modified fields and forget about them after saving', () => {
    const resourceFormStore = new ResourceFormStore(new ResourceStore('test'), 'snippets');
    resourceFormStore.schema = {};
    resourceFormStore.finishField('/block/0/text');
    resourceFormStore.finishField('/block/0/text');
    resourceFormStore.finishField('/block/1/text');

    expect(resourceFormStore.isFieldModified('/block/0/text')).toEqual(true);
    expect(resourceFormStore.isFieldModified('/block/1/text')).toEqual(true);
    expect(resourceFormStore.isFieldModified('/block/2/text')).toEqual(false);

    return resourceFormStore.save().then(() => {
        expect(resourceFormStore.isFieldModified('/block/0/text')).toEqual(false);
        expect(resourceFormStore.isFieldModified('/block/1/text')).toEqual(false);
    });
});

test('HasInvalidType return true when invalid type is set', () => {
    const schemaTypesPromise = Promise.resolve({
        types: {
            sidebar: {key: 'sidebar', title: 'Sidebar'},
        },
    });

    metadataStore.getSchemaTypes.mockReturnValue(schemaTypesPromise);

    const resourceStore = new ResourceStore('test', 1);
    const resourceFormStore = new ResourceFormStore(resourceStore, 'test');

    resourceStore.data.template = 'not-sidebar';

    return schemaTypesPromise.then(() => {
        expect(resourceFormStore.hasInvalidType).toEqual(true);
    });
});

test('HasInvalidType return false valid type is set', () => {
    const schemaTypesPromise = Promise.resolve({
        types: {
            sidebar: {key: 'sidebar', title: 'Sidebar'},
        },
    });

    metadataStore.getSchemaTypes.mockReturnValue(schemaTypesPromise);

    const resourceStore = new ResourceStore('test', 1);
    const resourceFormStore = new ResourceFormStore(resourceStore, 'test');

    resourceStore.data.template = 'sidebar';

    return schemaTypesPromise.then(() => {
        expect(resourceFormStore.hasInvalidType).toEqual(false);
    });
});

test('HasInvalidType return false when types are not set yet', () => {
    const resourceStore = new ResourceStore('test', 1);
    const resourceFormStore = new ResourceFormStore(resourceStore, 'test');

    expect(resourceFormStore.hasInvalidType).toEqual(false);
});

test('HasTypes return true when types are set', () => {
    const schemaTypesPromise = Promise.resolve({
        types: {
            sidebar: {key: 'sidebar', title: 'Sidebar'},
            footer: {key: 'footer', title: 'Footer'},
        },
    });

    metadataStore.getSchemaTypes.mockReturnValue(schemaTypesPromise);

    const resourceStore = new ResourceStore('test', 5);
    const resourceFormStore = new ResourceFormStore(resourceStore, 'snippets');

    return schemaTypesPromise.then(() => {
        expect(resourceFormStore.hasTypes).toEqual(true);
    });
});

test('HasTypes return false when types are not set', () => {
    const schemaTypesPromise = Promise.resolve({types: {}});

    metadataStore.getSchemaTypes.mockReturnValue(schemaTypesPromise);

    const resourceStore = new ResourceStore('test', 5);
    const resourceFormStore = new ResourceFormStore(resourceStore, 'snippets');

    return schemaTypesPromise.then(() => {
        expect(resourceFormStore.hasTypes).toEqual(false);
    });
});

test.each(['sidebar', 'footer'])('Set type to default "%s" if loaded data has no template set', (defaultType, done) => {
    const schemaTypesPromise = Promise.resolve({
        types: {
            sidebar: {key: 'sidebar', title: 'Sidebar'},
            footer: {key: 'footer', title: 'Footer'},
        },
        defaultType,
    });

    metadataStore.getSchemaTypes.mockReturnValue(schemaTypesPromise);

    const resourceStore = new ResourceStore('test');
    resourceStore.loading = true;

    const resourceFormStore = new ResourceFormStore(resourceStore, 'snippets');

    expect(resourceFormStore.type).toEqual(undefined);

    schemaTypesPromise.then(() => {
        // type should not be set until ResourceStore is loaded completely
        expect(resourceFormStore.type).toEqual(undefined);
        resourceStore.loading = false;

        setTimeout(() => {
            expect(resourceFormStore.type).toEqual(defaultType);
            resourceFormStore.destroy();
            done();
        }, 0);
    });
});

test('Set type to the template value if set', () => {
    const schemaTypesPromise = Promise.resolve({
        types: {
            sidebar: {key: 'sidebar', title: 'Sidebar'},
            footer: {key: 'footer', title: 'Footer'},
        },
        defaultType: 'footer',
    });

    metadataStore.getSchemaTypes.mockReturnValue(schemaTypesPromise);

    const resourceStore = new ResourceStore('test', 5);
    resourceStore.data = observable({template: 'footer'});

    const resourceFormStore = new ResourceFormStore(resourceStore, 'snippets');

    return schemaTypesPromise.then(() => {
        expect(resourceFormStore.type).toEqual('footer');
    });
});
