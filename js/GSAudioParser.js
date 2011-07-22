if (typeof gs === "undefined") {
    var gs = {};
}

(function() {

function assert(cond, sum) { if(!cond) throw new Error("AssertError"+(sum ? (": "+sum) : "")); }

// ctor for the GSAudioParser
// takes one argument: a GSFileInterface object

gs.GSAudioParser = function(fileObj) {
    if (!(this instanceof gs.GSAudioParser)) {
        throw new Error("GSAudioParser constructor cannot be called as a function.");
    }
    this.file = fileObj;
};

gs.GSAudioParser.prototype.hash = function(hashCallback) {

    var file = this.file;

    // TODO implement errbacks

    var BUF = 8192;
    var ID3 = 128;

    function read(offset, num, callback) {
        file.readChunks(offset, offset+num, callback);
    }

    read(0, 3, function(x){
        if ((x[0] === 73) && // I
            (x[1] === 68) && // D
            (x[2] === 51)) { // 3
                read(6, 4, function(x) {
                    size = (x[0] << 21) + (x[1] << 14) + (x[2] << 7) + (x[3]);
                    readGivenStartingByte(size+10);
                });
        }
        else {
            readGivenStartingByte(0);
        }
    });

    var processBuffers; // placeholder; defined later

    function readGivenStartingByte(theByte) {

        var md5 = new MD5Builder();

        function loopingAccumulateBuffers( curByte, fileLength, finalCallback, md5obj) {
            assert(curByte <= fileLength, "curByte > fileLength");

            var maxLen = Math.min(BUF, fileLength-curByte);


            if ( (curByte + BUF) < (fileLength - ID3) ) {

                read(curByte, maxLen, function(data) {
                        md5.update(data);

                        loopingAccumulateBuffers(curByte + BUF, fileLength, finalCallback, md5obj); 
                });

            }

            else {
                finalCallback(md5obj.calc());
            }

        }

        // Initial condition
        loopingAccumulateBuffers(theByte, file.file.size, processBuffers, md5); 
        console.log("start: "+theByte);
    }

    function processBuffers(x) {
        console.log("The hash is "+x);
    }

}

}());
