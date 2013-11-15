function AudioAnalyzer() {
    this.Fs = 44100;
    this.lowFreq = 18500;
    this.highFreq = 19500;
    this.pulseSampleLength = 256;
    this.binary = [];
    this.pulseData = [];
    this.pulseNum = 0;
    this.secPerBit = (2.0*this.pulseSampleLength)/this.Fs;
    this.readingBuff = 0;
    this.storedFreqData = [];
    this.lastFreqData = [];
    this.currentSample = 0;
    this.threshold = 10;
}

AudioAnalyzer.prototype.readCurrentPulse = function(array) {
    if (this.lastFreqData==array){
        console.log("Read the same exact data twice");
        return
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
    var maxAmpIndex = $.inArray(maxAmpValue,this.lastFreqData);
    var maxFreq = frqList[maxAmpIndex];
    console.log("Max freq: ", maxFreq, "Max amp: ", maxAmpValue);
    if (maxFreq == 0) {
        console.log("No significant data yet");
    }
    else if (Math.abs(maxFreq-this.highFreq)>Math.abs(maxFreq-this.lowFreq) && maxAmpValue>this.threshold) {
        this.addPulse('low');
        this.currentSample = this.currentSample + this.pulseSampleLength;
    }
    else if (Math.abs(maxFreq-this.highFreq)<Math.abs(maxFreq-this.lowFreq) && maxAmpValue>this.threshold) {
        this.addPulse('high');
        this.currentSample = this.currentSample + this.pulseSampleLength;
    }

};

AudioAnalyzer.prototype.addPulse = function(pulse) {
    if (this.pulseNum == 0) {
        if (this.pulseData.length!=0) {
            if (this.pulseData[this.pulseData.length-1][1] == pulse) {
                console.log("Read constant when expected shift, adjusting data appropriately");
                //this.shiftPulsesRight(); not yet written, not sure if necessary

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
    }
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

