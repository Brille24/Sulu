// @flow
import classNames from 'classnames';
import React from 'react';
import Icon from '../Icon';
import Loader from '../Loader';
import buttonStyles from './button.scss';
import type {Button as ButtonProps} from './types';
import type {ElementRef} from 'react';

const LOADER_SIZE = 20;
const ICON_ANGLE_DOWN = 'su-angle-down';

export default class Button extends React.PureComponent<ButtonProps> {
    static defaultProps = {
        active: false,
        disabled: false,
        hasOptions: false,
        primary: false,
        showText: true,
        success: false,
    };

    handleOnClick = () => {
        this.props.onClick();
    };

    setButtonRef = (ref: ?ElementRef<'button'>) => {
        const {buttonRef} = this.props;
        if (buttonRef && ref) {
            buttonRef(ref);
        }
    };

    render() {
        const {
            active,
            disabled,
            label,
            loading,
            hasOptions,
            icon,
            primary,
            size,
            showText,
            skin,
            success,
        } = this.props;

        const buttonClass = classNames(
            buttonStyles.button,
            {
                [buttonStyles.active]: active,
                [buttonStyles[size]]: size,
                [buttonStyles[skin]]: skin,
                [buttonStyles.primary]: primary,
                [buttonStyles.success]: success,
            }
        );
        const buttonContent = this.props.children || label;

        return (
            <button
                className={buttonClass}
                disabled={disabled}
                onClick={this.handleOnClick}
                ref={this.setButtonRef}
                type="button"
            >
                {loading &&
                    <Loader className={buttonStyles.loader} size={LOADER_SIZE} />
                }
                {icon &&
                    <Icon className={buttonStyles.icon} name={icon} />
                }
                {(buttonContent && showText) &&
                    <span className={buttonStyles.label}>{buttonContent}</span>
                }
                {hasOptions &&
                    <Icon className={buttonStyles.dropdownIcon} name={ICON_ANGLE_DOWN} />
                }
            </button>
        );
    }
}
