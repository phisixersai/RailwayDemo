var rosen;
var selectedSections = [];
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
			if (selectedSections)
			selectedSections.push(line);
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
        console.log(data);
		data.sections.forEach(function (section) {
			if (selectedSections.includes(section)) {
                rosen.unhighlightSections([section.code]);
                while (selectedSections.indexOf(section) !== -1) {
                    selectedSections.splice(selectedSections.indexOf(section), 1);
                }
			}
			else {
                selectedSections.push(section)
				msg += "Section code: " + section.code + "\n";
				console.log(section);
				rosen.highlightSections([section.code]);
			}
		});
		$('#map_message').text(msg);
        console.log(selectedSections);
	});
}

window.addEventListener('load', init);
