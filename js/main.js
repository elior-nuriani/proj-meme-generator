'use strict'
let gIsClicked = false;
var gCtx;
var gCanvas;
var gDragCurrLine;
var gIsShowRect = true;
var gIsDragging = false;
var gTextCoords = [];
var gCurrCoord = {};
var gIsMoved = false;

// --- Events listeners --- //

function setEventsListener() {

    // gCanvas.addEventListener('dblclick', function (e) {
    //     let coordsIdx = canvasClicked(e.offsetX, e.offsetY);
    //     if (coordsIdx !== -1) setSelectedTxt(coordsIdx);
    // });

    gCanvas.addEventListener("mousedown", function (e) {
        let coordsIdx = canvasClicked(e.offsetX, e.offsetY)
        gCanvas.onmousemove = function (e) {
            gCurrCoord = { x: e.offsetX, y: e.offsetY }
            if (coordsIdx !== -1) {
                gDragCurrLine = coordsIdx;
                gIsDragging = true;
                renderCanvas();
            }
        }
    }); gCanvas.addEventListener("mouseup", function (e) {
        gIsDragging = false;
        renderCanvas();
        gCanvas.onmousemove = null
    });
}


function canvasClicked(x, y) {
    let clickedcoord = gTextCoords.findIndex(coord => {
        return (
            x > coord.x &&
            y > coord.y &&
            x < coord.xEnd &&
            y < coord.yEnd
        )
    })
    return clickedcoord;
}

// --- Init Functions --- //
function onInitHomePage() {
    renderHeaderAndFooter();
    renderGallery();
    renderKeywords();
    setTopRated();
    renderCube();
}

function onInitEditor() {
    renderHeaderAndFooter();
    renderEmoji();
    updateMeme()
    initCanvas();
    initEventsListner();
}

function onInitMyMemes() {
    renderHeaderAndFooter();
    renderMyMemes();
}

function initEventsListner() {
    setTimeout(setEventsListener, 1000);
}

function initCanvas() {
    gCanvas = document.querySelector('.img-canvas');
    gCtx = gCanvas.getContext('2d');
    resizeCanvas();
    renderCanvas();
}

function resizeCanvas(){
    var elContainer = document.querySelector('.img-canvas');
    gCanvas.width = elContainer.offsetWidth;
    gCanvas.height = elContainer.offsetHeight;
}

//---Render Functions---//

function renderCanvas() {
    var file = loadFileFromStorage();
    if (file) {
        addUserFile(file);
    }
    var url = getImgUrl();
    var img = new Image();
    img.onload = function () {
        clearCoords();
        resizeCanvas();
        gCtx.drawImage(img, 0, 0, gCanvas.width, gCanvas.height);
        renderText();
    };
    img.src = url;
}

function renderHeaderAndFooter() {
    renderHeader();
    renderFooter();
}

function renderText() {
    var meme = getMeme();
    var txts = meme.txts;
    var idx = meme.selectedTxtIdx;
    var x, y;
    var textBaseline;

    txts.forEach((txt) => {
        if (txt.startPointY === 0 || txt.startPointY) y = txt.startPointY;
        else {
            if (idx === 0) {
                y = 0;
                textBaseline = 'top';
            }
            if (idx === 1) {
                y = gCanvas.height;
                textBaseline = 'bottom'
            }
            if (idx > 1) {
                y = gCanvas.height / 2;
                textBaseline = 'middle'
            }
            txt.textBaseline = textBaseline;
            txt.startPointY = y;
        }

        if (idx === gDragCurrLine && gIsDragging || gIsMoved) {
            x = gCurrCoord.x;
            y = gCurrCoord.y;
            txt.startPointY = y;
            txt.startPointX = x;
        } else {
            x = gCanvas.width / 2;
            if (txt.startPointX) x = txt.startPointX;
        }
        idx++;
        drawText(txt.line, x, y, txt.size, txt.font, txt.color, txt.textBaseline,
            txt.align);
    })
}

function renderGallery() {
    var strHTMLs;
    var memeImgs;
    var filter = getFilterBy();
    (filter.toLowerCase() === 'all') ? memeImgs = getImgs() : memeImgs = filterImgs();
    if (memeImgs.length !== 0) {
        strHTMLs = memeImgs.map(img => {
            return `<div class="card">
                    <a href='meme-editor.html'>
                        <img src='${img.url}' alt='Img Not Available'
                             onclick='onUpdateMemeId(${img.id})'/> 
                     </a></div>`
        })
        document.querySelector('.cards-container').innerHTML = strHTMLs.join(' ');
    }
    else {
        document.querySelector('.cards-container').innerHTML = `<span class="no-img animated shake ">
                                                                 No Images Avaliable 😬
                                                                 </span> `
    }
}

function renderKeywords() {
    var strHTML = '';
    var keyWordMap = getKeywords();
    var key;
    for (key in keyWordMap) {
        strHTML += `<span data-name="${key}" onclick="onSetPopularity(event,'${key}')">${key + ' '}</span>`
    }
    document.querySelector('.keyword-words').innerHTML = strHTML;

    for (key in keyWordMap) {
        var fontSize = findFontSize(keyWordMap[key]);
        var el = `[data-name="${key}"]`;
        document.querySelector(el).style.fontSize = fontSize + 'px';
    }
}

function renderHeader() {
    var strHTML = `<div class="main-content-header flex row space-between align-center container">
                      <div class="logo">Meme World</div>
                      <button class="menu-btn" onclick="toggleMenu()">☰</button>
                      <ul class="main-nav flex clean-list">
                          <li><a href="index.html">Gallery</a></li>
                          <li><a href="memes.html">Memes</a></li>
                       <li><a href="#">About</a></li>
                     </ul>
                </div>`
    document.querySelector('header').innerHTML = strHTML;
}

function renderFooter() {
    var strHTML = ` <div class="footer flex column align-center contanier">
                        <div class="logo">
                          Meme World
                        </div>
                        © 2019 All Rights Reserved
                        <div class="flex row flex-center ">
                             <i class="fab fa-facebook-square fa-3x media-icon"></i>
                             <i class="fab fa-twitter-square fa-3x media-icon"></i>
                             <i class="fab fa-behance-square fa-3x media-icon"></i>
                             <i class="fab fa-whatsapp-square fa-3x media-icon"></i>
                        </div>
                </div>`;
    document.querySelector('footer').innerHTML = strHTML;
}

function renderMyMemes() {
    var memes = loadMyMemesFromStorage();
    var strHTMLs;
    if (memes && memes.length !== 0) {
        strHTMLs = memes.map((img) => {
            return `<div class="card">
            <img src="${img}" >
                    </div>`
        })
        document.querySelector('.memes-container').innerHTML = strHTMLs;
    }
}

function renderEmoji() {
    var emojiObj = getEmoji();
    var emojis = emojiObj.emojis.slice(emojiObj.startIdx, emojiObj.startIdx + 3);
    var strHTMLs = emojis.map((emoji) => {
        return `<div class="emoji" onclick="onAddLine('emoji',this)">
                    ${emoji}
                </div>`
    })
    document.querySelector('.emoji-container').innerHTML = strHTMLs.join(' ');
}


// --- General functions --- //

function getCanvasSize() {
    return { width: gCanvas.width, height: gCanvas.height }
}

function clearCoords() {
    gTextCoords = [];
}

function drawText(text, centerX, centerY, fontsize, fontStyle, fontColor, baseLine, align) {
    gCtx.font = fontsize + 'px ' + fontStyle;
    gCtx.textAlign = align;
    gCtx.textBaseline = baseLine;
    gCtx.fillStyle = fontColor;
    gCtx.fillText(text, centerX, centerY, gCanvas.width);
    drawRect(centerY, fontsize, baseLine);
}

function drawRect(y, font, baseLine) {
    if (baseLine === 'bottom') y -= font;
    if (baseLine === 'middle') y -= font / 2;

    (gIsShowRect) ? gCtx.fillStyle = "rgba(0, 0, 0, 0.3)" : gCtx.fillStyle = "rgba(0, 0, 0, 0)";
    gCtx.fillRect(0, y, gCanvas.width, font);
    setCoords(y, font);
}

function setCoords(y, font) {
    var coord = {
        x: 0,
        y: y,
        xEnd: gCanvas.width,
        yEnd: font + y
    }
    gTextCoords.push(coord);
}

function findFontSize(num) {
    if (num >= 1 && num <= 5) return 15;
    if (num > 5 && num <= 10) return 25;
    if (num > 10 && num <= 15) return (16 + num);
    if (num > 15 && num <= 20) return 35;
    if (num > 20) return 40;
}

function onUpdateMemeId(id) {

    updateMemeId(id);
}

function onSetText(input) {
    var inputText = document.querySelector(`.${input} `).value;
    setText(inputText)
    renderCanvas();
}

//Decision as a number - true or false
function onSetFontSize(decision) {
    setFontSize(decision);
    renderCanvas();
}

function onSwitchLines() {
    switchLines();
    renderCanvas();
}

function onRemoveLine() {
    removeLine();
    renderCanvas();
}

function onAddLine(feature, elFeature) {
    var line;
    if (feature === 'line') line = document.querySelector('.add input').value;
    else line = elFeature.innerText;
    if (!line) return;
    addLine(line);
    renderCanvas();
}

function onDownloadImg(elLink) {
    var imgContent = gCanvas.toDataURL();

    elLink.href = imgContent;
}

function onAlignText(direction) {
    alignText(direction);
    renderCanvas();
}

function onSetColor() {
    var color = document.querySelector('[type=color]').value;
    setColor(color);
    renderCanvas();
}

function onSaveMyMeme() {
    var imgContent = gCanvas.toDataURL();
    saveMyMeme(imgContent);
}

function onMoveLine(direction) {
    moveLine(direction);
    renderCanvas();
}

function onChangeFont() {
    var font = document.querySelector('select').value;
    setFont(font);
    renderCanvas();
}

function onToggleRect() {
    if (gIsShowRect) {
        gIsShowRect = false;
        renderCanvas();
    } else {
        gIsShowRect = true;
        renderCanvas();
    }
}

function toggleMenu() {
    document.body.classList.toggle('open-menu');
    var elMenuBtn = document.querySelector('.menu-btn');
    var elCube = document.querySelector('.cube-viewport');
    if (gIsClicked) {
        gIsClicked = false;
        elMenuBtn.innerText = '☰'
        elCube.classList.remove('none');
    } else {
        gIsClicked = true;
        elMenuBtn.innerText = '✖️'
        elCube.classList.add('none');
    }
}

function onSetFilter(filter) {
    setFilterBy(filter)
    renderGallery();
}

function onShowMore() {
    document.querySelector('.keyword-container').classList.toggle('show-keyword-container')
    document.querySelector('.keyword-words').classList.toggle('show-keyword-box');
}

function onSetPopularity(e, name) {
    e.stopPropagation();
    setPopularity(name);
    renderKeywords();
}

function onSetEmojiStart(value) {
    setEmojiStart(value);
    renderEmoji();
}

function onImgInput(ev) {
    loadImageFromInput(ev, renderFile)
}

function loadImageFromInput(ev, renderFile) {
    var reader = new FileReader();
    reader.onload = function (event) {
        var img = new Image();
        img.onload = renderFile.bind(null, img)
        img.src = event.target.result;
    }
    reader.readAsDataURL(ev.target.files[0]);
}

function renderFile(img) {
    var elUserFile = document.querySelector('.file-container');
    elUserFile.innerHTML = `<a href="meme-editor.html#">
                             <img src="${img.src}" onclick="onCreateFile('${img.src}')" />
                           </a>` ;
}

function onCreateFile(url) {
    createFile(url);
}

// on submit call to this function
function uploadImg(elForm, ev) {
    ev.preventDefault();
    document.querySelector('.share').value = gCanvas.toDataURL("image/jpeg");
    // A function to be called if request succeeds
    function onSuccess(uploadedImgUrl) {
        uploadedImgUrl = encodeURIComponent(uploadedImgUrl)
        document.querySelector('.share').innerHTML = `
        <a class="w-inline-block social-share-btn btn fb" href="https://www.facebook.com/sharer/sharer.php?u=${uploadedImgUrl}&t=${uploadedImgUrl}" title="Share on Facebook" target="_blank" onclick="window.open('https://www.facebook.com/sharer/sharer.php?u=${uploadedImgUrl}&t=${uploadedImgUrl}'); return false;">
            <i class="fab fa-facebook fa-2x"></i>  
        </a>`
    }
    doUploadImg(elForm, onSuccess);
}

function doUploadImg(elForm, onSuccess) {
    var formData = new FormData(elForm);

    fetch('http://ca-upload.com/here/upload.php', {
        method: 'POST',
        body: formData
    })
        .then(function (response) {
            return response.text()
        })

        .then(onSuccess)
        .catch(function (error) {
            console.error(error)
        })
}
