import {
    Stream
} from 'xstream';

export function logDriver(msg$: Stream < any > ) {
    msg$.addListener({
        next: msg => console.log(msg)
    })
}