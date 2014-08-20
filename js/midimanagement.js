function playThis(){
	playSound(notesToMIDI, maxValue);
}

function playRandom(){
	playRandomSounds(notesToMIDI, maxValue);
}


function playSound (notesToMIDI, maxValue) {

	$.each(notesToMIDI, function(index, obj){
		var length = mapValue(obj.count, 1, maxValue, 0.2, 2);
		// console.log(obj.note);
		// console.log(length);
		var key = MIDI.keyToNote[obj.note]
		// console.log(key);
		// MIDI.programChange(0, 1);
		MIDI.noteOn(0, key, 127, (index)*delayMultiplier);
		MIDI.noteOff(0, key, 127, length);
	});	
}

var durations = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

function playRandomSounds(notesToMIDI, maxValue){
	// console.log("play random here!");
	// console.log(notesToMIDI);
	
	for (var i=0; i<120; i++){
		var play = Math.random() < 0.7 ? true : false;
		if(play){
			var syncNotes = Math.random()*3;
			//syncNotes = parseInt(syncNotes+1);
			syncNotes = 1;
			// console.log("setting "+syncNotes+" notes");
			var chord = [];

			var length;
			var shortLenth = Math.random() < 0.7 ? true : false; //0.7 favourite shorter notes/chords
			if(shortLenth) {
				// choose frome first half of the duration array
				var part = durations.slice((durations.length/2), durations.length);
			} else{
				var part = durations.slice(0, (durations.length/2)+1);
			}
			length = part[parseInt(Math.random()*part.length)]; //chord duration 


			for(var c=0; c<syncNotes; c++){
				var noteIndex = parseInt(Math.random()*notesToMIDI.length);
				var counted = notesToMIDI[noteIndex].count;
				var thisNote = MIDI.keyToNote[notesToMIDI[noteIndex].note];
				// console.log(counted/maxValue);
				// if( (counted/maxValue) < 0.2 ) {
					// console.log("breaking");					
				// }else{
				// 	chord.push(thisNote);
				// }
				chord.push(thisNote);
			}
			
			var repeat = (Math.random()*1)+1;
			for (var r=0; r<repeat; r++){
				// MIDI.programChange(0, 1);
				MIDI.chordOn(0, chord, 127, (i*length/2)+r/repeat);
				MIDI.chordOff(0, chord, 127, length);
			}
		}					
	}
}

function mapValue(value, start1, stop1, start2, stop2) {
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
  }

var randomnotes = function(){
	for(var i=0; i<10; i++){ 
		var n = parseInt( (Math.random()*88)+21); 
		MIDI.setVolume(127);
		// MIDI.programChange(0, 1);
		MIDI.noteOn(0, n, 127, i*0.2); 
		MIDI.noteOff(0, n, 127, (i*0.5)+1);
	}
}
