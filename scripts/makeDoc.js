'use strict';

var $ = require('jquery');
$("#button").click(makeDoc);

const dictKey = "7d5aa173-64d6-4c7b-8558-9bba3bca452c";
const proxyurl = "https://cors-anywhere.herokuapp.com/";

async function makeDoc() {
    let lines = $("#inputText").val().split("\n");
    let output = $("#outputText");
    let everything = [];
    let outputString = "";

    // Asynchronously query every input
    everything = await Promise.all(lines.map(iterate));

    // Print to output
    for (let i = 0; i < everything.length; i++) {
        outputString += everything[i].english + " - " + everything[i].spanish + "\n";
        outputString += everything[i].definition + "\n";
        outputString += everything[i].sentence + "\n\n";
    }
    output.val(outputString);
}

async function iterate(english) {
    let urlDict = "https://www.dictionaryapi.com/api/v3/references/collegiate/json/" + english + "?key=" + dictKey;
    let urlSpanish = "https://www.spanishdict.com/translate/";

    let spanish = "";
    let sentence = "";
    let definition = "";

    // Find spanish translation and sentence
    await fetch(proxyurl + urlSpanish + english)
        .then(response => response.text())
        .then(text => {

            let index = text.indexOf('"en":');

            while (!(text.substr(index, 8) === '"textEs"'))
                index++;

            index += 10;

            while (text.charAt(index) != '"') {
                sentence += text.charAt(index);
                index++;
            }

            while (!(text.substr(index, 13) === '"translation"'))
                index++;

            index += 15;

            while (text.charAt(index) != '"') {
                spanish += text.charAt(index);
                index++;
            }
        })
        .catch(err => {
            console.log("Could not find translation or sentence for " + english);
            console.error(err);
        });

    // Find english definition
    await fetch(urlDict)
        .then(response => response.json())
        .then(json => {
            definition = (json[0].shortdef[0] == null) ? "" : json[0].shortdef[0];
        })
        .catch(err => {
            console.log("Could not find definition for " + english);
            console.error(err);
        });

    // Translate english definition
    if (definition.length != 0) {
        definition = definition.replace(";", "%3B");
        await fetch("https://8e3eypecu0.execute-api.us-east-1.amazonaws.com/default/printHelloWorld?phrase=" + definition)
            .then(response => response.json())
            .then(json => {
                definition = json.translation
            })
            .catch(err => {
                console.log("Could not find translation for definition of " + english);
                console.error(err);
            })
    }

    return Promise.resolve({
        english: english,
        spanish: spanish,
        sentence: sentence,
        definition: definition
    });
}