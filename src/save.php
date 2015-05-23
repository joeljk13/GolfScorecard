<?php

if (!isset($_POST['json'])) {
    die("Error 0");
}

$json = json_decode($_POST['json'], true);
if ($json === NULL) {
    die("Error 1");
}

$json = json_encode($json, JSON_PRETTY_PRINT);
$file = fopen("scores.txt", "w") or die("Error 2");
fwrite($file, "$json\n");
fclose($file);

?>
