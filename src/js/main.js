$(document).ready(function() {
	init();
});

var rosen;
function init() {
	rosen = new Rosen('map', {
		apiKey: "4wnydu6huaentetjfypvvqah",
        consoleViewControl: true, // 地図左下にデバッグコンソールを表示する
		zoom: 16   // ズームレベル
    });
}
