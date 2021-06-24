import xs, {
    Stream
} from 'xstream';
import {
    run
} from '@cycle/run';
import {
    makeDOMDriver,
    MainDOMSource,
    VNode,
    div,
    p,
    i,
    button,
    style
} from '@cycle/dom';
import {
    extensionWidthDriver
} from './drivers/extensionWidthDriver';
import {
    logDriver
} from './drivers/logDriver';
import {
    ISource
} from './interfaces/ISource';
import {
    ISink
} from './interfaces/ISink';
import {
    getVideoChatClient,
    getVideoChatClientModals
} from './components/videoChatClient';
import {
    videoAppDriver
} from './drivers/videoAppDriver';

function handleVisibilityChange(isVideoChatClientVisible$: Stream < boolean > ) {
    extensionWidthDriver(isVideoChatClientVisible$);
    videoAppDriver(isVideoChatClientVisible$);
}

export const startVideoOn = (videoChatClientDivId: string, toggleVideoChatClientButtonId: string, videoChatClientModals: string, poly: string) => {
    const App = (source: ISource): ISink => {
        let isVideoChatClientVisible: boolean = false;

        const videoToggle$ = source.toggle
            .select(".toggle")
            .events('click');

        const isVideoChatClientVisible$ = videoToggle$
            .map(_ => {
                isVideoChatClientVisible = !isVideoChatClientVisible;
                return isVideoChatClientVisible;
            })
            .startWith(isVideoChatClientVisible);

        const toggle$ = isVideoChatClientVisible$
            .map(isVisible => i(`.toggle .fas ${isVisible?'.fa-video-slash':'.fa-video'}`));

        const client$ = isVideoChatClientVisible$.map(_=>div()); //getVideoChatClient(source, isVideoChatClientVisible$);

        const modals$ = getVideoChatClientModals(source, isVideoChatClientVisible$);

        const poly$ = isVideoChatClientVisible$
            .map(isVisible =>
                isVisible ?
                div('.poly-expanded') :
                div('.poly')
            );

        const log$ = xs.of("");

        return {
            client: client$,
            toggle: toggle$,
            modals: modals$,
            poly: poly$,
            isVideoChatClientVisible: isVideoChatClientVisible$,
            log: log$
        }
    };

    run(App, {
        client: makeDOMDriver(videoChatClientDivId),
        toggle: makeDOMDriver(toggleVideoChatClientButtonId),
        modals: makeDOMDriver(videoChatClientModals),
        poly: makeDOMDriver(poly),
        isVideoChatClientVisible: handleVisibilityChange,
        log: logDriver
    });
}