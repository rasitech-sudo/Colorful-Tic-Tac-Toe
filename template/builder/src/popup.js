//================================================
/*

Copyright (C) 2019 - 2021
tCubed Studios
www.tCubedStudios.com

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.


To view a copy of this license, visit http://creativecommons.org/licenses/GPL/2.0/

*/

import {startVideoOn} from './video'

//Popup Functionality
(function ($) {

    //Example use:
    //loadCss(chrome.runtime.getURL("game/libs/cube.css"));
    //Must add the folder to the manifest as follows (if css and js are in specified directories):
    //  "web_accessible_resources": [
    //      "game/js/*",
    //      "game/libs/*"
    //  ]
    function loadCss(path) {
        $("head").append("<link>");
        var css = $("head").children(":last");
        css.attr({
            rel: "stylesheet",
            type: "text/css",
            href: path
        });
    }

    // Commented out for now because this is specific to the chrome web store and we want to port to firefox and edge. No guarantee we'll have the same ID.
    /* function detectInstalledExtensions() {
        //Determine what extensions the user has installed

        //Highlight as installed

        //Build recommendations list.

        //Set click response to open the extension if it's installed or redirect user to the download page if not installed

        //Update our ads list based on what is installed. Basically, don't show ads for installed extensions

        //TODO we should build the games drawer, recommendations, Editor's Choice, etc from JS and gut from HTML
        var extensionIds = [
            'pfjbakaelkkenbenekldmehijlbpjjea', //Colorful Tic Tac Toe
            'ndmelloaocjpkhmajmkdbbhimohlclkd' //Colorful Rubik's Cube
        ];

        for (var i = 0; i < extensionIds.length; i++) {
            chrome.runtime.sendMessage(extensionIds[i], 'version', response => {
                if (!response) {
                    //console.log('No extension');
                    return;
                }
                //console.log('Extension version: ', response.version);
                $("#" + extensionIds[i] + " .ribbon").addClass("show");
            });
        }
    } */

    const FIREFOX_BROWSER = "firefox";
    const CHROME_BROWSER = "chrome";
    const EDGE_CHROMIUM_BROWSER = "edgeChromium";
    
    function isBrowser(browser) {
        // https://stackoverflow.com/a/9851769

        // Opera 8.0+
        //var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

        // Firefox 1.0+
        var isFirefox = typeof InstallTrigger !== 'undefined';

        // Safari 3.0+ "[object HTMLElementConstructor]" 
        //var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && window['safari'].pushNotification));

        // Internet Explorer 6-11
        //var isIE = /*@cc_on!@*/false || !!document.documentMode;

        // Edge 20+
        //var isEdge = !isIE && !!window.StyleMedia;

        // Chrome 1 - 79
        var isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);

        // Edge (based on chromium) detection
        var isEdgeChromium = isChrome && (navigator.userAgent.indexOf("Edg") != -1);

        // Blink engine detection
        //var isBlink = (isChrome || isOpera) && !!window.CSS;

        if(browser === EDGE_CHROMIUM_BROWSER){
            return isEdgeChromium;
        }
        else if(browser === CHROME_BROWSER){
            return isChrome;
        }
        else if(browser === FIREFOX_BROWSER){
            return isFirefox;
        }
        else{
            return false;
        }
    }

    function setupFeatureDrawerLinks(){
        // Refactor this. We ultimately want to pull this down using an API call instead of hard-coding here.
        var ticTacToeLink = "https://playtcubed.com/shop/tcubed-tic-tac-toe-game/";
        var rubiksCubeLink = "https://playtcubed.com/shop/tcubed-tic-tac-toe-game/";

        if(isBrowser(EDGE_CHROMIUM_BROWSER)){
            // TODO - we need these links.
            ticTacToeLink = "https://microsoftedge.microsoft.com/addons/Microsoft-Edge-Extensions-Home?hl=en-US";
            rubiksCubeLink = "https://microsoftedge.microsoft.com/addons/Microsoft-Edge-Extensions-Home?hl=en-US";
        }
        else if (isBrowser(CHROME_BROWSER)){
            ticTacToeLink = "https://chrome.google.com/webstore/detail/colorful-tic-tac-toe/pfjbakaelkkenbenekldmehijlbpjjea";
            rubiksCubeLink = "https://chrome.google.com/webstore/detail/colorful-rubiks-cube/ndmelloaocjpkhmajmkdbbhimohlclkd?hl=en-US";
        }
        
        $("#tic-tac-toe-item-link").attr("href", ticTacToeLink);
        $("#rubiks-cube-item-link").attr("href", rubiksCubeLink);

        // TODO - Set visibility
        if(isBrowser(EDGE_CHROMIUM_BROWSER)){
            $("#rubiks-cube-item").addClass('hidden-link');
            $("#sponsor-link").addClass('hidden-link');
        }
    }

    function revealTitleAndLogo() {
        //Load the title
        $("#title").load("../game/title.html", function () {
            //Wait until html is added to DOM. Otherwise the animation doesn't work.
            var titleTimeline = anime.timeline();

            //Reveal Title and Logo
            titleTimeline
                .add({
                    targets: '.letter',
                    fill: {
                        value: ['#fff', function (el) {
                            return el.fill
                        }],
                        duration: 500,
                        delay: 1000,
                        easing: 'easeInQuint'
                    },
                    stroke: {
                        value: ['#c0c0c0', function (el) {
                            return el.stroke
                        }],
                        duration: 1000,
                        delay: function (el, i, t) {
                            return i * 10;
                        },
                        easing: 'easeInExpo'
                    },
                    strokeWidth: {
                        value: [10, 1],
                        delay: function (el, i, t) {
                            return i * 10;
                        },
                        duration: 1000,
                        easing: 'easeInExpo'
                    },
                    strokeDashoffset: {
                        value: [anime.setDashoffset, 0],
                        duration: 1000,
                        delay: function (el, i, t) {
                            return i * 10;
                        },
                        easing: 'easeInExpo'
                    }
                }, 1)
                .add({
                    targets: '.logo',
                    opacity: {
                        value: [0, 1],
                        duration: 1500,
                        easing: 'easeInQuint'
                    }
                }, 0);
        });

        //Set the link to rules
        $("#rules-link").attr("href", "https://playtcubed.com/shop/tcubed-tic-tac-toe-game/");

        //Set the redirect link when user clicks the logo
        $("#icon-link").attr("href", "https://playtcubed.com/shop/tcubed-tic-tac-toe-game/");
    }

    function setupAffiliateLinks(){
        const sponsorLinkId = "#sponsor-link";

        //Animate sponsor link on hover
        $(sponsorLinkId).hover(
            function () {
                $(this).addClass('pound')
            },
            function () {
                $(this).removeClass('pound')
            }
        );

        //Occasionally shake the sponsor icon to draw attention to it - don't always shake, otherwise it's obnoxious
        setInterval(function () {
            $(sponsorLinkId).toggleClass("shake-slow shake-constant");
            setTimeout(function () {
                $(sponsorLinkId).removeClass("shake-slow shake-constant")
            }, 3000);
        }, 17000);
    }

    $(document).ready(function () {

        //detectInstalledExtensions();

        setupFeatureDrawerLinks();

        setupAffiliateLinks();

        revealTitleAndLogo();

        startVideoOn('#video-chat-client', '#toggle-video-chat-client', '#video-chat-client-modals', '#poly-shadow');

        // Games converted from a game engine may have already attached to the game div. In that case, the content.html is assumed
        // to be appended instead of replacing. To allow for both scenarios, the following uses get instead of load
        // https://stackoverflow.com/questions/3203035/jquery-use-load-to-append-data-instead-of-replace
        $.get("../game/content.html", function (data) {
            $('#game').append(data);

            //Inform game.js that the content has finished loading or else game.js might not work properly on some elements
            if (typeof onGameContentLoaded === "function") {
                onGameContentLoaded($);
            }
        });

        //Testing opening of another extension when game is clicked
        // $('#game').on('click', function() {
        //     alert("Game clicked");
        //     chrome.runtime.sendMessage("nakkggegdbiaffbcmhjnfecbjbjailna", 'launch', response => {
        //         if (!response) {
        //             console.log('Not Launching!!!');
        //             return;
        //         }
        //         console.log('Not Launching!!!');
        //     });

        //     //The following produces other issues
        //     //chrome.runtime.sendMessage("nakkggegdbiaffbcmhjnfecbjbjailna", { launch: true });
        //     window.close();
        // });

        //Open and Close Drawer
        //TOO Re-implement once we have enough games to show in the right menu
        // var menuOpen = false; 
        // $('.fa-gamepad').on('click', function() {     
        //     if (menuOpen) { 
        //         $('#content').animate({
        //             marginLeft: 0
        //         }) 
        //         menuOpen = false;
        //     } else {
        //         $('#content').animate({
        //             marginLeft: '-380px'
        //         })  
        //         menuOpen = true;
        //     }
        // }); 

        //Close the Popup
        $('#header .fa-times').on('click', function () {
            window.close();
        });

        //Close the settings
        $('#settings .header .fa-times').on('click', function () {
            $("#settings, .settings-shadow, .settings-shadow.layer2, .settings-shadow.layer3").removeClass('show');
        });

        //Show settings when clicked
        $('.fa-cog').on('click', function () {
            $("#settings, .settings-shadow, .settings-shadow.layer2, .settings-shadow.layer3").addClass('show');
        });

        //Open/close game drawer
        var gameDrawerOpen = false;
        $('.fa-gamepad').on('click', function () { //TODO replace fa-gamepad with fa-crown once we have enough games to show in the right menu
            var drawer = $('#main .background');
            var remove = gameDrawerOpen ? 'open' : 'closed';
            var add = gameDrawerOpen ? 'closed' : 'open';
            drawer.removeClass(remove);
            drawer.addClass(add);
            gameDrawerOpen = !gameDrawerOpen;
        });

        //Animate Social icons on hover
        $('.fa, .fas, .fab').hover(
            function () {
                $(this).addClass('pound')
            },
            function () {
                $(this).removeClass('pound')
            }
        );        

        //Animate logo on hover
        $('#logo').hover(
            function () {
                $(this).addClass('shake-slow shake-constant')
            },
            function () {
                $(this).removeClass('shake-slow shake-constant')
            }
        );

        //Navigate to our site on clicking the logo
        $('#logo').on('click', function () {
            window.open("https://playtcubed.com/shop/tcubed-tic-tac-toe-game/");
        });

        $('#title').hover(
            //On Hover Over
            function () {
                //Stagger the shaking or else the whole header looks like it's shaking vs each letter
                $('.letter').each($).wait(50, function (index) {
                    $(this).addClass("shake-slow shake-constant");
                });
            },

            //On Hover Out
            function () {
                $('.letter').removeClass('shake-slow shake-constant')

                //The timer from the "Wait" function above might still be adding the effect. So, remove all after a given time
                setTimeout(function () {
                    $('.letter').removeClass("shake-slow shake-constant")
                }, 2000);
            },
        );

        //Animate drawer icons on hover
        $('.background i.fa-gamepad').hover(
            function () {
                $('#main  .background').addClass('hover-gamepad')
            },
            function () {
                $('#main  .background').removeClass('hover-gamepad')
            }
        );
        $('.background i.fa-cog').hover( //TODO replace fa-cog with fa-crown once we have enough games to show in the right menu
            function () {
                $('#main  .background').addClass('hover-cog')
            },
            function () {
                $('#main  .background').removeClass('hover-cog')
            }
        );

        //Occasionally shake the logo to draw attention to it - don't always shake, otherwise it's obnoxious
        setInterval(function () {
            $("#logo").toggleClass("shake-slow shake-constant");
            setTimeout(function () {
                $("#logo").removeClass("shake-slow shake-constant")
            }, 3000);
        }, 13000);

        //Occasionally shake the game drawer icon to draw attention to it - don't always shake, otherwise it's obnoxious
        setInterval(function () {
            $('.background').addClass('hover-gamepad');
            $("i.fa-gamepad").toggleClass("shake-slow shake-constant");
            setTimeout(function () {
                $('.background, i.fa-gamepad').removeClass("hover-gamepad shake-slow shake-constant")
            }, 3000);
        }, 60000);
    });
})(jQuery);