var rosen;
function init() {
	rosen = new Rosen('map', {
		apiKey: "4wnydu6huaentetjfypvvqah",
		centerStation: 22917,
        consoleViewControl: true, // 地図左下にデバッグコンソールを表示する
		zoom: 16,   // ズームレベル
		sideMenuControl: true
    });
	rosenEventSetter();
}
function rosenEventSetter() {
	//setLineSelector();
	setSectionSelector();
}
function setLineSelector() {
	rosen.on('selectLine', function(data) {
		var msg = '';
		data.lines.forEach(function(line) {
			msg += line.name + "\n";
			console.log(line);
			rosen.highlightLine(line.code);
		});
		$('#map_message').text(msg);
	});
}

function setSectionSelector() {
	rosen.on('selectSection', function(data) {
		var msg = '';
		data.sections.forEach(function (section) {
			msg += "Section code: " + section.code + "\n";
			console.log(section);
			rosen.highlightSections([section.code]);
		});
		$('#map_message').text(msg);
	});
}
window.addEventListener('load', init);
