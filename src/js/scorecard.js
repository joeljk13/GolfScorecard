/*!
 * scorecard.js
 * JavaScript for the GolfScorecard web site.
 * Uses jQuery.
 *
 * Copyright (c) 2014 Jim & Joel Kottas.  All rights reserved.
 */

function triml(str) {
    return str.replace(/^\s+/, '');
}

function trimr(str) {
    return str.replace(/\s+$/, '');
}

function trimm(str) {
    return str.replace(/\s+/g, ' ');
}

function trim(str) {
    return trimm(triml(trimr(str)));
}

function Course(name, city, state, outPars, inPars) {
    this.name = name;
    this.city = city;
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

(function() {
"use strict";

function randomIntFromInterval(min, max) {
    // Generate a random integer in the range [min, max].
    return Math.floor(Math.random()*(max-min+1)+min);
}

function fetchDate() {
    var d = new Date();
    return (1 + d.getMonth()) + "/" + d.getDate() + "/" + d.getFullYear();
}

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

        var parRow = $("<tr></tr>")
            .attr('id', 'par-row')
            .append($("<td></td>").html("Par"));
        var outParTotal = $("<td></td>");
        var inParTotal = $("<td></td>");
        var parTotal = $("<td></td>");

        function addScores(a, b) {
            return Data.add(a instanceof Input ? a.getData() : a,
                            b instanceof Input ? b.getData() : b);
        }

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

        updateOutParTotal();
        updateInParTotal();
        updateParTotal();

        var tbody = $("<tbody></tbody>");

        for (var i = 0; i < this.players.length; ++i) {
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
    // After the page has been loaded, run these javascript commands to make
    // sure the GUI state is consistent.

    setDate();
    createSelect();
    setCourse(defCourse);
});

})();
