/*!
 * scorecard.js
 * JavaScript for the GolfScorecard web site.
 * Uses jQuery.
 *
 * Copyright (c) 2014 Jim & Joel Kottas.  All rights reserved.
 */

function triml(str) {
    return str.replace(/^\s+/, '');
}

function trimr(str) {
    return str.replace(/\s+$/, '');
}

function trimm(str) {
    return str.replace(/\s+/g, ' ');
}

function trim(str) {
    return trimm(triml(trimr(str)));
}

function Course(name, city, state, outPars, inPars) {
    this.name = name;
    this.city = city;
    this.outPars = outPars;
    this.inPars = inPars;

    this.id = "course_" + trim(this.name + this.city +
        this.state).replace(/\s/g, '_');

    this.str = this.name;
    if (city && state) {
        this.str += " (" + city + ", " + state + ")";
    }
    else if (city) {
        this.str += " (" + city + ")";
    }
    else if (state) {
        this.str += " (" + state + ")";
    }
}

(function() {
"use strict";

// Declare a global variable that will hold the array of cell IDs for scores and their corresponding
// row numbers.  The par row is number 0, player 1 row is 1, etc.
var scoreIDrows = [];

function addScoreIDandRow(cellid, rownum) {
    scoreIDrows.push([cellid, rownum]);
}

function getRowNum(cellid) {
    for (var n = 0; n < scoreIDrows.length; n++) {
        if (scoreIDrows[n][0] == cellid) {
            return scoreIDrows[n][1];
        }
    }
    return -1;
}

function updateCourseInfoGui() {
    // Only show the text box to enter in course information if "Other" is selected
    var selectedValue = $( "#select_course" ).val();
    if (selectedValue == "course_other") {
        $( "#other_course_name_label" ).show();
        $( "#other_course_name" ).show();
    } else {
        $( "#other_course_name_label" ).hide();
        $( "#other_course_name" ).hide();
    }
    updateParBasedOnCourse();
    return true;
}

function updateParBasedOnCourse() {
    // First reset all of the par values to 3.
    for (var h = 1; h <= 18; h++) {
        $( "#parh" + h.toString() ).text("3");
    }
    // Now update the holes based on the course
    var selectedValue = $( "#select_course" ).val();
    if (selectedValue == "MA_Devens_TheGeneral") {
        $( "#parh5" ).text("4");
        $( "#parh11" ).text("4");
    } else
    if (selectedValue == "NH_Pelham_MuldoonPark") {
        $( "#parh6" ).text("4");
        $( "#parh17" ).text("4");
    } else
    if (selectedValue == "typical_minigolf") {
        for (var n = 1; n <= 18; n++) {
            $( "#parh" + n.toString() ).text("2");
        }
    }
    recalculateRow(0);
    return true;
}

function countCharInString(s, c) {
    // Returns the number of times that the character c appears in the string s.
    var num = 0;
    for (var i = 0; i<s.length; i++) {
        if (s[i] == c)
            num++;
    }
    return num;
}

function recalculateCell() {
    // This function takes a variable number of arguments.  All arguments are
    // the IDs of the objects from which the elements should be included in
    // the calculation.  The first argument is the cell into which the sum
    // of the other cells is put.
    if (arguments.length <= 1) {
        return true;
    }
    var idOutput = arguments[0];
    var sum = 0;            // The sum of the numeric values in all cells.
    var numStars = 0;       // # of "*" characters in all cells.
    var numHashes = 0;      // # of "#" characters in all cells.
    var numPlusses = 0;      // # of "+" characters in all cells.
    var re = /[*#+ ]+/g;     // Regex to remove stars, hashes, and whitespace from the cell value.
    for (var i = 1; i < arguments.length; i++) {
        var cellText = $( "#" + arguments[i] ).text();
        numStars += countCharInString(cellText, '*');
        numHashes += countCharInString(cellText, '#');
        numPlusses += countCharInString(cellText, '+');
        var value = cellText.replace(re, '');
        sum += Number(value);
    }
    var newText = sum.toString()
        + Array(numPlusses + 1).join("+")
        + Array(numStars + 1).join("*")
        + Array(numHashes + 1).join("#");
    $( "#" + idOutput ).text(newText);
    return true;
}

function getNumPlayers() {
    // Returns the total number of players in the main display, including ones that
    // have no data for them.
    var localNumPlayers = defNumPlayers;
    var internalNumPlayers = Number($( "#num_players" ).val());
    if (internalNumPlayers > localNumPlayers) {
        // Allows for future growth when the number of players can be dynamically increased.
        localNumPlayers = internalNumPlayers;
    }
    return localNumPlayers;
}

function recalculateRow(rownum) {
    // Recalculates the given row number.  If rownum = 0, then the par row is recalculated.
    // Row 1 corresponds to player 1, etc.  If the rownum < 0, then all rows are recalculated.
    var numPlayers = getNumPlayers();
    for (var i = 0; i <= numPlayers; i++) {
        if (rownum == i || rownum < 0) {
            var pid = "p" + ((rownum == 0) ? "ar" : String(i));
            recalculateCell(
                pid + "out",
                pid + "h1",
                pid + "h2",
                pid + "h3",
                pid + "h4",
                pid + "h5",
                pid + "h6",
                pid + "h7",
                pid + "h8",
                pid + "h9");
            recalculateCell(
                pid + "in",
                pid + "h10",
                pid + "h11",
                pid + "h12",
                pid + "h13",
                pid + "h14",
                pid + "h15",
                pid + "h16",
                pid + "h17",
                pid + "h18");
            recalculateCell(
                pid + "total",
                pid + "out",
                pid + "in");
        }
    }
    return true;
}

function randomIntFromInterval(min, max) {
    // Generate a random integer in the range [min, max].
    return Math.floor(Math.random()*(max-min+1)+min);
}

function newScorecardID() {
    var d = new Date();
    var yyyy = d.getFullYear();
    var mm = d.getMonth() + 1;      if (mm < 10) { mm = "0" + mm; }
    var dd = d.getDate();           if (dd < 10) { dd = "0" + dd; }
    var HH = d.getHours();          if (HH < 10) { HH = "0" + HH; }
    var MM = d.getMinutes();        if (MM < 10) { MM = "0" + MM; }
    var SS = d.getSeconds();        if (SS < 10) { SS = "0" + SS; }
    var MMM = d.getMilliseconds();
    if (MMM < 10) { MMM = "00" + MMM; }
    else if (MMM < 100) { MMM = "0" + MMM; }
    var randValue = randomIntFromInterval(100000, 999999);
    var newID = yyyy.toString() + mm.toString() + dd.toString()
        + "_" + HH.toString() + MM.toString() + SS.toString() + MMM.toString()
        + "_" + randValue.toString();
    $( "#scorecard_id" ).val(newID);
    $( "#main_date" ).val(fetchDate());
    return true;
}

function fetchDate() {
    var d = new Date();
    return (1 + d.getMonth()) + "/" + d.getDate() + "/" + d.getFullYear();
}

function enterHoleScore(holeID) {
    // holeID should be the ID of the control into which the score would be entered.
    $( "#score_entry_dialog" ).data( "target_id", holeID ); // Save the control
        // ID to set the final value.
    // First set the initial value of the score box to be the current score value.
    var v = $( "#" + holeID ).text();
    $( "#score_box_entry" ).val(v);
    // And this is the code the clear it, if that is desired in the future.
    //$( "#score_box_entry" ).val('');
    var rownum = getRowNum(holeID);
    if (rownum == 0) {
        // This is the par row, so don't allow * and #.
        $( "#valuestar" ).hide();
        $( "#valuehash" ).hide();
        $( "#valueplus" ).hide();
        $( "#score_instructions_row" ).hide();
    } else {
        // Otherwise, it is a player row, so enable them.
        $( "#valuestar" ).show();
        $( "#valuehash" ).show();
        $( "#valueplus" ).show();
        $( "#score_instructions_row" ).show();
    }
    // Make sure the score area has the focus so that keyboard input is possible.
    $( "#score_box_entry" ).focus();
    // Now launch the dialog box to set/edit the score for this control.
    $( "#score_entry_dialog" ).dialog( "open" );
    return true;
}

function scoreEntryAppend(value) {
    var v = $( "#score_box_entry" ).val();
    v = v.toString() + value.toString();
    $( "#score_box_entry" ).val(v);
    return false;   // to make sure the dialog box is not dismissed.
}

function scoreEntryBackspace() {
    // Delete the last character from the score.
    var v = $( "#score_box_entry" ).val().toString();
    if (v.length == 1) {
        // Simply set the box score to be an empty string.
        scoreEntryClear();
    } else if (v.length > 1) {
        // Remove the last character from the box score string.
        v = v.substring(0, v.length - 1);
        $( "#score_box_entry" ).val(v);
    }
    return false;   // to make sure the dialog box is not dismissed.
}

function scoreEntryClear() {
    // Clear the value in the score box.
    $( "#score_box_entry" ).val('');
    return false;   // to make sure the dialog box is not dismissed.
}

function scoreEntryCancel() {
    // Cancel the score box and don't set any new score.
    scoreEntryClear();
    $('#score_entry_dialog').dialog('close');
    return false;   // to make sure the dialog box is not dismissed.
}

function scoreEntryDone() {
    // Saves the score box value for the calling hole.
    var v = $( "#score_box_entry" ).val();
    var holeID = $( "#score_entry_dialog" ).data("target_id");
    $("#" + holeID).text(v);
    var rownum = getRowNum(holeID);
    recalculateRow(rownum);
    scoreEntryClear();
    $('#score_entry_dialog').dialog('close');
    return false;   // to make sure the dialog box is not dismissed.
}

function clearScorecard() {
    // First ask for confirmation from the user to clear this scorecard and start over.
    var answer = confirm("Are you sure you want to clear this scorecard?");
    if (answer) {
        var numPlayers = getNumPlayers();
        for (var p = 1; p <= numPlayers; p++) {
            $( "#p" + p.toString() + "name" ).val('');
        }
        for (var n = 0; n < scoreIDrows.length; n++) {
            if (scoreIDrows[n][1] > 0) {    // The 0 row is the par row, so don't clear that.
                $( "#" + scoreIDrows[n][0] ).text('');
            }
        }
        recalculateRow(-1);                  // Recalculate all rows
        $( "#course_notes" ).val('');        // Clear the notes
        $( "#other_course_name" ).val('');   // Clear the other course information
        newScorecardID();
    }
    return true;
}

function setCursorAtTheEnd(aTextInput, aEvent) {
    var end = aTextInput.value.length;
    if (aTextInput.setSelectionRange) {
        setTimeout(aTextInput.setSelectionRange,0,[end,end]);
    } else { // IE style
        var aRange = aTextInput.createTextRange();
        aRange.collapse(true);
        aRange.moveEnd('character', end);
        aRange.moveStart('character', end);
        aRange.select();
    }
    aEvent.preventDefault();
    return false;
}

function moveCursorToEnd(el) {
    if (typeof el.selectionStart == "number") {
        el.selectionStart = el.selectionEnd = el.value.length;
    } else if (typeof el.createTextRange != "undefined") {
        el.focus();
        var range = el.createTextRange();
        range.collapse(false);
        range.select();
    }
    return false;
}


// The JavaScript functions below are for the jQuery UI for entering in a score
// value via the dialog box.
//
// Note:  The keyboard event handlers below return false when the default
// handler should not be called.
//
// From http://permadi.com/tutorial/jsEventBubbling/index.html:
//      By assigning an event handler like above, our handler will be called before the
//      default (built-in) event handler is called. Ont thing that often gets overlooked
//      is the return value. This value is important in some sitations because that value
//      determines whether the default event handler is called or not.
//
//      Returning false tells the default event handler to be skipped. Returning true tells
//      the event-chain to continue (meaning the default event handler will be called). If
//      no return value is specified, true is assumed.

function keydownHandler(e) {
    // For now, let the default handler do its stuff, except for the BACKSPACE key because
    // Chrome interprets it to go back to the previous web page.
    e = e || event;
    var eventName = e.type;
    var keyCode = e.keyCode;
    var which = e.which;
    var charCode = e.charCode;
    var charPressed = String.fromCharCode(e.keyCode || e.charCode);
    var shiftKeyActive = e.shiftKey;
    var ctrlKeyActive = e.ctrlKey;
    var altKeyActive = e.altKey;
    var metaKeyActive = e.metaKey;
    if (ctrlKeyActive || altKeyActive || metaKeyActive) {
        // None of the controls in the score entry dialog box should use the
        // Ctrl, Alt, or Meta keys.  Don't include the Shift key here because
        // the * and # characters may need it.
        return true;
    }
    switch (keyCode) {
        case 8:     // BACKSPACE key
            return false;
        default:
            break;
    }
    return true;
}

function keyupHandler(e) {
    // Chrome does not create a keypress event for the following keys:
    //      BACKSPACE
    //      DEL
    //      ESC
    // However, Chrome does generate a keypress event for 0-9, *, #, and the ENTER key.
    // Firefox does create keypress events for all of these keys, so these three special
    // keys need to be handled here and then ignored in the keypressHandler() function.
    e = e || event;
    var eventName = e.type;
    var keyCode = e.keyCode;
    var which = e.which;
    var charCode = e.charCode;
    var charPressed = String.fromCharCode(e.keyCode || e.charCode);
    var shiftKeyActive = e.shiftKey;
    var ctrlKeyActive = e.ctrlKey;
    var altKeyActive = e.altKey;
    var metaKeyActive = e.metaKey;
    if (ctrlKeyActive || altKeyActive || metaKeyActive) {
        // None of the controls in the score entry dialog box should use the
        // Ctrl, Alt, or Meta keys.  Don't include the Shift key here because
        // the * and # characters may need it.
        return false;
    }
    switch (keyCode) {
        case 8:     // BACKSPACE key
            scoreEntryBackspace();
            return false;
        case 27:    // ESC (Escape) key
            // This is the escape key, so treat it like the "Cancel" button.
            scoreEntryCancel();
            return false;
        case 46:    // DEL key (maybe)
            // This could be the Del key, so treat it like the "Clear" button.
            if (charCode == 0) {
                scoreEntryClear();
            }
            return false;
        default:
            break;
    }
    return false;
}

function keypressHandler(e) {
    // Function handler to handle the keystroke events on the score box entry control.
    e = e || event;
    var eventName = e.type;
    var keyCode = e.keyCode;
    var which = e.which;
    var charCode = e.charCode;
    var charPressed = String.fromCharCode(e.keyCode || e.charCode);
    var shiftKeyActive = e.shiftKey;
    var ctrlKeyActive = e.ctrlKey;
    var altKeyActive = e.altKey;
    var metaKeyActive = e.metaKey;
    if (ctrlKeyActive || altKeyActive || metaKeyActive) {
        // None of the controls in the score entry dialog box should use the
        // Ctrl, Alt, or Meta keys.  Don't include the Shift key here because
        // the * and # characters may need it.
        return false;
    }
    switch (keyCode) {
        case 8:     // BACKSPACE key
        case 27:    // ESC (Escape) key
        case 46:    // DEL key (maybe)
            // Ignore them here because they will be processed by the keyup event.
            return false;
        case 10:
        case 13:    // ENTER key
            // This is the enter key, so simulate the "Done" button being pressed.
            scoreEntryDone();
            return false;
        default:
            break;
    }
    switch (charPressed) {
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
            scoreEntryAppend(Number(charPressed));
            return false;
        case '*':
            if ($( "#valuestar" ).is(':visible')) {
                scoreEntryAppend(charPressed);
            }
            return false;
        case '#':
            if ($( "#valuehash" ).is(':visible')) {
                scoreEntryAppend(charPressed);
            }
            return false;
        case '+':
            if ($( "#valueplus" ).is(':visible')) {
                scoreEntryAppend(charPressed);
            }
            return false;
        default:
            break;
    }
    return false;
}

function Data(initData) {
    var data_ = null;
    var str_ = "";

    this.getDataHTML = function() {
        if (!data_ || !data_.number) {
            return '&nbsp;';
        }

        var str = data_.number + '<sup>';
        for (var i in data_) {
            if (i === 'number') {
                continue;
            }
            for (var j = 0; j < data_[i]; ++j) {
                str += i;
            }
        }
        str += '</sup>';
        return str;
    }

    this.getDataObject = function() {
        return $.extend({}, data_);
    }

    this.getDataStr = function() {
        return str_;
    }

    this.add = function(b) {
        return Data.add(this, b);
    };

    function setData(data) {
        if (!data || data === ' ') {
            data_ = null;
            return;
        }

        data_ = {
            number: parseInt(data.split(' ')[0], 10)
        };

        var str = data.split(' ')[1];
        for (var i = 0; i < str.length; ++i) {
            var c = str.charAt(i);
            if (c in data_) {
                ++data_[c];
            }
            else {
                data_[c] = 1;
            }
        }
    }

    function makeValidData(data) {
        data = (data + "").replace(/\s+/g, '');
        var num = data.replace(/[^\d]+/g, '');
        var sym = data.replace(/[\d]+/g, '');
        return num + ' ' + sym;
    }

    if (typeof initData === "object") {
        data_ = $.extend({}, initData);
        if (data_.number) {
            str_ = data_.number + ' ';
            for (var i in data_) {
                if (i === 'number') {
                    continue;
                }
                for (var j = 0; j < data_[i]; ++j) {
                    str_ += i;
                }
            }
        }
        else {
            str_ = "";
        }
    }
    else {
        str_ = makeValidData(initData);
        setData(str_);
    }
}

Data.add = function(a, b) {
    if (!(a instanceof Data)) {
        a = new Data(a);
    }
    if (!(b instanceof Data)) {
        b = new Data(b);
    }

    var data = a.getDataObject();
    var bData = b.getDataObject();

    for (var i in bData) {
        if (i in data) {
            data[i] += bData[i];
        }
        else {
            data[i] = bData[i];
        }
    }

    return new Data(data);
}

function Input(initData, updater) {
    this.$div = $(document.createElement('div'));
    this.$input = $(document.createElement('input'));
    this.$input.hide();
    this.$html = this.$div.add(this.$input);

    if (initData instanceof Input) {
        initData = initData.getData();
    }
    else if (!(initData instanceof Data)) {
        initData = new Data(initData);
    }
    if (!(typeof updater === "function")) {
        updater = new Function(updater);
    }

    var self = this;
    var data_ = null;

    this.getData = function() {
        return data_;
    }

    this.setData = function(newData) {
        if (!(newData instanceof Data)) {
            newData = new Data(newData);
        }

        data_ = newData;
        this.$input.val(data_.getDataStr());
        this.$div.html(data_.getDataHTML());
        updater();
    }

    this.$div.click(function() {
        self.$div.hide();
        self.$input.show();
        self.$input.focus();
    });

    this.$input.blur(function() {
        self.$input.hide();
        self.setData(self.$input.val());
        self.$div.show();
    });

    this.setData(initData);
}

var scorecards = {};

function getScorecard(course) {
    if (!(this instanceof getScorecard)) {
        if (course.id in scorecards) {
            return scorecards[course.id];
        }
        else {
            return new getScorecard(course);
        }
    }

    scorecards[course.id] = this;

    function getNewScorecardId() {
        var d = new Date();
        var yyyy = d.getFullYear();
        var mm = d.getMonth() + 1;      if (mm < 10) { mm = "0" + mm; }
        var dd = d.getDate();           if (dd < 10) { dd = "0" + dd; }
        var HH = d.getHours();          if (HH < 10) { HH = "0" + HH; }
        var MM = d.getMinutes();        if (MM < 10) { MM = "0" + MM; }
        var SS = d.getSeconds();        if (SS < 10) { SS = "0" + SS; }
        var MMM = d.getMilliseconds();
        if (MMM < 10) { MMM = "00" + MMM; }
        else if (MMM < 100) { MMM = "0" + MMM; }
        var randValue = randomIntFromInterval(100000, 999999);
        return yyyy.toString() + mm.toString() + dd.toString()
            + "_" + HH.toString() + MM.toString() + SS.toString() + MMM.toString()
            + "_" + randValue.toString();
    }

    this.id = getNewScorecardId();
    this.outPars = course.outPars;
    this.inPars = course.inPars;
    this.players = [];
    this.players.length = defNumPlayers;
    for (var i = 0; i < this.players.length; ++i) {
        this.players[i] = "";
    }
    this.nHoles = this.outPars.length + (this.inPars || []).length;
    this.scores = [];
    this.scores.length = this.players.length;
    for (var i = 0; i < this.scores.length; ++i) {
        this.scores[i] = [[]];
        this.scores[i][0].length = this.outPars.length;
        for (var j = 0; j < this.scores[i][0].length; ++j) {
            this.scores[i][0][j] = "";
        }
        if (this.inPars) {
            this.scores[i].push([]);
            this.scores[i][1].length = this.inPars.length;
            for (var j = 0; j < this.scores[i][1].length; ++j) {
                this.scores[i][1][j] = "";
            }
        }
    }
    this.notes = "";

    var self = this;

    this.getTable = function() {
        var headerRow = $("<tr></tr>")
            .attr('id', 'header-row')
            .append($("<td></td>").html("Hole #"));
        for (var i = 1; i <= this.outPars.length; ++i) {
            headerRow.append($("<td></td>").html(i + ""));
        }
        headerRow.append($("<td></td>").html("Out"));
        if (this.inPars) {
            for (var i = 1; i <= this.inPars.length; ++i) {
                headerRow.append($("<td></td>").html((i + this.outPars.length) +
                    ""));
            }
            headerRow.append($("<td></td>").html("In"));
        }
        headerRow.append($("<td></td>").html("Total"));

        var parRow = $("<tr></tr>")
            .attr('id', 'par-row')
            .append($("<td></td>").html("Par"));
        var outParTotal = $("<td></td>");
        var inParTotal = $("<td></td>");
        var parTotal = $("<td></td>");

        function addScores(a, b) {
            return Data.add(a instanceof Input ? a.getData() : a,
                            b instanceof Input ? b.getData() : b);
        }

        function outParTotalData() {
            return self.outPars.reduce(addScores);
        }
        function inParTotalData() {
            return self.inPars.reduce(addScores);
        }
        function parTotalData() {
            return self.inPars ? Data.add(outParTotalData(), inParTotalData())
                               : outParTotalData();
        }
        function updateOutParTotal() {
            outParTotal.html(outParTotalData().getDataHTML());
        }
        function updateInParTotal() {
            inParTotal.html(inParTotalData().getDataHTML());
        }
        function updateParTotal() {
            parTotal.html(parTotalData().getDataHTML());
        }

        for (var i = 0; i < this.outPars.length; ++i) {
            this.outPars[i] = new Input(this.outPars[i],
                                        function() {
                                            updateOutParTotal();
                                            updateParTotal();
                                        });
            parRow.append($("<td></td>").append(this.outPars[i].$html));
        }
        parRow.append(outParTotal);

        if (this.inPars) {
            for (var i = 0; i < this.inPars.length; ++i) {
                this.inPars[i] = new Input(this.inPars[i],
                                           function() {
                                               updateInParTotal();
                                               updateParTotal();
                                           });
                parRow.append($("<td></td>").append(this.inPars[i].$html));
            }
            parRow.append(inParTotal);
        }

        parRow.append(parTotal);

        updateOutParTotal();
        updateInParTotal();
        updateParTotal();

        var tbody = $("<tbody></tbody>");

        for (var i = 0; i < this.players.length; ++i) {
            (function(i) {
                var playerRow = $("<tr></tr>").append(
                    $("<td></td>").append(
                        $("<input />")
                            .attr('placeholder', 'Player ' + i)
                            .attr('type', 'text')
                            .addClass('player-name')
                            .val(self.players[i])
                            .blur(function() {
                                self.players[i] = $(this).val();
                            })));
                var outPlayerTotal = $("<td></td>").addClass('sum');
                var inPlayerTotal = $("<td></td>").addClass('sum');
                var playerTotal = $("<td></td>").addClass('sum');

                function outPlayerTotalData() {
                    return self.scores[i][0].reduce(addScores, new Data(""));
                }
                function inPlayerTotalData() {
                    return self.scores[i][1].reduce(addScores, new Data(""));
                }
                function playerTotalData() {
                    return self.inPars ? Data.add(outPlayerTotalData(), inPlayerTotalData())
                                       : outPlayerTotalData();
                }
                function updateOutPlayerTotal() {
                    outPlayerTotal.html(outPlayerTotalData().getDataHTML());
                }
                function updateInPlayerTotal() {
                    inPlayerTotal.html(inPlayerTotalData().getDataHTML());
                }
                function updatePlayerTotal() {
                    playerTotal.html(playerTotalData().getDataHTML());
                }

                for (var j = 0; j < self.outPars.length; ++j) {
                    self.scores[i][0][j] = new Input(self.scores[i][0][j],
                                                     function() {
                                                         updateOutPlayerTotal();
                                                         updatePlayerTotal();
                                                     });
                    playerRow.append($("<td></td>")
                        .addClass('score')
                        .append(self.scores[i][0][j].$html));
                }
                playerRow.append(outPlayerTotal);

                if (self.inPars) {
                    for (var j = 0; j < self.inPars.length; ++j) {
                        self.scores[i][1][j] = new Input(self.scores[i][1][j],
                                                         function() {
                                                             updateInPlayerTotal();
                                                             updatePlayerTotal();
                                                         });
                        playerRow.append($("<td></td>")
                            .addClass('score')
                            .append(self.scores[i][1][j].$html));
                    }
                    playerRow.append(inPlayerTotal);
                }

                playerRow.append(playerTotal);

                updateOutPlayerTotal();
                updateInPlayerTotal();
                updatePlayerTotal();

                tbody.append(playerRow);
            })(i);
        }

        var colspan = this.nHoles + (this.inPars ? 4 : 3);

        return $("<table></table>")
            .attr('id', 'scorecard')
            .append(
                $("<thead></thead>")
                    .append(headerRow)
                    .append(parRow))
            .append(tbody)
            .append($("<tfoot>").append([
                $("<tr></tr>")
                    .attr('id', 'notes_row')
                    .append([
                        $("<td></td>")
                            .attr('id', 'course_notes_label')
                            .append(
                                $("<label></label>")
                                    .attr('for', 'course_notes')
                                    .html('Notes')),
                        $("<td></td>")
                            .attr('id', 'course_notes')
                            .attr('colspan', colspan - 1)
                            .append(
                                $("<textarea></textarea>")
                                    .val(this.notes)
                                    .blur(function() {
                                        self.notes = $(this).val();
                                    })
                                    .attr('rows', '2')
                                    .attr('cols', '72')
                                    .attr('placeholder',
                                        'Enter any memorable thoughts about the course or round'))
                    ]),
                $("<tr></tr>")
                    .attr('id', 'scorecard-row')
                    .append($("<td></td>")
                        .attr('colspan', colspan)
                        .html('Scorecard ID: ')
                        .append(
                            $("<span></span>")
                                .attr('id', 'scorecard-id')
                                .html(this.id + "")))
            ]));
    };
}

function getUserInput(p) {
    return prompt(p, "");
}

function setCourse(course) {
    currentCourse = course;
    $("#scorecard").replaceWith(getScorecard(course).getTable());
    if (course === otherCourse) {
        var name = getUserInput("Please enter the name of this course.");
        if (name === null) {
            return;
        }
        var city = getUserInput("Please enter the city of this course.");
        if (city === null) {
            return;
        }
        var state = getUserInput("Please enter the state of this course.");
        if (state === null) {
            return;
        }
        var newCourse = new Course(name, city, state, course.outPars, course.inPars);
        courses.push(newCourse);
        setCourse(newCourse);
        $("#select_course")
            .prepend(
                $("<option></option>")
                    .prop('selected', true)
                    .attr('id', newCourse.id)
                    .html(newCourse.str));
    }
}

function selectChange() {
    var str = $(this).val();

    for (var i = 0; i < courses.length; ++i) {
        if (courses[i].str === str) {
            setCourse(courses[i]);
            return;
        }
    }
}

function createSelect() {
    var options = [];
    for (var i = 0; i < courses.length; ++i) {
        var option = $("<option></option>")
            .attr('id', courses[i].id)
            .html(courses[i].str);
        if (defCourse === courses[i]) {
            option.prop('selected', true);
        }
        options.push(option);
    }
    $("#select").append(
        $("<label></label>")
            .attr('id', 'select_course_label')
            .attr('for', 'select_course')
            .html('Select Course: '),
        $("<select></select>")
            .attr('id', 'select_course')
            .attr('title', 'Click to select a predefined course')
            .change(selectChange)
            .append(options));
}

function setDate() {
    $("#date").html(fetchDate());
}

$(function() {
    // After the page has been loaded, run these javascript commands to make
    // sure the GUI state is consistent.

    setDate();
    createSelect();
    setCourse(defCourse);

    return;

    // Initialize the array of all cell IDs that can contain scores.
    for (var p = 0; p <= num_players; p++) {
        var pid = "p" + ((p == 0) ? "ar" : String(p));
        for (var h = 1; h <= 18; h++) {
            var hid = pid + "h" + String(h);
            addScoreIDandRow(hid, p);
        }
    }
    updateCourseInfoGui();
    newScorecardID();

    document.getElementById('score_box_entry').onkeypress = keypressHandler;
    document.getElementById('score_box_entry').onkeyup = keyupHandler;
    document.getElementById('score_box_entry').onkeydown = keydownHandler;

    $( "#score_entry_dialog" ).dialog({
        autoOpen: false,
        title: "Score Entry",
        modal: true,
        dialogClass: "no-close",
        resizable: false,
        draggable: false,
        closeOnEscape: true
    });
});

})();
