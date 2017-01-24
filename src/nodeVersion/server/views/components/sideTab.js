let React = require('react'),
    unirest = require('unirest'),
    url = require('url');

let Tab = React.createClass({
    propTypes: {
        tab: React.PropTypes.shape({
            id: React.PropTypes.number.isRequired,
            text: React.PropTypes.string.isRequired
        }),
        onClick: React.PropTypes.func.isRequired
    },

    _onClick: function () {
        this.props.onClick(this.props.tab);
    },

    render: function () {
        return (
            <div id='tab'>
                <div onClick={this._onClick}>{this.props.tab.text}</div>
            </div>
        )
    }
});

let Tabs = React.createClass({
    render: function () {
        let self = this;
        let tabs = this.props.tabs.map(function (tab, index) {
            let prop = { id: index + 1, text: tab };
            return <Tab key={prop.id} tab={prop} onClick={self.props.onClick}/>
        });
        return (
            <div id='tabsPane'>
                {tabs}
            </div>
        )
    }
});

let Item = React.createClass({
    _onClick: function () {
        this.props.onClick(this.props);
    },

    render: function () {
        console.log('Item render >');
        let imgStyle = {
            height: '16px',
            width: '16px'
        };
        return (
            <div id='item'>
                <div onClick={this._onClick}>
                    <img style={imgStyle} src={this.props.imgUrl}></img>
                    <span>{this.props.name}</span>
                </div>
            </div>
        )
    }
});

let Video = React.createClass({
    render: function () {
        if (this.props.url) {
            return (
                <div id='videoPane'>
                    <video id="video" controls>
                        <source src={this.props.url} />
                    </video>
                </div>
            );
        } else {
            return (
                <div id='videoPane'></div>
            );
        }
    }
});

let ContentItemList = React.createClass({
    render: function () {
        console.log('ContentItemList render');
        let self = this;
        let items = this.props.itemList.map(function (item, index) {
            let key = item.name + index;
            return <Item key={key}
                         imgUrl={item.thumbnailUrl}
                         name={item.name}
                         url={item.url}
                         onClick={self.props.onClick}/>
        });
        return (
            <div>
                {items}
            </div>
        )
    }
});

let ContentItemSerise = React.createClass({
    render: function () {
        console.log('ContentItemSerise render');
        let self = this;
        if (this.props.seriseList) {
            let keys = Object.keys(this.props.seriseList);
            let list = [];
            keys.forEach(function (key) {
                list.push(self.props.seriseList[key]);
            });
            let items= list.map(function (item, index) {
                let key = index + 'serise';
                return <Item key={index}
                            imgUrl={self.props.imgUrl}
                            name={item.description}
                            url={item.url}
                            onClick={self.props.onClick}/>
            });
            return (
                <div>
                    <div id='serisePane'>
                        {items}
                    </div>
                </div>
            )
        } else {
            return (
                <div>
                    <div id='serisePane'></div>
                </div>
            )
        }
    }
});

let Content = React.createClass({
    seriseListStore: {},
    getInitialState: function() {
        return {
            seriseList: null,
            imgUrl: '',
            videoUrl: ''
        };
    },

    onClickContentItem: function (itemProps) {
        console.log('onClickContentItem >', itemProps);

        // check store
        let storeList = this.seriseListStore[itemProps.url];
        if (storeList) {
            this.setState({
                imgUrl: itemProps.imgUrl || '',
                seriseList: storeList,
                videoUrl: ''
            });
        } else {
            let self = this;
            let reqUrl = url.format({
                protocol: window.location.protocol,
                port: window.location.port,
                hostname: window.location.hostname,
                pathname: '/getAniSeries'
            });

            unirest.get(reqUrl)
            .query({
                url: itemProps.url
            })
            .end(function (res) {
                self.seriseListStore[itemProps.url] = res.body;
                self.setState({
                    imgUrl: itemProps.imgUrl || '',
                    seriseList: res.body,
                    videoUrl: ''
                });
            });
        }
    },

    onClickSeriseItem: function (itemProps) {
        console.log('onClickSeriseItem >', itemProps);
        let selectSeriseUrl = itemProps.url;
        let reqUrl = url.format({
            protocol: window.location.protocol,
            port: window.location.port,
            hostname: window.location.hostname,
            pathname: '/getEpisodeUrl'
        });
        let self = this;

        unirest.get(reqUrl)
        .query({
            url: selectSeriseUrl
        })
        .end(function (res) {
            self.setState({
                videoUrl: res.body
            });
        });
    },

    componentWillReceiveProps: function (nextProps) {
        console.log('componentWillReceiveProps');
        this.state.seriseList = null;
        this.state.imgUrl = '';
        this.state.videoUrl = '';
    },

    render: function () {
        console.log('Content render!!!', this.state.seriseList);
        if (this.props.content &&
            this.props.content.length > 0) {
            return (
                <div id='conentPane'>
                    <ContentItemList itemList={this.props.content}
                                     onClick={this.onClickContentItem}/>
                    <ContentItemSerise seriseList={this.state.seriseList}
                                       imgUrl={this.state.imgUrl}
                                       onClick={this.onClickSeriseItem}/>
                    <Video url={this.state.videoUrl}/>
                </div>
            )
        } else {
            return (<div id='conentPane'>no item</div>)
        }
    }
});

let SideTab = React.createClass({
    getInitialState: function() {
        return {
            content: null
        };
    },

    getDefaultProps: function () {
        return {
            tabs: ['Mon', 'Tus', 'Wen', 'Thu', 'Fri', 'Sat', 'Sun', 'Com']
        };
    },

    onClickTab: function (tab) {
        console.log('onClickTab >', tab.text);
        let self = this;
        let keys = Object.keys(this.props.aniList);
        let content = [];
        keys.forEach(function (key) {
            if (tab.id.toString() === key.charAt(0)) {
                content.push(self.props.aniList[key]);
            }
        });
        this.setState({
            content: content
        });
    },

    render: function () {
        console.log('SideTab render >');
        return (
            <div id='sideTab'>
                <Tabs tabs = {this.props.tabs} onClick={this.onClickTab}/>
                <Content content = {this.state.content}/>
            </div>
        )
    }
});

module.exports = SideTab;