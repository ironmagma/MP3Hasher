if (typeof gs === "undefined") {
    var gs = {};
}

$(document).ready(function(){




var GSFileInterface = gs.GSFileInterface;
var GSAudioParser = gs.GSAudioParser;


// Compatibility check

if (!GSFileInterface.isSupported) {
    alert("Your browser does not support the correct API. Please use the Java version instead."); // TODO make it a real redirect
}




var filefield = $("#files");
var fileDisplayBox = $(".filedisplay");
var fileList = [];


$(".uploadfilesbutton").click(function() {
    filefield.click();
});


function realizeAddedInFileList(howMany) {
    for (var i = fileList.length-howMany; i < fileList.length; i++) {
        var file = fileList[i][0];
        fileDisplayBox.append($("<div>"+file.name+"</div>"));

        var fileinterface = new GSFileInterface(file);
        var parser = new GSAudioParser(fileinterface);
        var t1 = new Date().getTime();
        parser.hash(function(x) { console.log("Hash: "+x); console.log((new Date().getTime()-t1)/1000) });
    }
}


filefield.change(function() {
    var list = this.files;
    var l = list.length;

    for ( var i = 0; i < l; i++) {
        fileList.push([list[i], {}]); // [fileobj, info] , where info will hold things like hash, etc.
    }

    realizeAddedInFileList(l); // l tells how many were added
                                // TODO make it properly handle multiple files
});



});
