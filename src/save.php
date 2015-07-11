<?php

function is_valid_scorecard_id($id) {
    if ($id === "" || preg_match('/\W/', $id) === 1) {
        return false;
    }
    return true;
}

function error($code) {
    if ($code === 400) {
        header('HTTP/1.1 400 Bad Request');
    } else {
        header('HTTP/1.1 500 Internal Server Error');
    }
    exit();
}

if (!isset($_POST['json'])) {
    error(400);
}

$json = json_decode($_POST['json'], true);
if ($json === NULL) {
    error(400);
}

$id = $json['id'];
if (!is_valid_scorecard_id($id)) {
    error(400);
}

$json = json_encode($json, JSON_PRETTY_PRINT);

$file = fopen("scores/$id", "w") or error(500);
$write = fwrite($file, "$json\n");
fclose($file);

if (!$write) {
    error(500);
}
