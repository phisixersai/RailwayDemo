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
    setSearchBox();
    //rosen.getSectionsByLineCode(331).then(function(sections){
    //    console.log(JSON.stringify(sections));
    //});
    renderFullrate();
    //rosen.highlightSections([3310210]);
	//rosenEventSetter();
    setLineSelector();
}
function renderFullrate() {
    dummy_data[0].sections.forEach(function (section) {
        var fcolor = rate2color(section.fullrate);
        rosen.highlightSections([section.code], {color: fcolor});
    });
}
function readFullrate() {}

function rate2color(val) {
    var rateMax = 200;
    var rateMin = 0;
    if (val > rateMax) {
        val = rateMax;
    }
    else if (val < rateMin) {
        val = rateMin;
    }
    var h = Math.floor((rateMax - val) * 120 / rateMax); //Hue(h) will change from red to green corresponding to rateMax to 0.
    var s = 1;
    var v = 1;
    //hsv to rgb , refer to http://schinckel.net/2012/01/10/hsv-to-rgb-in-javascript/
    var rgb, i, data = [];
    h = h / 60;
    i = Math.floor(h);
    data = [v*(1-s), v*(1-s*(h-i)), v*(1-s*(1-(h-i)))];
    switch(i) {
        case 0:
            rgb = [v, data[2], data[0]];
            break;
        case 1:
            rgb = [data[1], v, data[0]];
            break;
        case 2:
            rgb = [data[0], v, data[2]];
            break;
        case 3:
            rgb = [data[0], data[1], v];
            break;
        case 4:
            rgb = [data[2], data[0], v];
            break;
        default:
            rgb = [v, data[0], data[1]];
            break;
    }
    return '#' + rgb.map(function(x){
        return ("0" + Math.round(x*255).toString(16)).slice(-2);
    }).join('');
}

function setSearchBox() {
    $('#search_input').autocomplete({
        autoFocus: true,
        delay: 200,
        minLength: 1,
        source: function(req, res) {
            var search_params = {
                stationName: req.term,
                stationNameYomi: true,
                limit: 10
            };
            rosen.searchStations(search_params).then(function(stations) {
                var data = stations.map(function(s) { return {label: s.name, value: s.code}; });
                res(data);
            }).catch(function(err) {
                res("エラーが発生しました");
                console.log("err", err);
            });
        },
        select: function( event, ui ) {
            var station_code = ui.item.value;
            rosen.setCenterByStationCode(station_code);
            ui.item.value = ui.item.label;
        }
    });
    console.log($('#search_input').length);
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
			//console.log(line);
			rosen.highlightLine(line.code);
            getFullrateByLineCode(line.code);
		});
		$('#map_message').text(msg);
	});
}

function getFullrateByLineCode(c) {
    var line_data = {};
    rosen.getLineByCode(c).then(function(line){
        console.log(line);
        line_data.name = line.name;
        line_data.code = line.code;
    });
    rosen.getSectionsByLineCode(c).then(function(sections){
        //console.log(JSON.stringify(sections));
        line_data.sections = sections;
        //console.log(sections);
    });
    line_data.sections.forEach(function (section) {
        
    });
    console.log(line_data);
}
function genFakeRate() {
    return Math.floor(Math.random() * 200);
}

function setSectionSelector() {
	rosen.on('selectSection', function(data) {
		var msg = '';
        console.log(data);
		data.sections.forEach(function (section) {
			if (selectedSections.includes(section)) {
                rosen.unsetSectionPopup(section.code);
                //rosen.unhighlightSections([section.code]);
                while (selectedSections.indexOf(section) !== -1) {
                    selectedSections.splice(selectedSections.indexOf(section), 1);
                }
			}
			else {
                var popup = Rosen.textPopup().setComment("Section code: " + section.code + "\n");
                selectedSections.push(section)
				msg += "Section code: " + section.code + "\n";
				console.log(section);
                rosen.setSectionPopup(section.code, popup);
				//rosen.highlightSections([section.code]);
			}
		});
		$('#map_message').text(msg);
        console.log(selectedSections);
	});
}


window.addEventListener('load', init);
