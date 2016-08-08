!function(){
  Number.prototype.hex8 = function(){
    return (this + 0x200000000).toString(16).substr(1); // convert an integer into 8bits-hex
  };
  
  function crc32(mask){ // crc32
    if(!(this instanceof crc32))
      return new crc32(mask);
  
    mask || (mask = 0xEDB88320); // IEEE 802.3
    var crcTable = new Array(256);
  
    var c;
    for(var n = 0; n < 256; crcTable[n] = c, n++)
      for(c = n, k = 0; k < 8; k++)
        c = (c & 1) ? mask ^ (c >>> 1) : c >>> 1;
  
    function update(crc, data){
      var len = data.length;
      for(var n = 0; n < len; n++)
        crc = crcTable[(crc ^ data[n]) & 0xFF] ^ (crc >>> 8);
  
      return crc;
    }
    this.update = update;
  }
  crc32.prototype.crcFinal = function(data, crc){
    return this.update(crc, data) ^ crc;
  };
  crc32.prototype.crcDef = function(data){
    return this.crcFinal(data, 0xFFFFFFFF);
  };
  this.crc32 = crc32;

  var secretCode = {}, minLen = Math.min(), maxLen = 0;
  function addCode(mc, l, v){
    var coll;
    coll = secretCode[l] || (secretCode[l] = {});
    coll[mc] = v;

    if(!isNaN(l)){
      if(l < minLen)
        minLen = l;
      if(l > maxLen)
        maxLen = l;
    }
  }

  var inputCode = [], len, crc = new crc32, crcInit = 0xFFFFFFFF; // change the crcInit to another 32-bits integer if you would like to
  function userInput(key){
    if(key == 27){
      inputCode.length = 0;
      return;
    } // esc
    inputCode.push(key);
    len = inputCode.length;
    if(len < minLen) // keys user pressed less than the shortest secret code has
      return;
    while(len > maxLen) // too many input data, cut it down
      inputCode.shift(), len--;

    var code = [0].concat(inputCode), coll; // wasting one array element, but makes the logic clearly
    for(var i = len; i >= minLen; i--){
      code.shift(); // or you want an "if" here? no
      if(coll = secretCode[i]){ // if there is a secret code with this length...
        var shortCode = crc.crcFinal(code, crcInit).hex8();
        if(shortCode in coll) // and we are sure it matches user input
          this.eggIsFound && eggIsFound(shortCode, code, coll[shortCode]); // then we just pass everything we know to the callback function
          // you can change the callback's name if you know how to do
      }
    }
  }

  // change "omgKeyPressed" or "iCanSeeAnEgg" to something else if you wish
  this.omgKeyPressed = userInput;
  this.iCanSeeAnEgg = addCode;
}();
