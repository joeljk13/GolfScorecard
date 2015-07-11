/*
 * scorecard.js
 * JavaScript for the GolfScorecard web site.
 * Uses jQuery.
 *
 * Copyright (c) 2014-2015 Jim & Joel Kottas.  All rights reserved.
 */

// Using an anonymous function to avoid polluting the global scope.
(function() {
// "use strict" tells the browser to generate more errors than normal. This
// only applies to this function.
"use strict";

var data = {
    courses: [],
    scorecard: {
        players: [],
        scores: {},
        notes: ""
    }
};

var EMPTY_SCORE = {};

/*
 * Example JSON data:
 * {
 *     "courses": [
 *         ...
 *     ],
 *     "scorecard": {
 *         "course": {
 *             "name": "The Hill",
 *             "city": "Devens",
 *             "state": "MA",
 *             "pars": {
 *                 "out": [3, 3, 3, ...],
 *                 "in": [3, 3, 3, ...]
 *             }
 *         },
 *         "players": [
 *             "Dave",
 *             "Jack",
 *             ...
 *         ],
 *         "scores": {
 *             "Dave": {
 *                 "out": [
 *                     {
 *                         "number": 3
 *                     },
 *                     ...
 *                 ],
 *                 "in": [
 *                     {
 *                         "number": 3
 *                     },
 *                     ...
 *                 ]
 *             },
 *             "Jack" : {
 *                 "out": [
 *                     {
 *                         "number": 3
 *                     },
 *                     ...
 *                 ],
 *                 "in": [
 *                     {
 *                         "number": 3
 *                     },
 *                     ...
 *                 ]
 *             },
 *             ...
 *         },
 *         "notes": "Great day, lots of sun!",
 *     }
 * }
 */

/* Trims whitespace from the left side of a string. */
function triml(str) {
    return str.replace(/^\s+/, '');
}

/* Trims whitespace from the right side of a string. */
function trimr(str) {
    return str.replace(/\s+$/, '');
}

/* Replaces any occurrences of multiple whitespace characters in a row with a
 * single space. */
function trimm(str) {
    return str.replace(/\s+/g, ' ');
}

/* Does all of trimm, triml, trimr. */
function trim(str) {
    return trimm(triml(trimr(str)));
}

function sum(arr) {
    var total = 0,
        i     = 0,
        len   = arr.length;

    while (i < len) {
        total += +arr[i++];
    }

    return total;
}

function courseId(course) {
    return "course_" + trim(course.name + " " + course.city + " " +
                            course.state).replace(/\s/g, '_');
}

function courseStr(course) {
    var str = course.name;
    if (course.city && course.state) {
        str += " (" + course.city + ", " + course.state + ")";
    } else if (course.city) {
        str += " (" + course.city + ")";
    } else if (course.state) {
        str += " (" + course.state + ")";
    }
    return str;
}

function scoreHTML(score) {
    var number = "",
        sym    = "";

    if (score.number || score.number === 0) {
        number += score.number;
    }

    for (var i in score) {
        if (i === 'number') {
            continue;
        }
        for (var j = 0; j < score[i]; ++j) {
            sym += i;
        }
    }

    if (number === "" && sym === "") {
        return "&nbsp;"
    }
    return number + '<sup>' + sym + '</sup>';
}

function scoreStr(score) {
    var str = "";
    if (score.number || score.number === 0) {
        str += score.number;
    }
    for (var i in score) {
        if (i === 'number') {
            continue;
        }
        for (var j = 0; j < score[i]; ++j) {
            str += i;
        }
    }
    return str;
}

function getScoreFromInput(input) {
    var score = {};

    if (/\d/.test(input)) {
        var digits;
        score.number = 0;
        while (digits = /\d+/.exec(input)) {
            digits = digits[0];
            score.number += parseInt(digits, 10);
            input = input.replace(digits, '');
        }
    }

    input = input.replace(/\s/g, '');

    for (var i = 0; i < input.length; ++i) {
        var c = input.charAt(i);
        if (c in score) {
            ++score[c];
        } else {
            score[c] = 1;
        }
    }

    return score;
}

function addScores(a, b) {
    var score = {};
    for (var c in a) {
        if (c in score) {
            score[c] += a[c];
        } else {
            score[c] = a[c];
        }
    }
    for (var c in b) {
        if (c in score) {
            score[c] += b[c];
        } else {
            score[c] = b[c];
        }
    }
    score.number = (a.number || 0) + (b.number || 0);
    return score;
}

function outLabelsHTML(scorecard) {
    var i = 1;
    return scorecard.course.pars.out.reduce(function(a, b) {
        return a.add($("<td></td>").html(i++ + ""));
    }, $()).add($("<td></td>").html("Out"));
}

function inLabelsHTML(scorecard) {
    var i = scorecard.course.pars.out.length + 1;
    return scorecard.course.pars.in.reduce(function(a, b) {
        return a.add($("<td></td>").html(i++ + ""));
    }, $()).add($("<td></td>").html("In"));
}

function labelsHTML(scorecard) {
    var $html = $("<td></td>").html("Hole #");
    $html = $html.add(outLabelsHTML(scorecard));
    if ("in" in scorecard.course.pars) {
        $html = $html.add(inLabelsHTML(scorecard));
    }
    return $html.add($("<td></td>").html("Total"));
}

function generalInput(initData, updater) {
    var initData = updater(initData);
    var $div = $("<div></div>")
        .html(initData.html);
    var $input = $("<input />")
        .attr('type', 'text')
        .val(initData.val)
        .hide();

    $div.click(function() {
        $div.hide();
        $input.show();
        $input.focus();
    });

    function setData() {
        var newData = updater($input.val());
        if (newData === null) {
            return;
        }
        $input.val(newData.val);
        $div.html(newData.html);
    }

    $input.blur(function() {
        // Since $input blurs before the click event of a $div fires, hiding
        // this input can mess up clicks on score td's that have been moved by
        // this input. 100 ms should be short enough that it's practically
        // immediately, but long enough to get a click to register.
        setData();
        setTimeout(function() {
            $input.hide();
            $div.show();
        }, 100);
    });

    $input.keypress(function(e) {
        e = e || window.target;
        if (e.keyCode === 13) {
            $input.blur();
        }
    });

    return $div.add($input);
}

function parInput(par, updater) {
    return generalInput(par + "", function(data) {
        data = data.replace(/\D/g, '');
        if (!data) {
            return null;
        }
        var i = parseInt(data, 10);
        updater(i);
        return {
            val: i + "",
            html: i + ""
        };
    });
}

function outParsHTML(scorecard, updater) {
    var outPars = scorecard.course.pars.out,
        total   = $("<td></td>").addClass('par-sum');

    function outUpdater() {
        total.html(sum(outPars) + "");
        updater();
    }

    function getUpdater(p) {
        return function(i) {
            outPars[p] = i;
            outUpdater();
        }
    }

    var $pars = $();
    for (var p = 0; p < outPars.length; ++p) {
        var td = $("<td></td>")
            .addClass('par')
            .append(parInput(outPars[p], getUpdater(p)));
        $pars = $pars.add(td);
    }
    return $pars.add(total);
}

function inParsHTML(scorecard, updater) {
    var inPars = scorecard.course.pars.in,
        total  = $("<td></td>").addClass('par-sum');

    function inUpdater() {
        total.html(sum(inPars) + "");
        updater();
    }

    function getUpdater(p) {
        return function(i) {
            inPars[p] = i;
            inUpdater();
        }
    }

    var $pars = $();
    for (var p = 0; p < inPars.length; ++p) {
        var td = $("<td></td>")
            .addClass('par')
            .append(parInput(inPars[p], getUpdater(p)));
        $pars = $pars.add(td);
    }
    return $pars.add(total);
}

function parsHTML(scorecard) {
    var pars  = scorecard.course.pars,
        $pars = $("<td></td>").html("Par"),
        total = $("<td></td>").addClass('par-sum');

    if ("in" in pars) {
        var updater = function() {
            total.html(sum(pars.out) + sum(pars.in) + "");
        }
    } else {
        var updater = function() {
            total.html(sum(pars.out));
        }
    }

    $pars = $pars.add(outParsHTML(scorecard, updater));
    if ("in" in pars) {
        $pars = $pars.add(inParsHTML(scorecard, updater));
    }
    return $pars.add(total);
}

function playerPlaceholder(playerNumber) {
    return 'Player ' + playerNumber;
}

function playerStr(scorecard, playerNumber) {
    return scorecard.players[playerNumber - 1]
        || playerPlaceholder(playerNumber);
}

function playerNameHTML(scorecard, playerNumber) {
    var placeholder = playerPlaceholder(playerNumber);

    function update() {
        var prevName = playerStr(scorecard, playerNumber),
            newName  = $input.val() || placeholder;

        if (prevName === newName) {
            return;
        }

        scorecard.players[playerNumber - 1] = newName;
        scorecard.scores[newName] = scorecard.scores[prevName];
        delete scorecard.scores[prevName];
    }

    var $input = $("<input />")
        .val(scorecard.players[playerNumber - 1] || "")
        .addClass('player-name-input')
        .attr('placeholder', placeholder)
        .attr('type', 'text')
        .blur(update)
        .keypress(function(e) {
            e = e || window.target;
            if (e.keyCode === 13) {
                $(this).blur();
            }
        });

    update();
    return $input;
}

function scoreInput(score, updater) {
    return generalInput(scoreStr(score), function(data) {
        var s = getScoreFromInput(data);
        updater(s);
        return {
            val: scoreStr(s),
            html: scoreHTML(s)
        };
    });
}

function outScoresHTML(scorecard, playerNumber, updater) {
    var player    = playerStr(scorecard, playerNumber),
        outScores = scorecard.scores[player].out,
        total     = $("<td></td>").addClass('score-sum');

    function outUpdater() {
        var s = outScores.reduce(addScores, EMPTY_SCORE);
        total.html(scoreHTML(s));
        updater();
    }

    function getUpdater(s) {
        return function(i) {
            outScores[s] = i;
            outUpdater();
        }
    }

    var $scores = $();
    for (var s = 0; s < outScores.length; ++s) {
        var td = $("<td></td>")
            .addClass('score')
            .append(scoreInput(outScores[s], getUpdater(s)));
        $scores = $scores.add(td);
    }
    return $scores.add(total);
}

function inScoresHTML(scorecard, playerNumber, updater) {
    var player   = playerStr(scorecard, playerNumber),
        inScores = scorecard.scores[player].in,
        total    = $("<td></td>").addClass('score-sum');

    function inUpdater() {
        var s = inScores.reduce(addScores, EMPTY_SCORE);
        total.html(scoreHTML(s));
        updater();
    }

    function getUpdater(s) {
        return function(i) {
            inScores[s] = i;
            inUpdater();
        }
    }

    var $scores = $();
    for (var s = 0; s < inScores.length; ++s) {
        var td = $("<td></td>")
            .addClass('score')
            .append(scoreInput(inScores[s], getUpdater(s)));
        $scores = $scores.add(td);
    }
    return $scores.add(total);
}

function scoresHTML(scorecard, playerNumber) {
    var total   = $("<td></td>").addClass('score-sum'),
        player  = playerStr(scorecard, playerNumber),
        players = scorecard.players,
        scores  = scorecard.scores;

    function updater() {
        var player       = playerStr(scorecard, playerNumber),
            playerScores = scores[player],
            outScores    = playerScores.out.reduce(addScores, EMPTY_SCORE);

        if ("in" in scores[player]) {
            var inScores = playerScores.in.reduce(addScores, EMPTY_SCORE);
        }
        total.html(scoreHTML(addScores(outScores, inScores || EMPTY_SCORE)));
    }

    var $html = outScoresHTML(scorecard, playerNumber, updater);
    if ("in" in scores[player]) {
        $html = $html.add(inScoresHTML(scorecard, playerNumber, updater));
    }
    return $html.add(total);
}

function playerHTML(scorecard, playerNumber) {
    var $html = $("<tr></tr>")
        .append($("<td></td>")
            .append(playerNameHTML(scorecard, playerNumber)));

    $html.append(scoresHTML(scorecard, playerNumber));
    return $html;
}

function tableHeaderHTML(scorecard) {
    return $("<thead></thead>")
        .append($("<tr></tr>")
            .attr('id', 'labels-row')
            .append(labelsHTML(scorecard)))
        .append($("<tr></tr>")
            .attr('id', 'par-row')
            .append(parsHTML(scorecard)));
}

function tableBodyHTML(scorecard) {
    var $html = $("<tbody>");
    for (var p = 1; p <= scorecard.players.length; ++p) {
        $html.append(playerHTML(scorecard, p));
    }
    return $html;
}

function tableFooterHTML(scorecard) {
    var pars = scorecard.course.pars;
    var colspan = pars.out.length + 3;
    if ("in" in pars) {
        colspan += pars.in.length + 1;
    }
    colspan -= 2;

    return $("<tfoot>").append([
        $("<tr></tr>")
            .attr('id', 'buttons-row')
            .append([
                $("<td></td>")
                    .attr('id', 'player-buttons')
                    .append([
                        $("<button></button>")
                            .attr('type', 'button')
                            .text('Add Player')
                            .click(function() {
                                addPlayer(scorecard);
                                updateScorecard();
                            }),
                        $("<button></button>")
                            .attr('type', 'button')
                            .text('Remove Player')
                            .click(function() {
                                removeLastPlayer(scorecard);
                                updateScorecard(scorecard);
                            })
                    ]),
                $("<td></td>")
                    .attr('colspan', colspan + 2)
                    .append($("<button></button>")
                        .attr('type', 'button')
                        .attr('id', 'save-button')
                        .text('Save')
                        .click(save))
            ]),
        $("<tr></tr>")
            .append([
                $("<td></td>")
                    .attr('id', 'course-notes-label')
                    .append($("<label></label>")
                        .attr('for', 'course-notes')
                        .html('Notes')),
                $("<td></td>")
                    .attr('id', 'course-notes')
                    .attr('colspan', colspan + 1)
                    .append($("<textarea></textarea>")
                        .attr('id', 'course-notes-input')
                        .val(scorecard.notes)
                        .blur(function() {
                            scorecard.notes = $(this).val();
                        })
                        .attr('rows', '2')
                        .attr('cols', '72')
                        .attr('placeholder', 'Enter any memorable thoughts' +
                              ' about the course or round'))
            ]),
        $("<tr></tr>")
            .attr('id', 'scorecard-id-row')
            .append($("<td></td>")
                .attr('colspan', colspan + 2)
                .html('Scorecard ID: ')
                .append($("<span></span>")
                    .attr('id', 'scorecard-id')
                    .html(scorecard.id)))
    ]);
}

function tableHTML(scorecard) {
    var $html = $("<table></table>")
        .attr('id', 'scorecard')
        .append(tableHeaderHTML(scorecard))
        .append(tableFooterHTML(scorecard))
        .append(tableBodyHTML(scorecard));
    return $html;
}

function save() {
    $.post("save.php", {
        json: JSON.stringify(data.scorecard)
    });
}

function getUserInput(p) {
    return prompt(p, "");
}

function getNewCourse() {
    var name = getUserInput("Please enter the name of this course.");
    if (name === null) {
        return null;
    }
    var city = getUserInput("Please enter the city of this course.");
    if (city === null) {
        return null;
    }
    var state = getUserInput("Please enter the state of this course.");
    if (state === null) {
        return null;
    }

    var newCourse = {
        name: name,
        city: city,
        state: state,
        pars: {
            out: [3, 3, 3, 3, 3, 3, 3, 3, 3],
            in: [3, 3, 3, 3, 3, 3, 3, 3, 3]
        }
    };
    return newCourse;
}

function setCourse(scorecard, course) {
    if (course === otherCourse) {
        var newCourse = getNewCourse();
        if (!newCourse) {
            return;
        }
    } else {
        var newCourse = course;
    }
    scorecard.course = newCourse;
}

function addPlayer(scorecard) {
    var playerNumber = scorecard.players.length + 1,
        placeholder  = playerPlaceholder(playerNumber),
        course       = scorecard.course,
        pars         = course.pars,
        scores       = scorecard.scores;

    scorecard.players.push("");

    function getEmptyScore() {
        return EMPTY_SCORE;
    }

    scores[placeholder] = {
        out: pars.out.map(getEmptyScore)
    };
    if ("in" in pars) {
        scores[placeholder].in = pars.in.map(getEmptyScore);
    }
}

function removeLastPlayer(scorecard) {
    var players = scorecard.players,
        str     = playerStr(scorecard, players.length);

    delete scorecard.scores[str];
    players.pop();
}

function addCourse(course) {
    data.courses.push(course);
    $("#select-course")
        .prepend($("<option></option>")
            .attr('value', courseId(course))
            .html(courseStr(course)));
    return course;
}

/* Creates the course selection dropdown and label. */
function createSelect() {
    var options = [];
    var courses = data.courses;

    for (var i = 0; i < courses.length; ++i) {
        var course = courses[i];
        var option = $("<option></option>")
            .attr('value', courseId(course))
            .html(courseStr(course));
        if (i === defCourse) {
            option.prop('selected', true);
        }
        options.push(option);
    }

    $("#choose-course").append([
        $("<label></label>")
            .attr('id', 'select-course-label')
            .attr('for', 'select-course')
            .html('Select Course: '),
        $("<select></select>")
            .attr('id', 'select-course')
            .attr('title', 'Click to select a predefined course')
            .change(function() {
                var str = $(this).val();
                for (var i = 0; i < courses.length; ++i) {
                    var course = courses[i];
                    if (courseId(course) === str) {
                        setCourse(data.scorecard, course);
                        updateScorecard();
                        return;
                    }
                }
            })
            .append(options)
    ]);
}

function updateScorecard() {
    $("#scorecard").replaceWith(tableHTML(data.scorecard));
}

function fetchDate() {
    var d = new Date();
    return (1 + d.getMonth()) + "/" + d.getDate() + "/" + d.getFullYear();
}

function setDate() {
    $("#date").html(fetchDate());
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
    return newID;
}

$(function() {
    // After the page has been loaded, run these javascript commands to set up
    // any part of the page that needs to be created dynamically.

    setDate();
    createSelect();
    setCourse(data.scorecard, data.courses[defCourse]);
    addPlayer(data.scorecard);
    data.scorecard.id = newScorecardID();
    updateScorecard();
});

window.addCourse = function(info) {
    addCourse(info);
}

})();
