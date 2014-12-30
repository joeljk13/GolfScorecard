/*!
 * scorecard.js
 * JavaScript library for the GolfScorecard web site.
 * Uses jQuery.
 *
 * Copyright (c) 2014 Jim & Joel Kottas.  All rights reserved.
 * Date: 2014-12-28
 */

// Declare a global variable that will hold the array of cell IDs for scores and their corresponding
// row numbers.  The par row is number 0, player 1 row is 1, etc.
var scoreIDrows = [];

// The default number of players to expect.  This value could grow dynamically in the future.
var defNumPlayers = 0;


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

function initAll(num_players) {
    // After the page has been loaded, run these javascript commands to make
    // sure the GUI state is consistent.

    // Save the number of players as the default number of players to expect.
    defNumPlayers = num_players;

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
    return true;
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


// The JavaScript functions below are for the jQuery UI for entering in a score value via the dialog box.
//
// Note:  The keyboard event handlers below return false when the default handler should not be called.
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
