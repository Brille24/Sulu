// @flow
import React from 'react';
import toolbarDropdownOptionStyles from './toolbarDropdownOption.scss';

type Props = {
    children: string,
    disabled?: boolean,
    onClick: () => void,
};

export default class ToolbarDropdownListOption extends React.Component<Props> {
    handleClick = () => {
        const {onClick} = this.props;

        onClick();
    };

    render() {
        const {children, disabled} = this.props;
        return (
            <li>
                <button
                    className={toolbarDropdownOptionStyles.option}
                    disabled={disabled}
                    onClick={this.handleClick}
                    type="button"
                >
                    {children}
                </button>
            </li>
        );
    }
}
