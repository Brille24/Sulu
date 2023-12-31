// @flow
import React from 'react';
import PasswordConfirmationComponent from '../../../components/PasswordConfirmation';
import type {FieldTypeProps} from '../types';

export default class PasswordConfirmation extends React.Component<FieldTypeProps<?string>> {
    handleChange = (value: ?string) => {
        const {onFinish, onChange} = this.props;

        onChange(value);
        onFinish();
    };

    render() {
        const {disabled, error} = this.props;

        return <PasswordConfirmationComponent disabled={!!disabled} onChange={this.handleChange} valid={!error} />;
    }
}
