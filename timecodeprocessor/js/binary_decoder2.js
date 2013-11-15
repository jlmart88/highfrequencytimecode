Timestamp = function() {
this.manWeights = [80, 40, 20, 10, 8, 4, 2, 1];
this.secWeights = [40, 20, 10, 8, 4, 2, 1];
this.minWeights = [40, 20, 10, 8, 4, 2, 1];
this.hourWeights = [20, 10, 8, 4, 2, 1];
this.syncWord = [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,1];
this.manStart = 0;
this.manEnd = 8;
this.secStart = 8;
this.secEnd = 15;
this.parityBit = 15;
this.minStart = 16;
this.minEnd = 23;
this.hourStart = 24;
this.hourEnd = 30;
this.syncStart = 30;
this.syncEnd = 46;
this.hours = 0;
this.minutes = 0;
this.seconds = 0;
this.mantissa = 0;
this.binary = this.getInitialTimestamp();
};

Timestamp.prototype.string = function() {
    time = this.getTimestamp();
    if(time.hours<10)
    {
        time.hours = "0"+time.hours;
    }
    if(time.minutes<10)
    {
        time.minutes = "0"+time.minutes;
    }
    if(time.seconds<10)
    {
        time.seconds = "0"+time.seconds;
    }
    if(time.mantissa<10)
    {
        time.mantissa = "0"+Math.round(time.mantissa*100);
    }
    else{
        time.mantissa = Math.round(time.mantissa*100);
    }
    return time.hours+':'+time.minutes+':'+time.seconds+'.'+time.mantissa;
},

Timestamp.prototype.decToBin = function(decimal,weights) {
    var out = [];
    for (var i=0; i<weights.length; i++) {
        if (decimal>weights[i]){
        out.push(1);
        decimal-=weights[i];
        }
        else {
            out.push(0);
        }
    }
    out.reverse();
    return out;
},

Timestamp.prototype.binToDec = function(binary,weights) {
    binary.reverse();
    out=0;
    for (var i=0; i<weights.length; i++) {
        out+=binary[i]*weights[i];
    }
    return out;
};

Timestamp.prototype.fixTime = function(hours,minutes,seconds,mantissa) {
    var mantissaTemp = Math.round(mantissa*1000000)/1000000;
    while (mantissaTemp>=100){
        mantissaTemp-=100;
        seconds+=1;
    }
    while (seconds>=60){
        seconds-=60
        minutes+=1
    }
    while (minutes>=60){
        minutes-=60
        hours+=1
    }
    return {'hours':hours,'minutes':minutes,'seconds':seconds,'mantissa':mantissaTemp};
};

Timestamp.prototype.parityFix = function(binary) {
    binary[this.parityBit]=1;
    var onesTotal=0;
    for (var i=0; i<binary.length; i++){
        if (binary[i]==1) {
            onesTotal+=1;
        }
    }
    if (onesTotal%2 == 0){
        return binary;
    }
    binary[this.parityBit]=0;
    return binary;
};

Timestamp.prototype.parityFlag = function(binary) {
    var onesTotal=0;
    for (var i=0; i<binary.length; i++){
        if (binary[i]==1) {
            onesTotal+=1;
        }
    }
    if (onesTotal%2 == 0){
        return false;
    }
    return true;
};

Timestamp.prototype.getInitialTimestamp = function() {
    var man = [0,0,0,0,0,0,0,0];
    var secUnits = [0,0,0,0];
    var secTens = [0,0,0];
    var parityBit = [1];
    var minUnits = [0,0,0,0];
    var minTens = [0,0,0];
    var reservedBit=[0];
    var hourUnits = [0,0,0,0];
    var hourTens = [0,0];
    var syncWord= this.syncWord;
    return man.concat(secUnits,secTens,parityBit,minUnits,minTens,reservedBit,hourUnits,hourTens,syncWord);
};

Timestamp.prototype.setTimestamp = function(hours,minutes,seconds,mantissa) {
    var time = this.fixTime(hours,minutes,seconds,mantissa);
    if (time.hours>29 || time.minutes>59 || time.seconds>59 || time.mantissa>=100 || time.hours<0 || time.minutes<0 || time.seconds<0 || time.mantissa<0){
         alert("Invalid time");
    }
    else {
        this.hours=time.hours;
        this.minutes=time.minutes;
        this.seconds=time.seconds;
        this.mantissa=time.mantissa;
        this.binary=this.getInitialTimestamp();

        var manBin = this.decToBin(this.mantissa, this.manWeights);
        var secBin = this.decToBin(this.seconds, this.secWeights);
        var minBin = this.decToBin(this.minutes, this.minWeights);
        var hourBin = this.decToBin(this.hours, this.hourWeights);
        this.binary.splice.apply(this.binary, [this.manStart,this.manEnd-this.manStart].concat(manBin));
        this.binary.splice.apply(this.binary, [this.secStart,this.secEnd-this.secStart].concat(secBin));
        this.binary.splice.apply(this.binary, [this.minStart,this.minEnd-this.minStart].concat(minBin));
        this.binary.splice.apply(this.binary, [this.hourStart,this.hourEnd-this.hourStart].concat(hourBin));
        this.binary = this.parityFix(this.binary);
        //console.log(this.binary.length);




    }
};

Timestamp.prototype.setTimestampBin = function(binary) {
    var manBin = binary.slice(this.manStart,this.manEnd);
    var secBin = binary.slice(this.secStart, this.secEnd);
    var minBin = binary.slice(this.minStart, this.minEnd);
    var hourBin = binary.slice(this.hourStart, this.hourEnd);
    this.mantissa=this.binToDec(manBin,this.manWeights);
    this.seconds=this.binToDec(secBin,this.secWeights);
    this.minutes=this.binToDec(minBin,this.minWeights);
    this.hours=this.binToDec(hourBin,this.hourWeights);
    this.binary=binary;
};

Timestamp.prototype.getTimestamp = function() {
    return {'hours':this.hours,'minutes':this.minutes,'seconds':this.seconds,'mantissa':this.mantissa};
};

Timestamp.prototype.getTimestampBin = function() {
    return this.binary;
};

Timestamp.prototype.addTime = function(hours,minutes,seconds,mantissa) {
    this.setTimestamp(hours+this.hours,minutes+this.minutes,seconds+this.seconds,mantissa+this.mantissa)
};


TimecodeReader = function() {
    this.currentFrame = [];
    this.buf = 0;
    this.timeSinceSync = 0;
    this.secPerBit = (2.0*256)/44100;
    this.numBits = 46;
    this.currentStateDict = {"Out of Sync":0,"In Sync":1,"Recently Synced":2};
    this.currentStateDictInv = {};
    for (var key in this.currentStateDict) {
        this.currentStateDictInv[this.currentStateDict[key]] = key;
    }
    this.setState("Out of Sync");
    this.lastSyncBin = this.getTimestampBin();
    this.lastSync = this.getTimestamp();
};

TimecodeReader.prototype = new Timestamp();

TimecodeReader.prototype.receiveBit = function(bit) {
    if (bit == 1 || bit == 0) {
        //console.log('here');
        this.currentFrame.push(bit);
        if (this.currentFrame.length>this.numBits) {
            this.buf+=1;
        }
        this.readCurrentFrame();

        if (this.currentState == this.currentStateDict["In Sync"]){
            console.log(this.currentStateDictInv[this.currentState]);
        }
        else{
            this.incrementPredictedTime();
            console.log(this.currentStateDictInv[this.currentState]);
        }
    }
    else {
        //console.log('there');
    }
};

TimecodeReader.prototype.readCurrentFrame = function() {
    console.log(!(this.currentFrame.slice(this.buf+this.syncStart,this.buf+this.syncEnd).compare(this.syncWord)));
    if (this.currentFrame.length<this.numBits){
        this.setState("Out of Sync")
    }
    else if (!(this.currentFrame.slice(this.buf+this.syncStart,this.buf+this.syncEnd).compare(this.syncWord)) || this.parityFlag(this.binary)) {
        if (this.timeSinceSync > this.numBits) {
            this.setState("Out of Sync");
        }
        else {
            this.setState("Recently Synced");
        }
    }
    else {
        this.syncTime(this.currentFrame.slice(this.buf,this.buf+this.numBits));
    }
};

TimecodeReader.prototype.setState = function(state) {
    this.currentState = this.currentStateDict[state];
};

TimecodeReader.prototype.syncTime = function(binary) {

    this.setTimestampBin(binary);
    this.lastSyncBin=this.getTimestampBin();
    this.lastSync = this.getTimestamp();
    this.setState("In Sync");
    this.timeSinceSync=0;
};

TimecodeReader.prototype.incrementPredictedTime = function() {
    this.addTime(0,0,0,100*this.secPerBit);
    this.timeSinceSync+=1;
};


exports.Timestamp= Timestamp;
exports.TimecodeReader=TimecodeReader;


Array.prototype.compare = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time
    if (this.length != array.length)
        return false;

    for (var i = 0; i < this.length; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].compare(array[i]))
                return false;
        }
        else if (this[i] != array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
}










