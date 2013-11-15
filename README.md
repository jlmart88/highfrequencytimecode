highfrequencytimecode
=====================

High-Frequency Modulation Timecode Project for the Opera of the Future Lab

Authors: Justin Martinez, Garrett Parrish

Goal
=====================
The goal is to create a new timecode protocol, through the use of a high-frequency modulation signal. The idea is for this signal to exist above the range of human hearing, yet within the range of sampled audio. This will allow an encoded audio file to both be processed for data, as well as listened to without hearing the timecode interfering with the original file. 

This project encompasses the generation of the timecode (REAPER), the overlaying of it onto an audio file (REAPER), and the processing of a timecode overlaid signal (JavaScript/Node.js).

Timecode Generating
====================
The timecode bit protocol is defined in docs/TimecodeBitProtocol_v1.0.pdf. This file contains the information on bit significance and order, as well as the sync word and parity bits for error detecting/correcting.

The process of high-frequency modulation encoding is described in docs/HFMEncoding.pdf. This file describes the method behind the mapping bits into an audio file, which is the core of this project.

For our purposes, we have created a JS plug-in which will generate the timecode in REAPER. Although other implementations are possible by following the above protocols, creating a JS plugin allowed us to generate and overlay the timecode onto an audio file through the use of REAPER.

Timecode Processing
====================
The process of decoding the timecode is described in docs/HFMDecoding.pdf. This file describes the processing steps that should be taken on an encoded file to retrieve the timecode information.

For our purposes, we have used the Web Audio API[http://www.w3.org/TR/webaudio/] in conjunction with a Node.js server to implement a web page decoder/player. Our future implementations will depend on how successful this webpage is with regards to decoding the audio. 


Currently Known Bugs
===================
The biggest known problem with the project currently is due the inconsistency of our JavaScript implementation in scheduling events. Due to the high speeds at which the audio needs to be analyzed, the Web Audio API needs to perform a FFT every 256 samples. The consequence of this is that the web page player must be the only open web page in the browser to schedule the notes correctly, since it requires as much of the processing power of the web page as possible. 

We have also only tested with .wav files, so are unsure of the behavior after common compression techniques (i.e. .mp3)