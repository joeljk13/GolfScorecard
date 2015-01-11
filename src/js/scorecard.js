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

/* Create a course with new Course(NAME, CITY, STATE, OUT_PARS, IN_PARS).
 * this.name = NAME - The name of the course.
 * this.city = CITY - The name of the city the course is in.
 * this.state = STATE - The 2 letter abbreviation of the state that the course is in.
 * this.outPars = OUT_PARS - An array of pars for the front 9 holes (e.g. [3,
 *      3, 3, 3, 3, 3, 3, 3,  3]).
 * this.inPars = IN_PARS - An array of pars for the back 9 holes, like
 *      OUT_PARS. Make this null for courses with only 9 holes.
 *
 * this.id is a unique id for this course.
 * this.str is the pretty string that should be displayed to the user.
 */
function Course(name, city, state, outPars, inPars) {
    this.name = name;
    this.city = city;
    this.state = state;
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

// Using an anonomous function to avoid poluting the global scope
(function() {
// "use strict" tells the browser to generate more errors than normal. This
// only applies to this function.
"use strict";

function randomIntFromInterval(min, max) {
    // Generate a random integer in the range [min, max].
    return Math.floor(Math.random()*(max-min+1)+min);
}

function fetchDate() {
    var d = new Date();
    return (1 + d.getMonth()) + "/" + d.getDate() + "/" + d.getFullYear();
}

/* Create with new Data(INITIAL_DATA).
 * Note: This is immutable! To modify, create a new Data and leave the old one
 * for the garbage collector.
 *
 * If INITIAL_DATA is a string, this formats it correctly. It can be gotten
 * with this.getDataStr().
 * If INITIAL_DATA is an object, this assumes it is formatted correctly (see
 * this.getDataObject() format), and uses that object for the data and to
 * create the string.
 *
 * this.getDataHTML() - gets an HTML string used to display a score to the user
 * this.getDataObject() - gets the internal data structure.
 *      This is an object.
 *      The key 'number' is the number representing the score.
 *      All other keys are a single character, with a value being the number of
 *          times it appears in the score string.
 *      For example, the score string "4+##" would generate:
 *      {
 *          number: 4,
 *          '+': 1,
 *          '#': 2
 *      }
 */
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

/* Adds a and b (which are turned into Data instances if they aren't already)
 * to get a new Data instance. This adds the scores and the numbers of each
 * symbol. */
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

/* Create with new Input(INITIAL_DATA, UPDATER).
 * An Input is the Javascript object that represents a score field where you
 * can click on it to edit and 'un-click' it to save the new data. This is used
 * for the scores and the pars.
 *
 * INITIAL_DATA - The initial data. This is passed to new Data().
 * UPDATER - A function that is called whenever the data in this field is
 *      changed. Note that currently constructing an input will call UPDATER.
 *
 * this.$div - the jQuery element that contains the HTML that displays the
 *      score.
 * this.$input - the jQuery element that represents the input element.
 * this.$html - the jQuery element that encompasses all that's needed to be
 *      added to the DOM for this to work.
 * this.getData() - gets the Data object associated with this Input currently.
 * this.setData(DATA) - sets the data in this input to DATA. If DATA is not an
 *      instance of Data, it is converted to one.
 */
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

/* Gets the scorecard object for the given course. Each course gets exactly 1
 * scorecard. Lazily creates and reuses the scorecards for each course.
 * this.id -  A unique scorecard id.
 * this.outPars - An array of the front pars; gotten from course.
 * this.inPars - An array of the back pars; gotten from course.
 * this.players - An array of player names.
 * this.nHoles - The number of holes.
 * this.scores - A multidimentional array of scores. Access with scores[PLAYER
 *      NUMBER][0 if front 9, 1 if back 9][HOLE] (all arrays are 0-based).
 *      Each element is an Input after this.getTable() is called.
 * this.notes - The notes about this scorecard.
 * this.getTable() - Gets the jQuery element that represents the table that
 *      should be put on the page for this scorecard.
 */
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
        // Create header with hole numbers
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

        // Create row with pars
        var parRow = $("<tr></tr>")
            .attr('id', 'par-row')
            .append($("<td></td>").html("Par"));
        var outParTotal = $("<td></td>");
        var inParTotal = $("<td></td>");
        var parTotal = $("<td></td>");

        // Adds the data of scores a and b.
        function addScores(a, b) {
            return Data.add(a instanceof Input ? a.getData() : a,
                            b instanceof Input ? b.getData() : b);
        }

        // Helper functions
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

        // It can't hurt to make sure they're updated.
        updateOutParTotal();
        updateInParTotal();
        updateParTotal();

        var tbody = $("<tbody></tbody>");

        for (var i = 0; i < this.players.length; ++i) {
            // Create a new scope for all player variables, including the
            // player index
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

                // Helper functions
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

        // 3 == Player names + Out total + Total
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

/* Sets the new course to course. Prompts the user for info if course ===
 * otherCourse.
 */
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

/* Creates the course selection dropdown and label. */
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
    // After the page has been loaded, run these javascript commands to set up
    // any part of the page that needs to be created dynamically.

    setDate();
    createSelect();
    setCourse(defCourse);
});

})();
