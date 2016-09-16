var rosen;
var selectedSections = [];
var code2indexMap = {};
function init() {
	rosen = new Rosen('map', {
		apiKey: "************",
		centerStation: 22917,
        consoleViewControl: true,
		zoom: 16,   //
		sideMenuControl: true
    });
    //setSearchBox();
    //renderFullRate();
	mapSetter(0); //MODE: 0 = full rate　混雑率　, 1 = late rate　遅延率
    //fetchLateRateData();
    /*rosen.getCorporations().then(function(corps){
        console.log(corps);
    });*/
    //fetchFullRateData();
}
function renderFullRate() { //Should be deprecated
    dummy_data[0].sections.forEach(function (section) {
        var fcolor = rate2color(section.fullrate);
        rosen.highlightSections([section.code], {color: fcolor});
    });
}
function renderLateRate() {
    code2indexMap = {};
    laterate_data.forEach(function (line, idx) {
        var fcolor = rate2color(line.late_rate, 0, 100);
        code2indexMap[line.code] = idx;
        rosen.highlightLine(line.code, {color: fcolor});
    });
}

function mapSetter(mode) {
    switch(mode) {
        case 0:
            setFullRateMap();
            break;
        case 1:
            setLateRateMap();
            break;
        default:
            setFullRateMap();
            break;
    }
}

function setFullRateMap(){
    //renderFullRate();
    rosen.on('selectSection', function(data) {
        onSectionSelected(data, 0);
    });
}
function onSectionSelected(data, dir) { // dir=0 上り(Default)
    window.sec_data = data;
    console.log(data);
    console.log("dir = " + dir);
    var direction = "up";
    var timeInterval = "7-8";
    if (dir === 0) {
        direction = "up";
    }
    else {
        direction = "down";
    }
    rosen.clearAll();
    //rosen.clearHighlights();
    var station1 = "";
    var station2 = "";
    var rate = 0;
    data.sections.forEach(function (section) {
        var lineCode = Rosen.getLineCodeBySectionCode(section.code);
        console.log(fullrate_data[lineCode]);
        fullrate_data[lineCode].sections.forEach(function (sect, idx) {
            if (sect.code === section.code) {
                console.log(sect);
                station1 = sect.station1_name;
                station2 = sect.station2_name;
                rate = sect.full_rate[timeInterval][direction];
            }
            var fcolor = rate2color(sect.full_rate[timeInterval][direction], 0, 200);
            rosen.highlightSections([sect.code], {color: fcolor});
            if (idx === fullrate_data[lineCode].sections.length-1) {
                /*var popup = Rosen.textPopup().setComment(""
                    + fullrate_data[lineCode].name + ":\n"
                    + station1 + "と" + station2 + "の駅間\n"
                    +　timeInterval + "時の混雑率：" + rate + "%\n");*/
                var popup_content = "";
                if (dir === 0) {
                    var opposite = 1;
                    popup_content = '<h3>'+fullrate_data[lineCode].name+':</h3>'+
                    '<p>'+ station1 + 'から' + station2 + 'までの駅間</p>'+
                    '<p>'+ timeInterval + '時の混雑率：' + rate + '%</p>'+
                    '<a id="chdir" href="javascript:switchDir(window.sec_data,'+ opposite +')">下り表示</a>'
                }
                else {
                    var opposite = 0;
                    popup_content = '<h3>'+fullrate_data[lineCode].name+':</h3>'+
                    '<p>'+ station2 + 'から' + station1 + 'までの駅間</p>'+
                    '<p>'+ timeInterval + '時の混雑率：' + rate + '%</p>'+
                    '<a id="chdir" href="javascript:switchDir(window.sec_data,'+ opposite +')">上り表示</a>'
                }
                var popup = Rosen.htmlPopup({
                        closeButton: true,   // ☓ボタン非表示
                        className: "popup_fullrate", // ポップアップにつけるCSSクラス名
                    }).setHTML(popup_content);
                rosen.setSectionPopup(section.code, popup, true);
                rosen.highlightSections([section.code], {color: rate2color(rate, 0, 200)});
            }
        });
    });
}
function switchDir(data,dir) {
    console.log("switch");
    onSectionSelected(data, dir);

}
function setLateRateMap() {
    var chosenLine = {};
    renderLateRate();
	rosen.on('selectLine', function(data) {
        rosen.clearHighlights();
		var msg = '';
		data.lines.forEach(function(line) {
			msg += line.name + "\n";
            chosenLine.name = laterate_data[code2indexMap[line.code]].name;
            chosenLine.code = laterate_data[code2indexMap[line.code]].code;
            chosenLine.late_rate = laterate_data[code2indexMap[line.code]].late_rate;
            console.log(chosenLine);
            var fcolor = rate2color(chosenLine.late_rate, 0, 100);
            rosen.highlightLine(chosenLine.code, {color: fcolor});
		});
		$('#map_message').text(msg);
	});
    rosen.on('selectSection', function(data) {  //set popup window
        console.log(data);
        rosen.clearSectionPopups();
		data.sections.forEach(function (section) {
            var popup = Rosen.textPopup().setComment("" + chosenLine.name + "\n遅延率：" + chosenLine.late_rate + "%\n");
            rosen.setSectionPopup(section.code, popup);
		});
	});
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


// Helper Functions
function genFakeRate() {
    return Math.floor(Math.random() * 200);
}

function rate2color(val, min ,max) {
    var rateMax = max;
    var rateMin = min;
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

function saveAsTextFile(data, filename) {
    var blob = new Blob([JSON.stringify(data)], {type: "text/plain;charset=utf-8"});
    saveAs(blob, filename);
}

function fetchLateRateData() { //to set late rates
    var lateRateArr = [];
    var lineData = {};
    var params = {
        include: {
            prefectureCode: 13 //Tokyo
        },
        exclude: {
            corporationCode: 102 //TODO: to exclude Shinkansen company
        }
    };
    rosen.searchLines(params).then(function(lines) {
        lines.forEach(function(line) {
            lineData.name = line.name;
            lineData.code = line.code;
            lineData.late_rate = genFakeRate();
            lateRateArr.push(JSON.parse(JSON.stringify(lineData)));
            rosen.highlightLine(line.code);
        });
        setTimeout(function(){
            console.log(lateRateArr);
            saveAsTextFile(lateRateArr, "laterate.js");
        }, 10000);
    });
    /*rosen.getPrefectures().then(function(prefectures){
        console.log(prefectures);
    });
    rosen.getCorporations().then(function(corps){
        console.log(corps);
    });*/
}
function fetchFullRateData() { //to set late rates
    var lineData = {};
    var sectionData = {};
    var params = {
        include: {
            //corporationCode: 18, //The code of Tokyo Metro
            prefectureCode: 13 //The code of Tokyo is 13. TODO: To get railways of cities other than Tokyo
        },
        exclude: {
            corporationCode: 102 //TODO: to exclude Shinkansen company, 102 seems not to be Shinkansen
        }
    };
    rosen.searchLines(params).then(function(lines) {
        lines.forEach(function(line) {
            lineData[line.code] = {};
            lineData[line.code].name = line.name;
            lineData[line.code].sections = [];
            rosen.getSectionsByLineCode(line.code).then(function(sections) {
                sections.forEach(function (section){
                    //sectionData.code = (function () {return section.code;})();
                    rosen.getStationsBySectionCode(section.code).then(function(stations){
                        sectionData.code = section.code;
                        sectionData.station1_code = stations[0].code;
                        sectionData.station1_name = stations[0].name;
                        sectionData.station2_code = stations[1].code;
                        sectionData.station2_name = stations[1].name;
                        sectionData.full_rate = {};
                        sectionData.full_rate["7-8"] = {};
                        sectionData.full_rate["7-8"].up = genFakeRate();
                        sectionData.full_rate["7-8"].down = genFakeRate();
                        sectionData.full_rate["8-9"] = {};
                        sectionData.full_rate["8-9"].up = genFakeRate();
                        sectionData.full_rate["8-9"].down = genFakeRate();
                        lineData[line.code].sections.push(JSON.parse(JSON.stringify(sectionData)));
                    });
                });
            });
        });
        setTimeout(function(){
            console.log(lineData);
            saveAsTextFile(lineData, "fullrate.js");
        }, 30000);
    });
}

function readFullrate() {}


window.addEventListener('load', init);
