// @flow
import {observer} from 'mobx-react';
import {action, observable, autorun, computed} from 'mobx';
import classNames from 'classnames';
import React, {Fragment} from 'react';
import log from 'loglevel';
import Navigation from '../Navigation';
import Backdrop from '../../components/Backdrop';
import Loader from '../../components/Loader';
import initializer from '../../services/initializer';
import Router from '../../services/Router';
import userStore from '../../stores/userStore';
import Login from '../Login';
import ProfileFormOverlay from '../ProfileFormOverlay';
import Sidebar, {sidebarStore} from '../Sidebar';
import Toolbar from '../Toolbar';
import ViewRenderer from '../ViewRenderer';
import './global.scss';
import SnackbarContainer from '../../components/SnackbarContainer';
import snackbarStore from '../../stores/snackbarStore';
import Snackbar from '../../components/Snackbar';
import applicationStyles from './application.scss';

const NAVIGATION_PINNED_SETTING_KEY = 'sulu_admin.application.navigation_pinned';

type Props = {
    appVersion: ?string,
    router: Router,
    suluVersion: string,
};

type NavigationState = 'pinned' | 'hidden' | 'visible';

@observer
class Application extends React.Component<Props>{
    @observable openedProfileFormOverlay: boolean = false;

    @action openProfileFormOverlay() {
        this.openedProfileFormOverlay = true;
    }

    @action closeProfileFormOverlay() {
        this.openedProfileFormOverlay = false;
    }

    @observable navigationState: NavigationState;

    @computed get navigationPinned() {
        return this.navigationState === 'pinned';
    }

    @computed get navigationVisible() {
        return this.navigationPinned || this.navigationState === 'visible';
    }

    @action setNavigationState(state: NavigationState) {
        this.navigationState = state;
    }

    set navigationPinned(value: boolean) {
        this.setNavigationState(value ? 'pinned' : 'hidden');
    }

    set navigationVisible(value: boolean) {
        if (this.navigationPinned) {
            log.warn('Changing the visibility of the navigation is not allowed while navigation is pinned!');
            return;
        }

        this.setNavigationState(value ? 'visible' : 'hidden');
    }

    navigationPinnedDisposer: () => void;

    constructor(props: Props) {
        super(props);

        this.navigationPinnedDisposer = autorun(
            () => this.navigationPinned = userStore.getPersistentSetting(NAVIGATION_PINNED_SETTING_KEY)
        );
    }

    componentWillUnmount() {
        this.navigationPinnedDisposer();
    }

    toggleNavigation() {
        this.navigationVisible = !this.navigationVisible;
    }

    toggleNavigationPinned() {
        this.navigationPinned = !this.navigationPinned;
        userStore.setPersistentSetting(NAVIGATION_PINNED_SETTING_KEY, this.navigationPinned);
    }

    handleNavigationButtonClick = () => {
        this.toggleNavigation();
    };

    handlePinToggle = () => {
        this.toggleNavigationPinned();
    };

    handleNavigate = () => {
        if (!this.navigationPinned) {
            this.toggleNavigation();
        }
    };

    handleLoginSuccess = () => {
        this.props.router.reload();
    };

    handleLogout = () => {
        userStore.logout().then(() => {
            if (this.navigationVisible && !this.navigationPinned) {
                this.toggleNavigation();
            }
        });
    };

    handleProfileOverlayClose = () => {
        this.closeProfileFormOverlay();
    };

    handleProfileEditClick = () => {
        this.openProfileFormOverlay();
    };

    render() {
        const {appVersion, router, suluVersion} = this.props;
        const {loggedIn} = userStore;

        const rootClass = classNames(
            applicationStyles.root,
            {
                [applicationStyles.visible]: loggedIn,
                [applicationStyles.navigationVisible]: this.navigationVisible,
                [applicationStyles.navigationPinned]: this.navigationPinned,
            }
        );

        const sidebarClass = classNames(
            applicationStyles.sidebar,
            {
                [applicationStyles[sidebarStore.size]]: sidebarStore.size,
            }
        );

        const snackbarClass = classNames(
            applicationStyles.snackbar,
            {
                [applicationStyles.isNavigationVisible]: this.navigationVisible,
                [applicationStyles.isNavigationPinned]: this.navigationPinned,
                [applicationStyles[sidebarStore.size]]: sidebarStore.size,
            }
        );

        const contentClass = classNames(
            applicationStyles.content,
            {
                [applicationStyles.withSidebar]: sidebarStore.view,
                [applicationStyles.withPinnedNavigation]: this.navigationPinned,
            }
        );

        return (
            <Fragment>
                {!loggedIn &&
                    <Login
                        backLink="/" // TODO: Get the correct link here from the backend
                        initialized={!initializer.loading && !!initializer.initializedTranslationsLocale}
                        onLoginSuccess={this.handleLoginSuccess}
                        router={router}
                    />
                }
                {initializer.initialized && initializer.initializedTranslationsLocale
                    ? <Fragment>
                        <div className={rootClass}>
                            <nav className={applicationStyles.navigation}>
                                <Navigation
                                    appVersion={appVersion}
                                    onLogout={this.handleLogout}
                                    onNavigate={this.handleNavigate}
                                    onPinToggle={this.handlePinToggle}
                                    onProfileClick={this.handleProfileEditClick}
                                    pinned={this.navigationPinned}
                                    router={router}
                                    suluVersion={suluVersion}
                                />
                            </nav>
                            <div className={contentClass}>
                                <main className={applicationStyles.main}>
                                    <div className={applicationStyles.viewContainer}>
                                        {router.route &&
                                            <ViewRenderer router={router} />
                                        }
                                    </div>
                                    <header>
                                        <Toolbar
                                            navigationOpen={this.navigationVisible}
                                            onNavigationButtonClick={
                                                this.navigationPinned
                                                    ? undefined
                                                    : this.handleNavigationButtonClick
                                            }
                                        />
                                    </header>
                                </main>
                                <Sidebar className={sidebarClass} />
                                {this.navigationVisible && !this.navigationPinned &&
                                    <Backdrop
                                        fixed={false}
                                        onClick={this.handleNavigationButtonClick}
                                        visible={false}
                                    />
                                }
                            </div>
                        </div>
                        <ProfileFormOverlay
                            onClose={this.handleProfileOverlayClose}
                            open={this.openedProfileFormOverlay}
                        />
                        {
                            snackbarStore.messages.length
                                ? <SnackbarContainer className={snackbarClass}>
                                    {snackbarStore.messages.map((message, index) => {
                                        return (
                                            <Snackbar
                                                icon={message.icon}
                                                key={index}
                                                message={message.text}
                                                skin="floating"
                                                type={message.type}
                                            />
                                        );
                                    })}
                                </SnackbarContainer>
                                : null
                        }
                    </Fragment>
                    : <div className={applicationStyles.loader}>
                        <Loader />
                    </div>
                }
            </Fragment>
        );
    }
}

export default Application;
