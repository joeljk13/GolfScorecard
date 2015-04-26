<?php
define('NAME', "Golf Scorecard");
define('VERSION', "0.8.11");

// Default settings.
define('DEF_NUM_PLAYERS', 6);

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
    <link rel="stylesheet" href="css/scorecard.css">
</head>
<body>
    <div>
        <span id="program_name"><?php echo NAME; ?></span>
        <span id="program_version">Version <?php echo VERSION; ?></span>
        <span id="date_span">
            Date:
            <span id="date"></span>
        </span>
    </div>
    <form method="post">
        <div id="select"></div>
        <span id="scorecard"></span>
    </form>

<div id="resources-label">Disc Golf Resources:</div>
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

<p id="copyright">Copyright &copy; 2014 &ndash; 2015 Jim &amp; Joel Kottas.  All rights reserved.</p>

<script src="js/jquery/jquery-2.1.1.min.js"></script>
<script>
// Set global constants
var defNumPlayers = <?php echo DEF_NUM_PLAYERS; ?>;
</script>
<script src="js/scorecard.js"></script>
<script>
// Define pre-defined courses; the default one will be set once the DOM has 
// loaded.
var courses = [
    new Course("The General", "Devens", "MA",
        [3, 3, 3, 3, 4, 3, 3, 3, 3],
        [3, 4, 3, 3, 3, 3, 3, 3, 3]),
    new Course("The Hill", "Devens", "MA",
        [3, 3, 3, 3, 3, 3, 3, 3, 3],
        [3, 3, 3, 3, 3, 3, 3, 3, 3]),
    new Course("Coggshall Park", "Fitchburg", "MA",
        [3, 3, 3, 3, 3, 3, 4, 3, 3],
        [3, 3, 3, 3, 3, 3, 3, 4, 3]),
    new Course("Muldoon Park", "Pelham", "NH",
        [3, 3, 3, 3, 3, 4, 3, 3, 3],
        [3, 3, 3, 3, 3, 3, 3, 4, 3]),
    new Course("Typical Minigolf Course", "", "",
        [2, 2, 2, 2, 2, 2, 2, 2, 2],
        [2, 2, 2, 2, 2, 2, 2, 2, 2]),
    new Course("Other", "", "",
        [3, 3, 3, 3, 3, 3, 3, 3, 3],
        [3, 3, 3, 3, 3, 3, 3, 3, 3])
], defCourse = courses[0], otherCourse = courses[courses.length - 1], currentCourse = defCourse;
</script>
<noscript>You must have Javascript enabled for this to work.</noscript>
</body>
</html>
