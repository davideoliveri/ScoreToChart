var unalteredNotes = ["A", "Bb", "B", "C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab"];
var datanotes = [];
var maxValue = -1; 
var width = 1700, height = 600;
var barWidth = 30;
var pianoW = 1196;
var pianoH = 100;
var Hspacing = 20;
var keyHeight = d3.scale.linear().range([10, height-pianoH-(Hspacing*8)]);
var y = d3.scale.linear().range([height-pianoH, 20]);
var chart;
var notesToMIDI = [];
var delayMultiplier = 0.2;
var author = "Chopin";
var scoreName = "Largo in E-flat 109";


var localScores = ["musicxml/chopin/largo_b109.xml", 
					"musicxml/chopin/nocturne_21 _c_minor.xml", 
					"musicxml/chopin/prelude_28_03_g_major.xml", 
					"musicxml/chopin/prelude_e_minor.xml", 
					"musicxml/chopin/waltz_a_minor.xml", 
					"musicxml/lvb/grosse_fuge.xml", 
					"musicxml/lvb/LVB_OP18_NO1_all.xml", 
					"musicxml/lvb/LVB_OP18_NO1_M1.xml", 
					"musicxml/lvb/LVB_OP18_NO1_M2.xml", 
					"musicxml/lvb/LVB_OP18_NO1_M3.xml", 
					"musicxml/lvb/LVB_OP18_NO1_M4.xml", 
					"musicxml/lvb/moonlight_all.xml", 
					"musicxml/lvb/moonlight_m1.xml", 
					"musicxml/lvb/moonlight_m2.xml", 
					"musicxml/lvb/moonlight_m3.xml", 
					"musicxml/mozart/adagio_and_fugue_c_minor_K546.xml", 
					"musicxml/mozart/fugue_g_minor_k401.xml", 
					"musicxml/mozart/symphony_21_a_major_K134.xml", 
					"musicxml/mozart/turkish_march.xml"];

createFullWidthPiano();

function readTextFile(file){
	var rawFile = new XMLHttpRequest();
	rawFile.open("GET", file, true);
	rawFile.onreadystatechange = function ()
	{
		if(rawFile.readyState === 4)
		{
			if(rawFile.status === 200 || rawFile.status == 0)
			{
				var allText = rawFile.responseText;
				//console.log(allText);
				var score = $.parseXML(allText);
				var pitches = $(score).find("pitch");
				//console.log(pitches.length);
				var splitted = splitInOctaves(pitches);
				var countedNotes = countNotes(splitted);
				applyDataToPiano(countedNotes);
			}
		}
	}
	rawFile.send();
}


function createFullWidthPiano(){
	var offset = 16;
	var firstoctave = true;
	var secondoctave = false;
	var wk = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
	var bk = ['Bb', 'Db', 'Eb', 'Gb', 'Ab'];
	var octaveNow = 0;
	var piano = d3.select("#fullwidthpiano");
	piano.append("svg").attr("width", pianoW).attr("height", height)
	.insert("rect", ":first-child").attr("width", pianoW).attr("height", height).attr("fill", "rgb(176, 224, 230)");
	for(var i=0; i<52; i++){ // white keys
		var stepOctave = wk[i%7] == "C" ? true : false;
		if(stepOctave) {
			//console.log("step here with i = "+i);
			octaveNow++;
		}
		piano.select("svg").append("rect").attr("width", 23).attr("height", pianoH)
		.attr("x", i*23).attr("y", height -100)
		.attr("fill", "white").attr("stroke", "black")
		.attr("id", wk[i%7]+octaveNow )
		.on("click", function(d){
			var thiskey = d3.select(this);
			//console.log(thiskey[0][0].id);
			var note = MIDI.keyToNote[thiskey[0][0].id];
			// MIDI.programChange(0, 1);
			MIDI.noteOn(0, note, 127, 0);
			MIDI.noteOff(0, note, 127, 1);
		})
		.on("mouseover", function(d){
			var thiskey = d3.select(this);
			thiskey.attr("fill", "yellow");
		})
		.on("mouseout", function(d){
			var thiskey = d3.select(this);
			thiskey.attr("fill", "white");
		});		
	}
	
	var octave = 0;
	var bkcount = 0;
	var octaveNow = 0;
	var b = [0, 2, 3, 5, 6]; //in pos b[index] add a black key starting the piano with the lower A
	for(var i=0; i<51; i++){ // black keys skip last key, so iterate until 51
		var blackkey = i%7;
		var skipThis = true;
		
		for(var k=0, len = b.length; k<len; k++){ // check if we need a black key
			if(blackkey == b[k] && skipThis == true) {
				skipThis = false;
				break;				
			}
		}

		if (skipThis) {
			continue; //don't render a black key here!
		} else {
			var stepOctave = bk[bkcount%5] == "Db" ? true : false;
			if(stepOctave) {
				//console.log("step here with i = "+i);
				octaveNow++;
			}
			piano.select("svg").append("rect").attr("width", 13).attr("height", 70)
			.attr("x", 16+(octave*161)+(blackkey*23)).attr("y", height -100)
			.attr("fill", "black").attr("stroke", "black")
			.attr("id", bk[bkcount%5]+octaveNow)
			.on("click", function(d){
				var thiskey = d3.select(this);
				//console.log(thiskey[0][0].id);
				var note = MIDI.keyToNote[thiskey[0][0].id];
				MIDI.noteOn(0, note, 127, 0);
				MIDI.noteOff(0, note, 127, 1);
			})
			.on("mouseover", function(d){
				var thiskey = d3.select(this);
				thiskey.attr("fill", "yellow");
			})
			.on("mouseout", function(d){
				var thiskey = d3.select(this);
				thiskey.attr("fill", "black");
			});	
			bkcount++;
		}

		if(blackkey == 6) {
			octave++;
		}
	}
	//render black line
	d3.select("#fullwidthpiano").select("svg").append("line")
	.attr("x1", 0).attr("y1", height-pianoH)
	.attr("x2", pianoW).attr("y2", height-pianoH)
	.attr("stroke", "black").attr("stroke-width", 1);
	//now prepare the group for the bar chart
	d3.select("#fullwidthpiano svg").append("g").attr("id", "chartednotes"); 
	d3.select('#fullwidthpiano svg').append("text").attr("id", "scoretitle");
	readTextFile(localScores[0]);
}


function applyDataToPiano(notesAndValues){
	keyHeight.domain([0, maxValue]);
	var blackKeys = [];
	var allKeys = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
	
	$.each(notesAndValues, function(octIndex, octave){
		//console.log(octave[0]);

		var sortedNotes = [];
		var sortedCounts = [];
		var starterFound = false;
		var sliceAt =  -1
		//console.log("octave[0] before rearrangin");
		//console.log(octave[0]);
		$.each(allKeys, function(kIndex, key){			
			$.each(octave[0], function(index, note){
				if(note == key && !starterFound){
					starterFound = true;
					sliceAt = index;
					//console.log("at octave n "+octIndex+" we'll slice at "+index+"\n note is "+key);
					var firstPart = octave[0].slice(sliceAt, octave[0].lenght);
					var lastPart = octave[0].slice(0, sliceAt);
					var firstCount = octave[1].slice(sliceAt, octave[0].lenght);
					var lastCount = octave[1].slice(0, sliceAt);
					//console.log(firstPart);
					//console.log(lastPart);
					octave[0] = firstPart.concat(lastPart);
					octave[1] = firstCount.concat(lastCount);
					//console.log(octave[0]);
				} 
				if(starterFound) return false;
			});
		});	

		$.each(octave[0], function(octaveNumber, note){
			//console.log(note);

			var noteId = note+(octIndex);
			var noteRef = d3.select("#"+noteId);
			var newKeyH = keyHeight(octave[1][octaveNumber]);
			var newFill = noteRef.attr("fill");
			var count = octave[1][octaveNumber];
			//console.log("pushing "+noteId);
			notesToMIDI.push({note: noteId, count: count});
			if(newFill != "black"){
				var rect = d3.selectAll("#fullwidthpiano svg g").append("rect")
				.attr("id", noteId+"-"+count)
				.attr("width", noteRef.attr("width"))
				.attr("height", 0)
				.attr("x", function(){
					return noteRef.attr("x")
				}).attr("y",  height-pianoH - Hspacing)
				.attr("fill", newFill).attr("stroke", noteRef.attr("stroke"))
				.on("mouseover", function(d){
					var n = d3.select(this);
					var props = n.attr("id").split("-");
					var x = parseInt(n.attr("x"));
					var y = parseInt(n.attr("y"));
					d3.selectAll("#fullwidthpiano svg")
					.append("g").attr("id", "label")
					.append("rect")
					.attr("x", x).attr("y", y-30)
					.attr("width", 120).attr("height", 25)
					.attr("fill", "white").attr("stroke", "black")
					d3.select("#label")
					.append("text")
					.text(props[0]+": "+props[1]+" times").attr("x", x+4).attr("y", y-12)
					.attr("id", "label")
					.attr("fill", "black");
					
				})
				.on("mouseout", function(d){
					d3.select("#fullwidthpiano svg #label").remove();
				
				});

				rect.transition().duration(800).attr("height", newKeyH).attr("y", (height-newKeyH)-(pianoH+Hspacing));
			} else {
				blackKeys.push({noteName: noteId, noteCount: count});
			}
		});		
	});
	
	$.each(blackKeys, function(index, obj){
		//console.log(obj);
		var b = d3.select("#"+obj.noteName);
		var x = b.attr("x");
		var w = b.attr("width");
		var f = b.attr("fill");
		var h = keyHeight(obj.noteCount);
		//notesToMIDI.push({note: note+(octIndex), count: keyHeight});


		var rect = d3.select("#fullwidthpiano svg #chartednotes").append("rect")
		.attr("height", 0).attr("width", w)
		.attr("x", x).attr("y", (height)-pianoH-Hspacing)
		.attr("fill", f).attr("stroke", "black")
		.attr("id", obj.noteName+"-"+obj.noteCount)
		.on("mouseover", function(d){
			var n = d3.select(this);
			var props = n.attr("id").split("-");
			var x = parseInt(n.attr("x"));
			var y = parseInt(n.attr("y"));
			d3.selectAll("#fullwidthpiano svg")
			.append("g").attr("id", "label")
			.append("rect")
			.attr("x", x).attr("y", y-30)
			.attr("width", 120).attr("height", 25)
			.attr("fill", "white").attr("stroke", "black")
			d3.select("#label")
			.append("text")
			.text(props[0]+": "+props[1]+" times").attr("x", x+4).attr("y", y-12)
			.attr("id", "label")
			.attr("fill", "black");				
		})
		.on("mouseout", function(d){
			d3.select("#fullwidthpiano svg #label").remove();
		});

		rect.transition().duration(800).attr("height", h).attr("y", (height-h)-(pianoH+Hspacing));
		d3.select("svg #scoretitle").text(author+" - "+scoreName).attr("x", 30)
		.attr("y", 65).attr("font-family", "sans-serif").attr("font-size", "50px").attr("fill", "black").transition().duration(700).attr("opacity", 1);	
	});	
}


function countNotes(splitted){
	var counted = [];
	maxValue = -1;
	notesToMIDI = []; // reset
	$.each(splitted, function(index, octaveArray){
		counted[index] = noteCount(octaveArray);
	});
	return counted;
}

function splitInOctaves(pitches){
	var splitted = [];
	for(var i=0; i<9; i++){
		splitted[i] = [];
	}
	$.each(pitches, function(index, value){
		var octave = $(value).find("octave");
		var alter = $(value).find("alter");
		var step = $(value).find("step");
		var thisNote = "";

		if(alter[0] != undefined ){
			switch(alter[0].innerHTML){
				case "-1":
				thisNote = previousNote(step[0].innerHTML);
				break;
				case "-2":
				thisNote = previousTwoNotes(step[0].innerHTML);
				break;
				case "1":
				thisNote = nextNote(step[0].innerHTML);
				break;
				case "2":
				thisNote = nextTwoNotes(step[0].innerHTML);
				break;
			}
		} else { 
			thisNote = step[0].innerHTML;
		}
		splitted[parseInt(octave[0].innerHTML)].push(thisNote);
	});
	return splitted;
}



function noteCount(arr) {
	var a = [], b = [], prev;
	
    arr.sort(); // important!!!

   for ( var i = 0; i < arr.length; i++ ) {
   	if ( arr[i] !== prev ) {
   		a.push(arr[i]);
   		b.push(1);
   	} else {
   		b[b.length-1]++;

   		if(b[b.length-1] > maxValue) {
   			maxValue = b[b.length-1];
   		}
   	}
   	prev = arr[i];
   }

   for(var i=0, len = a.length; i<len; i++){
    	var thisNote = a[i];
   	 	if(thisNote.indexOf("b") != -1){ // if it's altered
   			var baseNote = thisNote.charAt(0); // take the base 
   			//check if the previous one starts with the same Letter (e.g. "Eb" and "E")
   			if( i != 0 && a[i-1].charAt(0) && a[i-1].charAt(0) == baseNote ){ // if the previous is the base of the altered...
   				//swap them and theyr value in array b[]
   				var theBase = a[i-1];
   				a[i-1] = thisNote;
   				a[i] = theBase;

   				var baseCount = b[i-1];
   				var thisCount = b[i];
   				b[i-1] = thisCount;
   				b[i] = baseCount;

   			}	
   		}	
   }

   return [a, b]
}

function nextNote(step){
	var pos = unalteredNotes.indexOf(step);
	if(pos < unalteredNotes.length-2){
		return unalteredNotes[pos+1];
	} else {
		return unalteredNotes[0];
	}
}

function nextTwoNotes(step){
	var pos = unalteredNotes.indexOf(step);
	if(pos < unalteredNotes.length-3){
		return unalteredNotes[pos+2];
	} else {
		return unalteredNotes[0];
	}
}

function previousNote(step){
	var pos = unalteredNotes.indexOf(step);
	if(pos > 0){
		return unalteredNotes[pos-1];
	} else {
		return unalteredNotes[unalteredNotes.length-1];
	}
}

function previousTwoNotes(step){
	var pos = unalteredNotes.indexOf(step);
	if(pos > 1){
		return unalteredNotes[pos-2];
	} else {
		return unalteredNotes[unalteredNotes.length-2];
	}
}

$("#scoreselector").change(function(){
	var i = $("#scoreselector option:selected")[0].index
	console.log($("#scoreselector option:selected")[0].parentElement.label);
	var transitions = 0;

	d3.selectAll("#fullwidthpiano svg #chartednotes rect").transition().attr("height", 0).attr("y", height - pianoH - Hspacing).remove().each("start", function(){
		transitions++;
	}).each("end", function(){
		transitions--;
		if(transitions == 0){
			//console.log("now invoce readTextFile");
			readTextFile(localScores[i]);
		}
	}); // clean previous chart if present...

	d3.select("svg #scoretitle").transition().delay(100).attr("opacity", 0);

	author = $("#scoreselector option:selected")[0].parentElement.label;
	scoreName = $("#scoreselector option:selected")[0].innerHTML;
})

$("#delaychooser").change(function(event){
//	delayMultiplier = event.target.value; // useless for now...
});


$("#scoreselector").selectpicker();

function saveSVG()
{
	var textToWrite = $("svg").parent().html();
	var textFileAsBlob = new Blob([textToWrite], {type:'image/svg+xml'});
	var fileNameToSaveAs = author+"_"+scoreName;

	var downloadLink = document.createElement("a");
	downloadLink.download = fileNameToSaveAs;
	downloadLink.innerHTML = "Download File";
	if (window.webkitURL != null) {
		downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
	} else {
		
		downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
		downloadLink.onclick = destroyClickedElement;
		downloadLink.style.display = "none";
		document.body.appendChild(downloadLink);
	}

	downloadLink.click();
}

destroyClickedElement = function(event) {
    document.body.removeChild(event.target);
};

