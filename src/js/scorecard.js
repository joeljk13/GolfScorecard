/*!
 * scorecard.js
 * JavaScript for the GolfScorecard web site.
 * Uses jQuery.
 *
 * Copyright (c) 2014-2015 Jim & Joel Kottas.  All rights reserved.
 */

/* Trims whitespace from the left side of a string. */
function triml(str) {
    return str.replace(/^\s+/, '');
}

/* Trims whitespace from the right side of a string. */
function trimr(str) {
    return str.replace(/\s+$/, '');
}

/* Replaces any occurances of multiple whitespace characters in a row with a
 * single space. */
function trimm(str) {
    return str.replace(/\s+/g, ' ');
}

/* Does all of trimm, triml, trimr. */
function trim(str) {
    return trimm(triml(trimr(str)));
}

// Using an anonomous function to avoid poluting the global scope
(function() {
// "use strict" tells the browser to generate more errors than normal. This
// only applies to this function.
"use strict";

var data = [];

/*
 * Example JSON data:
 *  [
 *      {
 *          "courseInfo": {
 *              "name": "The Hill",
 *              "city": "Devens",
 *              "state": "MA",
 *              "pars": {
 *                  "out": [3, 3, 3, ...],
 *                  "in": [3, 3, 3, ...]
 *              },
 *              "notes": "Great course!"
 *          },
 *          "scorecard": {
 *              "players": [
 *                  "Dave",
 *                  "Jack",
 *                  ...
 *              ],
 *              "scores": {
 *                  "Dave": {
 *                      "out": [
 *                          {
 *                              "number": 3
 *                          },
 *                          ...
 *                      ],
 *                      "in": [
 *                          {
 *                              "number": 3
 *                          },
 *                          ...
 *                      ]
 *                  },
 *                  "Jack" : {
 *                      "out": [
 *                          {
 *                              "number": 3
 *                          },
 *                          ...
 *                      ],
 *                      "in": [
 *                          {
 *                              "number": 3
 *                          },
 *                          ...
 *                      ]
 *                  },
 *                  ...
 *              },
 *              "notes": "Great day, lots of sun!",
 *          }
 *      }
 *  ]
 */

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
    if (score.number === 0) {
        return "&nbsp;";
    }
    var html = score.number + '<sup>';
    for (var i in score) {
        if (i === 'number') {
            continue;
        }
        for (var j = 0; j < score[i]; ++j) {
            html += i;
        }
    }
    html += '</sup>';
    return html;
}

function scoreStr(score) {
    if (score.number === 0) {
        return "";
    }
    var str = score.number + "";
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
    if (!input || /^\s*$/.test(input)) {
        return {number: 0};
    }

    var score = {
        number: parseInt(input, 10)
    };

    input = input.replace(/\d/g, "");

    for (var i = 0; i < input.length; ++i) {
        var c = input.charAt(i);
        if (/\s/.test(c)) {
            continue;
        }

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
    score.number = a.number + b.number;
    return score;
}

function outLabelsHTML(course) {
    var i = 1;
    return course.courseInfo.pars.out.reduce(function(a, b) {
        return a.add($("<td></td>").html(i++ + ""));
    }, $()).add($("<td></td>").html("Out"));
}

function inLabelsHTML(course) {
    var i = course.courseInfo.pars.out.length;
    return course.courseInfo.pars.in.reduce(function(a, b) {
        return a.add($("<td></td>").html(i++ + ""));
    }, $()).add($("<td></td>").html("In"));
}

function labelsHTML(course) {
    var $html = $("<td></td>").html("Hole #");
    $html = $html.add(outLabelsHTML(course));
    if ("in" in course.courseInfo.pars) {
        $html = $html.add(inLabelsHTML(course));
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
        $input.val(newData.val);
        $div.html(newData.html);
    }

    function finalize() {
        $input.hide();
        setData();
        $div.show();
    }

    $input.blur(function() {
        // Since $input blurs before the click event of a $div fires, hiding
        // this input can mess up clicks on score td's that have been moved by
        // this input. 100 ms should be short enough that it's practically
        // immediately, but long enough to get a click to register.
        setTimeout(finalize, 100);
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
        var i = parseInt(data, 10) + "";
        updater(i);
        return {
            val: i,
            html: i
        };
    });
}

function outParsHTML(course, updater) {
    var outPars = course.courseInfo.pars.out;
    var total = $("<td></td>");

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
        var td = $("<td></td>").append(parInput(outPars[p], getUpdater(p)));
        $pars = $pars.add(td);
    }
    return $pars.add(total);
}

function inParsHTML(course, updater) {
    var inPars = course.courseInfo.pars.in;
    var total = $("<td></td>").html(sum(inPars) + "");

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
        var td = $("<td></td>").append(parInput(inPars[p], getUpdater(p)));
        $pars = $pars.add(td);
    }
    return $pars.add(total);
}

function parsHTML(course) {
    var pars = course.courseInfo.pars;
    var $pars = $("<td></td>").html("Par");
    var total = $("<td></td>");

    if ("in" in pars) {
        var updater = function() {
            total.html(sum(pars.out) + sum(pars.in) + "");
        }
    } else {
        var updater = function() {
            total.html(sum(pars.out));
        }
    }

    $pars = $pars.add(outParsHTML(course, updater));
    if ("in" in pars) {
        $pars = $pars.add(inParsHTML(course, updater));
    }
    return $pars.add(total);
}

function playerPlaceholder(playerNumber) {
    return 'Player ' + playerNumber;
}

function playerNameHTML(scorecard, playerNumber) {
    var placeholder = playerPlaceholder(playerNumber);

    function update() {
        var prevName = scorecard.players[playerNumber - 1] || placeholder;
        var newName = $input.val() || placeholder;

        if (prevName === newName) {
            return;
        }

        scorecard.players[playerNumber - 1] = newName;
        scorecard.scores[newName] = scorecard.scores[prevName];
        delete scorecard.scores[prevName];
    }

    var $input = $("<input />")
        .val(scorecard.players[playerNumber - 1] || "")
        .addClass('player-name')
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
    var player = scorecard.players[playerNumber - 1] ||
        playerPlaceholder(playerNumber);
    var scores = scorecard.scores[player].out;
    var total = $("<td></td>").addClass('sum');

    function outUpdater() {
        var s = scores.reduce(addScores, {number: 0});
        total.html(scoreHTML(s));
        updater();
    }

    function getUpdater(s) {
        return function(i) {
            scores[s] = i;
            outUpdater();
        }
    }

    var $scores = $();
    for (var s = 0; s < scores.length; ++s) {
        var td = $("<td></td>")
            .addClass('score')
            .append(scoreInput(scores[s], getUpdater(s)));
        $scores = $scores.add(td);
    }
    return $scores.add(total);
}

function inScoresHTML(scorecard, playerNumber, updater) {
    var player = scorecard.players[playerNumber - 1] ||
        playerPlaceholder(playerNumber);
    var scores = scorecard.scores[player].in;
    var total = $("<td></td>").addClass('sum');

    function inUpdater() {
        var s = scores.reduce(addScores, {number: 0});
        total.html(scoreHTML(s));
        updater();
    }

    function getUpdater(s) {
        return function(i) {
            scores[s] = i;
            inUpdater();
        }
    }

    var $scores = $();
    for (var s = 0; s < scores.length; ++s) {
        var td = $("<td></td>")
            .addClass('score')
            .append(scoreInput(scores[s], getUpdater(s)));
        $scores = $scores.add(td);
    }
    return $scores.add(total);
}

function scoresHTML(scorecard, playerNumber) {
    var total = $("<td></td>").addClass('sum');
    var player = scorecard.players[playerNumber - 1] ||
        playerPlaceholder(playerNumber);
    var scores = scorecard.scores;

    function updater() {
        var player = scorecard.players[playerNumber - 1] ||
            playerPlaceholder(playerNumber);

        var outScores = scores[player].out.reduce(addScores, {number: 0});
        if ("in" in scores[player]) {
            var inScores = scores[player].in.reduce(addScores, {number: 0});
        }
        total.html(scoreHTML(addScores(outScores, inScores || {number: 0})));
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

function tableHeaderHTML(course) {
    return $("<thead></thead>")
        .append($("<tr></tr>")
            .attr('id', 'header-row')
            .append(labelsHTML(course)))
        .append($("<tr></tr>")
            .attr('id', 'par-row')
            .append(parsHTML(course)));
}

function tableBodyHTML(course) {
    var $html = $("<tbody>");
    for (var p = 1; p <= course.scorecard.players.length; ++p) {
        $html.append(playerHTML(course.scorecard, p));
    }
    return $html;
}

function tableFooterHTML(course) {
    // 2 == Player names + Out total + Total
    var pars = course.courseInfo.pars;
    var colspan = pars.out.length + 3;
    if ("in" in pars) {
        colspan += pars.in.length + 1;
    }
    colspan -= 2;

    return $("<tfoot>").append([
        $("<tr></tr>")
            .attr('id', 'notes_row')
            .append([
                $("<td></td>")
                    .attr('id', 'course_notes_label')
                    .append($("<label></label>")
                        .attr('for', 'course_notes')
                        .html('Notes')),
                $("<td></td>")
                    .attr('id', 'course_notes')
                    .attr('colspan', colspan - 1)
                    .append($("<textarea></textarea>")
                        .val(course.scorecard.notes)
                        .blur(function() {
                            course.scorecard.notes = $(this).val();
                        })
                        .attr('rows', '2')
                        .attr('cols', '72')
                        .attr('placeholder', 'Enter any memorable thoughts' +
                              ' about the course or round')),
                $("<td></td>")
                    .attr('id', 'add-player')
                    .attr('colspan', 2)
                    .append([
                        $("<div></div>").append($("<button></button>")
                            .attr('type', 'button')
                            .text('Add Player')
                            .click(function() {
                                addPlayer();
                            })),
                        $("<div></div>").append($("<button></button>")
                            .attr('type', 'button')
                            .text('Save')
                            .click(function() {
                                $.post("save.php", {
                                    json: JSON.stringify(data[currentCourse])
                                });
                            }))
                    ])
            ])
        // $("<tr></tr>")
        //     .attr('id', 'scorecard-row')
        //     .append($("<td></td>")
        //         .attr('colspan', colspan + 2)
        //         .html('Scorecard ID: ')
        //         .append($("<span></span>")
        //             .attr('id', 'scorecard-id')
        //             .html(courseId(course.courseInfo) + "")))
    ]);
}

function tableHTML(course) {
    var $html = $("<table></table>")
        .attr('id', 'scorecard')
        .append(tableHeaderHTML(course))
        .append(tableFooterHTML(course))
        .append(tableBodyHTML(course));
    return $html;
}

function getUserInput(p) {
    return prompt(p, "");
}

function setCourse(courseNumber) {
    if (courseNumber === otherCourse) {
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
        var newCourse = {
            name: name,
            city: city,
            state: state,
            pars: {
                out: [3, 3, 3, 3, 3, 3, 3, 3, 3],
                in: [3, 3, 3, 3, 3, 3, 3, 3, 3]
            }
        };
        setCourse(addCourse(newCourse));
    } else {
        $("#scorecard").replaceWith(tableHTML(data[courseNumber]));
        currentCourse = courseNumber;
    }
}

function addPlayer(course) {
    course = course || data[currentCourse];
    var scorecard = course.scorecard;
    var playerNumber = scorecard.players.length + 1;
    var placeholder = playerPlaceholder(playerNumber);
    scorecard.players.push("");

    function getEmptyScore(par) {
        return {number: 0};
    }

    scorecard.scores[placeholder] = {
        out: course.courseInfo.pars.out.map(getEmptyScore)
    };
    if ("in" in course.courseInfo.pars) {
        scorecard.scores[placeholder].in =
            course.courseInfo.pars.in.map(getEmptyScore);
    }

    if (course === data[currentCourse]) {
        setCourse(currentCourse);
    }
}

function addCourse(info) {
    var course = {
        courseInfo: info,
        scorecard: {
            players: [],
            scores: {}
        }
    };

    addPlayer(course);

    $("#select_course")
        .prepend($("<option></option>")
            .attr('id', courseId(course))
            .html(courseStr(course)));

    data.push(course);
    return data.length - 1;
}

/* Creates the course selection dropdown and label. */
function createSelect() {
    var options = [];

    for (var i = 0; i < data.length; ++i) {
        var course = data[i];
        var option = $("<option></option>")
            .attr('id', courseId(course.courseInfo))
            .html(courseStr(course.courseInfo));
        if (i === defCourse) {
            option.prop('selected', true);
        }
        options.push(option);
    }

    $("#select").append([
        $("<label></label>")
            .attr('id', 'select_course_label')
            .attr('for', 'select_course')
            .html('Select Course: '),
        $("<select></select>")
            .attr('id', 'select_course')
            .attr('title', 'Click to select a predefined course')
            .change(function() {
                var str = $(this).val();
                for (var i = 0; i < data.length; ++i) {
                    var course = data[i];
                    if (courseStr(course.courseInfo) === str) {
                        setCourse(i);
                        return;
                    }
                }
            })
            .append(options)
    ]);
}

function fetchDate() {
    var d = new Date();
    return (1 + d.getMonth()) + "/" + d.getDate() + "/" + d.getFullYear();
}

function setDate() {
    $("#date").html(fetchDate());
}

$(function() {
    // After the page has been loaded, run these javascript commands to set up
    // any part of the page that needs to be created dynamically.

    setDate();
    createSelect();
    setCourse(defCourse);
});

window.addCourse = function(info) {
    addCourse(info);
}

})();
