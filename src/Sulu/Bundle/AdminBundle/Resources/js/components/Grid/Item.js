// @flow
import React from 'react';
import classNames from 'classnames';
import BaseItem from './BaseItem';
import itemStyles from './item.scss';
import type {BaseItemProps} from './types';
import type {Node} from 'react';

type Props = {|
    ...BaseItemProps,
    children?: Node,
    className?: string,
|};

export default class Item extends React.PureComponent<Props> {
    static defaultProps = {
        colSpan: 12,
        spaceAfter: 0,
        spaceBefore: 0,
    };

    render() {
        const {
            children,
            className,
            ...others
        } = this.props;

        const itemClass = classNames([
            itemStyles.item,
            className,
        ]);

        return (
            <BaseItem {...others} className={itemClass}>
                {children}
            </BaseItem>
        );
    }
}
