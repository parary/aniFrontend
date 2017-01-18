var Promise = require("bluebird");
var cheerio = require('cheerio');
var unirest = require('unirest');
var express = require('express');
var app = express();
var BASE_URL = 'https://anigod.com';
var SERVER_PORT = 3000;

// logic codes
function getAniList() {
    return new Promise(function(resolve, reject) {
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
            let currentTimeMillis = Date.now();
            let videoUrl = BASE_URL + '/video?id=' + encodeURIComponent(videoId) + '&ts=' + currentTimeMillis;
            console.log( 'execute ' + videoUrl);
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
    function success(result) {
        res.send(result);
    }

    function reject(err) {
        res.status(500).send({ error: err });
    }

    getAniList()
        .then(success)
        .catch(reject);
});

app.listen(SERVER_PORT);
console.log('server start success, port: ' + SERVER_PORT);