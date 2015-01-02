<?php
echo "<!--";

define('NAME', "Golf Scorecard");
define('VERSION', "0.8.11");

// Default settings.
define('DEF_NUM_PLAYERS', 6);

// If True, use a dialog box to enter in the score value.
// If False, just make the score areas as individual text boxes.
define('DEF_USE_ENTRY_DIALOG', True);

function fetchDate() {
    $now = getdate();
    return sprintf("%d/%d/%d", $now['mon'], $now['mday'], $now['year']);
}

class Course {
    function __construct($name, $city, $state, $outPars, $inPars) {
        $this->name = $name;
        $this->city = $city;
        $this->state = $state;
        $this->outPars = $outPars;
        $this->inPars = $inPars;

        $this->id = str_replace(" ", "_", "course_" . $this->name . $this->city
            . $this->state);
        $this->str = $this->name;
        if ($this->city && $this->state) {
            $this->str .= " ($this->city, $this->state)";
        }
    }
}

// The first one will be the default selected one
$courses = array(
    new Course("The General", "Devens", "MA",
        array(3, 3, 3, 3, 4, 3, 3, 3, 3),
        array(3, 4, 3, 3, 3, 3, 3, 3, 3)),
    new Course("The Hill", "Devens", "MA",
        array(3, 3, 3, 3, 3, 3, 3, 3, 3),
        array(3, 3, 3, 3, 3, 3, 3, 3, 3)),
    new Course("Muldoon Park", "Pelham", "NH",
        array(3, 3, 3, 3, 3, 4, 3, 3, 3),
        array(3, 3, 3, 3, 3, 3, 3, 4, 3)),
    new Course("Typical Minigolf Course", "", "",
        array(2, 2, 2, 2, 2, 2, 2, 2, 2),
        array(2, 2, 2, 2, 2, 2, 2, 2, 2)),
    new Course("Other", "", "",
        array(3, 3, 3, 3, 3, 3, 3, 3, 3),
        array(3, 3, 3, 3, 3, 3, 3, 3, 3)));

echo "-->";
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <title><?php echo NAME; ?></title>
    <meta http-equiv="pragma" content="no-cache" />
    <meta http-equiv="Expires" content="Tue, 01 Jan 1980 1:00:00 GMT" />
    <meta name="robots" content="noindex, nofollow, noarchive" />
    <link rel="shortcut icon" href="favicon.ico" type="image/x-icon" />
    <link rel="stylesheet" href="css/jquery/jquery-ui.min.css">
    <link rel="stylesheet" href="css/scorecard.css">
</head>
<body>
    <noscript>You must have Javascript enabled for this to work.</noscript>
    <div id="header">
        <span id="program_name"><?php echo NAME; ?></span>
        <span id="program_version">Version <?php echo VERSION; ?></span>
        <span id="date_label">Date:</span>
        <span id="date"></span>
    </div>
    <form method="post">
        <p>
            <label id="select_course_label" for="select_course">Select Course:</label>
            <select id="select_course" name="select_course"
                title="Click to select a predefined course"
                onchange="javascript:updateCourseInfoGui();">
<?php
foreach ($courses as $course) {
?>
                    <option id="<?php echo $course->id; ?>"><?php echo $course->str; ?></option>
<?php
}
?>
            </select>
            &nbsp; &nbsp; &nbsp;
            <label id="other_course_name_label" for="other_course_name" hidden="hidden">Course
                Information:</label>
            <input type="text" placeholder="Enter course name and location"
                id="other_course_name" name="other_course_name" hidden="hidden" maxlength="128"
                size="48"
                title="Click to enter any name and location information about this course" />
        </p>

        <table class="scorecard">
        <!-- Hole # row -->
            <thead class="scorecard">
                <tr>
                    <td class="scorecard">Hole #</td>
<?php
for ($i = 1; $i <= 9; $i++) { /* Hole - Front 9 */
?>
                    <td class="scorecard"><?php echo $i; ?></td>
<?php
} /* Hole - Front 9 */
?>
                    <td class="scorecard">Out</td>
<?php
for ($i = 10; $i <= 18; $i++) { /* Hole - Back 9 */
?>
                    <td class="scorecard"><?php echo $i; ?></td>
<?php
} /* Hole - Back 9 */
?>
                    <td class="scorecard">In</td>
                    <td class="scorecard">Total</td>
                </tr>
            </thead>

            <!-- Par row -->
            <tr class="par">
                <td class="scorecard">Par</td>
<?php
for ($i = 1; $i <= 9; $i++) { /* Hole - Front 9 */
    $hid = "parh$i";
    if (DEF_USE_ENTRY_DIALOG) {
?>
                <td class="scorecard" id="<?php echo $hid; ?>" name="<?php echo $hid; ?>"
                    title="Click to set the par" onclick="javascript:enterHoleScore('<?php echo
                    $hid; ?>');">3</td>
<?php
    } else {
?>
                <td class="scorecard">
                    <input type="text" class="scorecard" maxlength="8" id="<?php echo $hid; ?>name"
                        placeholder="" size="2" title="Click to set the par" />
                </td>
<?php
    }
} /* Hole - Front 9 */
?>
                <td class="scorecard" id="parout" name="parout">27</td>
<?php
for ($i = 10; $i <= 18; $i++) { /* Hole - Back 9 */
    $hid = "parh$i";
    if (DEF_USE_ENTRY_DIALOG) {
?>
                <td class="scorecard" id="<?php echo $hid; ?>" name="<?php echo $hid; ?>"
                    title="Click to set the par" onclick="javascript:enterHoleScore('<?php echo
                    $hid; ?>');">3</td>
<?php
    } else {
?>
                <td class="scorecard"><input type="text" class="scorecard" maxlength="8" id="<?php
                    echo $hid; ?>name" placeholder="" size="2" title="Click to set the par" /></td>
<?php
    }
} /* Hole - Back 9 */
?>
                <td class="scorecard" id="parin" name="parin">27</td>
                <td class="scorecard" id="partotal" name="partotal">54</td>
            </tr>

            <!-- Player rows -->
<?php
for ($i = 1; $i <= DEF_NUM_PLAYERS; $i++) { /* Player */
    $id = "p$i"
?>
            <tr>
                <td class="playername scorecard" name="<?php echo $id; ?>name">
                    <input type="text" class="playername" maxlength="16" id="<?php echo $id; ?>name"
                        placeholder="Player <?php echo $i; ?>" size="16"
                        title="Click to enter the name for player <?php echo $i; ?>" />
                </td>
<?php
    for ($h = 1; $h <= 9; $h++) { /* Hole - Front 9 */
        $hid = $id . "h$h";
        if (DEF_USE_ENTRY_DIALOG) {
?>
                <td class="number" id="<?php echo $hid; ?>" name="<?php echo $hid; ?>"
                    title="Click to enter the hole <?php echo $h; ?> score for player <?php echo $i;
                    ?>" onclick="javascript:enterHoleScore('<?php echo $hid; ?>');"></td>
<?php
        } else {
?>
                <td class="number">
                    <input type="text" class="number" maxlength="8" id="<?php echo $hid; ?>name"
                        placeholder="" size="2" title="Click to enter the hole <?php echo $h;
                        ?> score for player <?php echo $i; ?>" />
                </td>
<?php
        }
    } /* Hole - Front 9 */
?>
                <td class="sum" id="<?php echo $id; ?>out" name="<?php echo $id; ?>out">0</td>
<?php
    for ($h=10; $h<=18; $h++) { /* Hole - Back 9 */
        $hid = $id . "h$h";
        if (DEF_USE_ENTRY_DIALOG) {
?>
                <td class="number" id="<?php echo $hid; ?>" name="<?php echo $hid; ?>"
                    title="Click to enter the hole <?php echo $h; ?> score for player <?php echo $i;
                    ?>" onclick="javascript:enterHoleScore('<?php echo $hid; ?>');"></td>
<?php
        } else {
?>
                <td class="number">
                    <input type="text" class="number" maxlength="8" id="<?php echo $hid; ?>name"
                        placeholder="" size="2" title="Click to enter the hole <?php echo $h;
                        ?> score for player <?php echo $i; ?>" /></td>
<?php
        }
    } /* Hole - Back 9 */
?>
                <td class="sum" id="<?php echo $id; ?>in" name="<?php echo $id; ?>in">0</td>
                <td class="sum" id="<?php echo $id; ?>total" name="<?php echo $id; ?>total">0</td>
            </tr>
<?php
} /* Player */
?>

            <tr class="notes">
                <td class="scorecard">Notes</td>
                <td colspan="21" class="notes">
                    <textarea id="course_notes" name="course_notes" rows="2" cols="72"
                        placeholder="Enter any memorable thoughts about the course or the round"
                        title="Click to enter any memorable thoughts about the course or the round"
                        maxlength="300"></textarea>
                </td>
            </tr>
        </table>

        <span class="scorecard_id">
            <label for="" id="scorecard_id_label" name="scorecard_id_label">Scorecard ID:</label>
            &nbsp;
            <input class="scorecard_id" type="text" id="scorecard_id" name="scorecard_id" value=""
                size="40" placeholder="???" readonly="readonly" />
            <input type="hidden" id="num_players" name="num_players" value="<?php echo
                DEF_NUM_PLAYERS; ?>" />
        </span>
    </form>

<br/>
<!-- Should ask if for confirmation before clearing and setting a new scorecard ID. -->
<button id="clear_command" name="clear_command" class="command_button"
    title="Clears the scorecard values, notes, and any course information that was entered"
    onclick="javascript:clearScorecard();">Clear</button> &nbsp; &nbsp;
<button id="save_command" name="save_command" class="command_button" title="Not implemented yet"
    disabled="disabled">Save</button> &nbsp; &nbsp;
<button id="load_command" name="load_command" class="command_button" title="Not implemented yet"
    disabled="disabled">Load...</button>

<br/><br/>
<p>
    <b><u>Disc Golf Resources:</u></b>
    <ul>
        <li>
            <a href="http://www.dgcoursereview.com/">DGCourseReview.com</a>
            &ndash; Has lots of information on disc golf courses everywhere.
        </li>
        <li>
            <a href="http://www.inboundsdiscgolf.com/">Inbounds Disc Golf</a>
            &ndash; Has a comparison of the various types of discs.
        </li>
    </ul>
</p>

<?php
if (DEF_USE_ENTRY_DIALOG) {
?>
<div id="score_entry_dialog" title="Score Entry">
    <form method="post" id="gsentry" name="gsentry">
        <table class="score_entry">
            <tr>
                <td class="score_value" colspan="3" id="score_box" name="score_box">
                    <input class="score_entry" type="text" id="score_box_entry"
                        name="score_box_entry" readonly="readonly" size="12"
                        onfocus="javascript:moveCursorToEnd(this);" />
                </td>
                <td class="score_entry_cmd" colspan="3">
                    <button type="button" class="score_entry_cmd" id="valueDone" name="valueDone"
                        onclick="javascript:scoreEntryDone();">Done</button>
                </td>
            </tr>
            <tr>
                <td class="score_entry">
                    <button type="button" class="score_entry" id="value1" name="value1"
                        onclick="javascript:scoreEntryAppend(1);">1</button>
                </td>
                <td class="score_entry">
                    <button type="button" class="score_entry" id="value2" name="value2"
                        onclick="javascript:scoreEntryAppend(2);">2</button>
                </td>
                <td class="score_entry">
                    <button type="button" class="score_entry" id="value3" name="value3"
                        onclick="javascript:scoreEntryAppend(3);">3</button>
                </td>
                <td class="score_entry_cmd" colspan="3">
                    <button type="button" class="score_entry_cmd" id="valueCancel"
                        name="valueCancel" onclick="javascript:scoreEntryCancel();">Cancel</button>
                </td>
            </tr>
            <tr>
                <td class="score_entry">
                    <button type="button" class="score_entry" id="value4" name="value4"
                        onclick="javascript:scoreEntryAppend(4);">4</button>
                </td>
                <td class="score_entry">
                    <button type="button" class="score_entry" id="value5" name="value5"
                        onclick="javascript:scoreEntryAppend(5);">5</button>
                </td>
                <td class="score_entry">
                    <button type="button" class="score_entry" id="value6" name="value6"
                        onclick="javascript:scoreEntryAppend(6);">6</button>
                </td>
                <td class="score_entry_cmd" colspan="3">
                    <button type="button" class="score_entry_cmd" id="valueBackspace"
                        name="valueBackspace"
                        onclick="javascript:scoreEntryBackspace();">Backspace</button>
                </td>
            </tr>
            <tr>
                <td class="score_entry">
                    <button type="button" class="score_entry" id="value7" name="value7"
                        onclick="javascript:scoreEntryAppend(7);">7</button>
                </td>
                <td class="score_entry">
                    <button type="button" class="score_entry" id="value8" name="value8"
                        onclick="javascript:scoreEntryAppend(8);">8</button>
                </td>
                <td class="score_entry">
                    <button type="button" class="score_entry" id="value9" name="value9"
                        onclick="javascript:scoreEntryAppend(9);">9</button>
                </td>
                <td class="score_entry_cmd" colspan="3">
                    <button type="button" class="score_entry_cmd" id="valueClear" name="valueClear"
                        onclick="javascript:scoreEntryClear();">Clear</button>
                </td>
            </tr>
            <tr>
                <td></td>
                <td class="score_entry">
                    <button type="button" class="score_entry" id="value0" name="value0"
                        onclick="javascript:scoreEntryAppend(0);">0</button>
                </td>
                <td></td>
                <td>
                    <button type="button" class="score_entry" id="valuestar" name="valuestar"
                        onclick="javascript:scoreEntryAppend('*');">*</button>
                </td>
                <td>
                    <button type="button" class="score_entry" id="valuehash" name="valuehash"
                        onclick="javascript:scoreEntryAppend('#');">#</button>
                </td>
                <td>
                    <button type="button" class="score_entry" id="valueplus" name="valueplus"
                        onclick="javascript:scoreEntryAppend('+');">+</button>
                </td>
            </tr>
            <tr id="score_instructions_row" name="score_instructions_row">
                <td class="score_entry_instructions" colspan="6" id="score_instructions"
                    name="score_instructions">
                    The *, #, and + symbols can be used to keep track of special cases, such as
                    mulligans, gimmes, clangs, or a minimum approximate score.
                </td>
            </tr>
        </table>
    </form>
</div>
<?php
}
?>

<br/>
<p class="copyright">Copyright &copy; 2014 Jim &amp; Joel Kottas.  All rights reserved.</p>

<script src="js/jquery/jquery-2.1.1.min.js"></script>
<script src="js/jquery/jquery-ui.min.js"></script>
<script>
// Set global settings
var defNumPlayers = <?php echo DEF_NUM_PLAYERS; ?>;
</script>
<script src="js/scorecard.js"></script>
</body>
</html>
