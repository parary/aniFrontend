let React = require('react');
let ReactDOMServer = require('react-dom/server');
let jsx = require('node-jsx');
jsx.install();

let Index = require('./index.jsx');

let getIndex = (req, res) => {
    let element = React.createElement(Index);
    res.send(ReactDOMServer.renderToString(element));
}

module.exports = {
    getIndex: getIndex
}