let rest = require('./rest/rest');
let view = require('./views/view');
let log = require('./util/util').log;
let config = require('../config');
let express = require('express');
let app = express();

////// routing codes
// routing view
app.get('/', view.getIndex);
app.get('/browser.js', view.getBrowserJs);

// routing rest api
app.get('/getEpisodeUrl', rest.getEpisodeUrl);
app.get('/getAniSeries', rest.getAniSeries);
app.get('/getAniList', rest.getAniList);

// test and prevent (404)
app.get('/img/anigod.png', function (req, res) {
    res.sendfile('./server/resource/anigod.png');
});
app.get('/test', function (req, res) {
    log('/test is called');
    res.status(200).json({
        'test': 'test success'
    });
});

// server start code
app.set('port', (process.env.PORT || config.port));
let server = app.listen(app.get('port'), function () {
    var port = server.address().port;
    console.log('server start success, port: ' + port);
});

module.exports = () => {
    return server;
}