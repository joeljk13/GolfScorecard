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
    address: "80 Antietam Street",
    city: "Devens",
    state: "MA",
    zip: "01432",
    dg_url: "http://www.dgcoursereview.com/course.php?id=6629",
    pars: {
        out: [3, 3, 3, 3, 4, 3, 3, 3, 3],
        in: [3, 4, 3, 3, 3, 3, 3, 3, 3]
    }
});

addCourse({
    name: "The Hill",
    address: "80 Antietam Street",
    city: "Devens",
    state: "MA",
    zip: "01432",
    dg_url: "http://www.dgcoursereview.com/course.php?id=1186",
    pars: {
        out: [3, 3, 3, 3, 3, 3, 3, 3, 3],
        in: [3, 3, 3, 3, 3, 3, 3, 3, 3]
    }
});

addCourse({
    name: "Muldoon Park",
    address: "304 Mammoth Road",
    city: "Pelham",
    state: "NH",
    zip: "03076",
    dg_url: "http://www.dgcoursereview.com/course.php?id=4935",
    pars: {
        out: [3, 3, 3, 3, 4, 3, 3, 3, 3],
        in: [3, 3, 3, 3, 3, 3, 3, 4, 3]
    }
});

addCourse({
    name: "Coggshall Park",
    address: "South Street",
    city: "Fitchburg",
    state: "MA",
    zip: "01420",
    dg_url: "http://www.dgcoursereview.com/course.php?id=3764",
    pars: {
        out: [3, 3, 3, 3, 3, 3, 4, 3, 3],
        in: [3, 3, 3, 3, 3, 3, 3, 4, 3]
    }
});

addCourse({
    name: "Pyramids - Silver",
    address: "103 Marshall Street",
    city: "Leicester",
    state: "MA",
    zip: "01524",
    dg_url: "http://www.dgcoursereview.com/course.php?id=1718",
    pars: {
        out: [3, 3, 3, 3, 3, 3, 3, 3, 3],
        in: [3, 3, 4, 4, 3, 3, 3, 3, 3]
    }
});

addCourse({
    name: "Pyramids - Gold",
    address: "103 Marshall Street",
    city: "Leicester",
    state: "MA",
    zip: "01524",
    dg_url: "http://www.dgcoursereview.com/course.php?id=1718",
    pars: {
        out: [4, 3, 3, 4, 4, 3, 4, 4, 4],
        in: [3, 3, 4, 5, 4, 3, 3, 3, 4]
    }
});

addCourse({
    name: "Maple Hill - Red",
    address: " 132 Marshall Street",
    city: "Leicester",
    state: "MA",
    zip: "01524",
    dg_url: "http://www.dgcoursereview.com/course.php?id=119",
    pars: {
        out: [3, 3, 3, 3, 3, 3, 3, 3, 4],
        in: [3, 3, 3, 3, 3, 3, 3, 3, 3]
    }
});

addCourse({
    name: "Maple Hill - White",
    address: " 132 Marshall Street",
    city: "Leicester",
    state: "MA",
    zip: "01524",
    dg_url: "http://www.dgcoursereview.com/course.php?id=119",
    pars: {
        out: [3, 3, 3, 3, 3, 3, 3, 3, 3],
        in: [4, 3, 3, 3, 3, 3, 3, 3, 4]
    }
});

addCourse({
    name: "Maple Hill - Blue",
    address: " 132 Marshall Street",
    city: "Leicester",
    state: "MA",
    zip: "01524",
    dg_url: "http://www.dgcoursereview.com/course.php?id=119",
    pars: {
        out: [4, 3, 3, 3, 3, 3, 4, 3, 4],
        in: [3, 4, 4, 3, 3, 3, 3, 3, 4]
    }
});

addCourse({
    name: "Maple Hill - Gold",
    address: " 132 Marshall Street",
    city: "Leicester",
    state: "MA",
    zip: "01524",
    dg_url: "http://www.dgcoursereview.com/course.php?id=119",
    pars: {
        out: [4, 3, 3, 3, 3, 3, 3, 3, 4],
        in: [4, 4, 4, 3, 3, 3, 3, 4, 4]
    }
});

addCourse({
    name: "Simonds Park",
    address: "Bedford Road, opposite 29 Church Lane",
    city: "Burlington",
    state: "MA",
    zip: "01803",
    dg_url: "http://www.dgcoursereview.com/course.php?id=3241",
    pars: {
        out: [3, 3, 3, 3, 3, 3, 3, 4, 3],
        in: []
    }
});

addCourse({
    name: "Typical Disc Golf Course",
    address: "",
    city: "",
    state: "",
    zip: "",
    dg_url: "",
    pars: {
        out: [3, 3, 3, 3, 3, 3, 3, 3, 3],
        in: [3, 3, 3, 3, 3, 3, 3, 3, 3]
    }
});

addCourse({
    name: "Typical Minigolf Course",
    address: "",
    city: "",
    state: "",
    zip: "",
    dg_url: "",
    pars: {
        out: [2, 2, 2, 2, 2, 2, 2, 2, 2],
        in: [2, 2, 2, 2, 2, 2, 2, 2, 2]
    }
});
