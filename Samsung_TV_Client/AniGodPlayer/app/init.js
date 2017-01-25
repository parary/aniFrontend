
alert('init.js loaded');

function onStart() {
	Audio.init();
	Player.init();

	$.sfScene.show('Main');
	$.sfScene.focus('Main');
//	sf.scene.show('Main');
//	sf.scene.focus('Main');
}

function onDestroy() {
	Player.destroy();
}
