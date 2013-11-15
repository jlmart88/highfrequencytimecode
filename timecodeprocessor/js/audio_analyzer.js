

AudioAnalyzer = function() {
    this.Fs = 44100;
    this.lowFreq = 18500;
    this.highFreq = 19500;
    this.pulseSampleLength = 512;
    this.binary = [];
    this.pulseData = [];
    this.pulseNum = 0;
    this.secPerBit = (2.0*this.pulseSampleLength)/this.Fs;
    this.readingBuff = 0;
    this.storedFreqData = [];
    this.storedTimeData = [];
    this.lastFreqData = [];
    this.currentSample = 0;
    this.threshold = 10;
}

AudioAnalyzer.prototype.readCurrentPulse = function(array) {
    if (this.lastFreqData==array){
        console.log("Read the same exact data twice");
    }
    this.lastFreqData=array;
    this.storedFreqData.push(this.lastFreqData);
    var n = this.lastFreqData.length;
    var k = range(n);
    var frqList = new Uint32Array(k.length);
    for (var i = 0; i < n; i++) {
        frqList[i] = k[i]*this.Fs/(k.length*2);
    }
    //frqList = frqList.slice(0,n/2);
    var maxAmpValue = Math.max.apply(null,this.lastFreqData);
    //var maxAmpIndex = $.inArray(maxAmpValue,this.lastFreqData);
    var maxAmpIndex = this.lastFreqData.indexOf(maxAmpValue);
    var maxFreq = frqList[maxAmpIndex];
    //console.log("Max freq: ", maxFreq, "Max amp: ", maxAmpValue);
    if (maxFreq == 0) {
        console.log("No significant data yet");
    }
    else if (Math.abs(maxFreq-this.highFreq)>Math.abs(maxFreq-this.lowFreq) && maxAmpValue>this.threshold) {
        this.currentSample = this.currentSample + this.pulseSampleLength;
        var result = this.addPulse('low');
    }
    else if (Math.abs(maxFreq-this.highFreq)<Math.abs(maxFreq-this.lowFreq) && maxAmpValue>this.threshold) {
        this.currentSample = this.currentSample + this.pulseSampleLength;
        var result = this.addPulse('high');
    }
    /*
    if (this.pulseNum == 0){
    return this.binary[this.binary.length-1];
    }
    else {
        return null;
    }
    */
    return result
};

AudioAnalyzer.prototype.addPulse = function(pulse) {
    if (this.pulseNum == 0) {
        if (this.pulseData.length!=0) {
            if (this.pulseData[this.pulseData.length-1][1] == pulse) {
                console.error("Read constant when expected shift, adjusting data appropriately");
                //this.shiftPulsesRight(); not yet written, not sure if necessary
                //this.pulseData.push([pulse,'blank']);
                //this.pulseNum = 1;

            }
            else {
                this.pulseData.push([pulse,'blank']);
                this.pulseNum = 1;
            }
        }
        else {
            this.pulseData.push([pulse,'blank']);
            this.pulseNum = 1;
        }
    }
    else if (this.pulseNum == 1){
        this.pulseData[this.pulseData.length-1][1] = pulse;
        this.pulseNum = 0;
        this.updateBinary();
        return this.binary[this.binary.length-1]
    }
    return null
};

AudioAnalyzer.prototype.updateBinary = function() {
    this.binary = [];
    for (var i = 0; i < this.pulseData.length; i++) {
        var bit = this.pulseData[i];
        if (bit[0] == bit[1]){
            this.binary.push(0);

        }
        else{
            this.binary.push(1);

        }
    }
};




//additional functions needed for proper operation
function range(start, stop, step){
    if (typeof stop=='undefined'){
        // one param defined
        stop = start;
        start = 0;
    }
    if (typeof step=='undefined'){
        step = 1;
    }
    if ((step>0 && start>=stop) || (step<0 && start<=stop)){
        return [];
    }
    var result = [];
    for (var i=start; step>0 ? i<stop : i>stop; i+=step){
        result.push(i);
    }
    return result;
}


exports.AudioAnalyzer = AudioAnalyzer;


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