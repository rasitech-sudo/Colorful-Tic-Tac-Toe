var $ = require('jquery');
window.$ = $;
require('bootstrap');
const Video = require('../js/twilio-video');

function getVideoApp() {
    //const Video = Twilio.Video;

    /*const myUser = 'dude';
    const myRoom = 'myRoom';
    const url = `http://127.0.0.1:5001/battleshiptest-a000d/us-central1/getAccessToken?user=${myUser}&room=${myRoom}`;*/
    const isMobile = (() => {
        if (typeof navigator === 'undefined' || typeof navigator.userAgent !== 'string') {
            return false;
        }
        return /Mobile/.test(navigator.userAgent);
    })();

    const localTracks = {
        audio: null,
        video: null
    };

    const $modals = $('#modals');
    const $selectMicModal = $('#select-mic', $modals);
    const $selectCameraModal = $('#select-camera', $modals);
    const $showErrorModal = $('#show-error', $modals);
    const $joinRoomModal = $('#join-room', $modals);

    // ConnectOptions settings for a video web application.
    const connectOptions = {
        // Available only in Small Group or Group Rooms only. Please set "Room Type"
        // to "Group" or "Small Group" in your Twilio Console:
        // https://www.twilio.com/console/video/configure
        bandwidthProfile: {
            video: {
                dominantSpeakerPriority: 'high',
                mode: 'collaboration',
                renderDimensions: {
                    high: {
                        height: 720,
                        width: 1280
                    },
                    standard: {
                        height: 90,
                        width: 160
                    }
                }
            }
        },

        // Available only in Small Group or Group Rooms only. Please set "Room Type"
        // to "Group" or "Small Group" in your Twilio Console:
        // https://www.twilio.com/console/video/configure
        dominantSpeaker: true,

        // Comment this line to disable verbose logging.
        logLevel: 'debug',

        // Comment this line if you are playing music.
        maxAudioBitrate: 16000,

        // VP8 simulcast enables the media server in a Small Group or Group Room
        // to adapt your encoded video quality for each RemoteParticipant based on
        // their individual bandwidth constraints. This has no utility if you are
        // using Peer-to-Peer Rooms, so you can comment this line.
        preferredVideoCodecs: [{
            codec: 'VP8',
            simulcast: true
        }],

        // Capture 720p video @ 24 fps.
        video: {
            height: 720,
            frameRate: 24,
            width: 1280
        }
    };

    const $leave = $('#leave-room');
    const $room = $('#room');
    const $activeParticipant = $('div#active-participant > div.participant.main', $room);
    const $activeVideo = $('video', $activeParticipant);
    const $participants = $('div#participants', $room);

    // The current active Participant in the Room.
    let activeParticipant = null;

    // Whether the user has selected the active Participant by clicking on
    // one of the video thumbnails.
    let isActiveParticipantPinned = false;

    /*$.getJSON(url, accessToken => {
        console.log(accessToken);

        /!*Video.createLocalTracks({
            audio: true,
            video: {width: 640}
        }).then(localTracks => {
            const localMediaContainer = document.getElementById('local-media-container-id');
            localTracks.forEach(function (track) {
                localMediaContainer.appendChild(track.attach());
            });
            return Video.connect(accessToken.token, {
                name: myRoom,
                tracks: localTracks
            });
        }).then(room => {
            console.log('Connected to Room "%s"', room.name);

            room.participants.forEach(participantConnected);
            room.on('participantConnected', participantConnected);

            room.on('participantDisconnected', participantDisconnected);
            room.once('disconnected', error => room.participants.forEach(participantDisconnected));
        }, error => {
            console.error(`Unable to connect to Room: ${error.message}`);
        });*!/
    });*/

    // On mobile browsers, there is the possibility of not getting any media even
    // after the user has given permission, most likely due to some other app reserving
    // the media device. So, we make sure users always test their media devices before
    // joining the Room. For more best practices, please refer to the following guide:
    // https://www.twilio.com/docs/video/build-js-video-application-recommendations-and-best-practices
    const deviceIds = {
        audio: isMobile ? null : localStorage.getItem('audioDeviceId'),
        video: isMobile ? null : localStorage.getItem('videoDeviceId')
    };

    /**
     * Select your Room name, your screen name and join.
     * @param [error=null] - Error from the previous Room session, if any
     */
    async function selectAndJoinRoom(error = null) {
        const formData = await selectRoom($joinRoomModal, error);
        if (formData === false) {
            return () => {};
        }

        if (!formData) {
            // User wants to change the camera and microphone.
            // So, show them the microphone selection modal.
            deviceIds.audio = null;
            deviceIds.video = null;
            return selectMicrophone();
        }
        const {
            identity,
            roomName
        } = formData;

        try {
            let url = `https://us-central1-arcade-4a795.cloudfunctions.net/getAccessToken?user=${identity}&room=${roomName}`;

            let token;

            // Fetch an AccessToken to join the Room.
            const response = await fetch(url);

            // Extract the AccessToken from the Response.
            token = await response.text();

            /*if (isMobile) {
                // hack to get around https requirement for using media devices on non-localhost domains
                token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsImN0eSI6InR3aWxpby1mcGE7dj0xIn0.eyJqdGkiOiJTSzNjODA1YzFlNTJiMDcyZGZlNjI2YTExZWI3M2RhNTliLTE2MDY3MTUxODAiLCJpc3MiOiJTSzNjODA1YzFlNTJiMDcyZGZlNjI2YTExZWI3M2RhNTliIiwic3ViIjoiQUM0OWI2MGI5YjE2MDkyMTJkOGI2YjBjYjJkYWQ1YTVkYSIsImV4cCI6MTYwNjcxODc4MCwiZ3JhbnRzIjp7ImlkZW50aXR5IjoicCIsInZpZGVvIjp7InJvb20iOiJ0ZXN0In19fQ.YqHF5gP63qY_PWtsezqxCgtkkLK-jFPo-Q_-MTl0R5U";
            } else {
                // Fetch an AccessToken to join the Room.
                const response = await fetch(url);

                // Extract the AccessToken from the Response.
                token = await response.text();
            }*/

            // Add the specified audio device ID to ConnectOptions.
            connectOptions.audio = {
                deviceId: {
                    exact: deviceIds.audio
                }
            };

            // Add the specified Room name to ConnectOptions.
            connectOptions.name = roomName;

            // Add the specified video device ID to ConnectOptions.
            connectOptions.video.deviceId = {
                exact: deviceIds.video
            };

            // Join the Room.
            await joinRoom(token, connectOptions);

            if (!($("#local-media-container-id").length)) {
                // The video chat client was closed, so do nothing.
                return () => {};
            } else {
                // After the video session, display the room selection modal.
                return selectAndJoinRoom();
            }

        } catch (error) {
            return selectAndJoinRoom(error);
        }
    }

    /**
     * Select your camera.
     */
    async function selectCamera() {
        if (deviceIds.video === null) {
            try {
                deviceIds.video = await selectMedia('video', $selectCameraModal, stream => {
                    const $video = $('video', $selectCameraModal);
                    $video.get(0).srcObject = stream;
                });
            } catch (error) {
                showError($showErrorModal, error);
                return;
            }
        }
        return selectAndJoinRoom();
    }

    /**
     * Select your microphone.
     */
    async function selectMicrophone() {
        if (deviceIds.audio === null) {
            try {
                deviceIds.audio = await selectMedia('audio', $selectMicModal, stream => {
                    const $levelIndicator = $('svg rect', $selectMicModal);
                    const maxLevel = Number($levelIndicator.attr('height'));
                    micLevel(stream, maxLevel, level => $levelIndicator.attr('y', maxLevel - level));
                });
            } catch (error) {
                showError($showErrorModal, error);
                return;
            }
        }
        return selectCamera();
    }

    // If the current browser is not supported by twilio-video.js, show an error
    // message. Otherwise, start the application.
    /*window.addEventListener('load',
        Video.isSupported
            ? selectMicrophone
            : () => {
                showError($showErrorModal, new Error('This browser is not supported.'));
            });*/

    const startVideoApp = Video.isSupported ?
        selectMicrophone :
        () => {
            showError($showErrorModal, new Error('This browser is not supported.'));
        }

    function participantConnected(participant) {
        console.log('Participant "%s" connected', participant.identity);

        const div = document.createElement('div');
        div.id = participant.sid;
        div.innerText = participant.identity;

        participant.on('trackSubscribed', track => trackSubscribed(div, track));
        participant.on('trackUnsubscribed', trackUnsubscribed);

        participant.tracks.forEach(publication => {
            if (publication.isSubscribed) {
                trackSubscribed(div, publication.track);
            }
        });

        document.body.appendChild(div);
    }

    function participantDisconnected(participant) {
        console.log('Participant "%s" disconnected', participant.identity);
        document.getElementById(participant.sid).remove();
    }

    function trackSubscribed(div, track) {
        div.appendChild(track.attach());
    }

    function trackUnsubscribed(track) {
        track.detach().forEach(element => element.remove());
    }

    /**
     * Start capturing media from the given input device.
     * @param kind - 'audio' or 'video'
     * @param deviceId - the input device ID
     * @param render - the render callback
     * @returns {Promise<void>} Promise that is resolved if successful
     */
    async function applyInputDevice(kind, deviceId, render) {
        // Create a new LocalTrack from the given Device ID.
        const [track] = await Video.createLocalTracks({
            [kind]: {
                deviceId
            }
        });

        // Stop the previous LocalTrack, if present.
        if (localTracks[kind]) {
            localTracks[kind].stop();
        }

        // Render the current LocalTrack.
        localTracks[kind] = track;
        render(new MediaStream([track.mediaStreamTrack]));
    }

    /**
     * Get the list of input devices of a given kind.
     * @param kind - 'audio' | 'video'
     * @returns {Promise<MediaDeviceInfo[]>} the list of media devices
     */
    async function getInputDevices(kind) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        return devices.filter(device => device.kind === `${kind}input`);
    }

    /**
     * Select the input for the given media kind.
     * @param kind - 'audio' or 'video'
     * @param $modal - the modal for selecting the media input
     * @param render - the media render function
     * @returns {Promise<string>} the device ID of the selected media input
     */
    async function selectMedia(kind, $modal, render) {
        const $apply = $('button', $modal);
        const $inputDevices = $('select', $modal);
        const setDevice = () => applyInputDevice(kind, $inputDevices.val(), render);

        // Get the list of available media input devices.
        let devices = await getInputDevices(kind);

        // Apply the default media input device.
        await applyInputDevice(kind, devices[0].deviceId, render);

        // If all device IDs and/or labels are empty, that means they were
        // enumerated before the user granted media permissions. So, enumerate
        // the devices again.
        if (devices.every(({
                deviceId,
                label
            }) => !deviceId || !label)) {
            devices = await getInputDevices(kind);
        }

        // Populate the modal with the list of available media input devices.
        $inputDevices.html(devices.map(({
            deviceId,
            label
        }) => {
            return `<option value="${deviceId}">${label}</option>`;
        }));

        return new Promise(resolve => {
            $modal.on('shown.bs.modal', function onShow() {
                $modal.off('shown.bs.modal', onShow);

                // When the user selects a different media input device, apply it.
                $inputDevices.change(setDevice);

                // When the user clicks the "Apply" button, close the modal.
                $apply.click(function onApply() {
                    $inputDevices.off('change', setDevice);
                    $apply.off('click', onApply);
                    $modal.modal('hide');
                });
            });

            // When the modal is closed, save the device ID.
            $modal.on('hidden.bs.modal', function onHide() {
                $modal.off('hidden.bs.modal', onHide);

                // Stop the LocalTrack, if present.
                if (localTracks[kind]) {
                    localTracks[kind].stop();
                    localTracks[kind] = null;
                }

                // Resolve the Promise with the saved device ID.
                const deviceId = $inputDevices.val();
                localStorage.setItem(`${kind}DeviceId`, deviceId);
                resolve(deviceId);
            });

            // Show the modal.
            $modal.modal({
                backdrop: 'static',
                focus: true,
                keyboard: false,
                show: true
            });
        });
    }

    /**
     * Show the given error.
     * @param $modal - modal for showing the error.
     * @param error - Error to be shown.
     */
    function showError($modal, error) {
        // Add the appropriate error message to the alert.
        $('div.alert', $modal).html(getUserFriendlyError(error));
        $modal.modal({
            backdrop: 'static',
            focus: true,
            keyboard: false,
            show: true
        });

        $('#show-error-label', $modal).text(`${error.name}${error.message
        ? `: ${error.message}`
        : ''}`);
    }

    const USER_FRIENDLY_ERRORS = {
        NotAllowedError: () => {
            return '<b>Causes: </b><br>1. The user has denied permission for your app to access the input device either by dismissing the permission dialog or clicking on the "deny" button.<br> 2. The user has denied permission for your app to access the input device in the browser settings.<br>' +
                '<br><b>Solutions: </b><br> 1. The user should reload your app and grant permission to access the input device.<br> 2. The user should allow access to the input device in the browser settings and then reload your app.';
        },
        NotFoundError: () => {
            return '<b>Cause: </b><br>1. The user has disabled the input device for the browser in the system settings.<br>2. The user\'s machine does not have such input device connected to it.<br>' +
                '<br><b>Solution</b><br>1. The user should enable the input device for the browser in the system settings<br>2. The user should have atleast one input device connected.';
        },
        NotReadableError: () => {
            return '<b>Cause: </b><br>The browser could not start media capture with the input device even after the user gave permission, probably because another app or tab has reserved the input device.<br>' +
                '<br><b>Solution: </b><br>The user should close all other apps and tabs that have reserved the input device and reload your app, or worst case, restart the browser.';
        },
        OverconstrainedError: error => {
            return error.constraint === 'deviceId' ?
                '<b>Cause: </b><br>Your saved microphone or camera is no longer available.<br><br><b>Solution: </b><br>Please make sure the input device is connected to the machine.' :
                '<b>Cause: </b><br>Could not satisfy the requested media constraints. One of the reasons ' +
                'could be that your saved microphone or camera is no longer available.<br><br><b>Solution: </b><br>Please make sure the input device is connected to the machine.';
        },
        TypeError: () => {
            return '<b>Cause: </b><br><code>navigator.mediaDevices</code> does not exist.<br>' +
                '<br><b>Solution: </b><br>If you\'re sure that the browser supports ' +
                '<code>navigator.mediaDevices</code>, make sure your app is being served ' +
                'from a secure context (<code>localhost</code> or an <code>https</code> domain).';
        }
    };

    /**
     * Get a user friendly Error message.
     * @param error - the Error for which a user friendly message is needed
     * @returns {string} the user friendly message
     */
    function getUserFriendlyError(error) {
        const errorName = [error.name, error.constructor.name].find(errorName => {
            return errorName in USER_FRIENDLY_ERRORS;
        });
        return errorName ? USER_FRIENDLY_ERRORS[errorName](error) : error.message;
    }

    /**
     * Calculate the root mean square (RMS) of the given array.
     * @param samples
     * @returns {number} the RMS value
     */
    function rootMeanSquare(samples) {
        const sumSq = samples.reduce((sumSq, sample) => sumSq + sample * sample, 0);
        return Math.sqrt(sumSq / samples.length);
    }

    /**
     * Poll the microphone's input level.
     * @param stream - the MediaStream representing the microphone
     * @param maxLevel - the calculated level should be in the range [0 - maxLevel]
     * @param onLevel - called when the input level changes
     */
    function micLevel(stream, maxLevel, onLevel) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioContext = AudioContext ? new AudioContext() : null;
        audioContext.resume().then(() => {
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 1024;
            analyser.smoothingTimeConstant = 0.5;

            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);
            const samples = new Uint8Array(analyser.frequencyBinCount);

            const track = stream.getTracks()[0];
            let level = null;

            requestAnimationFrame(function checkLevel() {
                analyser.getByteFrequencyData(samples);
                const rms = rootMeanSquare(samples);
                const log2Rms = rms && Math.log2(rms);
                const newLevel = Math.ceil(maxLevel * log2Rms / 8);

                if (level !== newLevel) {
                    level = newLevel;
                    onLevel(level);
                }

                requestAnimationFrame(track.readyState === 'ended' ?
                    () => onLevel(0) :
                    checkLevel);
            });
        });
    }

    /**
     * Add URL parameters to the web app URL.
     * @param params - the parameters to add
     */
    function addUrlParams(params) {
        const combinedParams = Object.assign(getUrlParams(), params);
        const serializedParams = Object.entries(combinedParams)
            .map(([name, value]) => `${name}=${encodeURIComponent(value)}`)
            .join('&');
        history.pushState(null, '', `${location.pathname}?${serializedParams}`);
    }

    /**
     * Generate an object map of URL parameters.
     * @returns {*}
     */
    function getUrlParams() {
        const serializedParams = location.search.split('?')[1];
        const nvpairs = serializedParams ? serializedParams.split('&') : [];
        return nvpairs.reduce((params, nvpair) => {
            const [name, value] = nvpair.split('=');
            params[name] = decodeURIComponent(value);
            return params;
        }, {});
    }

    /**
     * Select your Room name and identity (screen name).
     * @param $modal - modal for selecting your Room name and identity
     * @param error - Error from the previous Room session, if any
     */
    function selectRoom($modal, error) {
        const $alert = $('div.alert', $modal);
        const $changeMedia = $('button.btn-dark', $modal);
        const $identity = $('#screen-name', $modal);
        const $join = $('button.btn-primary', $modal);
        const $roomName = $('#room-name', $modal);
        const $cancel = $('#cancel');

        // If Room name is provided as a URL parameter, pre-populate the Room name field.
        const {
            roomName
        } = getUrlParams();
        if (roomName) {
            $roomName.val(roomName);
        }

        // If any previously saved user name exists, pre-populate the user name field.
        const identity = localStorage.getItem('userName');
        if (identity) {
            $identity.val(identity);
        }

        if (error) {
            $alert.html(`<h5>${error.name}${error.message
            ? `: ${error.message}`
            : ''}</h5>${getUserFriendlyError(error)}`);
            $alert.css('display', '');
        } else {
            $alert.css('display', 'none');
        }

        return new Promise(resolve => {
            $modal.on('shown.bs.modal', function onShow() {
                $modal.off('shown.bs.modal', onShow);

                $cancel.click(function onCancel() {
                    $cancel.off('click', onCancel);
                    $('#leave-room').hide();
                    $modal.modal('hide');
                    resolve(false);
                });

                $changeMedia.click(function onChangeMedia() {
                    $changeMedia.off('click', onChangeMedia);
                    $modal.modal('hide');
                    resolve(null);
                });

                $join.click(function onJoin() {
                    const identity = $identity.val();
                    const roomName = $roomName.val();
                    if (identity && roomName) {
                        // Append the Room name to the web application URL.
                        addUrlParams({
                            roomName
                        });

                        // Save the user name.
                        localStorage.setItem('userName', identity);

                        $join.off('click', onJoin);
                        $modal.modal('hide');
                    }
                });
            });

            $modal.on('hidden.bs.modal', function onHide() {
                $modal.off('hidden.bs.modal', onHide);
                const identity = $identity.val();
                const roomName = $roomName.val();
                resolve({
                    identity,
                    roomName
                });
            });

            $modal.modal({
                backdrop: 'static',
                focus: true,
                keyboard: false,
                show: true
            });
        });
    }

    /**
     * Set the active Participant's video.
     * @param participant - the active Participant
     */
    function setActiveParticipant(participant) {
        if (activeParticipant) {
            const $activeParticipant = $(`div#${activeParticipant.sid}`, $participants);
            $activeParticipant.removeClass('active');
            $activeParticipant.removeClass('pinned');

            // Detach any existing VideoTrack of the active Participant.
            const {
                track: activeTrack
            } = Array.from(activeParticipant.videoTracks.values())[0] || {};
            if (activeTrack) {
                activeTrack.detach($activeVideo.get(0));
                $activeVideo.css('opacity', '0');
            }
        }

        // Set the new active Participant.
        activeParticipant = participant;
        const {
            identity,
            sid
        } = participant;
        const $participant = $(`div#${sid}`, $participants);

        $participant.addClass('active');
        if (isActiveParticipantPinned) {
            $participant.addClass('pinned');
        }

        // Attach the new active Participant's video.
        const {
            track
        } = Array.from(participant.videoTracks.values())[0] || {};
        if (track) {
            track.attach($activeVideo.get(0));
            $activeVideo.css('opacity', '');
        }

        // Set the new active Participant's identity
        $activeParticipant.attr('data-identity', identity);
    }

    /**
     * Set the current active Participant in the Room.
     * @param room - the Room which contains the current active Participant
     */
    function setCurrentActiveParticipant(room) {
        const {
            dominantSpeaker,
            localParticipant
        } = room;
        setActiveParticipant(dominantSpeaker || localParticipant);
    }

    /**
     * Set up the Participant's media container.
     * @param participant - the Participant whose media container is to be set up
     * @param room - the Room that the Participant joined
     */
    function setupParticipantContainer(participant, room) {
        const {
            identity,
            sid
        } = participant;

        // Add a container for the Participant's media.
        const $container = $(`<div class="participant" data-identity="${identity}" id="${sid}">
<audio autoplay ${participant === room.localParticipant ? 'muted' : ''} style="opacity: 0"></audio>
<video autoplay muted playsinline style="opacity: 0"></video>
</div>`);

        // Toggle the pinning of the active Participant's video.
        $container.on('click', () => {
            if (activeParticipant === participant && isActiveParticipantPinned) {
                // Unpin the RemoteParticipant and update the current active Participant.
                setVideoPriority(participant, null);
                isActiveParticipantPinned = false;
                setCurrentActiveParticipant(room);
            } else {
                // Pin the RemoteParticipant as the active Participant.
                if (isActiveParticipantPinned) {
                    setVideoPriority(activeParticipant, null);
                }
                setVideoPriority(participant, 'high');
                isActiveParticipantPinned = true;
                setActiveParticipant(participant);
            }
        });

        // Add the Participant's container to the DOM.
        $participants.append($container);
    }

    /**
     * Set the VideoTrack priority for the given RemoteParticipant. This has no
     * effect in Peer-to-Peer Rooms.
     * @param participant - the RemoteParticipant whose VideoTrack priority is to be set
     * @param priority - null | 'low' | 'standard' | 'high'
     */
    function setVideoPriority(participant, priority) {
        participant.videoTracks.forEach(publication => {
            const track = publication.track;
            if (track && track.setPriority) {
                track.setPriority(priority);
            }
        });
    }

    /**
     * Attach a Track to the DOM.
     * @param track - the Track to attach
     * @param participant - the Participant which published the Track
     */
    function attachTrack(track, participant) {
        // Attach the Participant's Track to the thumbnail.
        const $media = $(`div#${participant.sid} > ${track.kind}`, $participants);
        $media.css('opacity', '');
        track.attach($media.get(0));

        // If the attached Track is a VideoTrack that is published by the active
        // Participant, then attach it to the main video as well.
        if (track.kind === 'video' && participant === activeParticipant) {
            track.attach($activeVideo.get(0));
            $activeVideo.css('opacity', '');
        }
    }

    /**
     * Detach a Track from the DOM.
     * @param track - the Track to be detached
     * @param participant - the Participant that is publishing the Track
     */
    function detachTrack(track, participant) {
        // Detach the Participant's Track from the thumbnail.
        const $media = $(`div#${participant.sid} > ${track.kind}`, $participants);
        $media.css('opacity', '0');
        track.detach($media.get(0));

        // If the detached Track is a VideoTrack that is published by the active
        // Participant, then detach it from the main video as well.
        if (track.kind === 'video' && participant === activeParticipant) {
            track.detach($activeVideo.get(0));
            $activeVideo.css('opacity', '0');
        }
    }

    /**
     * Handle the Participant's media.
     * @param participant - the Participant
     * @param room - the Room that the Participant joined
     */
    function participantConnected(participant, room) {
        // Set up the Participant's media container.
        setupParticipantContainer(participant, room);

        // Handle the TrackPublications already published by the Participant.
        participant.tracks.forEach(publication => {
            trackPublished(publication, participant);
        });

        // Handle theTrackPublications that will be published by the Participant later.
        participant.on('trackPublished', publication => {
            trackPublished(publication, participant);
        });
    }

    /**
     * Handle a disconnected Participant.
     * @param participant - the disconnected Participant
     * @param room - the Room that the Participant disconnected from
     */
    function participantDisconnected(participant, room) {
        // If the disconnected Participant was pinned as the active Participant, then
        // unpin it so that the active Participant can be updated.
        if (activeParticipant === participant && isActiveParticipantPinned) {
            isActiveParticipantPinned = false;
            setCurrentActiveParticipant(room);
        }

        // Remove the Participant's media container.
        $(`div#${participant.sid}`, $participants).remove();
    }

    /**
     * Handle to the TrackPublication's media.
     * @param publication - the TrackPublication
     * @param participant - the publishing Participant
     */
    function trackPublished(publication, participant) {
        // If the TrackPublication is already subscribed to, then attach the Track to the DOM.
        if (publication.track) {
            attachTrack(publication.track, participant);
        }

        // Once the TrackPublication is subscribed to, attach the Track to the DOM.
        publication.on('subscribed', track => {
            attachTrack(track, participant);
        });

        // Once the TrackPublication is unsubscribed from, detach the Track from the DOM.
        publication.on('unsubscribed', track => {
            detachTrack(track, participant);
        });
    }

    /**
     * Join a Room.
     * @param token - the AccessToken used to join a Room
     * @param connectOptions - the ConnectOptions used to join a Room
     */
    async function joinRoom(token, connectOptions) {
        // Join to the Room with the given AccessToken and ConnectOptions.
        const room = await Video.connect(token, connectOptions);

        // Save the LocalVideoTrack.
        let localVideoTrack = Array.from(room.localParticipant.videoTracks.values())[0].track;

        // Make the Room available in the JavaScript console for debugging.
        window.room = room;

        // Handle the LocalParticipant's media.
        participantConnected(room.localParticipant, room);

        // Subscribe to the media published by RemoteParticipants already in the Room.
        room.participants.forEach(participant => {
            participantConnected(participant, room);
        });

        // Subscribe to the media published by RemoteParticipants joining the Room later.
        room.on('participantConnected', participant => {
            participantConnected(participant, room);
        });

        // Handle a disconnected RemoteParticipant.
        room.on('participantDisconnected', participant => {
            participantDisconnected(participant, room);
        });

        // Set the current active Participant.
        setCurrentActiveParticipant(room);

        // Update the active Participant when changed, only if the user has not
        // pinned any particular Participant as the active Participant.
        room.on('dominantSpeakerChanged', () => {
            if (!isActiveParticipantPinned) {
                setCurrentActiveParticipant(room);
            }
        });

        // Leave the Room when the "Leave Room" button is clicked.
        $leave.click(function onLeave() {
            $leave.off('click', onLeave);
            room.disconnect();
        });

        return new Promise((resolve, reject) => {
            // Leave the Room when the "beforeunload" event is fired.
            window.onbeforeunload = () => {
                room.disconnect();
            };

            if (isMobile) {
                // TODO(mmalavalli): investigate why "pagehide" is not working in iOS Safari.
                // In iOS Safari, "beforeunload" is not fired, so use "pagehide" instead.
                window.onpagehide = () => {
                    room.disconnect();
                };

                // On mobile browsers, use "visibilitychange" event to determine when
                // the app is backgrounded or foregrounded.
                document.onvisibilitychange = async () => {
                    if (document.visibilityState === 'hidden') {
                        // When the app is backgrounded, your app can no longer capture
                        // video frames. So, stop and unpublish the LocalVideoTrack.
                        localVideoTrack.stop();
                        room.localParticipant.unpublishTrack(localVideoTrack);
                    } else {
                        // When the app is foregrounded, your app can now continue to
                        // capture video frames. So, publish a new LocalVideoTrack.
                        localVideoTrack = await createLocalVideoTrack(connectOptions.video);
                        await room.localParticipant.publishTrack(localVideoTrack);
                    }
                };
            }

            room.once('disconnected', (room, error) => {
                // Clear the event handlers on document and window..
                window.onbeforeunload = null;
                if (isMobile) {
                    window.onpagehide = null;
                    document.onvisibilitychange = null;
                }

                // Stop the LocalVideoTrack.
                localVideoTrack.stop();

                // Handle the disconnected LocalParticipant.
                participantDisconnected(room.localParticipant, room);

                // Handle the disconnected RemoteParticipants.
                room.participants.forEach(participant => {
                    participantDisconnected(participant, room);
                });

                // Clear the active Participant's video.
                $activeVideo.get(0).srcObject = null;

                // Clear the Room reference used for debugging from the JavaScript console.
                window.room = null;

                if (error) {
                    // Reject the Promise with the TwilioError so that the Room selection
                    // modal (plus the TwilioError message) can be displayed.
                    reject(error);
                } else {
                    // Resolve the Promise so that the Room selection modal can be
                    // displayed.
                    resolve();
                }
            });
        });
    }

    startVideoApp();
}

function leaveVideoAppRoom() {
    if (window.room != null) {
        window.room.disconnect();
    }
}

export {
    getVideoApp,
    leaveVideoAppRoom
}