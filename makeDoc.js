async function makeDoc() {
    var lines = $("#inputText").val().split(/\s+/);
    var output = $("#outputText");
    var spanishWords = [];
    var definitions = [];
    var sentences = [];
    var outputString = "";
    const proxyurl = "https://cors-anywhere.herokuapp.com/";
    const dictKey = "7d5aa173-64d6-4c7b-8558-9bba3bca452c"

    // Get Spanish word and sentence and English Definition
    for (let i = 0; i < lines.length; i++) {
        var english = lines[i];
        var urlSpanish = "https://www.spanishdict.com/translation/" + english;
        var urlDict = "https://www.dictionaryapi.com/api/v3/references/collegiate/json/" + english + "?key=" + dictKey;

        await fetch(proxyurl + urlSpanish)
            .then(response => response.text())
            .then(text => {
                var index = text.indexOf("<a href=\"/translate/");
                var spanish = "";
                var sentence = "";

                while (text.charAt(index) != '>')
                    index++;

                index++;

                while (text.charAt(index) != '<') {
                    spanish += text.charAt(index);
                    index++;
                }

                index = text.indexOf("<em class=\"exB\">");

                while (text.charAt(index) != '>')
                    index++;

                index++;

                while (text.charAt(index) != '<') {
                    sentence += text.charAt(index);
                    index++;
                }

                console.log(spanish + sentence);
                spanishWords.push(spanish);
                sentences.push(sentence);
            });

        await fetch(urlDict)
            .then(response => response.json())
            .then(json => {
                definitions.push(json[0].shortdef[0]);
            });
    }

    /*
    // Change English Definitions to Spanish Definition
    for (let i = 0; i < definitions.length; i++) {
        var englishDef = definitions[i];
        var testUrl = "https://translate.google.com/#view=home&op=translate&sl=en&tl=es&text=" + englishDef;
        var urlChange = "https://www.spanishdict.com/translation/" + englishDef;

        await $.get("fetch.php", {
            url: (proxyurl + testUrl)
        }, function(data) {
            console.log(data);
        });

        await fetch(proxyurl + urlChange)
            .then(response => response.text())
            .then(text => {
                console.log(text);
            });

        await $.get(proxyurl + testUrl, function(responseText) {
            //console.log(responseText);
            var index = responseText.indexOf("\"displayText\"");
            var spanishDef = "";

            while (responseText.indexOf(index) != ':')
                index++;

            index += 2;

            while (responseText.indexOf(index) != '"') {
                spanishDef += responseText.charAt(index);
                index++;
            }
            console.log(spanishDef);
            definitions[i] = spanishDef;

        });
    }
    */

    // Combine word arrays into one string
    for (var i = 0; i < lines.length; i++) {
        outputString += lines[i] + " - " + spanishWords[i] + "\n";
        outputString += definitions[i] + "\n";
        outputString += sentences[i] + "\n\n";
    }
    output.val(outputString);
}