/*
 * courses.js
 * JavaScript for defining golf courses for the GolfScorecard web site.
 * This file must be included after the scorecard.js file.
 *
 * Copyright (c) 2015 Jim & Joel Kottas.  All rights reserved.
 */

// The 0-based index for the default course to show in a new scorecard
var defCourse = 0;

// The 0-based index of the special course called "Other" that the user could
// define dynamically.
var otherCourse = -1;

// Define pre-defined courses; the default one will be set once the DOM has 
// loaded.

addCourse({
    name: "The General",
    city: "Devens",
    state: "MA",
    pars: {
        out: [3, 3, 3, 3, 4, 3, 3, 3, 3],
        in: [3, 4, 3, 3, 3, 3, 3, 3, 3],
    }
});

addCourse({
    name: "The Hill",
    city: "Devens",
    state: "MA",
    pars: {
        out: [3, 3, 3, 3, 3, 3, 3, 3, 3],
        in: [3, 3, 3, 3, 3, 3, 3, 3, 3]
    }
});

addCourse({
    name: "Muldoon Park",
    city: "Pelham",
    state: "NH",
    pars: {
        out: [3, 3, 3, 3, 3, 4, 3, 3, 3],
        in: [3, 3, 3, 3, 3, 3, 3, 4, 3]
    }
});

addCourse({
    name: "Coggshall Park",
    city: "Fitchburg",
    state: "MA",
    pars: {
        out: [3, 3, 3, 3, 3, 3, 4, 3, 3],
        in: [3, 3, 3, 3, 3, 3, 3, 4, 3]
    }
});

addCourse({
    name: "Typical Minigolf Course",
    city: "",
    state: "",
    pars: {
        out: [2, 2, 2, 2, 2, 2, 2, 2, 2],
        in: [2, 2, 2, 2, 2, 2, 2, 2, 2]
    }
});