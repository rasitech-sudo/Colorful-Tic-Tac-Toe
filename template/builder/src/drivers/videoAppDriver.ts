import {
    getVideoApp,
    leaveVideoAppRoom
} from './videoApp.js';

import {
    Stream
} from 'xstream';

export function videoAppDriver(isVideoChatClientVisible$: Stream < boolean > ) {
    isVideoChatClientVisible$.addListener({
        next: isVideoChatClientVisible => {
            if (isVideoChatClientVisible) {
                getVideoApp();
            } else {
                // TODO - how do we gracefully close?
                leaveVideoAppRoom();
            }
        }
    })
}