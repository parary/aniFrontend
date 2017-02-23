let React          = require('react'),
    ReactDOMServer = require('react-dom/server'),
    fs             = require('fs'),
    pathUtil       = require('path'),
    browserify     = require('browserify'),
    babelify       = require('babelify'),
    Handlebars     = require('handlebars'),
    jsx            = require('node-jsx');
jsx.install();

let Root = React.createFactory(require('./components/root'));
let viewsPath = './server/views';

let getIndex = (req, res) => {
    console.log('getIndex');
    let path = pathUtil.join(viewsPath, 'index.hbs');
    let template = Handlebars.compile(fs.readFileSync(path).toString());
    let reactHtml = ReactDOMServer.renderToString(Root());

    res.send(template({
        markup: reactHtml
    }));
}

let getBrowserJs = (req, res) => {
    console.log('getBrowserJs');
    let path = viewsPath + '/browser';
    browserify(path)
        .transform(babelify, {presets: ['es2015', 'react']})
        .bundle()
        .pipe(res);
}

module.exports = {
    getIndex: getIndex,
    getBrowserJs: getBrowserJs
}