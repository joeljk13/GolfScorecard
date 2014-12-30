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
    <meta charset="utf-8" />
    <title><?php echo NAME; ?></title>
    <meta http-equiv="pragma" content="no-cache" />
    <meta http-equiv="Expires" content="Tue, 01 Jan 1980 1:00:00 GMT" />
    <meta name="robots" content="noindex, nofollow, noarchive" />
    <link rel="shortcut icon" href="favicon.ico" type="image/x-icon" />
    <link rel="stylesheet" href="css/jquery/jquery-ui.min.css">
    <link rel=stylesheet" href="css/scorecard.css" />
</head>
<body onload="javascript:initAll();">
    <form method="post" id="gscard" name="gscard">
    <p>
        <span class="program_name"><?php echo NAME; ?></span>
        <span class="program_version">&ndash; Version <?php echo VERSION; ?></span>
        <?php for ($i=0; $i<40; $i++) { ?> &nbsp; <?php } ?>
        <label for="main_date" id="main_date_label" name="main_date_label">Date:</label>
        <input type="text" id="main_date" name="main_date" readonly="readonly" />
    </p>
    <p>
        <label id="select_course_label" for="select_course">Select Course:</label>
        <select id="select_course" name="select_course" title="Click to select a predefined course"
            onchange="javascript:updateCourseInfoGui();">
                <!-- If any options are added, update the updateParBasedOnCourse() function
                     to include any non-par 3 holes. -->
                <option value="MA_Devens_TheGeneral" selected="selected">
                    Devens - The General</option>
                <option value="MA_Devens_TheHill">MA - Devens - The Hill</option>
                <option value="NH_Pelham_MuldoonPark">NH - Pelham - Muldoon Park</option>
                <option value="typical_minigolf">Typical Minigolf Course</option>
                <option value="course_other">Other</option>
        </select>
        &nbsp; &nbsp; &nbsp;
        <label id="other_course_name_label" for="other_course_name" 
            hidden="hidden">Course Information:</label>
        <input type="text" placeholder="Enter course name and location" 
            id="other_course_name" name="other_course_name" hidden="hidden"  maxlength="128"
            size="48" title="Click to enter any name and location information about this course"/>
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
            <td class="scorecard" id="<?php echo $hid; ?>" name="<?php echo 
                $hid; ?>" title="Click to set the par"
                onclick="javascript:enterHoleScore('<?php echo $hid; ?>');">3</td>
<?php } /* Hole - Front 9 */ ?>
            <td class="scorecard" id="parout" name="parout">27</td>
<?php for ($i=10; $i<=18; $i++) { /* Hole - Back 9 */
    $hid = "parh$i";
?>
            <td class="scorecard" id="<?php echo $hid; ?>" name="<?php echo 
                $hid; ?>" title="Click to set the par"
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
            <td class="playername scorecard" name="<?php echo $id; 
                ?>name"><input type="text" class="playername" maxlength="16" id="<?php echo
                $id; ?>name" placeholder="Player <?php echo $i; ?>" size="16"
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
                <textarea id="course_notes" name="course_notes" rows="2" cols="72" maxlength="300"
                    placeholder="Enter any memorable thoughts about the course or the round"
                    title="Click to enter any memorable thoughts about the course or the round">
                </textarea>
            </td>
        </tr>
    </table>
    <span class="scorecard_id">
        <label for="" id="scorecard_id_label" name="scorecard_id_label">Scorecard ID:</label> &nbsp;
        <input class="scorecard_id" type="text" id="scorecard_id" 
            name="scorecard_id" value="" size="40" placeholder="???" />
        <input type="hidden" id="num_players" name="num_players" value="<?php 
            echo NUM_PLAYERS; ?>" />
    </span>
    </form>
<br/>
<!-- Should ask if for confirmation before clearing and setting a new scorecard ID. -->
<button id="clear_command" name="clear_command" class="command_button" 
    title="Clears the scorecard values, notes, and any course information that was entered"
    onclick="javascript:clearScorecard();">Clear</button> &nbsp; &nbsp;
<button id="save_command" name="save_command" class="command_button"
    title="Not implemented yet" disabled="disabled">Save</button> &nbsp; &nbsp;
<button id="load_command" name="load_command" class="command_button"
    title="Not implemented yet" disabled="disabled">Load...</button>
<br/><br/>
<p>
    <b><u>Disc Golf Resources:</u></b>
    <ul>
        <li>
            <a href="http://www.dgcoursereview.com/" tar>DGCourseReview.com</a>
            &ndash; Has lots of information on disc golf courses everywhere.
        </li>
    </ul>
</p>

<div id="score_entry_dialog" title="Score Entry">
    <form method="post" id="gsentry" name="gsentry">
    <table class="score_entry">
        <tr>
            <td class="score_value" colspan="3" id="score_box" name="score_box">
                <input class="score_entry" type="text" id="score_box_entry" 
                    name="score_box_entry" readonly="readonly" size="12"
                    onfocus="javascript:moveCursorToEnd(this);"/>
            </td>
            <td>&nbsp;</td>
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
            <td class="score_entry_cmd">
                <button type="button" class="score_entry_cmd" id="valueBackspace"
                    name="valueBackspace" onclick="javascript:scoreEntryBackspace();">
                        Backspace
                </button>
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
            <td class="score_entry_cmd">
                <button type="button" class="score_entry_cmd" id="valueClear"
                    name="valueClear" onclick="javascript:scoreEntryClear();">
                        Clear
                </button>
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
            <td class="score_entry_cmd">
                <button type="button" class="score_entry_cmd" id="valueCancel"
                    name="valueCancel" onclick="javascript:scoreEntryCancel();">
                        Cancel
                </button>
            </td>
        </tr>
        <tr>
            <td class="score_entry">
                <button type="button" class="score_entry" id="valuestar" name="valuestar"
                    onclick="javascript:scoreEntryAppend('*');">*</button>
            </td>
            <td class="score_entry">
                <button type="button" class="score_entry" id="value0" name="value0"
                    onclick="javascript:scoreEntryAppend(0);">0</button>
            </td>
            <td class="score_entry">
                <button type="button" class="score_entry" id="valuehash" name="valuehash"
                    onclick="javascript:scoreEntryAppend('#');">#</button>
            </td>
            <td class="score_entry_cmd">
                <button type="button" class="score_entry_cmd" id="valueDone"
                    name="valueDone" onclick="javascript:scoreEntryDone();">
                        Done
                </button>
            </td>
        </tr>
        <tr id="score_instructions_row" name="score_instructions_row">
            <td class="score_entry_instructions" colspan="4" 
                id="score_instructions" name="score_instructions">
                The * and # symbols can be used to keep track of special cases, 
                such as mulligans, gimmes, or clangs.
            </td>
        </tr>
    </table>
    </form>
</div>
<br/>
<p class="copyright">Copyright &copy; 2014 Jim Kottas.  All rights reserved.</p>
<script src="js/jquery/jquery-2.1.1.min.js"></script>
<script src="js/jquery/jquery-ui.min.js"></script>
<script src="js/scorecard.js"></script>
</body>
</html>
