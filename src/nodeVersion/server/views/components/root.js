let React = require('react'),
    unirest = require('unirest'),
    url = require('url');

let SideTab = require('./sideTab');

let Root = React.createClass({
    getInitialState: function() {
        return {
            rootLoading: 'Loading...',
            aniList: null
        };
    },

    componentDidMount: function () {
        console.log('componentDidMount');
        let self = this;
        let reqUrl = url.format({
            protocol: window.location.protocol,
            port: window.location.port,
            hostname: window.location.hostname,
            pathname: '/getAniList',
            query: {}
        });

        unirest.get(reqUrl)
        .end(function (res) {
            self.setState({
                rootLoading: '',
                aniList: res.body
            });
        });
    },

    render: function () {
        console.log('Root render >', this.state.rootLoading);

        // loading...
        if (this.state.rootLoading) {
            return (
                <div>
                    <div>{this.state.rootLoading}</div>
                </div>
            )
        } else {
        // loading complete...
            return (
                <div>
                    <SideTab aniList = {this.state.aniList}/>
                </div>
            )
        }
    }
});

module.exports = Root;