function ScenePlayer() {}

ScenePlayer.prototype.initialize = function() {
	alert("ScenePlayer.initialize()");
	this.baseUrl = 'https://anigodgrabber.appspot.com/AniGod';
	this.parentItem = {};
	this.$name = $('#channelName');
	this.$loader = $('#loaderPlayer');
	this.$keyhelp = $('#keyhelpPlayer');
	this.$el = $('#ScenePlayer');
	this.$volume = $('#volume');
	this.$volumeValue = this.$volume.find('.value');

	this.volumeTimeout = null;

	var that = this;

	Player.onBufferingStart = function() {
		alert('onBufferingStart');
		that.show();
		that.showLoading();
		that.updateKeyhelp('Buffering');
		that.showKeyhelp();
	};

	Player.onBufferingComplete = function() {
		alert('onBufferingComplete');
		that.hide();
		that.hideLoading();
		that.updateKeyhelp();
		that.hideKeyhelp();
	};

	Player.onNetworkDisconnected = function() {
		alert('onBufferingComplete');
		Player.state = Player.STOPPED;
		that.show();
		that.hideLoading();
		that.updateKeyhelp('Network Disconnected');
		that.showKeyhelp();
	};

	Player.onRenderError = function() {
		alert('onRenderError');
		Player.stop();
		that.show();
		that.hideLoading();
		that.updateKeyhelp('Render Error');
		that.showKeyhelp();
	};

	Player.onRenderingComplete = function() {
		alert('onRenderingComplete');
		Player.state = Player.STOPPED;
		that.show();
		that.hideLoading();
		that.updateKeyhelp('Rendering Complete');
		that.showKeyhelp();
	};

	Player.onStreamNotFound = function() {
		alert('onStreamNotFound');
		Player.state = Player.STOPPED;
		that.show();
		that.hideLoading();
		that.updateKeyhelp('Stream Not Found');
		that.showKeyhelp();
	};
};

ScenePlayer.prototype.show = function() {
	this.$el.show();
	this.updateKeyhelp();
};

ScenePlayer.prototype.hide = function() {
	this.$el.hide();
};

ScenePlayer.prototype.showLoading = function() {
	this.$loader.dzLoader('show');
};

ScenePlayer.prototype.hideLoading = function() {
	this.$loader.dzLoader('hide');
};

ScenePlayer.prototype.showKeyhelp = function() {
	this.$keyhelp.show();
};

ScenePlayer.prototype.hideKeyhelp = function() {
	this.$keyhelp.hide();
};

ScenePlayer.prototype.updateKeyhelp = function(status) {
	this.$keyhelp.sfKeyHelp({
		user: this.name + (status ? ' - ' + status : ''),
		'red': 'Retry',
		'return': 'Return'
	}).show();
};

ScenePlayer.prototype.changeVolume = function(up) {
	var that = this;

	if (Audio.muted) return;

	if (up) {
		Audio.volumeUp();
	} else {
		Audio.volumeDown();
	}

	clearTimeout(this.volumeTimeout);

	this.$volumeValue.text(Audio.getVolume());
	this.$volume.show();
	this.show();

	this.volumeTimeout = setTimeout(function() {
		that.$volume.hide();
		that.hide();
	}, 2000);
};

ScenePlayer.prototype.toggleMute = function() {
	var that = this;

	Audio.toggleMute();

	clearTimeout(this.volumeTimeout);

	if (Audio.muted) {
		this.$volume.addClass('muted').show();
		this.show();
	} else {
		this.$volumeValue.text(Audio.getVolume());
		this.$volume.removeClass('muted').show();
		this.show();

		this.volumeTimeout = setTimeout(function() {
			that.$volume.hide();
			that.hide();
		}, 2000);
	}
};

ScenePlayer.prototype.handleShow = function(item) {
	alert("ScenePlayer.handleShow()");
	this.parentItem = item;
	this.name = item.name + ' : ' + item.description;
	this.updateKeyhelp();
	var that = this;
	var config = {
			url: that.baseUrl+'?mode=episode&url=' + item.url,
			success: function(data) {
				console.log('episode loaded.');
				that.url = data;
				alert(item.url);
				alert(data);
				Player.play(data);
				that.name = that.name + ' ( '+ data.substring(0, data.indexOf('.com')+4 ) +' ) ';
				that.updateKeyhelp();
			},

			error: function(xhr) {
				console.log('episode load error: ' + xhr.statusText);
				that._setLoading(false);
				that._showError('Error episode loading url: ' + xhr.statusText);
			}
		};

		$.ajax(config);
};

ScenePlayer.prototype.handleHide = function() {
	alert("ScenePlayer.handleHide()");
	Player.stop();
};

ScenePlayer.prototype.handleFocus = function() {
	alert("ScenePlayer.handleFocus()");
};

ScenePlayer.prototype.handleBlur = function() {
	alert("ScenePlayer.handleBlur()");
};

ScenePlayer.prototype.handleKeyDown = function(keyCode) {
	alert("ScenePlayer.handleKeyDown(" + keyCode + ")");
	switch (keyCode) {
		case $.sfKey.VOL_UP:
		case $.sfKey.PANEL_VOL_UP:
			this.changeVolume(1);
			break;

		case $.sfKey.VOL_DOWN:
		case $.sfKey.PANEL_VOL_DOWN:
			this.changeVolume();
			break;

		case $.sfKey.MUTE:
			this.toggleMute();
			break;

		case $.sfKey.RED:
			Player.stop();
			Player.play(this.url);
			break;

		case $.sfKey.RETURN:
			$.sfKey.block();
			$.sfScene.hide('Player');
			$.sfScene.show('Main');
			$.sfScene.focus('Main');
			break;
	}
};