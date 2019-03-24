async function makeDoc() {
    var lines = $("#inputText").val().split(",");
    var output = $("#outputText");
    var spanishWords = [];
    var definitions = [];
    var sentences = [];
    var outputString = "";
    const dictKey = "7d5aa173-64d6-4c7b-8558-9bba3bca452c";
    const transKey = "AIzaSyB96TP6RRUx8aLqRgBpnFIHE5BqrCBDHI8";
    const urlTranslate = "https://translation.googleapis.com/language/translate/v2";
    const proxyurl = "https://cors-anywhere.herokuapp.com/";

    // Get Spanish word and sentence and English Definition
    for (let i = 0; i < lines.length; i++) {
        var english = lines[i];
        var urlDict = "https://www.dictionaryapi.com/api/v3/references/collegiate/json/" + english + "?key=" + dictKey;
        var urlSpanish = "https://www.spanishdict.com/translate/" + english;

        await $.get(urlTranslate, {
            q: english,
            target: "es",
            key: transKey
        }, function(data) {
            spanishWords.push(data.data.translations[0].translatedText);
        });

        await fetch(urlDict)
            .then(response => response.json())
            .then(json => {
                definitions.push(json[0].shortdef[0]);
            });

        await fetch(proxyurl + urlSpanish)
            .then(response => response.text())
            .then(text => {
                var sentence = "";

                index = text.indexOf("<em class=\"exB\">");

                while (text.charAt(index) != '>')
                    index++;

                index++;

                while (text.charAt(index) != '<') {
                    sentence += text.charAt(index);
                    index++;
                }

                sentences.push(sentence);
            });
    }

    // Convert English Definition to Spanish
    for (let i = 0; i < definitions.length; i++) {
        await $.get(urlTranslate, {
            q: definitions[i],
            target: "es",
            key: transKey
        }, function(data) {
            definitions[i] = data.data.translations[0].translatedText;
        });
    }

    // Combine word arrays into one string
    for (var i = 0; i < lines.length; i++) {
        outputString += lines[i] + " - " + spanishWords[i] + "\n";
        outputString += definitions[i] + "\n";
        outputString += sentences[i] + "\n\n";
    }
    output.val(outputString);
}