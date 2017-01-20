var Promise = require("bluebird");
var cheerio = require('cheerio');
var unirest = require('unirest');
var express = require('express');
var https = require('https');
var spawn = require('child_process').spawn;
var app = express();
var BASE_URL = 'https://anigod.com';
var USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.90 Safari/537.36';
var SERVER_PORT = 8080;
var LOG = true;

// util
function log(logStr) {
    if (LOG) {
        console.log(logStr);
    }
}

// logic codes
function getAniList() {
    log('getAniList() is called');
    return new Promise(function(resolve, reject) {
        log('usnirest.get(' + BASE_URL + ') is called');
        unirest.get(BASE_URL)
        .headers({
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.90 Safari/537.36'
        })
        .end(function (res) {
            let htmlStr = res.body;
            let $ = cheerio.load(htmlStr);
            let rows = $('div.index-table-container');
            let weekIdx = 1;
            let aniList = {};

            // unirest request success check
            if (res.error) {
                log('res.body: ' + res.body);
                reject(res.error);
            }

            rows.each(function() {
                let row = this;
                let h2 = $(row).find('h2');
                console.log(h2.text());

                let itemsOfDay = $(row).find('tbody tr');
                let itemIdx = 1;
                itemsOfDay.each(function () {
                    let item = this;
                    let weekItem = {};

                    if (item.tagName === 'tr') {
                        // mon ~ sun
                        if ($(item).attr('itemtype') || $(item).attr('itemscope') === '') {
                            weekItem['name'] = $(item).find('meta[itemprop=name]').attr('content');
                            weekItem['thumbnailUrl'] = $(item).find('meta[itemprop=thumbnailUrl]').attr('content');
                            weekItem['url'] = $(item).find('meta[itemprop=url]').attr('content');
                        } else {
                            // complete
                            let $aTag = $(item).find('a[class=index-image-container]');
                            let $imgTag = $($aTag).find('img');

                            weekItem['name'] = $aTag.attr('title');
                            weekItem['thumbnailUrl'] = $imgTag.attr('src');
                            weekItem['url'] = $aTag.attr('href');
                        }

                        let key = weekIdx.toString() + itemIdx.toString();
                        console.log('\tID : ' + key + " " + weekItem.name);
                        aniList[key] = weekItem;
                        itemIdx++;
                    }
                });
                weekIdx++;
            });

            resolve(aniList);
        });
    });
}

function getList(htmlStr) {
    log('getAniList() is called');
    let $ = cheerio.load(htmlStr);
    let rows = $('div.index-table-container');
    let weekIdx = 1;
    let aniList = {};

    rows.each(function() {
        let row = this;
        let h2 = $(row).find('h2');
        log(h2.text());

        let itemsOfDay = $(row).find('tbody tr');
        let itemIdx = 1;
        itemsOfDay.each(function () {
            let item = this;
            let weekItem = {};

            if (item.tagName === 'tr') {
                // mon ~ sun
                if ($(item).attr('itemtype') || $(item).attr('itemscope') === '') {
                    weekItem['name'] = $(item).find('meta[itemprop=name]').attr('content');
                    weekItem['thumbnailUrl'] = $(item).find('meta[itemprop=thumbnailUrl]').attr('content');
                    weekItem['url'] = $(item).find('meta[itemprop=url]').attr('content');
                } else {
                // complete
                    let $aTag = $(item).find('a[class=index-image-container]');
                    let $imgTag = $($aTag).find('img');

                    weekItem['name'] = $aTag.attr('title');
                    weekItem['thumbnailUrl'] = $imgTag.attr('src');
                    weekItem['url'] = $aTag.attr('href');
                }

                let key = weekIdx.toString() + itemIdx.toString();
                log('\tID : ' + key + " " + weekItem.name);
                aniList[key] = weekItem;
                itemIdx++;
            }
        });
        weekIdx++;
    });

    return aniList;
}

function getAniSeries(aniUrl) {
    return new Promise(function(resolve, reject) {
        unirest.get(aniUrl)
        .headers({
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.90 Safari/537.36'
        })
        .end(function (res) {
            let htmlStr = res.body;
            let $ = cheerio.load(htmlStr);
            let items = $('tr[itemtype="http://schema.org/TVEpisode"]');
            let seriesId = 1;
            let aniList = {};


            // unirest request success check
            if (res.error) {
                reject(res.error);
            }

            items.each(function() {
                let item = this;
                let seriesItem = {};

                seriesItem['name'] = $(item).find('meta[itemprop=name]').attr('content');
                seriesItem['description'] = $(item).find('meta[itemprop=description]').attr('content');
                seriesItem['url'] = $(item).find('meta[itemprop=url]').attr('content');

                let $link = $(item).find('a[class="table-link"]');
                if ($link.length > 0) {
                    seriesItem['real'] = $link.attr('href');
                }

                console.log('Series ID : ' + seriesId + ' ' + seriesItem.description);
                aniList[seriesId] = seriesItem;
                seriesId++;
            });

            resolve(aniList);
        });
    });
}

function getEpisodeUrl(episodeUrl) {
    let headersOp = {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.90 Safari/537.36',
        'referer': 'http://viid.me/qpvAPr?utm_source=anigod.gryfindor.com&utm_medium=QL&utm_name=1'
    };
    return new Promise(function(resolve, reject){
        unirest.get(episodeUrl)
        .headers(headersOp)
        .end(function (res) {
            let htmlStr = res.body;

            // unirest request success check
            if (res.error) {
                reject(res.error);
            }
            let key = 'var videoID';
            let startIndex = htmlStr.indexOf(key);
            let endIndex = htmlStr.indexOf( ';', startIndex);
            let unTrimVideoId = htmlStr.substring( startIndex + key.length, endIndex - 1);
            let trimIndex = unTrimVideoId.indexOf("'");
            let videoId = unTrimVideoId.substr(trimIndex + 1);
            console.log('ori hash: ' + videoId);
            console.log('\n\n');

            videoId = videoId.replace(/\\\//g, "%2F" );  // `\/`   to `%2F`
            videoId = videoId.replace(/\\x2b/g, "%2B");  // `\x2b` to `%2B`
            videoId = videoId.replace(/=/g, "%3D");      // `=`    to `%3D`

            let currentTimeMillis = Date.now();
            let videoUrl = BASE_URL + '/video?id=' + videoId + '&ts=' + currentTimeMillis;
            console.log('execute: ' + videoId);
            resolve(videoUrl);
        });
    });
}

// routing codes
app.get('/getEpisodeUrl', function (req, res) {
    // ?url=https://address
    let episodeUrl = req.param('url');

    function success(result) {
        res.send(result);
    }

    function reject(err) {
        res.status(500).send({ error: err.message });
    }

    if (!episodeUrl) {
        reject(new Error('Invalid API call, /getEpisodeUrl API must pass the `url` param '));
    } else {
        getEpisodeUrl(episodeUrl)
            .then(success)
            .catch(reject);
    }
});

app.get('/getAniSeries', function (req, res) {
    // ?url=https://address
    let aniUrl = req.param('url');

    function success(result) {
        res.send(result);
    }

    function reject(err) {
        res.status(500).send({ error: err.message });
    }

    if (!aniUrl) {
        reject(new Error('Invalid API call, /getAniSeries API must pass the `url` param '));
    } else {
        getAniSeries(aniUrl)
            .then(success)
            .catch(reject);
    }
});

app.get('/getAniList', function (req, res) {
    log('/getAniList is called');

    function success(result) {
        res.status(200).json(result);
    }

    function reject(err) {
        res.status(500).send({ error: err });
    }

    getAniList()
        .then(success)
        .catch(reject);
});

app.get('/getList', function (req, res) {
    log('/getList is called');

    https.get(BASE_URL, (innerRes) => {
        log('node https called');
        log('statusCode: ' + innerRes.statusCode);

        const statusCode = innerRes.statusCode;
        if (statusCode !== 200) {
            res.status(statusCode).send({
                error: 'Request Failed.\nStatus Code: ' + statusCode
            });
        } else {
            let rawData = '';
            innerRes.on('data', (chunk) => rawData += chunk);
            innerRes.on('end', () => {
                log('inner call success');
                log('data >>> ' + rawData);
                let list = getList(rawData);
                res.status(statusCode).json(list);
            });
        }
    }).on('error', (e) => {
        log(e.message);
        res.status(500).send({ error: e.message });
    });
});

app.get('/curl', (req, res) => {
    log('/curl is called.');

    try {
        let child = spawn('curl', ['--max-time', '60', BASE_URL]);
        let rawData = '';
        child.stdout.on('data', (chunk) => rawData += chunk);
        child.stdout.on('end', () => {
            log('node curl spawn call success');
            log('data >>> ' + rawData);
            let list = getList(rawData);
            res.status(200).json(list);
        });
        child.on('exit', (code) => {
            if (code !== 0) {
                res.status(500).send({
                    error: 'Failed, node curl spawn. exit code > ' + code
                });
            }
        });
    } catch (e) {
        res.status(500).send({
            error: 'Failed, node curl spawn. > ' + e.message
        });
    }
});

app.get('/test', function (req, res) {
    log('/test is called');
    res.status(200).json({
        'test': 'test success'
    });
});

// server start code
app.set('port', (process.env.PORT || SERVER_PORT));
var server = app.listen(app.get('port'), function () {
    var port = server.address().port;
    console.log('server start success, port: ' + port);
});
