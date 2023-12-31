// @flow
import React from 'react';
import ButtonGroup from '../../components/ButtonGroup';
import Button from '../../components/Button';
import listAdapterRegistry from './registries/listAdapterRegistry';

type Props = {
    adapters: Array<string>,
    currentAdapter: string,
    onAdapterChange: (adapter: string) => void,
};

export default class AdapterSwitch extends React.PureComponent<Props> {
    handleAdapterChange = (adapter: ?string) => {
        if (!adapter || this.props.currentAdapter === adapter) {
            return;
        }

        this.props.onAdapterChange(adapter);
    };

    render() {
        const {
            currentAdapter,
            adapters,
        } = this.props;

        if (adapters.length < 2) {
            return null;
        }

        return (
            <ButtonGroup>
                {adapters.map((adapter, index) => {
                    const Adapter = listAdapterRegistry.get(adapter);

                    return (
                        <Button
                            active={adapter === currentAdapter}
                            icon={Adapter.icon}
                            key={index}
                            onClick={this.handleAdapterChange}
                            value={adapter}
                        />
                    );
                })}
            </ButtonGroup>
        );
    }
}
