if (typeof gs === "undefined") {
    var gs = {};
}

(function() {


// ctor for the GSFileInterface

gs.GSFileInterface = function(fileObj) {
    if (!(this instanceof gs.GSFileInterface)) {
        throw new Error("GSFileInterface constructor cannot be called as a function.");
    }
    if (!gs.GSFileInterface.isSupported) {
        return null;
    }
    this.file = fileObj;
    this.reader = null;
};




// Assign "cross-browser" wrapper methods to the prototype

gs.GSFileInterface.prototype.slice = null;
gs.GSFileInterface.prototype.readChunks = null;

if (
    window.File && 
    window.FileList &&
    window.FileReader &&
    window.Blob
) {

    // Slice

    gs.GSFileInterface.prototype.slice = function(byteOffset, numBytes) {
        if (window.Blob.prototype.mozSlice) {
            return this.file.mozSlice(byteOffset, numBytes);
        }
        if (window.Blob.prototype.webkitSlice) {
            return this.file.webkitSlice(byteOffset, numBytes);
        }
        return this.file.slice(byteOffset, numBytes);
    };


    // Read chunks

    if (window.FileReader.prototype.readAsArrayBuffer) {
        gs.GSFileInterface.prototype.readChunks = function(byteOffset, numBytes, callback) {
            this.reader = new FileReader(this.file);
            var myBlob = this.slice(byteOffset, numBytes);
            var that = this;
            this.reader.onload = function(evt) { callback.apply(that, [new Uint8Array(evt.target.result)]); };
            this.reader.readAsArrayBuffer(myBlob);
        };
    }
    else if (window.FileReader.prototype.readAsBinaryString) {
        gs.GSFileInterface.prototype.readChunks = function(byteOffset, numBytes, callback) {
            this.reader = new FileReader(this.file);
            var myBlob = this.slice(byteOffset, numBytes);

            var that = this;
            this.reader.onload = function(evt) { 
            
                var result = evt.target.result; 

                // Now that we have a binary string, convert it to a buffer-like array
                var buffer = [];
                buffer.byteLength = result.length;

                for ( var i = 0; i < buffer.byteLength; i++ ) {
                    buffer[i] = result.charCodeAt(i);
                }

                callback.apply(that, [buffer]);
            
            };

            this.reader.readAsBinaryString(myBlob);

        };
    }

}

// Provide an .isSupported property (not method!),
// so that one does not have to call 
// the ctor just to find out if the browser
// supports all the APIs.

// We do this by making sure no methods
// have not been defined (i.e. are null)

gs.GSFileInterface.isSupported = function() { 

    for (var method in gs.GSFileInterface.prototype) {
        if (gs.GSFileInterface.prototype.hasOwnProperty(method) && gs.GSFileInterface.prototype[method] === null) {
            return false;
        }
    }
    return true;

}();



}());

