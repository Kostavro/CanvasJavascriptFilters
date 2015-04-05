var canvas;
var context;
var iW = 0; // image width
var iH = 0; // image height
var p1 = 0.99;
var p2 = 0.99;
var p3 = 0.99;
var er = 0; // extra red
var eg = 0; // extra green
var eb = 0; // extra blue
var iBlurRate = 0;
var func = 'color'; // last used function
var valueS = 0;
var valueC = 0;
var imgObj = new Image();
imgObj.src = 'myuploader/canvasimages/testimage.jpg';

window.onload = function() {
    // creating context for original image
    canvasOrig = document.getElementById('orig');
    contextOrig = canvasOrig.getContext('2d');
    
    // drawing original image
    var imgObj = new Image();
    imgObj.onload = function () {
        iW = imgObj.width*0.6; // fitting big images
        iH = imgObj.height*0.6; // without losing proportions 
        canvasOrig.width = iW;
        canvasOrig.height = iH;
        canvas.width = iW;
        canvas.height = iH;
        contextOrig.drawImage(imgObj, 0, 0, iW, iH); // draw the image on the canvas
        context.drawImage(imgObj, 0, 0, iW, iH);
    }
    imgObj.src = 'myuploader/canvasimages/testimage.jpg';

    // creating testing context
    canvas = document.getElementById('panel');
    context = canvas.getContext('2d');
};

function Grayscale() {
    func = 'grayscale'; // last used function
    var imgd = context.getImageData(0, 0, iW, iH);
    var data = imgd.data;
    p1 = 0.3;
    p2 = 0.59;
    p3 = 0.11;
    
    for (var i = 0, n = data.length; i < n; i += 4) {
        var grayscale = data[i] * p1 + data[i+1] * p2 + data[i+2] * p3;
        data[i]   = grayscale + er; 
        data[i+1] = grayscale + eg; 
        data[i+2] = grayscale + eb; 
    }
    context.putImageData(imgd, 0, 0);
}

function Color() {
    func = 'color'; // last used function
    var imgd = contextOrig.getImageData(0, 0, iW, iH);
    var data = imgd.data;

    for (var i = 0, n = data.length; i < n; i += 4) {
        data[i]   = data[i]*p1+er; 
        data[i+1] = data[i+1]*p2+eg; 
        data[i+2] = data[i+2]*p3+eb; 
    }
    context.putImageData(imgd, 0, 0);
}

function Blur() {
    func = 'blur'; // last used function
    var imgd = contextOrig.getImageData(0, 0, iW, iH);
    var data = imgd.data;

    for (br = 0; br < iBlurRate; br += 1) {
        for (var i = 0, n = data.length; i < n; i += 4) {

            iMW = 4 * iW;
            iSumOpacity = iSumRed = iSumGreen = iSumBlue = 0;
            iCnt = 0;

            // data of close pixels (from all 8 surrounding pixels)
            aCloseData = [
                i - iMW - 4, i - iMW, i - iMW + 4, // top pixels
                i - 4, i + 4, // middle pixels
                i + iMW - 4, i + iMW, i + iMW + 4 // bottom pixels
            ];

            // calculating Sum value of all close pixels
            for (e = 0; e < aCloseData.length; e += 1) {
                if (aCloseData[e] >= 0 && aCloseData[e] <= data.length - 3) {
                    iSumOpacity += data[aCloseData[e]];
                    iSumRed += data[aCloseData[e] + 1];
                    iSumGreen += data[aCloseData[e] + 2];
                    iSumBlue += data[aCloseData[e] + 3];
                    iCnt += 1;
                }
            }

            // apply average values
            data[i] = (iSumOpacity / iCnt)*p1+er;
            data[i+1] = (iSumRed / iCnt)*p2+eg;
            data[i+2] = (iSumGreen / iCnt)*p3+eb;
            data[i+3] = (iSumBlue / iCnt);
        }
    }
    context.putImageData(imgd, 0, 0);
}

// use this for light manipulation
function changeGrayValue(val) {
    p1 += val;
    p2 += val;
    p3 += val;

    switch(func) {
        case 'color': Color(); break;
        case 'blur': Blur(); break;
    }
}

// use this for colors manipulation
function changeColorValue(sobj, val) {
    switch (sobj) {
        case 'er': er += val; break;
        case 'eg': eg += val; break;
        case 'eb': eb += val; break;
    }

    switch(func) {
        case 'color': Color(); break;
        case 'blur': Blur(); break;
    }
}

// use this for blur manipulation
function changeBlurValue(val) {
    iBlurRate += val;

    if (iBlurRate <= 0) Color();
    if (iBlurRate > 4) iBlurRate = 4;

    Blur();
}

// use this to reset bottom image
function resetToColor() {
    p1 = 1;
    p2 = 1;
    p3 = 1;
    er = eg = eb = 0;
    iBlurRate = 0;
    valueC = 0;
    valueS = 0;
    valueP = 0;

    Color();
}

function Invert() {
    var imgd = context.getImageData(0, 0, iW, iH);
    var data = imgd.data;
    for (var i = 0, n = data.length; i < n; i += 4) {
        data[i]   = 255 - data[i]; 
        data[i+1] = 255 - data[i+1]; 
        data[i+2] = 255 - data[i+2]; 
    }
    context.putImageData(imgd, 0, 0);
}

function Thresholded() {
    var imgd = context.getImageData(0, 0, iW, iH);
    var data = imgd.data;
    for (var i = 0, n = data.length; i < n; i += 4) {
        var threshold = (0.2126*data[i] + 0.7152*data[i+1] + 0.0722*data[i+2] >= 128) ? 255 : 0;
        data[i]   = threshold; 
        data[i+1] = threshold; 
        data[i+2] = threshold; 
    }
    context.putImageData(imgd, 0, 0);
}

// value is passed from index.html
function changecontrast(value) {
    valueC += value;
    contrast(valueC);
}

function contrast(value) {
    var imgd = contextOrig.getImageData(0, 0, iW, iH);
    var data = imgd.data;
    var factor = (259 * (value + 255)) / (255 * (259 - value));
    for(var i=0;i<data.length;i+=4)
    {
        data[i] = factor * (data[i] - 128) + 128;
        data[i+1] = factor * (data[i+1] - 128) + 128;
        data[i+2] = factor * (data[i+2] - 128) + 128;
    }
    context.putImageData(imgd, 0, 0);
}

// value is passed from index.html
function changesaturation(value) {
    valueS += value;
    saturate(valueS);
}

function saturate(value) {
    var imgd = contextOrig.getImageData(0, 0, iW, iH);
    var data = imgd.data;
    for(var i=0;i<data.length;i+=4)
    {
        var avg = (data[i] + data[i+1] + data[i+2])/3;
        data[i]   = avg + value * (data[i] - avg); 
        data[i+1] = avg + value * (data[i+1] - avg); 
        data[i+2] = avg + value * (data[i+2] - avg);         
    }
    context.putImageData(imgd, 0, 0);
}

function posterize() {
    var imgd = context.getImageData(0, 0, iW, iH);
    var data = imgd.data;
    var valueP = 4; // change this if you want to play around with this function
    var factor = Math.floor(255/valueP);
    for(var i=0;i<data.length;i+=4)
    {
        data[i]   = Math.floor(data[i] / factor) * factor; 
        data[i+1] = Math.floor(data[i+1] / factor) * factor; 
        data[i+2] = Math.floor(data[i+2] / factor) * factor;           
    }
    context.putImageData(imgd, 0, 0);
}

function sepia() {
    var imgd = context.getImageData(0, 0, iW, iH);
    var data = imgd.data;
    for(var i=0;i<data.length;i+=4)
    {
        // these are the "official" sepia values - apply once
        data[i]   = (data[i] * 0.393) + (data[i+2] * 0.769) + (data[i+3] * 0.189); // red
        data[i+1] = (data[i] * 0.349) + (data[i+2] * 0.686) + (data[i+3] * 0.168); // green
        data[i+2] = (data[i] * 0.272) + (data[i+2] * 0.534) + (data[i+3] * 0.131); // blue     
    }
    context.putImageData(imgd, 0, 0);
}

function noise() {
    var imgd = context.getImageData(0, 0, iW, iH);
    var data = imgd.data;

    for (var i = 0, n = data.length; i < n; i += 4) {
        // generating random color coefficients
        var randColor1 = 0.6 + Math.random() * 0.5;
        var randColor2 = 0.6 + Math.random() * 0.5;
        var randColor3 = 0.6 + Math.random() * 0.5;
        // assigning random colors to our data
        data[i] = data[i]*p2*randColor1+er;
        data[i+1] = data[i+1]*p2*randColor2+eg;
        data[i+2] = data[i+2]*p3*randColor3+eb;
    }
    context.putImageData(imgd, 0, 0);
}

function fliph() {
    context.translate(iW, 0);
    context.scale(-1, 1);
    context.drawImage(imgObj, 0, 0, iW, iH); // this will reset previous filters
}

function flipv() {
    context.translate(0, iH);
    context.scale(1, -1);
    context.drawImage(imgObj, 0, 0, iW, iH); // this will reset previous filters
}

// this function shall not be documented, due to its nature and purpose
function trip() { 
    var imgd = context.getImageData(0, 0, iW, iH);
    var data = imgd.data;
    iBlurRate = 1;

    for (br = 0; br < iBlurRate; br += 1) {
        for (var i = 0, n = data.length; i < n; i += 4) {

            iMW = 4 * iW;
            iSumOpacity = iSumRed = iSumGreen = iSumBlue = 0;
            iCnt = 0;

            aCloseData = [i - iMW - 4, i - iMW, i - iMW + 4, i - 4, i + 4, i + iMW - 4, i + iMW, i + iMW + 4];

            for (e = 0; e < aCloseData.length; e += 1) {
                if (aCloseData[e] >= 0 && aCloseData[e] <= data.length - 3) {
                    iSumOpacity += data[aCloseData[e]];
                    iSumRed += data[aCloseData[e] + 22222]*0.9;
                    iSumGreen += data[aCloseData[e] + 222]*0.689;
                    iSumBlue += data[aCloseData[e] + 15522];
                    iCnt += 1;
                }
            }
            data[i+3] = (iSumOpacity / iCnt);
            data[i] = 2*(iSumRed / iCnt)*p1+er*2;
            data[i+1] = 3* (iSumGreen / iCnt)*p2+eg*99;
            data[i+2] = 5*(iSumBlue / iCnt)*p3+eb/22;
        }
    }
    context.putImageData(imgd, 0, 0);
}
