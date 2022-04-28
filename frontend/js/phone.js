const urlParams = new URLSearchParams(window.location.search);
const host = urlParams.get('host') || location.hostname;
const domain = urlParams.get('domain') || host;
const user = urlParams.get('user') || '1001';
const dial = urlParams.get('dial') || '';
/* By all means, don't intake the password via the query string in production! */
const password = urlParams.get('password') || 'ChangeMeUser';

var socket = new JsSIP.WebSocketInterface('ws://' + host + ':5066');
var configuration = {
    sockets: [ socket ],
    uri: 'sip:' + user + '@' + domain,
    password: password,
};

var ua = new JsSIP.UA(configuration);

ua.on("registered", function (data) {
    elStatus.innerHTML = 'Ready (' + user + ')';
});

ua.on("disconnected", function (data) {
    elStatus.innerHTML = '<div class="alert alert-danger p-0">Disconnected!</div>';
});

ua.on("registrationFailed", function (data) {
    elStatus.innerHTML = '<div class="alert alert-danger p-0">Registration failed!</div>';
});

ua.on("newRTCSession", function (data) {
    var session = data.session;

    if (data.originator == 'remote') {
        if (inCall || ringing) {
            session.terminate({ status_code: 486 });
            return;
        }

        ringing = true;
        elRingtone.currentTime = 0;
        elRingtone.play();
        elAnswer.classList.add('pulse');
        window.session = session;
        elStatus.innerHTML = '<div class="alert alert-success p-0">Incoming call from ' + session.remote_identity.display_name + '</div>';
    }

    session.on("confirmed", function () {
        elStatus.innerHTML = 'Call answered!';
        elDisplay.value = '';
        inCall = true;
        inProgress = false;
        window.session = session;

        var remoteAudio = document.getElementById('remote');
        remoteAudio.srcObject = session.connection.getRemoteStreams()[0];
    });

    session.on("ended", function () {
        elStatus.innerHTML = 'Call ended';
        elDisplay.value = '';
        inCall = false;
        inProgress = false;
        ringing = false;
        elRingtone.pause();
        elAnswer.classList.remove('pulse');
        session = null;
        elMute.innerHTML = 'Mute';

        setTimeout(function () {
            elStatus.innerHTML = 'Ready (' + user + ')';
        }, 500);
    });

    session.on("failed", function () {
        console.log('session has failed');
    });
});

const constraints = { 'audio': true, 'video': false };

function placeCall(ext) {
    var eventHandlers = {
        'failed': function (e) {
            elStatus.innerHTML = '<div class="alert alert-danger p-0">Call failed</div>';
            console.error(e);
        },
    };

    var options = {
        'eventHandlers': eventHandlers,
        'mediaConstraints': constraints,
        'sessionTimersExpires': 1800,
        'pcConfig': {
            'iceServers': [
                { 'urls': ['stun:stun.gmx.net'] },
            ]
        }
    };

    var session = ua.call(ext + '@' + domain, options);

    return session;
}

function onAnswer() {
    if (!inCall && !ringing) {
        if (!elDisplay.value.length) {
            return;
        }

        const ext = elDisplay.value;
        elDisplay.value = '';
        elStatus.innerHTML = 'Calling ' + ext + ' ...';

        inProgress = placeCall(ext);
    }

    if (ringing && session) {
        ringing = false;
        elRingtone.pause();
        elAnswer.classList.remove('pulse');
        session.answer({
            'mediaConstraints': constraints,
            'sessionTimersExpires': 1800,
            'pcConfig': {
                'iceServers': [
                    { 'urls': ['stun:stun.gmx.net'] },
                ]
            }
        });
    }
}

function onEnd() {
    if (inCall && session) {
        session.terminate();
    } else if (ringing && session) {
        session.terminate({ status_code: 603 });
    } else if (inProgress) {
        inProgress.terminate({ status_code: 487 });
    } else {
        elDisplay.value = '';
    }
}

function onMute() {
    if (inCall && session) {
        if (!session.isMuted().audio) {
            session.mute();
            elMute.innerHTML = 'Unmute';
        } else {
            session.unmute();
            elMute.innerHTML = 'Mute';
        }
    }
}

function onKey(key) {
    elDisplay.value += key;

    if (inCall && session) {
        session.sendDTMF(key);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    /* Oversimplifying for demonstrative purposes, don't use globals in this fashion! */
    window.elRingtone = document.getElementById('ringtone');
    window.elAnswer = document.getElementById('answer');
    window.elDisplay = document.getElementById('display');
    window.elStatus = document.getElementById('status');
    window.elMute = document.getElementById('mute');
    window.inCall = false;
    window.inProgress = false;
    window.ringing = false;

    if (!navigator.mediaDevices) {
        window.alert("Ooops, cannot access media devices!");
        elStatus.innerHTML = '<div class="alert alert-danger p-0">Media access error!</div>';
    }

    navigator.mediaDevices.getUserMedia(constraints)
        .then(function (stream) {
            elDisplay.value = dial;
            ua.start();
        })
        .catch(function (err) {
            window.alert("Ooops, we've be media access!");
            elStatus.innerHTML = '<div class="alert alert-danger p-0">Media access error!</div>';
        });
});
