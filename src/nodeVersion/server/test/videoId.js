var ajax = {};
ajax.x = function () {
    if (typeof XMLHttpRequest !== 'undefined') {
        return new XMLHttpRequest();
    }
    var versions = [
        "MSXML2.XmlHttp.6.0",
        "MSXML2.XmlHttp.5.0",
        "MSXML2.XmlHttp.4.0",
        "MSXML2.XmlHttp.3.0",
        "MSXML2.XmlHttp.2.0",
        "Microsoft.XmlHttp"
    ];

    var xhr;
    for (var i = 0; i < versions.length; i++) {
        try {
            xhr = new ActiveXObject(versions[i]);
            break;
        } catch (e) {}
    }
    return xhr;
};

var encrypt = function (text) {
    var buffer = forge.util.createBuffer(text);
    var r = forge.random.getBytesSync(16);
    var key = forge.util.createBuffer('L4rTnKVGyqkDM856', 'utf8');
    var iv = forge.util.createBuffer(r);
    var ciphertext = forge.util.createBuffer();

    var cipher = forge.aes.createEncryptionCipher(key, 'CFB');
    cipher.start(iv);
    cipher.update(buffer);
    cipher.finish();

    iv = forge.util.createBuffer(r);
    var encrypted = cipher.output;

    for (var i = 0, len = iv.length(); i < len; i++) ciphertext.putByte(iv.getByte(i));
    for (var i = 0, len = encrypted.length(); i < len; i++) ciphertext.putByte(encrypted.getByte(i));

    var encoded = forge.util.encode64(ciphertext.getBytes());

    return encoded;
};

ajax.send = function (url, callback, method, headers, data, async) {
    if (async === undefined) {
        async = true;
    }
    var x = ajax.x();

    x.open(method, url, async);
    x.onreadystatechange = function () {
        if (x.readyState == 4) {
            callback(JSON.parse(x.responseText));
        }
    };

    if (method == 'POST') {
        x.setRequestHeader('Content-type', 'application/json');
    }

    x.setRequestHeader('Accept', 'application/json');

    x.send(data);
};

ajax.get = function (url, headers, params, callback, async) {
    var query = [];
    for (var key in params) {
        query.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
    }
    ajax.send(url + (query.length ? '?' + query.join('&') : ''), callback, 'GET', headers, null, async);
};

ajax.post = function (url, headers, params, data, callback, async) {
    var query = [];
    for (var key in params) {
        query.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
    }
    ajax.send(url + (query.length ? '?' + query.join('&') : ''), callback, 'POST', headers, JSON.stringify(data), async);
};


var decrypt = function (k, encoded) {
    var decoded = forge.util.decode64(encoded);
    var buffer = forge.util.createBuffer(decoded);

    var key = forge.util.createBuffer(k, 'utf8');
    var iv = forge.util.createBuffer();
    var ciphertext = forge.util.createBuffer();

    for (var i = 0; i < 16; i++) iv.putByte(buffer.getByte(i));
    for (var i = 0, len = buffer.length(); i < len; i++) ciphertext.putByte(buffer.getByte(i));

    var cipher = forge.aes.createDecryptionCipher(key, 'CFB');
    cipher.start(iv);
    cipher.update(ciphertext);
    cipher.finish();

    return cipher.output.getBytes();
};

var loadVideo = function (k, t, v) {
    plyr.setup();

    var token = decrypt(k, t);
    document.cookie = 'token=' + token + ';path=/video';

    var videoID = v;
    var element = document.getElementById('video-source');
    if (!element) return;
    var video = element.parentNode;

    if (element.src) return;

    video.ondrag = function () {
        return false;
    };
    video.ondragend = function () {
        return false;
    };
    video.ondragstart = function () {
        return false;
    };
    video.oncontextmenu = function () {
        return false;
    };

    element.setAttribute('src', '/video?id=' + encodeURIComponent(videoID) + '&ts=' + Date.now());

    video.load();
};


var recaptcha = function (response) {
    if (!response || response.length == 0) return;

    var url = '/episode';
    var data = {
        'episode_id': 34149,
        'recaptcha': response,
    };

    ajax.post(url, null, null, data, function (response) {
        if (!response.data) return;

        var data = response.data;
        var key = data.key;
        var token = data.token;
        var videoID = data.encrypted;

        loadVideo(key, token, videoID);
    });
};


var showFacebookLikePromotion = function () {
    var target = document.getElementById('facebook-like-promotion');
    target.style.display = 'block';
};

var hideFacebookLikePromotion = function () {
    var target = document.getElementById('facebook-like-promotion');
    target.style.display = 'none';
};

var showFacebookSharePromotion = function () {
    var target = document.getElementById('facebook-share-promotion');
    target.style.display = 'block';
};

var hideFacebookSharePromotion = function () {
    var target = document.getElementById('facebook-share-promotion');
    target.style.display = 'none';
};

var shareEpisode = function () {
    FB.ui({
            method: 'share',
            href: 'https://anigod.com/episode/7화-34149',
        },

        function (response) {
            if (response && !response.error_message) {
                hideFacebookSharePromotion();
            } else {
                showFacebookSharePromotion();
            }
        }
    );
};

(function () {

    var closeMobileRevenuehits1 = document.getElementById('episode-video-ad-close-mobile-revenuehits1');
    var closeWebRevenuehits1 = document.getElementById('episode-video-ad-close-web-revenuehits1');

    closeMobileRevenuehits1.onclick = function () {
        var target = this.parentElement.parentElement;
        target.parentElement.removeChild(target);
    };

    closeWebRevenuehits1.onclick = function () {
        var target = this.parentElement.parentElement;
        target.parentElement.removeChild(target);
    };



    var closeMobileRevenuehits2 = document.getElementById('episode-video-ad-close-mobile-revenuehits2');
    var closeWebRevenuehits2 = document.getElementById('episode-video-ad-close-web-revenuehits2');

    closeMobileRevenuehits2.onclick = function () {
        var target = this.parentElement.parentElement;
        target.parentElement.removeChild(target);
    };

    closeWebRevenuehits2.onclick = function () {
        var target = this.parentElement.parentElement;
        target.parentElement.removeChild(target);
    };

})();

(function () {
    var like = localStorage.getItem('like-anigod');
    if (like != '1') {
        showFacebookLikePromotion();
    } else {
        showFacebookSharePromotion();
    }
})();

(function () {
    var createID = function () {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 24; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
    }

    var target = document.getElementById('download-button');
    var href = target.getAttribute('data-href');
    href += createID();
    target.setAttribute('href', href);
})();

$(function () {
    $('img.lazy').lazyload({
        placeholder: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
    });
});