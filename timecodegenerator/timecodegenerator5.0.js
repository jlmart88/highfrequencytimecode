// Written by Garrett Parrish for MIT Media Lab "Opera of the Future"

desc: Adjustable Frequency Timecode Generator

slider1:18500.0<1,22000,50>milli encoding freq (Hz) 
slider2:500<1,20000,50>milli sweep width (0=narrow, 1=wide)'F Delta'
slider3:19500.0<1,22000,50>second encoding freq (Hz)
slider4:0.001<0,1,0.05>second encoding width (0=narrow, 1=wide)
slider5:30<0.5,60,0.5>fps 'Fm'
slider6:86.132812<2,240,.5>frequency1
slider7:43.066406<1,120,.5>frequency2
slider8:0<0,1,1{normal,notch}>bandpassmode

srate = 44100.0;
@slider
@sample

p += slider6/srate;

//variables
buffercount = floor(p);
sample_count += 1;
pos = sample_count/srate;
m_on = (cos(2*$pi*slider5*pos)+1)/2;
m_fm = cos(2*$pi*slider5*pos);
osc_hi = cos((2.0*$pi*pos)*slider1);
osc_low = cos((2.0*$pi*pos)*slider3);
sweep_dif = slider3 - slider1;
sweep = ((m_on*sweep_dif)+slider1);

//////////////////////////////
///// TIMECODE GENERATOR /////
//////////////////////////////

// mantissa = [0,0,0,0,0,0,0,0] - 8
manBin = 1000; 
manBin[0] = 0;manBin[1] = 0;manBin[2] = 0;manBin[3] = 0;
manBin[4] = 0;manBin[5] = 0;manBin[6] = 0;manBin[7] = 0;

// seconds = [0,0,0,0,0,0,0] - 7
secBin = 1100;
secBin[0] = 0;secBin[1] = 0;secBin[2] = 0;secBin[3] = 0;
secBin[4] = 0;secBin[5] = 0;secBin[6] = 0;

// parity bit =[1] - 1
parityBit = 1200;
parityBit[0] = 1;

//count number of ones in final timestamps -- odd number --> set to one, even number of ones --> set to zero

// minutes = [0,0,0,0,0,0,0] - 7
minBin = 1300;
minBin[0] = 0;minBin[1] = 0;minBin[2] = 0;minBin[3] = 0;
minBin[4] = 0;minBin[5] = 0;minBin[6] = 0;

// reserved bit = [0] - 1
reservedBit = 1400;
reservedBit[0] = 0;

// hours = [0,0,0,0,0,0] - 6
hourBin = 1500;
hourBin[0] = 0;hourBin[1] = 0;hourBin[2] = 0;
hourBin[3] = 0;hourBin[4] = 0;hourBin[5] = 0;

// sync word = [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,1] -16
syncWord = 1600;
syncWord[0] = 0;syncWord[1] = 0;syncWord[2] = 1;syncWord[3] = 1;syncWord[4] = 1;syncWord[5] = 1;
syncWord[6] = 1;syncWord[7] = 1;syncWord[8] = 1;syncWord[9] = 1;syncWord[10] = 1;syncWord[11] = 1;
syncWord[12] = 1;syncWord[13] = 1;syncWord[14] = 0; syncWord[15] = 1;

//timestamp - 46

function assignmentOfTimestamp()
(
timestamp = 1700;
timestamp[0] = manBin[0];timestamp[1] = manBin[1];timestamp[2] = manBin[2];timestamp[3] = manBin[3];
timestamp[4] = manBin[4];timestamp[5] = manBin[5];timestamp[6] = manBin[6];timestamp[7] = manBin[7];

timestamp[8] = secBin[0];timestamp[9] = secBin[1];timestamp[10] = secBin[2];timestamp[11] = secBin[3];
timestamp[12] = secBin[4];timestamp[13] = secBin[5];timestamp[14] = secBin[6];

timestamp[15] = parityBit[0];

timestamp[16] = minBin[0];timestamp[17] = minBin[1];timestamp[18] = minBin[2];timestamp[19] = minBin[3];
timestamp[20] = minBin[4];timestamp[21] = minBin[5];timestamp[22] = minBin[6];

timestamp[23] = reservedBit[0];

timestamp[24] = hourBin[0];timestamp[25] = hourBin[1];timestamp[26] = hourBin[2];
timestamp[27] = hourBin[3];timestamp[28] = hourBin[4];timestamp[29] = hourBin[5];

timestamp[30] = syncWord[0];timestamp[31] = syncWord[1];timestamp[32] = syncWord[2];timestamp[33] = syncWord[3];
timestamp[34] = syncWord[4];timestamp[35] = syncWord[5];timestamp[36] = syncWord[6];timestamp[37] = syncWord[7];
timestamp[38] = syncWord[8];timestamp[39] = syncWord[9];timestamp[40] = syncWord[10];timestamp[41] = syncWord[11];
timestamp[42] = syncWord[12];timestamp[43] = syncWord[13];timestamp[44] = syncWord[14];timestamp[45] = syncWord[15];
);

///// calculate when the timestamp will end and get that time /////

function initializeTimecode()
(
numBits = 46.0;
secPerBit = 1.0/(2.0*slider6); // bits per frame // 30 frames a second
secOfTimecode = (numBits*secPerBit);
);

///// convert to hours, seconds, minutes of file /////

function findTimeData(a)
(
seconds = sample_count/srate + secOfTimecode;
minutes = seconds/60.0;
hours = minutes/60.0;
decimalseconds = (seconds-(floor(seconds)));
mantissa = floor(decimalseconds*100.0);
);

function determineTimestampTime()
(
secondsTS = (floor(seconds + secOfTimecode)%60.0);
minutesTS = (floor(minutes + (secOfTimecode/60.0))%60.0);
hoursTS = (floor(hours + (secOfTimeCode/(60.0*60.0)))%60.0);
mantissaTS = floor(((seconds+secofTimecode)-floor(seconds+secOfTimeCode))*100.0);
);

///// convert integers to binary (decToBin) /////

function decToBinMantissa(decimal)
(
//[80,40,20,10,8,4,2,1]
manWeights = 1800;
manWeights[0] = 80;manWeights[1] = 40;manWeights[2] = 20;manWeights[3] = 10;
manWeights[4] = 8;manWeights[5] = 4;manWeights[6] = 2;manWeights[7] = 1;
iman=0;

while (
(decimal>=manWeights[iman]) ? (decimal-=manWeights[iman];manBin[8-iman] = 1;) : (manBin[8-iman] = 0);
iman+= 1;
iman < 8;
);
);

function decToBinHours(decimal)
(
//[20,10,8,4,2,1]
hourWeights = 1900;
hourWeights[0] = 20;hourWeights[1] = 10;hourWeights[2] = 8;
hourWeights[3] = 4;hourWeights[4] = 2;hourWeights[5] = 1;

ihr=0;
while (
(decimal>=hourWeights[ihr]) ? (decimal-=hourWeights[ihr];hourbin[6-ihr] = 1;) : (hourBin[6-ihr] = 0);
ihr+= 1;
ihr < 6;
);
);

function decToBinMins(decimal)
(
//[40,20,10,8,4,2,1]
minWeights = 2000;
minWeights[0] = 40;minWeights[1] = 20;minWeights[2] = 10;
minWeights[3] = 8;minWeights[4] = 4;minWeights[5] = 2;minWeights[6] = 1;
imin=0;

while (
(decimal>=minWeights[imin]) ? (decimal-=minWeights[i];minBin[7-imin] = 1;) : (minBin[7-imin] = 0);
imin+= 1;
imin < 7;
);
);

function decToBinSecs(decimal)
(
//[40,20,10,8,4,2,1]
secWeights = 2100;
secWeights[0] = 40;secWeights[1] = 20;secWeights[2] = 10;
secWeights[3] = 8;secWeights[4] = 4;secWeights[5] = 2;secWeights[6] = 1;
isec=0;

while (
(decimal>=secWeights[isec]) ? (decimal-=secWeights[isec];secBin[7-isec] = 1;) : (secBin[7-isec] = 0);
isec+= 1;
isec < 7;
);
);

function encodeParityBit()
(
ipar = 0;
evenOrOdd = 0;

while (
evenOrOdd += (timestamp[ipar] == 0) ? 1:0;
ipar += 1;
ipar < 46;
);

//even = 0 // odd = 1
parityBit[0] = ((evenOrOdd%2) == 0) ? 0:1;

);

// set all determined time values to their respective places in their arrays
decToBinMantissa(mantissaTS);
decToBinSecs(secondsTS);
decToBinMins(minutesTS);
decToBinHours(hoursTS);

// encode that out to the wave
(buffercount%numBits == 0) ? (encodeParityBit();findTimeData();initializeTimecode();determineTimestampTime();assignmentOfTimestamp(););

freqswitch = (timestamp[buffercount%numBits] == 1) ? floor(((1.0/(2*slider6))*srate)) : floor(((1.0/(2*slider7))*srate));

//switches betwen two sine waves based on binary data
((sample_count%freqswitch == 0)&&(tracker == 1)) ? (tracker = 0) :(((sample_count%freqswitch == 0) && (tracker == 0)) ? tracker = 1);

spl0 = (osc_hi*tracker+osc_low*(1-tracker))*vol;
spl1 = spl0;

vol = .02;

/////////////////////////////////////
///// END OF TIMECODE GENERATOR /////
/////////////////////////////////////


/////////////////////////////////////
////////// BANDPASS FILTER //////////
/////////////////////////////////////

bandpassFrequency = slider3;
bandpassWidth = .3; 
bandpassWetMix = 0;
bandpassDryMix = 120;
dampening=bandpassWidth*0.999 + 0.001;

c = ( 1 / tan( $pi*bandpassFrequency / srate ) );
a2 = 1 + c*(c+dampening);
fa1 = 2 * (1 - c*c) / a2;
fa0 = (1 + c*(c-dampening)) / a2;
fk = c*dampening / a2;

wetsign=slider8?-1:1;
dry=2 ^ (bandpassDryMix/6); 
wet=2 ^ (bandpassWetMix/6)*wetsign;
lastdamp=dampening;


d0_l = fk*spl0 - (fa1*fd1_l + fa0*fd2_l);
d0_r = fk*spl1 - (fa1*fd1_r + fa0*fd2_r);

/*
spl0 = wet*(d0_l - fd2_l) + dry*spl0;
spl1 = wet*(d0_r - fd2_r) + dry*spl1;
*/

fd2_l = fd1_l;
fd2_r = fd1_r;
fd1_l = d0_l;
fd1_r = d0_r;

/////////////////////////////////////
/////// END OF BANDPASS FILTER //////
/////////////////////////////////////