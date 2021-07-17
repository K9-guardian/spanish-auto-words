$(document).ready(function () {
    $('#create').click(createNewCard)
    $('#content').find('[placeholder=English]').change(function() {
        updateCard($(this).parent().parent())
    })
    $('#upload').click(uploadQuizlet)
    $('#update').click(updateOutput)
})

const definitions = {}
const sentences = {}
let progressMax = 0
let currentProgress = 0

async function updateCard(e) {
    $(e).find('[placeholder]').prop('disabled', true)
    const english = $(e).find('[placeholder=English]').val()
    let translation = ($(e).find('[placeholder=Spanish]').val() !== '') ? $(e).find('[placeholder=Spanish]').val() : getTranslation(english)
    let dictionary = getDictionary(english)

    const response = await Promise.all([translation, dictionary])
    translation = response[0]
    dictionary = response[1]

    $(e).find('[placeholder=Spanish]').val(translation)
    $(e).find('[placeholder=Definition]').val(dictionary.definitions[0])
    $(e).find('[placeholder=Sentence]').val(dictionary.sentences[0])

    const definitionsDropdown = $(e).find('.dropdown-menu').first()
    const sentencesDropdown = $(e).find('.dropdown-menu').last()

    definitionsDropdown.empty()
    sentencesDropdown.empty()
    
    dictionary.definitions.forEach(e => definitionsDropdown.append(makeDropdownItem(e)))
    dictionary.sentences.forEach(e => sentencesDropdown.append(makeDropdownItem(e)))

    definitionsDropdown.children().each((i, e) => $(e).click(() => updateTextArea(e)))
    sentencesDropdown.children().each((i, e) => $(e).click(() => updateTextArea(e)))

    $(e).find('[placeholder]').prop('disabled', false)
}

async function updateOutput() {
    $('#update').prop('disabled', true)
    $('#output').prop('readonly', true)
    createProgressBar()

    const numCards = $('#content').children().length - 1
    const numRows = 4 * numCards - 1
    const values = []
    $('#content').find('.card-body').each(function(i) {
        const obj = {
            english: $(this).find('[placeholder=English]').val(),
            spanish: $(this).find('[placeholder=Spanish]').val(),
            definition: $(this).find('[placeholder=Definition]').val(),
            sentence: $(this).find('[placeholder=Sentence]').val()
        }
        values.push(obj)
    })

    let str = ""
    progressMax = numCards
    Promise.all(values.map(async e => ({
        english: e.english,
        spanish: e.spanish,
        definition: Object.keys(definitions).includes(e.definition) ? definitions[e.definition] : await addTranslation(e.definition, definitions),
        sentence: Object.keys(sentences).includes(e.sentence) ? sentences[e.sentence] : await addTranslation(e.sentence, sentences)
    }))).then(output => {
        output.forEach(e => str += `${e.english} - ${e.spanish}\n${e.definition}\n${e.sentence}\n\n`)
        $('#output').val(str)
        $('#output').prop('rows', numRows)
        $('#output').prop('readonly', false)
        $('#update').prop('disabled', false)
        removeProgressBar()
    })
}

async function addTranslation(phrase, map) {
    const translation = await getTranslation(phrase)
    currentProgress++
    const percentage = Math.floor(currentProgress * 100 / progressMax)
    $('#progress').attr('style', 'width: ' + percentage + '%')
    map[phrase] = translation
    return translation
}

async function uploadQuizlet() {
    $('#upload').prop('disabled', true)
    createUploadSpinner()

    const quizletURL = "https://i3qcmaxsv6.execute-api.us-west-1.amazonaws.com/default/getQuizlet?url="
    const url = $('#upload').parent().prev().val()

    if (!url.startsWith("https://quizlet.com")) {
        console.log('Bad URL')
        $('#upload').prop('disabled', false)
        removeUploadSpinner()
        return
    }

    const response = await fetch(quizletURL + url, {
        headers: {
            "x-api-key": "wWU4nr8mJF5z1gA554y6l8eugbxhJBrQ6Vtk2bBa"
        }
    })
    const words = await response.json()
    removeUploadSpinner()

    if (words == null || words.length == 0) {
        console.log('Bad URL')
        $('#upload').prop('disabled', false)
        return
    }

    $('#content').find('.card').remove()

    words.forEach(createNewCard)
    $('#content').find('[placeholder=English]').each((i, e) => $(e).val(words[i].english))

    const cards = []
    $('#content').find('.card-body').each((i, e) => {
        cards.push(e)
    })

    Promise.all(cards.map(updateCard)).then(() => {
        $('#content').find('[placeholder=Spanish]').each((i, e) => $(e).val(words[i].spanish))
    })

    $('#upload').prop('disabled', false)
}

async function getTranslation(english) {
    const translationURL = "https://2v9gxi9uc1.execute-api.us-west-1.amazonaws.com/default/getTranslation?text="
    const response = await fetch(translationURL + english, {
        headers: {
            "x-api-key": "i6Oeo7myYb1AOTiOYR2NY9xMgS7Bo6zV484lz9Ya"
        }
    })
    return await response.text()
}

async function getDictionary(word) {
    const dictionaryURL = "https://gdjosxqauk.execute-api.us-west-1.amazonaws.com/default/getDictionary?word="
    word = word.replace(/\bto\b|\[.*\]|\(.*\)/, '').split(/\bor\b|,/)[0]
    const response = await fetch(dictionaryURL + word, {
        headers: {
            "x-api-key": "AtTjaZXXnc33G3ZBX18d6BGEJAkgPhS88YgEAnOj"
        }
    })
    return await response.json()
}

function makeDropdownItem(str) {
    return `<a class="dropdown-item">${str}</a>`
}

function createNewCard() {
    const cardHTML = `
    <div class="card m-3 bg-light">
        <div class="card-body">
            <div class="input-group mb-3">
                <input type="text" class="form-control" placeholder="English">
                <input type="text" class="form-control" placeholder="Spanish">
            </div>
            <div class="input-group mb-3">
                <textarea class="form-control" placeholder="Definition" rows="3"></textarea>
                <div class="input-group-append">
                    <button class="btn dropdown-toggle" type="button" data-toggle="dropdown"></button>
                    <div class="dropdown-menu"></div>
                </div>
            </div>
            <div class="input-group mb-3">
                <textarea class="form-control" placeholder="Sentence" rows="3"></textarea>
                <div class="input-group-append">
                    <button class="btn dropdown-toggle" type="button" data-toggle="dropdown"></button>
                    <div class="dropdown-menu"></div>
                </div>
            </div>
        </div>
    </div>`
    $('#create').before(cardHTML)
    const newCard = $('#content').find('.card-body').last()
    newCard.find('[placeholder=English]').change(() => updateCard(newCard))
    newCard.find('[placeholder=English]').focus()
}

function createProgressBar() {
    const progressBar = `
    <div class="progress w-50 mt-3 mx-auto">
        <div id="progress" class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar"></div>
    </div>`
    $('#content').parent().parent().before(progressBar)
}

function createUploadSpinner() {
    const spinner = `
    <span id="loading" class="spinner-border spinner-border-sm" role="status"></span>`
    $('#upload').find('span').before(spinner)
}

function removeUploadSpinner() {
    $('#loading').remove()
}

function removeProgressBar() {
    $('#progress').parent().remove()
}

function updateTextArea(dropdownItem) {
    const dropdown = $(dropdownItem).parent()
    dropdown.parent().prev().val($(dropdownItem).text())
}