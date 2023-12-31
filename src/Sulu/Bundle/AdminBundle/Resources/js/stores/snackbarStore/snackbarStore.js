// @flow
import {action, observable} from 'mobx';
import type {Message} from './types';

class SnackbarStore {
    @observable.shallow messages: Array<Message> = [];

    timeouts: Array<TimeoutID | null> = [];

    @action add(message: Message, milliseconds: ?number = null) {
        this.messages.push(message);
        this.timeouts.push(null);

        if (milliseconds) {
            this.timeouts[this.messages.length - 1] = setTimeout(() => {
                this.remove(message);
            }, milliseconds);
        }
    }

    @action remove(message: Message) {
        const messageIndex = this.messages.indexOf(message);

        if (messageIndex !== -1) {
            if (this.timeouts[messageIndex]) {
                clearTimeout(this.timeouts[messageIndex]);
            }

            this.timeouts.splice(messageIndex, 1);
            this.messages.splice(messageIndex, 1);
        }
    }

    @action clear() {
        this.messages = [];
        this.timeouts.forEach((timeoutId) => {
            clearTimeout(timeoutId);
        });
        this.timeouts = [];
    }
}

export default new SnackbarStore();
