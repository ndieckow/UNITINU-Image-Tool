var MAX = 600;

var orgCanvas = document.getElementById("orgCanvas");
var orgContext = orgCanvas.getContext("2d");

var mirCanvas = document.getElementById("mirCanvas");
var mirContext = mirCanvas.getContext("2d");

var uploadBtn = document.getElementById("uploadBtn");
var imgSelect = document.getElementById("imgSelect");
var lrToggle = document.getElementById("lrToggle");
var percSlider = document.getElementById("percSlider");

var downloadBtn = document.getElementById("downloadBtn");
var download3in1Btn = document.getElementById("download3in1Btn");
var dropZone = document.getElementById("dropZone");

var empty = true;
var img;
var filename;
var perc;
var uWidth;
var uHeight;

function initImage(evt) {
    if (evt.type == "drop") {
        evt.stopPropagation();
        evt.preventDefault();
        dropZone.style.border = "2px dashed #bbb";
    }

    //var imgPath = imgSelect.value;
    var file;

    if (evt.type == "drop") {
        file = evt.dataTransfer.files[0];
        if (file === undefined) {
            dropZone.style.border = "2px solid #e53939";
            window.setTimeout(function() {
                dropZone.style.border = "2px dashed #bbb";
            }, 2000);
            return;
            /*onlineDrop = true;

            var html = evt.dataTransfer.getData("text/html");
            var template = document.createElement("template");
            html = html.trim();
            template.innerHTML = html;

            fetch(template.content.firstChild.src, { mode: 'no-cors' })
                .then(res => res.blob())
                .then(blob => {
                    reader.readAsDataURL(blob);
                });

            img = new Image();
            img.src = template.content.firstChild.src;
            img.src = img.src + "?" + new Date().getTime();
            img.crossOrigin = null;
            img.onload = loadImage;*/
        }
    } else {
        file = evt.target.files[0];
    }

    filename = file.name;
    var reader = new FileReader();

    reader.onload = (function(e) {
        img = new Image();
        img.src = reader.result;
        img.onload = loadImage;
    });

    reader.readAsDataURL(file);
    empty = false;
    percSlider.value = 500;
}

function loadImage() {
    var maxHeight = document.body.clientHeight - 350;

    if (img.width >= img.height) {
        uWidth = img.width > MAX ? MAX : img.width;
        uHeight = uWidth * img.height / img.width;
    } else {
        uHeight = img.height > maxHeight ? maxHeight : img.height;
        uWidth = uHeight * img.width / img.height;
    }

    percSlider.style.width = uWidth + "px";
    perc = percSlider.value / 1000;
    drawOriginal();
    drawSingleMirrored(mirCanvas, lrToggle.checked, uWidth, uHeight);
};

function drawSingleMirrored(canvas, direction, width, height) {
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (direction == false || direction == 0) {
        // left side
        canvas.width = width * perc * 2;
        canvas.height = height;
        ctx.drawImage(img,
            0, 0,
            img.width * perc, img.height,
            0, 0,
            canvas.width / 2, canvas.height);

        ctx.scale(-1, 1);
        ctx.drawImage(img,
            0, 0,
            img.width * perc, img.height,
            -(canvas.width), 0,
            canvas.width / 2, canvas.height);
    } else if (direction == true || direction == 1) {
        // right side
        canvas.width = width * (1 - perc) * 2;
        canvas.height = width * img.height / img.width;
        ctx.drawImage(img,
            img.width * perc, 0,
            img.width, img.height,
            canvas.width / 2, 0,
            width, canvas.height);

        ctx.scale(-1, 1);
        ctx.drawImage(img,
            img.width * perc, 0,
            img.width, img.height,
            -(canvas.width / 2), 0,
            width, canvas.height);
    }
}

function drawOriginal() {
    // draw the image
    orgContext.clearRect(0, 0, orgCanvas.width, orgCanvas.height);
    orgCanvas.width = uWidth;
    orgCanvas.height = uHeight;
    orgContext.drawImage(img, 0, 0, orgCanvas.width, orgCanvas.height);

    // Draw mirror line
    orgContext.strokeStyle = "#edf7ff";
    orgContext.lineWidth = 2;
    orgContext.shadowBlur = 10;
    orgContext.shadowColor = "#75a1c4";
    orgContext.beginPath();
    orgContext.moveTo(orgCanvas.width * perc, 0);
    orgContext.lineTo(orgCanvas.width * perc, orgCanvas.height);
    orgContext.stroke();
}

function downloadImage() {
    if (empty) return;

    img.setAttribute('crossOrigin', 'anonymous');
    var dlCanvas = document.createElement("canvas");
    drawSingleMirrored(dlCanvas, lrToggle.checked, img.width, img.height);

    var dl = dlCanvas.toDataURL();
    downloadURI(URL.createObjectURL(dataURIToBlob(dl)), "UNITINU_" + filename);
    delete dlCanvas;
}

function download3in1() {
    if (empty) return;

    var stitchCanvas = document.createElement("canvas"); // create temporary, invisible canvas
    stitchCanvas.height = img.height;
    stitchCanvas.width = img.width * 3;

    var ctx = stitchCanvas.getContext("2d");

    ctx.drawImage(img,
        0, 0,
        img.width * perc, img.height,
        0, 0,
        img.width * perc, img.height);

    ctx.drawImage(img, img.width * perc * 2, 0);

    ctx.drawImage(img,
        img.width * perc, 0,
        img.width, img.height,
        stitchCanvas.width - img.width * (1 - perc), 0,
        img.width, img.height);

    ctx.scale(-1, 1);

    ctx.drawImage(img,
        0, 0,
        img.width * perc, img.height,
        -(img.width * perc * 2), 0,
        img.width * perc, img.height);

    ctx.drawImage(img,
        img.width * perc, 0,
        img.width, img.height,
        -(stitchCanvas.width - img.width * (1 - perc)), 0,
        img.width, img.height);

    var dl = stitchCanvas.toDataURL();

    downloadURI(URL.createObjectURL(dataURIToBlob(dl)), "UNITINU_" + filename);
}

function downloadURI(uri, name) {
    var link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    delete link;
}

function dataURIToBlob(dataURI) {
    var binStr  = atob(dataURI.split(',')[1]),
                len = binStr.length,
                arr = new Uint8Array(len),
                mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

    for (var i = 0; i < len; i++) {
        arr[i] = binStr.charCodeAt(i);
    }

    return new Blob([arr], {
        type: mimeString
    });
}

var ignore = false;

function highlightDropZone(e) {
    if (e.target == document.getElementById("selectBtn")) {
        ignore = true;
    } else {
        dropZone.style.border = "2px solid #2196F3";
    }
}

function handleDropZone(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy';
}

function restoreDropZone(e) {
    if (ignore) {
        ignore = false;
    } else if (e.target != document.getElementById("selectBtn")) {
        dropZone.style.border = "2px dashed #bbb";
    }
}

imgSelect.addEventListener("change", initImage);
lrToggle.addEventListener("change", function() {
    if (empty) return;
    drawSingleMirrored(mirCanvas, lrToggle.checked, uWidth, uHeight);
} );
percSlider.addEventListener("input", function() {
    if (empty) return;
    perc = percSlider.value / 1000;
    drawOriginal();
    drawSingleMirrored(mirCanvas, lrToggle.checked, uWidth, uHeight);
} );
downloadBtn.addEventListener("click", downloadImage);
download3in1Btn.addEventListener("click", download3in1);

dropZone.addEventListener("dragenter", highlightDropZone);
dropZone.addEventListener("dragover", handleDropZone);
dropZone.addEventListener("dragleave", restoreDropZone);
dropZone.addEventListener("drop", initImage);