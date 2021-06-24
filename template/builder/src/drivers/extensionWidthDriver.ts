import {
    Stream
} from 'xstream';

function expand(html: JQuery < HTMLElement > ) {
    html.addClass('expand');
}

function contract(html: JQuery < HTMLElement > ) {
    html.removeClass('expand');
}

export function extensionWidthDriver(isVideoChatClientVisible$: Stream < boolean > ) {
    isVideoChatClientVisible$.addListener({
        next: isVideoChatClientVisible => {
            var gameContainer = $('div.game-container');
            var html = $('html');
            var body = $('body');
            var featureDrawerHandle = $('.feature-drawer-handle');
            var gameDrawerHandle = $('.game-drawer-handle');

            if (isVideoChatClientVisible) {
                expand(html);
                expand(body);
                expand(gameContainer);
                expand(featureDrawerHandle);
                expand(gameDrawerHandle);

                // Refresh css.
                var links = document.getElementsByTagName("link");
                for (var i = 0; i < links.length; i++) {
                    var link = links[i];
                    if (link.href.includes('video.css') && link.rel === "stylesheet") {
                        console.log('refreshing css');
                        link.href += "?";
                    }
                }
            } else {
                contract(html);
                contract(body);
                contract(gameContainer);
                contract(featureDrawerHandle);
                contract(gameDrawerHandle);
            }
        }
    })
}