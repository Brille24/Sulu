// @flow
import {render} from 'enzyme';
import React from 'react';
import {listAdapterDefaultProps} from 'sulu-admin-bundle/utils/TestHelper';
import MediaCardOverviewAdapter from '../../adapters/MediaCardOverviewAdapter';

jest.mock('sulu-admin-bundle/services/initializer', () => jest.fn());

jest.mock('sulu-admin-bundle/utils/Translator', () => ({
    translate(key) {
        switch (key) {
            case 'sulu_media.copy_url':
                return 'Copy URL';
            case 'sulu_media.download_masterfile':
                return 'Download master file';
        }
    },
}));

test('Render a basic Masonry view with the MediaCardOverviewAdapter', () => {
    const thumbnails = {
        'sulu-240x': 'http://lorempixel.com/240/100',
        'sulu-100x100': 'http://lorempixel.com/100/100',
    };
    const data = [
        {
            id: 1,
            title: 'Title 1',
            mimeType: 'image/png',
            size: 12345,
            url: 'http://lorempixel.com/500/500',
            thumbnails,
        },
        {
            id: 2,
            title: 'Title 1',
            mimeType: 'image/jpeg',
            size: 54321,
            url: 'http://lorempixel.com/500/500',
            thumbnails,
        },
    ];
    const mediaCardAdapter = render(
        <MediaCardOverviewAdapter
            {...listAdapterDefaultProps}
            data={data}
            onItemSelectionChange={jest.fn()}
            page={2}
            pageCount={5}
        />
    );

    expect(mediaCardAdapter).toMatchSnapshot();
});
