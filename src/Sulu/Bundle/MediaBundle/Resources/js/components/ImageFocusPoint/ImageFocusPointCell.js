// @flow
import React from 'react';
import classNames from 'classnames';
import {Icon} from 'sulu-admin-bundle/components';
import imageFocusPointCellStyles from './imageFocusPointCell.scss';
import type {ArrowDirection, Point} from './types';

const ICON_UP = 'su-angle-up';

type Props = {
    active: boolean,
    arrowDirection?: ArrowDirection,
    onClick?: (value: Point) => void,
    size: number,
    value: Point,
};

export default class ImageFocusPointCell extends React.PureComponent<Props> {
    static defaultProps = {
        active: false,
    };

    static getDirectionInDegrees(direction: ArrowDirection) {
        switch (direction) {
            case 'left':
                return -90;
            case 'top-left':
                return -45;
            case 'top':
                return 0;
            case 'top-right':
                return 45;
            case 'right':
                return 90;
            case 'bottom-right':
                return 125;
            case 'bottom':
                return 180;
            case 'bottom-left':
                return 225;
        }

        throw new Error(`Direction with the name "${direction}" is undefined.`);
    }

    handleClick = () => {
        const {
            value,
            onClick,
        } = this.props;

        if (onClick) {
            onClick(value);
        }
    };

    render() {
        const {
            size,
            active,
            arrowDirection,
        } = this.props;
        const buttonStyle = {
            width: `${size}%`,
            height: `${size}%`,
        };
        const focusPointClass = classNames(
            imageFocusPointCellStyles.imageFocusPointCell,
            {
                [imageFocusPointCellStyles.active]: active,
            }
        );
        const iconStyle = arrowDirection
            ? {transform: `rotate(${ImageFocusPointCell.getDirectionInDegrees(arrowDirection)}deg)`}
            : {};

        return (
            <button
                className={focusPointClass}
                disabled={active}
                onClick={this.handleClick}
                style={buttonStyle}
                type="button"
            >
                {!!arrowDirection && !active &&
                    <div style={iconStyle}>
                        <Icon name={ICON_UP} />
                    </div>
                }
            </button>
        );
    }
}
