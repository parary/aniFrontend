var Player = {
	STOPPED: 0,
	PLAYING: 1,
	PAUSED: 2,

	plugin: null,
	state: -1,

	init: function() {
		alert('Player init.');

		this.state = this.STOPPED;
		this.plugin = document.getElementById('pluginPlayer');

		if (!this.plugin) return alert('Player init error!');

		// this.plugin.OnCurrentPlayTime = 'Player.setCurrentTime';
		this.plugin.OnStreamInfoReady = 'Player.onStreamInfoReady';
		this.plugin.OnBufferingStart = 'Player.onBufferingStart';
		this.plugin.OnBufferingComplete = 'Player.onBufferingComplete';
		this.plugin.OnRenderingComplete = 'Player.onRenderingComplete';
		this.plugin.OnNetworkDisconnected = 'Player.onNetworkDisconnected';
		this.plugin.OnRenderError = 'Player.onRenderError';
		this.plugin.OnStreamNotFound = 'Player.onStreamNotFound';

		this.plugin.SetDisplayArea(0, 0, 960, 540);
	},

	destroy: function() {
		if (!this.plugin) return;

		if (this.state === this.PLAYING || this.state === this.PAUSED) {
			this.plugin.Stop();
		}
	},

	play: function(url) {
		alert('Player.play(' + url + ')');
		if (this.state === this.STOPPED) {
			this.plugin.Play(url);
			this.state = this.PLAYING;
		}
	},

	stop: function() {
		alert('Player.stop()');
		if (this.state === this.PLAYING) {
			this.plugin.Stop();
			this.state = this.STOPPED;
		}
	},

	setCurrentTime: function(time) {
		alert('Player.setCurrentTime(' + time + ')');
	},

	onStreamInfoReady: function() {
		alert('Player.onStreamInfoReady()');
	},

	onBufferingStart: function() {
		alert('Player.onBufferingStart()');
	},

	onBufferingComplete: function() {
		alert('Player.onBufferingComplete()');
	},

	onRenderingComplete: function() {
		alert('Player.onRenderingComplete()');
	},

	onNetworkDisconnected: function() {
		alert('Player.onNetworkDisconnected()');
		this.state = this.STOPPED;
	},

	onRenderError: function() {
		alert('Player.onRenderError()');
		this.state = this.STOPPED;
	},

	onStreamNotFound: function() {
		alert('Player.onStreamNotFound()');
		this.state = this.STOPPED;
	}
};

alert('Player loaded.');