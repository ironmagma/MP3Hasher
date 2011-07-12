if (typeof gs === "undefined") {
    var gs = {};
}

(function() {


// ctor for the GSAudioParser
// takes one argument: a GSFileInterface object

gs.GSAudioParser = function(fileObj) {
    if (!(this instanceof gs.GSAudioParser)) {
        throw new Error("GSAudioParser constructor cannot be called as a function.");
    }
    this.file = fileObj;
};

gs.GSAudioParser.prototype.hash = function(hashCallback) {

    var off = 0; 
    var file = this.file;

    //function readChunksLikeJava(skip, length, callback) {
    //    file.readChunks(currentOffset, currentOffset+length, callback);
    //    currentOffset += length;
    //}

    // TODO implement errbacks

    //var buf = 8192;
    //var id3 = 128;


    function read(num, callback) {
        file.readChunks(off, off+num, callback);
        off += num;
    }
    function skip(num) {
        off += num;
    }

    read(3, function(x){
        if ((x[0] === 73) && // I
            (x[1] === 68) && // D
            (x[2] === 51)) { // 3
                skip(3);
                read(4, function(x) {
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
        function loopingAccumulateBuffers( curByte, fileLength, finalCallback, listOfArrayBuffers) {
            if (curByte === fileLength) {
                alert("Reached end of file");
                return;
            }
            else if (curByte > fileLength) {
                alert("Oh no... curByte > fileLength"); // TODO
                return;
            }

            read()

        }

        // Initial condition
        loopingAccumulateBuffers(0, file.size, processBuffers, []); 
    }

    function processBuffers() {
        alert("All buffers have been processed! :)");
    }

}

}());
