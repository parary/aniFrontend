// load library
let Promise = require('bluebird');
let cheerio = require('cheerio');
let unirest = require('unirest');
let path = require('path');
let log = require('../util/util').log;

// load config
let config = require('../../config');
let BASE_URL = config.base_url;
let USER_AGENT = config.user_agent;

function _getAniList(htmlStr) {
    log('_getAniList() is called');
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

                    //// special handle
                    //// url이 완벽하지 않은 경우, 처리 하지 않음
                    //// e.g) 완결 애니매이션, 랭킹, tv, 추천게시판
                    let itemUrl = $aTag.attr('href');
                    if (itemUrl && itemUrl.indexOf(BASE_URL) > 0) {
                        weekItem['name'] = $aTag.attr('title');
                        weekItem['thumbnailUrl'] = $imgTag.attr('src');
                        weekItem['url'] = $aTag.attr('href');
                    }
                }

                if (weekItem && weekItem.url) {
                    let key = weekIdx.toString() + itemIdx.toString();
                    log('\tID : ' + key + " " + weekItem.name);
                    aniList[key] = weekItem;
                    itemIdx++;
                }
            }
        });
        weekIdx++;
    });

    return aniList;
}

function _getAniSeries(htmlStr) {
    let $ = cheerio.load(htmlStr);
    let items = $('tr[itemtype="http://schema.org/TVEpisode"]');
    let seriesId = 1;
    let aniSeries = {};

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

        log('Series ID : ' + seriesId + ' ' + seriesItem.description);
        aniSeries[seriesId] = seriesItem;
        seriesId++;
    });

    return aniSeries;
}

function _getEpisodeUrl(htmlStr) {
    let key = 'var videoID';
    let startIndex = htmlStr.indexOf(key);
    let endIndex = htmlStr.indexOf( ';', startIndex);
    let unTrimVideoId = htmlStr.substring( startIndex + key.length, endIndex - 1);
    let trimIndex = unTrimVideoId.indexOf("'");
    let videoId = unTrimVideoId.substr(trimIndex + 1);
    log('ori hash: ' + videoId);
    log('\n\n');

    videoId = videoId.replace(/\\\//g, "%2F" );  // `\/`   to `%2F`
    videoId = videoId.replace(/\\x2b/g, "%2B");  // `\x2b` to `%2B`
    videoId = videoId.replace(/=/g, "%3D");      // `=`    to `%3D`

    let currentTimeMillis = Date.now();
    let videoUrl = BASE_URL + '/video?id=' + videoId + '&ts=' + currentTimeMillis;
    log('execute: ' + videoId);
    return videoUrl;
}

function getAniList(req, res) {
    log('getAniList() is called');
    log('usnirest.get(' + BASE_URL + ') is called');
    function success_response(result) {
        res.send(result);
    }

    function error_response(err) {
        res.status(500).send({ error: err.message });
    }

    unirest.get(BASE_URL)
    .headers({
        'User-Agent': USER_AGENT
    })
    .end(function (res) {
        let htmlStr = res.body;

        // unirest request success check
        if (res.error) {
            log('res.body: ' + res.body);
            error_response(res.error);
        }

        let list = _getAniList(htmlStr);
        success_response(list);
    });
}

function getAniSeries(req, res) {
    log('getAniSeries() is called');

    function success_response(result) {
        res.send(result);
    }

    function error_response(err) {
        res.status(500).send({ error: err.message });
    }

    // ?url=https://address
    let aniUrl = req.param('url');
    if (!aniUrl) {
        error_response(new Error('Invalid API call, /getAniSeries API must pass the `url` param '));
    } else {
        log('usnirest.get(' + aniUrl + ') is called');
        unirest.get(aniUrl)
        .headers({
            'User-Agent': USER_AGENT
        })
        .end(function (res) {
            let htmlStr = res.body;

            // unirest request success check
            if (res.error) {
                log('res.body: ' + res.body);
                error_response(res.error);
            }

            let series = _getAniSeries(htmlStr);
            success_response(series);
        });
    }
    
}

function getEpisodeUrl(req, res) {
    log('getEpisodeUrl() is called');

    function success_response(result) {
        res.send(result);
    }

    function error_response(err) {
        res.status(500).send({ error: err.message });
    }

    // ?url=https://address
    let episodeUrl = req.param('url');
    let headersOp = {
        'User-Agent': USER_AGENT,
        'referer': 'http://viid.me/qpvAPr?utm_source=anigod.gryfindor.com&utm_medium=QL&utm_name=1'
    };

    log('usnirest.get(' + episodeUrl + ') is called');
    unirest.get(episodeUrl)
    .headers(headersOp)
    .end(function (res) {
        let htmlStr = res.body;

        // unirest request success check
        if (res.error) {
            log('res.body: ' + res.body);
            error_response(res.error);
        }
        let videoUrl = _getEpisodeUrl(htmlStr);
        success_response(videoUrl);
    });
}

module.exports = {
    getAniList: getAniList,
    getAniSeries: getAniSeries,
    getEpisodeUrl: getEpisodeUrl
};
