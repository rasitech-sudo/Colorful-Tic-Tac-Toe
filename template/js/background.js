//================================================
/*

Colorful Tic Tac Toe 5x5.
Copyright (C) 2019 Chris Sprague
www.PlaytCubed.com
www.HoverDroids.com
www.Spragucm.com

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

//Respond to requests from our other extensions (e.g. determine if present, launch, etc)
chrome.runtime.onMessageExternal.addListener(
	(message, sender, sendResponse) => {
		//Response to request for this extension's version number
		if (message == 'version') {
			const manifest = chrome.runtime.getManifest();
			sendResponse({
				type: 'success',
				version: manifest.version
			});
			return true;
			
		} else if (message == "launch") {
			//Doesn't work as expected. Blocked?
			//chrome.app.window.create("popup.html");
			
            //The following gets us close, but we'll need to go ahead and make this the fullscreen popup window
            //TODO - define different windows size templates to open
			window.open("popup.html", "extension_popup", "width=300,height=400,status=no,scrollbars=yes,resizable=no");
		}
	}
);

chrome.runtime.onInstalled.addListener((details) => {
	if (details.reason.search(/install/g) === -1) {
		return
	}
	/* chrome.tabs.create({
		url: chrome.extension.getURL("template/welcome.html"),
		active: true
	}) */
})