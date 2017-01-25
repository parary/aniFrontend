function SceneSub() {}

SceneSub.prototype.initialize = function() {
	alert("SceneSub.initialize()");
	this.parentItem = {};
	this.list = new SubList('#subList');
	this.$info = $('#subInfo');
	this.$infoBox = this.$info.find('.subInfo-box');
	this.showingInfo = false;
};

SceneSub.prototype.play = function(item) {
	alert("SceneSub.play()");
	
	$.sfScene.hide('Sub');
	$.sfScene.show('Player', item);
	$.sfScene.focus('Player');
};


SceneSub.prototype.buildInfo = function(data) {

};

SceneSub.prototype.showMainKeyhelp = function() {
	$('#keyhelpMain').sfKeyHelp({
		'enter': 'Play',
		'rew': 'Previous page',
		'ff': 'Next page',
		'red': 'Reload',
		'return': 'Return'
	});
};

SceneSub.prototype.showInfoKeyhelp = function() {
	$('#keyhelpSub').sfKeyHelp({
		'return': 'Return'
	});
};

SceneSub.prototype.reload = function() {
	this.list.load(this.parentItem.url);
};

SceneSub.prototype.handleShow = function(item) {
	alert("SceneSub.handleShow()");
	this.parentItem = item;
	this.showMainKeyhelp();
	this.reload();
};

SceneSub.prototype.handleHide = function() {
	alert("SceneSub.handleHide()");
};

SceneSub.prototype.handleFocus = function() {
	alert("SceneSub.handleFocus()");
	this.list.focus();
};

SceneSub.prototype.handleBlur = function() {
	alert("SceneSub.handleBlur()");
	this.list.blur();
};

SceneSub.prototype.handleKeyDown = function(keyCode) {
	alert("SceneSub.handleKeyDown(" + keyCode + ")");

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
				this.play(this.list.getCurrent());
				break;
			case $.sfKey.INFO:
				this.showInfo(this.list.getCurrent());
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
			case $.sfKey.RETURN:
				$.sfKey.block();
				$.sfScene.hide('Sub');
				$.sfScene.show('Main');
				$.sfScene.focus('Main');
				break;
			case $.sfKey.BLUE:
				$.sfKey.block();
				$.sfScene.hide('Sub');
				$.sfScene.show('Main');
				$.sfScene.focus('Main');
				break;
		}
};

function pad(num) {
	return num < 10 ? '0' + num : num;
}

function formatDate(timestamp) {
	var date = new Date(timestamp * 1000);

	return date.getHours() + ':' + pad(date.getMinutes());
}