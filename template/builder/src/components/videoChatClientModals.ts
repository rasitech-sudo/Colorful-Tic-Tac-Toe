import {
    div,
    h5,
    svg,
    VNode,
    select,
    button,
    video,
    label,
    input,
} from "@cycle/dom";

function getModalProperties(ariaLabelledBy: string, dataBackdrop: string = 'static', tabIndex: string = '-1', role: string = 'dialog', ariaHidden: string = 'true') {
    const properties = {
        attrs: {
            'data-backdrop': dataBackdrop,
            'tabindex': tabIndex,
            'role': role,
            'aria-labelledby': ariaLabelledBy,
            'aria-hidden': ariaHidden
        }
    }

    return properties;
}

function getDocumentRole() {
    const properties = {
        attrs: {
            'role': 'document'
        }
    }

    return properties;
}

function getIsText() {
    const properties = {
        props: {
            type: 'text'
        }
    }

    return properties;
}

function getIsButton() {
    const properties = {
        props: {
            type: 'button'
        }
    }

    return properties;
}

function getMicrophoneSvg(): VNode {
    const properties = {
        attrs: {
            'focusable': 'false',
            'viewBox': '0 0 100 100',
            'aria-hidden': 'true',
            'height': '100',
            'width': '100',
            'style': 'margin: 10px 0'
        }
    }

    return svg(properties, [
        svg.defs([
            svg.clipPath({
                attrs: {
                    'id': 'level-indicator'
                }
            }, [
                svg.rect({
                    attrs: {
                        'x': '0',
                        'y': '100',
                        'width': '100',
                        'height': '100'
                    }
                })
            ]),
            svg.path({
                attrs: {
                    'fill': 'rgb(220, 220, 220)',
                    'd': 'm52 38v14c0 9.757-8.242 18-18 18h-8c-9.757 0-18-8.243-18-18v-14h-8v14c0 14.094 11.906 26 26 26v14h-17v8h42v-8h-17v-14c14.094 0 26-11.906 26-26v-14h-8z'
                }
            }),
            svg.path({
                attrs: {
                    'fill': 'rgb(220, 220, 220)',
                    'd': 'm26 64h8c5.714 0 10.788-4.483 11.804-10h-11.887v-4h12.083v-4h-12.083v-4h12.083v-4h-12.083v-4h12.083v-4h-12.083v-4h12.083v-4h-12.083v-4h12.083v-4h-12.083v-4h11.887c-1.016-5.517-6.09-10-11.804-10h-8c-6.393 0-12 5.607-12 12v40c0 6.393 5.607 12 12 12z'
                }
            }),
            svg.path({
                attrs: {
                    'fill': '#080',
                    'clip-path': 'url(#level-indicator)',
                    'd': 'm52 38v14c0 9.757-8.242 18-18 18h-8c-9.757 0-18-8.243-18-18v-14h-8v14c0 14.094 11.906 26 26 26v14h-17v8h42v-8h-17v-14c14.094 0 26-11.906 26-26v-14h-8z'
                }
            }),
            svg.path({
                attrs: {
                    'fill': '#080',
                    'clip-path': 'url(#level-indicator)',
                    'd': 'm26 64h8c5.714 0 10.788-4.483 11.804-10h-11.887v-4h12.083v-4h-12.083v-4h12.083v-4h-12.083v-4h12.083v-4h-12.083v-4h12.083v-4h-12.083v-4h12.083v-4h-12.083v-4h11.887c-1.016-5.517-6.09-10-11.804-10h-8c-6.393 0-12 5.607-12 12v40c0 6.393 5.607 12 12 12z'
                }
            }),
        ])
    ]);
}

function getSelectMicrophoneModal(): VNode {
    return div('#select-mic.modal fade', getModalProperties('select-mic-label'), [
        div('.modal-dialog', getDocumentRole(), [
            div('.modal-content', [
                div('.modal-header', [
                    h5('#select-mic-label.modal-title', 'Microphone')
                ]),
                div('.modal-body', {
                    style: { // TODO - move to css
                        'text-align': 'center'
                    }
                }, [
                    select({
                        style: { // TODO - move to css
                            'width': '100%'
                        }
                    }),
                    getMicrophoneSvg()
                ]),
                div('.modal-footer', [
                    button('.btn btn-primary', getIsButton(), 'Apply')
                ])
            ])
        ])
    ]);
}

function getSelectCameraModal(): VNode {
    return div('#select-camera.modal fade', getModalProperties('select-camera-label'), [
        div('.modal-dialog', getDocumentRole(), [
            div('.modal-content', [
                div('.modal-header', [
                    h5('#select-camera-label.modal-title', 'Camera')
                ]),
                div('.modal-body', {
                    style: { // TODO - move to css
                        'text-align': 'center'
                    }
                }, [
                    select({
                        style: { // TODO - move to css
                            'width': '100%'
                        }
                    }),
                    video({
                        attrs: {
                            autoplay: true,
                            muted: true,
                            playsInline: true,
                            style: 'margin: 10px 0; width: 60%'
                        },
                    })
                ]),
                div('.modal-footer', [
                    button('.btn btn-primary', getIsButton(), 'Apply')
                ])
            ])
        ])
    ]);
}

function getJoinRoomModal(): VNode {
    return div('#join-room.modal fade', getModalProperties('join-room-label'), [
        div('.modal-dialog', getDocumentRole(), [
            div('.modal-content', [
                div('.modal-header', [
                    h5('#join-room-label.modal-title', 'Video Chat')
                ]),
                div('.modal-body', [
                    div('.form-group', [
                        label('#room-name-label', {
                            attrs: {
                                'for': 'room-name'
                            }
                        }, ['Room Name']),
                        input('#room-name.form-control', getIsText())
                    ]),
                    div('.form-group', [
                        label('#screen-name-label', {
                            attrs: {
                                'for': 'screen-name'
                            }
                        }, ['User Name']),
                        input('#screen-name.form-control', getIsText())
                    ]),
                    div('.alert alert-warning', {
                        attrs: {
                            'role': 'alert'
                        }
                    })
                ]),
                div('.modal-footer', [
                    button('#cancel.btn btn-secondary', getIsButton(), 'Cancel'),
                    button('.btn btn-dark', getIsButton(), 'Change Microphone and Camera'),
                    button('.btn btn-primary', getIsButton(), 'Join')
                ])
            ])
        ])
    ]);
}

function getShowErrorModal(): VNode {
    return div('#show-error.modal fade', getModalProperties('show-error-label'), [
        div('.modal-dialog', getDocumentRole(), [
            div('.modal-content', [
                div('.modal-header', [
                    h5('#show-error-label.modal-title', 'Error')
                ]),
                div('.modal-body', [
                    div('.alert alert-warning', {
                        attrs: {
                            'role': 'alert'
                        }
                    })
                ])
            ])
        ])
    ]);
}

export function getModals(): VNode {
    return div('#modals', [
        getSelectMicrophoneModal(),
        getSelectCameraModal(),
        getJoinRoomModal(),
        getShowErrorModal()
    ]);
}