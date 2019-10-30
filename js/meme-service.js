'use strict'

var gFilterBy = 'all';
var gNextId = 1;
var gKeywords = {
    'happy': 12, 'funny': 32, 'animal': 7, 'politician': 3, 'dog': 26, 'cat': 1, 'laugh': 13
};
var gImgs = createImages();
var gMeme = {
    selectedImgId: 1, selectedTxtIdx: 0,
    txts: [{ line: 'I never eat Falafel', font: 'impact', size: 30, align: 'center', color: 'red' },
    { line: 'I never eat Pizza', font: 'impact', size: 30, align: 'center', color: 'red' },
    ]
}
var gEmoji = {
    startIdx: 0,
    emojis: ['😀', '😆', '🙃', '😇', '😍', '🙊', '💥', '🐶']
}
var gTopRated = setTopRated();

function getEmoji() {
    return gEmoji;
}

function createImages() {
    var imgs = [
        createImage(gNextId++, 'img/1.jpg', ['bad', 'politician'], 3),
        createImage(gNextId++, 'img/2.jpg', ['funny', 'laugh'], 5),
        createImage(gNextId++, 'img/3.jpg', ['dance', 'happy'], 5),
        createImage(gNextId++, 'img/4.jpg', ['politician'], 0),
        createImage(gNextId++, 'img/5.jpg', ['success', 'happy'], 10),
        createImage(gNextId++, 'img/6.jpg', ['dog', 'happy', 'animal'], 3),
        createImage(gNextId++, 'img/7.jpg', ['cat', 'happy', 'animal'], 10),
        createImage(gNextId++, 'img/8.jpg', ['happy', 'laugh'], 1),
        createImage(gNextId++, 'img/9.jpg', ['laugh', 'happy'], 0),
        createImage(gNextId++, 'img/10.jpg', ['dog', 'happy', 'animal'], 10),
        createImage(gNextId++, 'img/11.jpg', ['weird'], 10),
        createImage(gNextId++, 'img/12.jpg', ['what', 'hidden'], 2),
        createImage(gNextId++, 'img/13.jpg', ['scream', 'angry'], 14),
        createImage(gNextId++, 'img/14.jpg', ['dance', 'happy', 'laugh'], 2),
        createImage(gNextId++, 'img/15.jpg', ['leo', 'happy', 'drink'], 12),
    ];
    return imgs;
}

function createImage(id, url, keywords, rate) {
    return {
        id: id,
        url: url,
        keywords: keywords,
        rate: rate
    }
}

function getImgs() {
    return gImgs;
}

function getMeme() {
    return gMeme;
}

function getKeywords() {
    return gKeywords;
}

function getTopRated() {
    return gTopRated;
}

function getImgUrl() {
    // debugger;
    let meme = gMeme;
    let img = gImgs.find(img => {
        return img.id === meme.selectedImgId
    })
    return img.url;
}

function setEmojiStart(value) {
    if (value === 'next' && gEmoji.startIdx !== gEmoji.emojis.length - 1) gEmoji.startIdx++;
    if (value === 'prev' && gEmoji.startIdx !== 0) gEmoji.startIdx--;
}

function setText(str) {
    gMeme.txts[gMeme.selectedTxtIdx].line = str;
}

function setFontSize(decision) {
    (decision) ? gMeme.txts[gMeme.selectedTxtIdx].size++ : gMeme.txts[gMeme.selectedTxtIdx].size--;
}

function updateMemeId(id) {
    gMeme.selectedImgId = id;
    saveMemeToStorage();
}

function updateMeme() {
    gMeme = loadMemeFromStorage();
}

function switchLines() {
    (gMeme.selectedTxtIdx === gMeme.txts.length - 1) ? gMeme.selectedTxtIdx = 0 : gMeme.selectedTxtIdx++;
    return gMeme.selectedTxtIdx;
}

function removeLine() {
    gMeme.txts.splice(gMeme.selectedTxtIdx, 1);
}

function alignText(direction) {
    gMeme.txts[gMeme.selectedTxtIdx].align = direction;
}

function setColor(color) {
    gMeme.txts[gMeme.selectedTxtIdx].color = color
}

function addLine(feature) {
    var txtProp = setProp();
    //Initialize basic prop
    var txt = {
        line: feature,
        font: 'impact',
        size: 30,
        align: 'center',
        color: 'black'
    }
    // Initializ the prop which is depends on other lines
    if (txtProp.length !== 0) {
        txt.startPointY = txtProp.startPointY;
        txt.textBaseline = txtProp.textBaseline;
    }
    if (txtProp.decision === 'unshift') gMeme.txts.unshift(txt);
    else gMeme.txts.push(txt)
}

function setProp() {
    // ---- Decision = The way to insert the item to an array --- //
    var canvasHeight = getCanvasSize().height;
    var prop = {};
    if (gMeme.txts.length === 1) {
        if (gMeme.txts[0].startPointY > canvasHeight / 2) {
            prop.startPointY = 0;
            prop.textBaseline = 'top';
            prop.decision = 'unshift';
        } else {
            prop.startPointY = canvasHeight;
            prop.textBaseline = 'bottom';
            prop.decision = 'push';
        }
    }
    return prop;
}

function moveLine(direction) {
    (direction === 'up') ? gMeme.txts[gMeme.selectedTxtIdx].startPointY-- : gMeme.txts[gMeme.selectedTxtIdx].startPointY++;
}

function saveMyMeme(imgContent) {
    var myMemes = loadMyMemesFromStorage();
    if (!myMemes || myMemes.length === 0) {
        var myMemes = [];
        myMemes.push(imgContent);
        saveMyMemesToStorage(myMemes)
    } else {
        myMemes.push(imgContent);
        saveMyMemesToStorage(myMemes)
    }
}

function setFont(font) {
    gMeme.txts[gMeme.selectedTxtIdx].font = font;
}

function saveMyMemesToStorage(myMemes) {
    saveToStorage('My-Memes', myMemes)
}

function loadMyMemesFromStorage() {
    return loadFromStorage('My-Memes');
}

function setFilterBy(filter) {
    filter = filter.toLowerCase();
    (filter) ? gFilterBy = filter : gFilterBy = 'all';
    // gFilterBy = filter ? filter : 'all'
}

function getFilterBy() {
    return gFilterBy;
}

function filterImgs() {
    var str;
    var filterImgs = gImgs.filter((img) => {
        str = img.keywords.join(' ');
        return str.includes(gFilterBy)
    })
    return filterImgs;
}

function setPopularity(name) {
    gKeywords[name]++;
}

function setSelectedTxt(idx) {
    gMeme.selectedTxtIdx = idx;
}


function setTopRated() {
    var topRates = [];
    var rates = gImgs.map(function (img) {
        return {
            rate: img.rate,
            id: img.id
        }
    });
    rates.sort(function (a, b) { return b.rate - a.rate });
    for (let i = 0; i < 6; i++) {
        topRates.push(gImgs[rates[i].id - 1]) //The Id is less 1 because of the diff 
    }                                          // of the array indexs
    return topRates;
}

function createFile(url) {
    var file = createImage(gNextId, url, [], 0);
    updateMemeId(gNextId);
    saveFileToStorage(file);
}

function addUserFile(file){
    gImgs.push(createImage(gNextId++,file.url,[],0));
}

function resetFileStorage(){
    localStorage.removeItem('file');
}

function saveFileToStorage(file) {
    saveToStorage('file', file);
}

function loadFileFromStorage() {
    return loadFromStorage('file');
}




// const MEME_KEY = 'Meme'
function saveMemeToStorage() {
    saveToStorage('Meme', gMeme);
}


function loadMemeFromStorage() {
    return loadFromStorage('Meme');
}