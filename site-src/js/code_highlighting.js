// Instantiate the date before the document loads
document.getElementById("present-date").innerHTML = Date();

function updatePresentDate() {
    document.getElementById("present-date").innerHTML = Date();
    $('pre code').each(function(i, block) {
        hljs.highlightBlock(block);
    });
}

function getSelectionText() {
    var text = "";
    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
        text = document.selection.createRange().text;
    }
    return text;
}

var presentDateTimer = window.setInterval(updatePresentDate, 1000);
var selectionSafe;

function checkResumeUpdates() {
    console.log("CHECK timer = ", presentDateTimer, " selection text: ", getSelectionText());
    setTimeout(function(){
        checkSelection();
        if(!presentDateTimer && selectionSafe)
        {
            updatePresentDate();
            presentDateTimer = window.setInterval(updatePresentDate, 1000);
            console.log("SETTING NEW INTERVAL", presentDateTimer);
        }
    }, 500);
}

function checkSelection() {
    selectionSafe = !getSelectionText();
}

function stopUpdates() {
    window.clearInterval(presentDateTimer);
    presentDateTimer = null;
    selectionSafe = false;
}

document.addEventListener("selectstart", stopUpdates);
document.onmousedown=stopUpdates;
document.onkeydown=stopUpdates;

// document.addEventListener("selectionchange", checkSelection);
document.onmouseup=checkResumeUpdates;
document.onkeyup=checkResumeUpdates;
