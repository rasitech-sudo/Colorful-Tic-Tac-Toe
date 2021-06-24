import xs, {
    MemoryStream,
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
    style,
    h3,
    video
} from '@cycle/dom';
import {
    ISource
} from '../interfaces/ISource';
import {
    ISink
} from '../interfaces/ISink';
import {
    getModals
} from './videoChatClientModals';

export function getVideoChatClient(source: ISource, isVideoChatClientVisible$: MemoryStream < boolean > ): Stream < VNode > {
    const client$ = isVideoChatClientVisible$
        .map(isVisible => isVisible ?
            div([
                button('#leave-room.btn btn-outline-primary', 'Leave'),
                div(
                    /* {
                        attrs: {
                            'style': 'border:1px solid black;'
                        }
                    }, */
                    [
                        //h3('Local Camera Preview'),
                        div('#local-media-container-id')
                    ]),
                div('.container-fluid', [
                    div('#room.row', [
                        div('#participants', {
                            style: {
                                'text-align': 'center'
                            }
                        }),
                        div('#active-participant.col-xs-12 col-sm-9 col-md-10', {
                            style: {
                                'text-align': 'center'
                            }
                        }, [
                            div('.participant main', [
                                video({
                                    attrs: {
                                        autoplay: true,
                                        playsinline: true,
                                        muted: true,
                                    }
                                })
                            ])
                        ])
                    ])
                ])
            ]) :
            div( /* [p('#output.output', (new Date()).toISOString())] */ ));

    return client$;
}

export function getVideoChatClientModals(source: ISource, isVideoChatClientVisible$: MemoryStream < boolean > ): Stream < VNode > {
    const client$ = isVideoChatClientVisible$
        .map(isVisible => isVisible ?
            getModals() :
            div());

    return client$;
}