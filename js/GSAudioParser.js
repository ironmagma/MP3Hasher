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
        var fsize = file.file.size;

        // Part 1

        function loopingAccumulateBuffers (curByte) {

            var maxLen = Math.min(BUF, fsize-curByte);

            if ( (curByte + BUF) < (fsize - ID3) ) {
                read(curByte, maxLen, function(data) {
                        md5.update(data);
                        loopingAccumulateBuffers(curByte + BUF, fsize); 
                });
            }
            else {
                readRestOfData(curByte);
            }

        }

        // Part 2

        function readRestOfData (curByte) {
            var numBytesToRead = fsize - curByte - ID3;
            read(curByte, numBytesToRead, function(x) {
                md5.update(x);
                var curByte = fsize-ID3;
                read(curByte, 3, function(x) {
                    if (
                        !(
                            x[0] === 84 && // T
                            x[1] === 65 && // A
                            x[2] === 71    // G
                        )
                    ) {
                        md5.update(x);
                        read(curByte+3, fsize - curByte - 3, function(x) {
                            md5.update(x);
                            hashCallback(md5.calc());
                        });
                    }
                    else {
                        hashCallback(md5.calc());
                    }
                });
            });
        }

        // Initial condition
        loopingAccumulateBuffers(theByte); 
    }

}

}());
