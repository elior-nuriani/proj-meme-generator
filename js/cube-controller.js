'use strict'

var gCubeSide = ['top', 'bottom', 'face1', 'face2', 'face3', 'face4'];

function renderCube() {
    var strHTML = `<div class="cube-container flex row center">`
    var topRateds = getTopRated();
    for (let i = 0; i < 6; i++) {
        var url = topRateds[i].url;
        var id = topRateds[i].id;
        strHTML += `<div class="cube ${gCubeSide[i]}">
                            <a href='meme-editor.html'>
                                  <img src="${url}" alt="" onclick='onUpdateMemeId(${id})'>
                            </a>
                    </div>`
    }
    strHTML += `</div>`
    document.querySelector('.cube-viewport').innerHTML = strHTML;
}