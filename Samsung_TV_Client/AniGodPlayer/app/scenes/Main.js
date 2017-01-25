function SceneMain() {}

SceneMain.prototype.initialize = function() {
	this.list = new List('#list');
	this.$info = $('#info');
	this.$infoBox = this.$info.find('.info-box');
	this.showingInfo = false;
};

SceneMain.prototype.select = function(item) {
	alert("SceneMain.play()");
	$.sfScene.hide('Main');
	$.sfScene.show('Sub', item);
	$.sfScene.focus('Sub');
};

SceneMain.prototype.buildInfo = function(data) {

};

SceneMain.prototype.hideInfo = function() {
	alert("SceneMain.hideInfo()");
	this.showingInfo = false;
	this.showMainKeyhelp();
	this.list.focus();
	this.$info.hide();
};

SceneMain.prototype.showMainKeyhelp = function() {
	$('#keyhelpMain').sfKeyHelp({
		'enter': 'Select',
		'rew': 'Previous page',
		'ff': 'Next page',
		'red': 'Reload',
		'return': 'Return'
	});
};

SceneMain.prototype.showInfoKeyhelp = function() {
	$('#keyhelpMain').sfKeyHelp({
		'return': 'Return'
	});
};

SceneMain.prototype.reload = function() {
	this.list.load();
};

SceneMain.prototype.handleShow = function() {
	alert("SceneMain.handleShow()");
	this.showMainKeyhelp();
	this.reload();
};

SceneMain.prototype.handleHide = function() {
	alert("SceneMain.handleHide()");
};

SceneMain.prototype.handleFocus = function() {
	alert("SceneMain.handleFocus()");
	this.list.focus();
};

SceneMain.prototype.handleBlur = function() {
	alert("SceneMain.handleBlur()");
	this.list.blur();
};

SceneMain.prototype.handleKeyDown = function(keyCode) {
	alert("SceneMain.handleKeyDown(" + keyCode + ")");

	if (this.showingInfo) {
		switch (keyCode) {
			case $.sfKey.RETURN:
				$.sfKey.block();
				this.hideInfo();
				break;
		}
	} else {
		switch (keyCode) {
			case $.sfKey.UP:
				this.list.up();
				break;
			case $.sfKey.DOWN:
				this.list.down();
				break;
			case $.sfKey.LEFT:
				this.list.left();
				break;
			case $.sfKey.RIGHT:
				this.list.right();
				break;
			case $.sfKey.ENTER:
				// this.play(this.list.getCurrent());
				this.select(this.list.getCurrent());
				break;
			case $.sfKey.INFO:
				// this.showInfo(this.list.getCurrent());
				break;
			case $.sfKey.RED:
				this.reload();
				break;
			case $.sfKey.FF:
				this.list.nextPage();
				break;
			case $.sfKey.RW:
				this.list.previousPage();
				break;
			case $.sfKey.BLUE:
				$.sfScene.hide('Main');
				break;
		}
	}
};

function pad(num) {
	return num < 10 ? '0' + num : num;
}

function formatDate(timestamp) {
	var date = new Date(timestamp * 1000);

	return date.getHours() + ':' + pad(date.getMinutes());
}
