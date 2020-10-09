// General measurements
var mainWidth = 1070;
var mainHeight = 600;
// Html interaction
var recordingSelector;
var playButton;
var languageButton;
var infoLink;
var scaleCheckbox;
var fundamentalCheckbox;
var persistentCheckbox;
var principalCheckbox;
var beatCheckbox;
// Visualizations
var title_y = 35;
var orchestra_y = 60;
var heading_x;
var lyricsDisplayBox_x = 300;
var lyricsDisplayBox_y = orchestra_y + 10;
var navigationBox;
var navigationBoxH = 50;
var navBoxCursor;
var navBoxCursorW = 3;
var navBoxCursorColor = 'lime';
var lyricsBoxes = [];
var lyricLineH = 20;
var lyricsDisplayHFactor = 8;
var lyricsDisplayH = lyricLineH * lyricsDisplayHFactor + 10;
var lyricLineShift = 0;
var centoCheckboxes;
var patternLabelBoxes = [];
var patternLabelBoxes_y = 100;
var patternLabelBoxes_w = 80;
var patternLabelH = 25;
var colors = ['255, 0, 0', '0, 128, 0', '255, 255, 0',
              '255, 0, 255', '0, 0, 255', '0, 255, 255',
              '255, 165, 0', '128, 0, 128', '0, 255, 0'];
var lineBox;
var lineBoxSeparation = 30;
var centoBox;
var currentLine;
var scaleLines = [];
var scaleDegrees = [];
var minScale;
var maxScale;
var fundamentalDegree;
var fundamentalDegreeColor = 'rgba(255, 0, 0, 0.4)';
var persistentDegree;
var persistentDegreeColor = 'rgba(255, 165, 0, 0.3)';
var principalDegrees = [];
var principalDegreeColor = 'rgba(255, 0, 0, 0.3)';
var beatsColor = 'rgba(0, 0, 255, 0.2)';
// Audio
var mbid;
var track;
var loaded;
var playing;
var currentTime;
var jump;
var trackDuration;
// Metadata and annotations
var title;
var orchestra;
var pitchTrack;
var beats;
// Multilanguage
var language;
var textsLang;
var labels = {
  "play": {
    "en": "Play",
    "es": "Toca"
  },
  "pause": {
    "en": "Pause",
    "es": "Pausa"
  },
  "continue": {
    "en": "Play",
    "es": "Sigue"
  },
  "loading": {
    "en": "Loading...",
    "es": "Cargando..."
  },
  "select": {
    "en": "Select",
    "es": "Elige"
  },
  "centos": {
    "en": "Centos",
    "es": "Centones"
  },
  "scale": {
    "en": "Scale",
    "es": "Escala"
  },
  "fundamental": {
    "en": "Fundamental degree (FD)",
    "es": "Grado fundamental (GF)"
  },
  "persistent": {
    "en": "Persistent degree (PD)",
    "es": "Grado persistente (GP)"
  },
  "principal": {
    "en": "Principal degrees (pd)",
    "es": "Grados principales (gp)"
  },
  "degrees": {
    "en": ["FD", "PD", "pd"],
    "es": ["GF", "GP", "gp"]
  },
  "beats": {
    "en": "Beats",
    "es": "Pulsaciones"
  }
}

function preload () {
  language = document.documentElement.lang;
  if (language == 'es') {
    recordingsInfo = loadJSON("files/recordingsInfo.json");
    tubu = loadJSON("files/tubu.json");
  } else if (language == 'en') {
    recordingsInfo = loadJSON("../files/recordingsInfo.json");
    tubu = loadJSON("../files/tubu.json");
  }
}

function setup() {
  var canvas = createCanvas(mainWidth, mainHeight)
  var div = select("#sketch-holder");
  div.style("width: " + width + "px; position: relative;");
  canvas.parent("sketch-holder");

  ellipseMode(CORNER);

  // Visualizations
  lyricsDisplayBox = new CreateLyricsDisplayBox();
  navigationBox = new CreateNavigationBox();
  navBoxCursor = new CreateNavBoxCursor();
  lineBox = new CreateLineBox();

  // Selector
  recordingSelector = createSelect()
    .size(100, 20)
    .position(10, 10)
    .changed(start)
    .parent("sketch-holder")
  recordingSelector.option(labels.select[language])
  var noRec = recordingSelector.child();
  noRec[0].setAttribute("selected", "true");
  noRec[0].setAttribute("disabled", "true");
  noRec[0].setAttribute("hidden", "true");
  noRec[0].setAttribute("style", "display: none");
  var mbids = Object.keys(recordingsInfo)
  for (var i = 0; i < mbids.length; i++) {
    var mbid = mbids[i]
    var nawba = recordingsInfo[mbid].nawba.tr;
    var mizan = recordingsInfo[mbid].mizan.tr;
    var title = mizan[0].toUpperCase() + mizan.slice(1, mizan.length) + ' ' + nawba;
    var orchestra = recordingsInfo[mbid].orchestra[language];
    var duration = niceTime(recordingsInfo[mbid].duration);
    var option = title + ' - ' + orchestra + ' (' + duration + ')';
    recordingSelector.option(option, mbid);
  }

  // Buttons
  playButton = createButton(labels.play[language])
    .size(100, 100)
    .position(10, recordingSelector.y + recordingSelector.height+10)
    .mousePressed(player)
    .parent("sketch-holder")
    .attribute("disabled", "true");

  languageButton = createButton("العربية")
    .size(100, 30)
    .position(10, playButton.y + playButton.height + 10)
    .mousePressed(languageChange)
    .parent("sketch-holder")
    .attribute("disabled", "true");

  // Centos
  centoBox = new CreateCentoBox();

  heading_x = centoBox.x1 + (lyricsDisplayBox.x2 - centoBox.x1) / 2;

  // Info link
  infoLink = select("#info-link");
  infoLink.position(width - 50, 10);

  // Check boxes
  scaleCheckbox = createCheckbox('', true)
    .position(width-25, lineBox.y1-20)
    .parent('sketch-holder');
  scaleCheckbox.attribute("disabled", "true");

  fundamentalCheckbox = createCheckbox('', true)
    .position(10, navigationBox.y1-25)
    .parent('sketch-holder');
  fundamentalCheckbox.attribute("disabled", "true");

  persistentCheckbox = createCheckbox('', true)
    .position(410, navigationBox.y1-25)
    .parent('sketch-holder');
  persistentCheckbox.attribute("disabled", "true");

  principalCheckbox = createCheckbox('', true)
    .position(210, navigationBox.y1-25)
    .parent('sketch-holder');
  principalCheckbox.attribute("disabled", "true");

  beatCheckbox = createCheckbox('', true)
    .position(lineBox.x1, lineBox.y1-20)
    .parent('sketch-holder');
  beatCheckbox.attribute("disabled", "true");

  centoCheckboxes = select("#cento-checkboxes");
}

function draw() {
  background(165, 214, 167)

  // Title and orchestra
  if (recordingSelector.value() != labels.select[language]) {
    textAlign(CENTER, BOTTOM);
    stroke(0);
    strokeWeight(1);
    fill(0);
    textSize(20);
    textStyle(BOLD);
    text(title[textsLang], heading_x, title_y);
    noStroke();
    fill(0);
    textSize(18);
    text(orchestra[textsLang], heading_x, orchestra_y);
  }

  // Labels to check boxes
  textAlign(RIGHT, TOP);
  textStyle(NORMAL)
  noStroke();
  textSize(12);
  fill(0);
  text(labels.scale[language], scaleCheckbox.x-5, scaleCheckbox.y+3);
  textAlign(LEFT, TOP);
  text(labels.fundamental[language], fundamentalCheckbox.x+20,
       fundamentalCheckbox.y+3);
  text(labels.persistent[language], persistentCheckbox.x+20,
      persistentCheckbox.y+3);
  text(labels.principal[language], principalCheckbox.x+20,
       principalCheckbox.y+3);
  text(labels.beats[language], beatCheckbox.x+20, beatCheckbox.y+3);

  lyricsDisplayBox.display();

  if (loaded && playing) {
    currentTime = track.currentTime();
  }

  navigationBox.displayBack();
  navBoxCursor.updateNav();
  lineBox.displayBack();
  centoBox.display();

  if (loaded) {
    if (scaleCheckbox.checked()) {
      for (var i = 0; i < scaleLines.length; i++) {
        stroke(200);
        strokeWeight(1);
        line(lineBox.x1, scaleLines[i], lineBox.x2, scaleLines[i]);
        textAlign(LEFT, CENTER);
        noStroke();
        textSize(12);
        fill(150);
        textStyle(NORMAL);
        text(scaleDegrees[i], lineBox.x2+5, scaleLines[i]);
      }
    }

    currentLine = undefined;
    for (var i = 0; i < lyricsBoxes.length; i++) {
      lyricsBoxes[i].update();
      lyricsBoxes[i].display();
    }

    navBoxCursor.updateLine();

    for (var i = 0; i < patternLabelBoxes.length; i++) {
      patternLabelBoxes[i].update();
      patternLabelBoxes[i].display();
    }

    textAlign(RIGHT, CENTER);

    if (principalCheckbox.checked()) {
      textStyle(NORMAL);
      for (var i = 0; i < principalDegrees.length; i++) {
        textSize(12);
        fill(0);
        if ((principalDegrees[i] == fundamentalDegree ||
            principalDegrees[i] == persistentDegree) &&
            fundamentalCheckbox.checked()) {
          noStroke();
          text(labels.degrees[language][2], lineBox.x1-30, principalDegrees[i]);
        } else {
          noStroke();
          text(labels.degrees[language][2], lineBox.x1-5, principalDegrees[i]);
          stroke(color(principalDegreeColor));
          strokeWeight(3);
          line(lineBox.x1, principalDegrees[i], lineBox.x2-2, principalDegrees[i]);
        }
      }
    }

    if (persistentCheckbox.checked()) {
      stroke(color(persistentDegreeColor));
      strokeWeight(5);
      line(lineBox.x1, persistentDegree, lineBox.x2-2, persistentDegree);
      noStroke();
      textSize(12);
      fill(0);
      text(labels.degrees[language][1], lineBox.x1-5, persistentDegree);
    }

    if (fundamentalCheckbox.checked()) {
      stroke(color(fundamentalDegreeColor));
      strokeWeight(5);
      line(lineBox.x1+3, fundamentalDegree, lineBox.x2-2, fundamentalDegree);
      textStyle(BOLD);
      noStroke();
      textSize(15);
      fill(0);
      text(labels.degrees[language][0], lineBox.x1-5, fundamentalDegree);
    }
  }

  navBoxCursor.display();
  navigationBox.displayFront();
  lineBox.displayFront();
}

function start() {
  // Stop and remove current audio
  if (loaded) {
    track.stop();
  }
  loaded = false;
  playing = false;
  currentTime = undefined;
  jump = undefined;
  // Reset data
  textsLang = language;
  lyricsBoxes = [];
  lyricLineShift = 0;
  patternLabelBoxes = [];
  for (var i = centoCheckboxes.elt.children.length; i > 0; i--) {
    centoCheckboxes.elt.children[i-1].remove();
  }
  scaleLines = [];
  scaleDegrees = [];
  // Reset buttons
  playButton.html(labels.play[language]);
  playButton.attribute("disabled", "true");
  languageButton.attribute("disabled", "true");
  languageButton.html("العربية");
  scaleCheckbox.attribute("disabled", "true");
  fundamentalCheckbox.attribute("disabled", "true");
  persistentCheckbox.attribute("disabled", "true");
  principalCheckbox.attribute("disabled", "true");
  beatCheckbox.attribute("disabled", "true");
  // Load new audio
  mbid = recordingSelector.value();
  audioLoader(mbid);
  // Load metadata
  var recording = recordingsInfo[mbid];
  var link = recording.info;
  infoLink.attribute("href", link)
    .html("+info");
  var nawba = recording.nawba;
  var tab = recording.tab;
  var tabInfo = tubu[tab.code];
  var scale = tabInfo.scale;
  minScale = min(Object.keys(scale));
  maxScale = max(Object.keys(scale));
  for (var i = 0; i < Object.keys(scale).length; i++) {
    var cents = Object.keys(scale)[i];
    var line_x = map(int(cents), minScale, maxScale,
                     lineBox.y2-10, lineBox.y1+10);
    scaleLines.push(line_x);
    scaleDegrees.push(scale[cents]);
  }
  fundamentalDegree = map(tabInfo.fundamental, minScale, maxScale,
                          lineBox.y2-10, lineBox.y1+10);
  persistentDegree = map(tabInfo.persistent, minScale, maxScale,
                          lineBox.y2-10, lineBox.y1+10);
  for (var i = 0; i < tabInfo.principal.length; i++) {
    var cents = map(tabInfo.principal[i], minScale, maxScale,
                    lineBox.y2-10, lineBox.y1+10);
    principalDegrees.push(cents);
  }
  var mizan = recording.mizan;
  var trTitle = mizan.tr[0].toUpperCase() + mizan.tr.slice(1, mizan.tr.length) + ' ' + tab.tr;
    var arTitle = mizan.ar + ' ' + tab.ar;
  title = {'ar': arTitle, 'en': trTitle, 'es': trTitle};
  orchestra = recording.orchestra;
  trackDuration = recording.duration;
  // Lyrics boxes
  var lyrics = recording.lyrics;
  for (var i = 0; i < lyrics.length; i++) {
      var lyricsBox = new CreateLyricsBox(lyrics[i], i);
      lyricsBoxes.push(lyricsBox);
  }
  // Load pitch track
  if (language == 'es') {
    pitchTrack = loadJSON("files/pitchTracks/" + mbid + "-pitchTrack.json", function() {
                            for (var i = 0; i < lyricsBoxes.length; i++) {
                              lyricsBoxes[i].genPitchTrack();
                            }
                          });
  } else {
    pitchTrack = loadJSON("../files/pitchTracks/" + mbid + "-pitchTrack.json", function() {
                            for (var i = 0; i < lyricsBoxes.length; i++) {
                              lyricsBoxes[i].genPitchTrack();
                            }
                          });
  }
  // Beats
  beats = recording.beats;
  for (var i = 0; i < lyricsBoxes.length; i++) {
    lyricsBoxes[i].genBeats();
  }
  // Patterns
  var patterns = recording.patterns;
  var patternLabels = Object.keys(patterns).sort();
  for (var i = 0; i < patternLabels.length; i++) {
    var patternLabel = patternLabels[i];
    var patternLabelBox = new CreatePatternLabelBox(patternLabel, i);
    for (var j = 0; j < patterns[patternLabel].length; j++) {
      var pattern = patterns[patternLabel][j];
      var patternBox = new CreatePatternBox(pattern, patternLabel, i, patternLabels.length);
      patternLabelBox.patternBoxes.push(patternBox);
    }
    patternLabelBoxes.push(patternLabelBox);
  }
}



// Visualizations
function CreateLyricsDisplayBox() {
  this.x1 = lyricsDisplayBox_x;
  this.y1 = lyricsDisplayBox_y;
  this.x2 = width-10;
  this.w = this.x2 - this.x1;
  this.h = lyricLineH * lyricsDisplayHFactor + 10;
  this.y2 = this.y1 + this.h;
  this.color;

  this.display = function() {
    if (loaded) {
      this.color = color(255);
    } else {
      this.color = color(0, 25);
    }
    fill(this.color);
    noStroke();
    rect(this.x1, this.y1, this.w, this.h);
    stroke(0);
    strokeWeight(1);
    line(this.x1, this.y1-1, this.x2, this.y1-1);
    line(this.x2, this.y1-1, this.x2, this.y2);
    strokeWeight(2);
    line(this.x1, this.y2, this.x2, this.y2);
    line(this.x1, this.y1, this.x1, this.y2);
  }
}

function CreateNavigationBox() {
  this.x1 = 10;
  this.x2 = width - 10;
  this.y1 = height - navigationBoxH - 10;
  this.y2 = height - 10;
  this.w = this.x2 - this.x1
  this.color;

  this.displayBack = function() {
    if (loaded) {
      this.color = color(255);
    } else {
      this.color = color(0, 25);
    }
    fill(this.color);
    noStroke();
    rect(this.x1, this.y1, this.w, navigationBoxH);
  }

  this.displayFront = function() {
    stroke(0, 150);
    strokeWeight(1);
    line(this.x1, this.y1-1, this.x2, this.y1-1);
    line(this.x2, this.y1-1, this.x2, this.y2);
    strokeWeight(2);
    line(this.x1, this.y1, this.x1, this.y2);
    line(this.x1, this.y2, this.x2, this.y2);
  }

  this.clicked = function () {
    if (mouseX > this.x1 && mouseX < this.x2 && mouseY > this.y1 && mouseY < this.y2) {
      jump = map(mouseX, this.x1, this.x2, 0, trackDuration);
      if (playing) {
        track.jump(jump);
        jump = undefined;
      } else {
        currentTime = jump;
      }
    }
  }
}

function CreateNavBoxCursor() {
  this.nav_x;
  this.line_x;
  this.lineWeight = navBoxCursorW * 2;

  this.updateNav = function() {
    this.nav_x = map(currentTime, 0, trackDuration,
      navigationBox.x1+navBoxCursorW/2, navigationBox.x2-navBoxCursorW/2);
    if (navigationBox.x2 - navBoxCursorW/2 - this.x < 0.1) {
      track.stop();
      playing = false;
      currentTime = 0;
      playButton.html(labels.play[language]);
    }
  }

  this.updateLine = function() {
    if (currentLine != undefined) {
      var lineStart = lyricsBoxes[currentLine].start;
      var lineEnd = lyricsBoxes[currentLine].end;
      this.line_x = map(currentTime, lineStart, lineEnd,
                        lineBox.x1+this.lineWeight/2,
                        lineBox.x2-this.lineWeight/2);
    }
  }

  this.display = function() {
    stroke(color(navBoxCursorColor));
    // Cursor in navigation box
    strokeWeight(navBoxCursorW);
    line(this.nav_x, navigationBox.y1, this.nav_x,
      navigationBox.y2-navBoxCursorW/2);
    // Cursor in line box
    if (currentLine != undefined) {
      strokeWeight(this.lineWeight);
      line(this.line_x, lineBox.y1+this.lineWeight/2,
           this.line_x, lineBox.y2-this.lineWeight/2);
    }
  }
}

function CreateLineBox() {
  this.x1 = 60;
  this.y1 = lyricsDisplayBox.y2 + lineBoxSeparation;
  this.w = width - 95;
  this.h = navigationBox.y1 - this.y1 - 30;
  this.x2 = this.x1 + this.w;
  this.y2 = this.y1 + this.h;
  this.color;

  this.displayBack = function() {
    if (loaded) {
      this.color = color(255);
    } else {
      this.color = color(0, 25);
    }
    noStroke();
    fill(this.color);
    rect(this.x1, this.y1, this.w, this.h);
  }

  this.displayFront = function() {
    stroke(0);
    strokeWeight(1);
    line(this.x1, this.y1, this.x2, this.y1);
    line(this.x2, this.y1, this.x2, this.y2);
    strokeWeight(2);
    line(this.x1, this.y2, this.x2, this.y2);
    line(this.x1, this.y1+1, this.x1, this.y2);
  }

  this.clicked = function () {
    if (mouseX > this.x1 && mouseX < this.x2 && mouseY > this.y1 && mouseY < this.y2) {
      jump = map(mouseX, this.x1, this.x2, lyricsBoxes[currentLine].start, lyricsBoxes[currentLine].end);
      if (playing) {
        track.jump(jump);
        jump = undefined;
      } else {
        currentTime = jump;
      }
    }
  }
}

function CreateCentoBox() {
  this.x1 = playButton.x + playButton.width + 20;
  this.y1 = lyricsDisplayBox_y;
  this.x2 = lyricsDisplayBox_x-10;
  this.w = this.x2 - this.x1;
  this.h = lyricsDisplayBox.h;
  this.y2 = this.y1 + this.h;
  this.color;

  this.display = function() {
    if (loaded) {
      this.color = color(255);
    } else {
      this.color = color(0, 25);
    }
    fill(this.color);
    noStroke();
    rect(this.x1, this.y1, this.w, this.h);
    stroke(0);
    strokeWeight(1);
    line(this.x1, this.y1-1, this.x2, this.y1-1);
    line(this.x2, this.y1-1, this.x2, this.y2);
    strokeWeight(2);
    line(this.x1, this.y2, this.x2, this.y2);
    line(this.x1, this.y1, this.x1, this.y2);
    textAlign(LEFT, BOTTOM);
    noStroke();
    fill(0);
    textSize(12);
    textStyle(BOLD);
    text(labels.centos[language], this.x1, this.y1-5);
  }
}

function CreateLyricsBox(lyric, i) {
  this.index = i;
  this.start = lyric.start;
  this.end = lyric.end;
  // Data for navigation boxes
  this.nav_x1 = map(this.start, 0, trackDuration,
    navigationBox.x1+navBoxCursorW/2, navigationBox.x2-navBoxCursorW/2);
  this.nav_x2 = map(this.end, 0, trackDuration,
    navigationBox.x1+navBoxCursorW/2, navigationBox.x2-navBoxCursorW/2);
  this.nav_y1 = navigationBox.y1;
  this.nav_w = this.nav_x2 - this.nav_x1;
  this.nav_h = navigationBoxH-2;
  this.lineType;
  if (lyric.lyrics['es'][0] == '#') {
    this.lineType = 2;
    this.nav_def_fill = color(0, 40);
  } else if (lyric.lyrics['es'][0] == '(') {
    this.lineType = 3;
    this.nav_def_fill = color(255);
  } else {
    this.lineType = 1;
    this.nav_def_fill = color(0, 70);
  }

  this.nav_fill;
  this.nav_stroke;
  // Data for lyrics display boxes
  this.lx1 = lyricsDisplayBox_x + 10;
  this.ly1 = 5 + lyricsDisplayBox_y + (lyricLineH * this.index);
  this.lw = width-10 - this.lx1 + 10;
  this.lh = lyricLineH;
  this.lx2 = this.lx1 + this.lw;
  this.ly2 = this.ly1 + this.lh;
  this.lfill;
  this.hidden;
  // Line pitch track
  this.pitchTrack = {};
  this.tak = [];
  this.dum = [];

  this.genPitchTrack = function() {
    for (var i = this.start * 100; i <= this.end * 100; i++) {
      var k = (i/100).toFixed(2);
      var v = pitchTrack[k];
      var x = map(i, this.start*100, this.end*100, lineBox.x1, lineBox.x2);
      var y;
      if (v < minScale) {
        y = undefined;
      } else if (v > maxScale) {
        y = undefined;
      } else {
        y = map(v, minScale, maxScale, lineBox.y2-10, lineBox.y1+10);
      }
      this.pitchTrack[round(x)] = round(y);
    }
  }

  this.genBeats = function() {
    for (var i = 0; i < beats.tak.length; i++) {
      if (beats.tak[i] >= this.start && beats.tak[i] <= this.end) {
        var x = map(beats.tak[i], this.start, this.end, lineBox.x1, lineBox.x2);
        this.tak.push(x);
      }
    }
    for (var i = 0; i < beats.dum.length; i++) {
      if (beats.dum[i] >= this.start && beats.dum[i] <= this.end) {
        var x = map(beats.dum[i], this.start, this.end, lineBox.x1, lineBox.x2);
        this.dum.push(x);
      }
    }
  }

  this.update = function() {
    // Check if the cursor is within a lyrics navigation box
    if (navBoxCursor.nav_x >= this.nav_x1 && navBoxCursor.nav_x < this.nav_x2) {
      currentLine = this.index;
      this.nav_fill = color(128, 128, 0, 250);
      this.nav_stroke = color(128, 128, 0, 250);
      this.lfill = color(128, 128, 0, 100);
      if (this.ly1 + lyricLineShift >= lyricsDisplayBox_y+lyricsDisplayH-5) {
        lyricLineShift = lyricsDisplayBox_y+lyricsDisplayH-this.ly1-lyricLineH-5;
      } else if (this.ly1+lyricLineShift <= lyricsDisplayBox_y) {
        lyricLineShift = lyricsDisplayBox_y - this.ly1 + 5;
      }
    } else {
      this.nav_fill = this.nav_def_fill;
      this.nav_stroke = color(255);
      this.lfill = color(255, 0);
    }

  }

  this.display = function() {
    // Navigation box
    fill(this.nav_fill);
    stroke(this.nav_stroke);
    strokeWeight(1);
    rect(this.nav_x1, this.nav_y1, this.nav_w, this.nav_h);
    if (this.ly1 + lyricLineShift > lyricsDisplayBox_y &&
      this.ly1 + lyricLineShift < lyricsDisplayBox_y + lyricsDisplayH - 5) {
      // Lyrics display box
      fill(this.lfill);
      noStroke();
      rect(this.lx1-10, this.ly1+lyricLineShift, this.lw, this.lh);
      // Lyrics text
      if (textsLang == 'ar') {
        textAlign(RIGHT, BOTTOM);
      } else {
        textAlign(LEFT, BOTTOM);
      }
      textSize(lyricLineH * 0.70);
      fill(0);
      var txt = lyric.lyrics[textsLang];
      if (this.lineType == 2) {
        if (textsLang == 'ar') {
          textStyle(NORMAL);
          txt = txt + '       ';
        } else {
          textStyle(ITALIC);
          txt = '       ' + txt.substring(1)
        }
      } else if (this.lineType == 3) {
        textStyle(NORMAL);
      } else {
        textStyle(BOLD);
      }
      text(txt, this.lx1, this.ly1-(lyricLineH*0.2)+lyricLineShift,
        this.lw-30, this.lh);
      this.hidden = false;
    } else {
      this.hidden = true;
    }
    // Pitch track
    if (this.index == currentLine) {
      stroke(0);
      noFill();
      strokeWeight(2);
      var openShape = false;
      for (var i = 0; i < Object.keys(this.pitchTrack).length; i++) {
        var x = Object.keys(this.pitchTrack)[i];
        var y = this.pitchTrack[x];
        if (isNaN(y)) {
          if (openShape) {
            endShape();
            openShape = false;
          }
        } else {
          if (openShape) {
            vertex(x, y);
          } else {
            beginShape();
            vertex(x, y);
            openShape = true;
          }
        }
      }
      if (openShape) {
        endShape();
      }
      // Beats
      if (beatCheckbox.checked()) {
        stroke(color(beatsColor));
        for (var i = 0; i < this.tak.length; i++) {
          strokeWeight(1);
          line(this.tak[i], lineBox.y1, this.tak[i], lineBox.y2);
        }
        for (var i = 0; i < this.dum.length; i++) {
          strokeWeight(3);
          line(this.dum[i], lineBox.y1+2, this.dum[i], lineBox.y2-2);
        }
      }
    }
  }

  this.clicked = function() {
    if (mouseX > this.lx1 && mouseX < this.lx2 &&
        mouseY > this.ly1+lyricLineShift && mouseY < this.ly2+lyricLineShift &&
        !this.hidden) {
      jump = this.start;
      if (playing) {
        track.jump(jump);
        jump = undefined;
      } else {
        currentTime = jump;

      }
    }
  }
}

function CreatePatternLabelBox(patternLabel, i) {
  this.i = i;
  this.x1 = centoBox.x1+10;
  this.x2 = centoBox.x2-10;
  this.y2 = centoBox.y1 + (patternLabelH * i) + 5;
  this.y1 = this.y2 + 5;
  this.patternBoxes = [];
  this.sounding = 0;
  this.checkBox;

  this.genCheckBox = function() {
    this.checkBox = createCheckbox('', true)
    .position(this.x1, this.y1)
    .parent('cento-checkboxes')
    .changed(function() {print(this.checked())});
  }

  this.update = function() {
    var sounding = 0;
    for (var j = 0; j < this.patternBoxes.length; j++) {
      patternBox = this.patternBoxes[j];
      if (navBoxCursor.nav_x >= patternBox.nav_x1 &&
          navBoxCursor.nav_x <= patternBox.nav_x2) {
        sounding += 1;
      }
    }
    this.sounding = sounding;
  }

  this.display = function() {
    if (this.sounding > 0) {
      textSize(lyricLineH * 1.2);
    } else {
      textSize(lyricLineH * 0.70);
    }
    textAlign(LEFT, CENTER);
    textStyle(BOLD);
    stroke(color('rgb(' + colors[this.i] + ')'));
    strokeWeight(2);
    fill(0);
    text(patternLabel, this.x1+20, this.y2, patternLabelBoxes_w, patternLabelH);
    if (this.checkBox.checked()) {
      for (var i = 0; i < this.patternBoxes.length; i++) {
        this.patternBoxes[i].update();
        this.patternBoxes[i].display();
      }
    }
  }
}

function CreatePatternBox(pattern, patternLabel, i, total) {
  this.start = pattern.start;
  this.end = pattern.end;
  // Box in navigation box
  this.nav_x1 = map(this.start, 0, trackDuration,
    navigationBox.x1+navBoxCursorW/2, navigationBox.x2-navBoxCursorW/2);
  this.nav_x2 = map(this.end, 0, trackDuration,
    navigationBox.x1+navBoxCursorW/2, navigationBox.x2-navBoxCursorW/2);
  this.nav_h = (navigationBoxH - 10) / total;
  this.nav_y1 = navigationBox.y1 + 5 + this.nav_h * i;
  this.nav_w = this.nav_x2 - this.nav_x1;
  // Box in line box
  this.lineIndex = 0;
  while (this.end <= lyricsBoxes[this.lineIndex].start ||
    this.start >= lyricsBoxes[this.lineIndex].end) {
    this.lineIndex += 1;
    if (this.lineIndex == lyricsBoxes.length) {
      this.lineIndex = undefined;
      break;
    }
  }
  if (this.lineIndex != undefined) {
    this.lineStart = lyricsBoxes[this.lineIndex].start;
    this.lineEnd = lyricsBoxes[this.lineIndex].end;
    if (this.start < this.lineStart) {
      this.line_x1 = lineBox.x1;
    } else {
      this.line_x1 = map(this.start, this.lineStart, this.lineEnd,
                         lineBox.x1, lineBox.x2,);
    }
    if (this.end > this.lineEnd) {
      this.line_x2 = lineBox.x2;
    } else {
      this.line_x2 = map(this.end, this.lineStart, this.lineEnd,
                         lineBox.x1, lineBox.x2,);
    }
    this.line_w = this.line_x2 - this.line_x1;
  }

  this.update = function() {}

  this.display = function() {
    // noStroke();
    stroke(0);
    strokeWeight(1);
    fill(color('rgba(' + colors[i] + ', 0.5)'));
    rect(this.nav_x1, this.nav_y1, this.nav_w, this.nav_h);
    if (this.lineIndex != undefined && this.lineIndex == currentLine) {
      rect(this.line_x1, lineBox.y1, this.line_w, lineBox.h);
      textSize(15);
      textAlign(LEFT, TOP);
      textSize(NORMAL);
      noStroke();
      fill(0);
      text(patternLabel[1], this.line_x1+5, lineBox.y1+5, this.line_w, lineBox.h);
    }
  }
}



// Audio
function audioLoader() {
  var root;
  if (language == "es") {
    root = "tracks/"
  } else {
    root = "../tracks/"
  }
  track = loadSound(root + mbid + ".mp3", function () {
    for (var i = 0; i < patternLabelBoxes.length; i++) {
      patternLabelBoxes[i].genCheckBox();
    }
    scaleCheckbox.removeAttribute("disabled");
    fundamentalCheckbox.removeAttribute("disabled");
    persistentCheckbox.removeAttribute("disabled");
    principalCheckbox.removeAttribute("disabled");
    beatCheckbox.removeAttribute("disabled");
    loaded=true;
    currentTime = 0;
    playButton.html(labels.play[language]);
    playButton.removeAttribute("disabled");
    languageButton.removeAttribute("disabled");
  }, function() {}, function() {
    playButton.html(labels.loading[language]);
  });
}

function player() {
  if (playing) {
    track.pause();
    playing = false;
    playButton.html(labels.continue[language]);
  } else {
    if (jump == undefined) {
      track.play();
    } else {
      track.play();
      track.jump(jump);
      jump = undefined;
    }
    playing = true;
    playButton.html(labels.pause[language]);
  }
}

// Helper functions
function mouseClicked () {
  if (loaded) {
    navigationBox.clicked();
    lineBox.clicked();
    for (var i = 0; i < lyricsBoxes.length; i++) {
      lyricsBoxes[i].clicked();
    }
  }
}

function languageChange () {
  if (textsLang == "ar") {
    textsLang = language;
    languageButton.html("العربية");
  } else {
    textsLang = "ar";
    if (language =="es") {
      languageButton.html("Español");
    } else if (language == "en") {
      languageButton.html("English");
    }
  }
}

function niceTime (seconds) {
  var niceTime;
  var sec = int(seconds%60);
  var min = int(seconds/60);
  niceTime = str(min).padStart(2, "0") + ":" + str(sec).padStart(2, "0");
  return niceTime
}
