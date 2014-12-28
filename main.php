<?php
define('NAME', "Golf Scorecard");
define('VERSION', "0.8.3");
define('NUM_PLAYERS', 6);

function fetchDate() {
    $now = getdate();
    return sprintf("%d/%d/%d", $now['mon'], $now['mday'], $now['year']);
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8"/>
    <title><?php echo NAME; ?></title>
    <meta http-equiv="pragma" content="no-cache" />
    <meta http-equiv="Expires" content="Tue, 01 Jan 1980 1:00:00 GMT" />
    <meta name="robots" content="noindex, nofollow, noarchive" />
    <link rel="shortcut icon" href="favicon.ico" type="image/x-icon" />
    <link rel="stylesheet" href="jquery-ui.min.css">
    <script src="jquery-2.1.1.min.js"></script>
    <script src="jquery-ui.min.js"></script>
</head>
<body onload="javascript:initAll();">
    <script type="text/javascript"><!--
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
            var re = /[*# ]+/g;     // Regex to remove stars, hashes, and whitespace from the cell value.
            for (var i = 1; i < arguments.length; i++) {
                var cellText = $( "#" + arguments[i] ).text();
                numStars += countCharInString(cellText, '*');
                numHashes += countCharInString(cellText, '#');
                var value = cellText.replace(re, '');
                sum += Number(value);
            }
            var newText = sum.toString() + Array(numStars + 1).join("*") + Array(numHashes + 1).join("#");
            $( "#" + idOutput ).text(newText);
            return true;
        }

        function getNumPlayers() {
            // Returns the total number of players in the main display, including ones that
            // have no data for them.
            var numPlayers = <?php echo NUM_PLAYERS; ?>;
            var internalNumPlayers = Number($( "#num_players" ).val());
            if (internalNumPlayers > numPlayers) {
                // Allows for future growth when the number of players can be dynamically increased.
                numPlayers = internalNumPlayers;
            }
            return numPlayers;
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
            var newID = yyyy + mm + dd + "_" + HH + MM + SS + MMM + "_" + randValue;
            $( "#scorecard_id" ).val(newID);
            $( "#main_date" ).val(fetchDate());
            return true;
        }

        function fetchDate() {
            var d = new Date();
            return (1 + d.getMonth()) + "/" + d.getDate() + "/" + d.getFullYear();
        }

        function initAll() {
            // After the page has been loaded, run these javascript commands to make
            // sure the GUI state is consistent.
            // First initialize the array of all cell IDs that can contain scores.
            for (var p = 0; p <= <?php echo NUM_PLAYERS; ?>; p++) {
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
            $( "#score_entry_dialog" ).data( "target_id", holeID ); // Save the control ID to set the final value.
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
                $( "#score_instructions_row" ).hide();
            } else {
                // Otherwise, it is a player row, so enable them.
                $( "#valuestar" ).show();
                $( "#valuehash" ).show();
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
    --></script>
    <style type="text/css">
        table.scorecard {
            border: 2px solid black;
        }
        thead.scorecard {
            font-weight: bold;
            text-align: center;
            background-color: black;
            color: white;
        }
        tr.par {
            font-weight: bold;
            text-align: center;
            background-color: #FFCC66;
        }
        tr.notes {
            font-weight: bold;
            text-align: center;
            background-color: #CCFFFF;
        }
        td.notes {
            font-weight: normal;
            text-align: left;
            background-color: #CCFFFF;
        }
        td.playername {
            text-align: left;
            padding-left: 4px;
            padding-right: 4px;
        }
        input.playername {
            border: none;
        }
        td.scorecard {
            border: 1px solid black;
            padding: 2px;
        }
        td.number {
            text-align: center;
            min-width: 20px;
            border: 1px solid gray;
        }
        td.sum {
            text-align: center;
            font-weight: bold;
            min-width: 40px;
            border: 1px solid gray;
            background-color: rgb(216,216,216); 
        }
        button.command_button {
            width: 100px;
        }
        textarea {
            border: 1px solid black;
            resize: none;
        }
        .scorecard_id {
            border: none;
            font-size: small;
            font-style: normal;
        }
        p.copyright {
            font-size: smaller;
        }
        span.program_name {
            font-size: x-large;
            font-weight: bold;
        }
        span.program_version {
            font-size: smaller;
            font-weight: normal;
            font-style: italic;
        }
        #main_date {
            border: none;
        }
    </style>
    <form method="post" id="gscard" name="gscard">
    <p><span class="program_name"><?php echo NAME; ?></span><span class="program_version"> &ndash; Version <?php echo VERSION; ?></span>
        <?php for ($i=0; $i<40; $i++) { ?> &nbsp; <?php } ?>
        <label for="main_date" id="main_date_label" name="main_date_label">Date:</label>
        <input type="text" id="main_date" name="main_date" readonly="readonly"/>
    </p>
    <p><label id="select_course_label" for="select_course">Select Course:</label>
        <select id="select_course" name="select_course" title="Click to select a predefined course"
        onchange="javascript:updateCourseInfoGui();">
                <!-- If any options are added, update the updateParBasedOnCourse() function
                     to include any non-par 3 holes. -->
                <option value="MA_Devens_TheGeneral" selected="selected" >MA - Devens - The General</option>
                <option value="MA_Devens_TheHill">MA - Devens - The Hill</option>
                <option value="NH_Pelham_MuldoonPark">NH - Pelham - Muldoon Park</option>
                <option value="typical_minigolf">Typical Minigolf Course</option>
                <option value="course_other">Other</option>
        </select>
        &nbsp; &nbsp; &nbsp;
        <label id="other_course_name_label" for="other_course_name" hidden="hidden">Course Information:</label> 
        <input type="text" placeholder="Enter course name and location" id="other_course_name" name="other_course_name"
               hidden="hidden" maxlength="128" size="48" title="Click to enter any name and location information about this course"/>
    </p>
    <table class="scorecard">
        <!-- Hole # row -->
        <thead class="scorecard">
            <tr>
                <td class="scorecard">Hole #</td>
<?php for ($i=1; $i<=9; $i++) { /* Hole - Front 9 */ ?>
                <td class="scorecard"><?php echo $i; ?></td>
<?php } /* Hole - Front 9 */ ?>
                <td class="scorecard">Out</td>
<?php for ($i=10; $i<=18; $i++) { /* Hole - Back 9 */ ?>
                <td class="scorecard"><?php echo $i; ?></td>
<?php } /* Hole - Back 9 */ ?>
                <td class="scorecard">In</td>
                <td class="scorecard">Total</td>
            </tr>
        </thead>

        <!-- Par row -->
        <tr class="par">
            <td class="scorecard">Par</td>
<?php for ($i=1; $i<=9; $i++) { /* Hole - Front 9 */
    $hid = "parh$i";
?>
            <td class="scorecard" id="<?php echo $hid; ?>" name="<?php echo $hid; ?>" title="Click to set the par"
            onclick="javascript:enterHoleScore('<?php echo $hid; ?>');">3</td>
<?php } /* Hole - Front 9 */ ?>
            <td class="scorecard" id="parout" name="parout">27</td>
<?php for ($i=10; $i<=18; $i++) { /* Hole - Back 9 */
    $hid = "parh$i";
?>
            <td class="scorecard" id="<?php echo $hid; ?>" name="<?php echo $hid; ?>" title="Click to set the par"
            onclick="javascript:enterHoleScore('<?php echo $hid; ?>');">3</td>
<?php } /* Hole - Back 9 */ ?>
            <td class="scorecard" id="parin" name="parin">27</td>
            <td class="scorecard" id="partotal" name="partotal">54</td>
        </tr>

        <!-- Player rows -->
<?php for ($i=1; $i<=NUM_PLAYERS; $i++) { /* Player */
    $id = "p$i"
?>
        <tr>
            <td class="playername scorecard" name="<?php echo $id; ?>name"><input type="text" class="playername" maxlength="16" id="<?php echo $id; ?>name" placeholder="Player <?php echo $i; ?>" size="16"
            title="Click to enter the name for player <?php echo $i; ?>"/></td>
<?php for ($h=1; $h<=9; $h++) { /* Hole - Front 9 */
    $hid = $id . "h$h";
?>
            <td class="number" id="<?php echo $hid; ?>" name="<?php echo $hid; ?>"
            title="Click to enter the hole <?php echo $h; ?> score for player <?php echo $i; ?>"
            onclick="javascript:enterHoleScore('<?php echo $hid; ?>');"></td>
<?php } /* Hole - Front 9 */ ?>
            <td class="sum"    id="<?php echo $id; ?>out" name="<?php echo $id; ?>out">0</td>
<?php for ($h=10; $h<=18; $h++) { /* Hole - Back 9 */
    $hid = $id . "h$h";
?>
            <td class="number" id="<?php echo $hid; ?>" name="<?php echo $hid; ?>"
            title="Click to enter the hole <?php echo $h; ?> score for player <?php echo $i; ?>"
            onclick="javascript:enterHoleScore('<?php echo $hid; ?>');"></td>
<?php } /* Hole - Back 9 */ ?>
            <td class="sum" id="<?php echo $id; ?>in" name="<?php echo $id; ?>in">0</td>
            <td class="sum" id="<?php echo $id; ?>total" name="<?php echo $id; ?>total">0</td>
        </tr>
<?php } /* Player */ ?>
        <tr class="notes">
            <td class="scorecard">Notes</td>
            <td colspan="21" class="notes">
                <textarea id="course_notes" name="course_notes"
                          rows="2" cols="72" maxlength="300"
                          placeholder="Enter any memorable thoughts about the course or the round"
                          title="Click to enter any memorable thoughts about the course or the round"></textarea>
            </td>
        </tr>
    </table>
    <span class="scorecard_id">
        <label for="" id="scorecard_id_label" name="scorecard_id_label">Scorecard ID:</label> &nbsp;
        <input class="scorecard_id" type="text" id="scorecard_id" name="scorecard_id" value="" size="40" placeholder="???"/>
        <input type="hidden" id="num_players" name="num_players" value="<?php echo NUM_PLAYERS; ?>"/>
    </span>
    </form>

<br/>
<!-- Should ask if for confirmation before clearing and setting a new scorecard ID. -->
<button id="clear_command" name="clear_command" class="command_button" title="Clears the scorecard values, notes, and any course information that was entered"
        onclick="javascript:clearScorecard();">Clear</button> &nbsp; &nbsp;
<button id="save_command" name="save_command" class="command_button" title="Not implemented yet" disabled="disabled">Save</button> &nbsp; &nbsp;
<button id="load_command" name="load_command" class="command_button" title="Not implemented yet" disabled="disabled">Load...</button>

<br/><br/>
<p><b><u>Disc Golf Resources:</u></b>
<ul>
    <li><a href="http://www.dgcoursereview.com/" tar>DGCourseReview.com</a> &ndash; Has lots of information on disc golf courses everywhere.</li>
</ul></p>

<div id="score_entry_dialog" title="Score Entry">
    <style type="text/css">
        table.score_entry {
        }
        td.score_entry {
            border: none;
            text-align: center;
            background-color: white;
            color: black;
        }
        input.score_entry {
            border: none;
            text-align: center;
            background-color: white;
            color: black;
        }
        td.score_entry_cmd {
            border: none;
            text-align: center;
        }
        td.score_value {
            border: 1px solid black;
            text-align: center;
            width: 100%;
        }
        td.score_entry_instructions {
            border: none;
            font-size: small;
            font-style: italic;
        }
        button.score_entry {
            width: 100%
        }
        button.score_entry_cmd {
            width: 120px;
        }
        .no-close .ui-dialog-titlebar {
            display: none;
        }
    </style>
    <form method="post" id="gsentry" name="gsentry">
    <table class="score_entry">
        <tr>
            <td class="score_value" colspan="3" id="score_box" name="score_box">
                <input class="score_entry" type="text" id="score_box_entry" name="score_box_entry" readonly="readonly" size="12"
                       onfocus="javascript:moveCursorToEnd(this);"/>
            </td>
            <td>&nbsp;</td>
        </tr>
        <tr>
            <td class="score_entry"><button type="button" class="score_entry" id="value1" name="value1" onclick="javascript:scoreEntryAppend(1);">1</button></td>
            <td class="score_entry"><button type="button" class="score_entry" id="value2" name="value2" onclick="javascript:scoreEntryAppend(2);">2</button></td>
            <td class="score_entry"><button type="button" class="score_entry" id="value3" name="value3" onclick="javascript:scoreEntryAppend(3);">3</button></td>
            <td class="score_entry_cmd"><button type="button" class="score_entry_cmd" id="valueBackspace" name="valueBackspace"
                                                onclick="javascript:scoreEntryBackspace();">Backspace</button></td>
        </tr>
        <tr>
            <td class="score_entry"><button type="button" class="score_entry" id="value4" name="value4" onclick="javascript:scoreEntryAppend(4);">4</button></td>
            <td class="score_entry"><button type="button" class="score_entry" id="value5" name="value5" onclick="javascript:scoreEntryAppend(5);">5</button></td>
            <td class="score_entry"><button type="button" class="score_entry" id="value6" name="value6" onclick="javascript:scoreEntryAppend(6);">6</button></td>
            <td class="score_entry_cmd"><button type="button" class="score_entry_cmd" id="valueClear" name="valueClear"
                                                onclick="javascript:scoreEntryClear();">Clear</button></td>
        </tr>
        <tr>
            <td class="score_entry"><button type="button" class="score_entry" id="value7" name="value7" onclick="javascript:scoreEntryAppend(7);">7</button></td>
            <td class="score_entry"><button type="button" class="score_entry" id="value8" name="value8" onclick="javascript:scoreEntryAppend(8);">8</button></td>
            <td class="score_entry"><button type="button" class="score_entry" id="value9" name="value9" onclick="javascript:scoreEntryAppend(9);">9</button></td>
            <td class="score_entry_cmd"><button type="button" class="score_entry_cmd" id="valueCancel" name="valueCancel"
                                                onclick="javascript:scoreEntryCancel();">Cancel</button></td>
        </tr>
        <tr>
            <td class="score_entry"><button type="button" class="score_entry" id="valuestar" name="valuestar" onclick="javascript:scoreEntryAppend('*');">*</button></td>
            <td class="score_entry"><button type="button" class="score_entry" id="value0" name="value0" onclick="javascript:scoreEntryAppend(0);">0</button></td>
            <td class="score_entry"><button type="button" class="score_entry" id="valuehash" name="valuehash" onclick="javascript:scoreEntryAppend('#');">#</button></td>
            <td class="score_entry_cmd"><button type="button" class="score_entry_cmd" id="valueDone" name="valueDone"
                                                onclick="javascript:scoreEntryDone();">Done</button></td>
        </tr>
        <tr id="score_instructions_row" name="score_instructions_row">
            <td class="score_entry_instructions" colspan="4" id="score_instructions" name="score_instructions">
                The * and # symbols can be used to keep track of special cases, such as mulligans, gimmes, or clangs.
            </td>
        </tr>
    </table>
    </form>
</div>
<script><!--
document.getElementById('score_box_entry').onkeypress = keypressHandler;
document.getElementById('score_box_entry').onkeyup = keyupHandler;
document.getElementById('score_box_entry').onkeydown = keydownHandler;

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
        default:
            break;
    }
    return false;
}

$( "#score_entry_dialog" ).dialog({
    autoOpen: false,
    title: "Score Entry",
    modal: true,
    dialogClass: "no-close",
    resizable: false,
    draggable: false,
    closeOnEscape: true
});
--></script>

<br/>
<p class="copyright">Copyright &copy; 2014 Jim Kottas.  All rights reserved.</p>
</body>
</html>
