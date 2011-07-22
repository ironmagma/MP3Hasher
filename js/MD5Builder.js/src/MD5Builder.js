var MD5Builder = (function() {

function assert(x, msg) { if(!x) throw new Error("Assert error" + ((msg !== undefined)?(": "+msg):"")); }

var BUFFER_SIZE = 8192;

function MemBuffer() {
   if(!(this instanceof MemBuffer)) throw new ValueError("MemBuffer constructor mustn't be called as function.");
   if (typeof Uint8Array !== "undefined")  {
      this.buf = new Uint8Array(BUFFER_SIZE);
   }
   else {
      this.buf = new Array();
   }
   this.size = 0;
}

MemBuffer.prototype.empty = function() {
   this.size = 0;
};

MemBuffer.prototype.getElem = function(i) {
   return this.buf[i];
};

MemBuffer.prototype.setElem = function(i, v) {
   assert(i < this.buf.size, "Buffer index out of bounds.");
   this.buf[i] = v;
};

MemBuffer.prototype.append = function(v, offset) {
   offset = offset || 0;
   assert(v.length-offset <= BUFFER_SIZE, "Adding beyond");

   var getElem;

   if (v.getElem) {
      getElem = function(x) {return v.getElem(x);}
   }
   else {
      getElem = function(x) {return v[x];}
   }

   var initialSize = this.size;

   for (var i = 0; i < v.length - offset; i++) {
      this.buf[initialSize + i] = getElem(offset+i);
      this.size++;
   }

};

MemBuffer.prototype.setBufferValue = function(arr, offset) {
   this.empty();
   this.append(arr, offset);
};

MemBuffer.prototype.toString = function() {
   var ret = "[";
   for (var i = 0; i < this.size; i++) {
      ret += this.buf[i] + ", ";
   }
   if ( ret !== "[" ) {
      ret = ret.substring(0, ret.length-2);
   }
   ret += "]";
   return ret;
};

function MD5Builder() {
   this.abcd_start = [
      1732584193,
      -271733879,
      -1732584194,
      271733878
   ];
   this.totalLen = 0;
   this.bigBuf = new MemBuffer();
}

MD5Builder.prototype.update = function(bytearr) {
   if (typeof bytearr === "number") {
      bytearr = [bytearr];
   }
   else if (typeof ArrayBuffer !== "undefined" && bytearr instanceof ArrayBuffer) {
      bytearr = new Uint8Array(bytearr);
   }
   else if (typeof bytearr === "string") {
      // Turn a string into a list of characters
      if (typeof Uint8Array !== "undefined") {
         var myarr = new Uint8Array(bytearr.length);
      }
      else {
         var myarr = [];
      }
      for (var i = 0;i < bytearr.length;i++) {
         myarr[i]=bytearr.charCodeAt(i);
      }
      bytearr = myarr;
   }


   var catted = new KittyArray(this.bigBuf, bytearr);
   var chunksProcessed = 0;
   while (catted.length-chunksProcessed*BUFFER_SIZE > BUFFER_SIZE) {
      this._process(catted, chunksProcessed*BUFFER_SIZE, BUFFER_SIZE);
      chunksProcessed++;
   }
   if (chunksProcessed > 0) {
      var bytesToStore = catted.length-chunksProcessed*BUFFER_SIZE;
      this.bigBuf.setBufferValue(catted, chunksProcessed*BUFFER_SIZE);
   }
   else {
      this.bigBuf.append(bytearr);
   }
}

MD5Builder.prototype._process = function(byteArr, offset, numBytes, isThisTheFinalCalc) {

   var getElem, appendPadding;
      
   if (numBytes === BUFFER_SIZE && !isThisTheFinalCalc) {
      appendPadding = false;
   }
   else {
      appendPadding = true;
   }

   if (byteArr.getElem) {
      getElem = function(x) {return byteArr.getElem(x);}
   }
   else {
      getElem = function(x) {return byteArr[x];}
   }



   var bin = [];

   for(var j = 0; j < numBytes * 8; j+=8) {
      bin[j>>5] |= (getElem(offset+(j>>3)) & 0xff) << (j%32);
   }



   if (!appendPadding) {
      assert(numBytes === BUFFER_SIZE, "Numbytes != BUFFER_SIZE and no padding");
      this.totalLen += numBytes;
      return this.abcd_start = core_md5_ex(bin, numBytes*8, this.abcd_start, appendPadding, this.totalLen);
   }
   else {
      var totalLen = this.totalLen + numBytes;
      return core_md5_ex(bin, numBytes*8, this.abcd_start, appendPadding, totalLen);
   }

};


MD5Builder.prototype.calc = function() {
   if (this.bigBuf.size > 0) {
      return binl2hex(this._process(this.bigBuf, 0, this.bigBuf.size, true));
   }
   else {
      return binl2hex(this._process([], 0, 0, true));
   }
};


function KittyArray(buf, arr) { // simulates the buffer catted to the array

   if(!(this instanceof KittyArray)) throw new ValueError("KittyArray constructor mustn't be called as function.");

   if(typeof ArrayBuffer !== 'undefined' && arr.constructor === ArrayBuffer) {
      arr = new Uint8Array(arr);
   }

   this.buf = buf;
   this.arr = arr; 

   // cached lengths
   this.bufLen = buf.size;
   this.arrLen = arr.length; 
   this.length = this.bufLen+this.arrLen;
}

KittyArray.prototype.getElem = function (i) {
   if (i < this.bufLen) return this.buf.getElem(i);
   return this.arr[i-this.bufLen];
};


return MD5Builder;

}());
