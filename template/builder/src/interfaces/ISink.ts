import {
    Stream
} from 'xstream';
import {
    VNode
} from '@cycle/dom';

export interface ISink {
    client: Stream < VNode > ;
    toggle: Stream < VNode > ;
    modals: Stream < VNode > ;
    poly: Stream < VNode > ;
    isVideoChatClientVisible: Stream < boolean > ;
    log: Stream < any > ;
}