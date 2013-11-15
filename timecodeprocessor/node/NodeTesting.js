/* TODO:
Comment code and clean up cruft

Document the demo process

Figure out how to reset the server on a page refresh (perhaps have the page send a XML request with a specific
 initial header?)

Work in Error-Correction:
    Smoothing what is sent to browser
    Tracking and recognizing laggy states
    Clean up how the data is sent to browser (i.e. send as JSON, Object, etc. ?)

See if we can eliminate the need for the browser??? (unlikely, would require alot of work)
    Find out how to tell Node.js to listen to a stream
    Implement the fourier analysis in Node.js (is now currently being performed by Web Audio API in browser)
 */



var http = require('http');
var sys = require('sys');
var m3u8 = require('m3u8');
var fs = require('fs');
var timecode = require('../js/binary_decoder2.js');
var analyzer = require('../js/audio_analyzer.js');
var jDataView = require('jdataview');
//var $ = require('jquery');

var timecodeReader = new timecode.TimecodeReader;
var audioAnalyzer = new analyzer.AudioAnalyzer;

http.createServer(function(request,response){
    //sys.puts("I got kicked");
    //console.dir(request.param);
    //console.log(request);

    if (request.method == 'POST') {
        console.log("POST");
        var body = '';
        request.on('data', function (data) {
            var data = new jDataView(data);
            //console.log(data.getInt32(0));
            //var data = new DataView(arrayBuffer);

            var tempArray = new Float32Array(
                data.byteLength / Float32Array.BYTES_PER_ELEMENT);
            var len = tempArray.length;
            // Incoming data is raw floating point values
            // with little-endian byte ordering.
            for (var jj = 0; jj < len; ++jj) {
                tempArray[jj] =
                    data.getFloat32(jj * Float32Array.BYTES_PER_ELEMENT, true);
            }
            //console.log(tempArray);
            //console.log(data);
            //body = toArrayBuffer(data);
            //console.log("Partial body: " + data.byteLength);
            //var receivedBit = audioAnalyzer.readCurrentPulse(body);
            var finalArray = toArrayBuffer(tempArray);
            //console.log(data);
            //var finalArray = new DataView(data);

            var receivedBit = audioAnalyzer.readCurrentPulse(finalArray.slice(0,finalArray.length-1));
            timecodeReader.receiveBit(receivedBit);
            //console.log(audioAnalyzer.pulseData);
            //console.log(timecodeReader.currentFrame);
            //console.log(timecodeReader.lastSync);
        });
        request.on('end', function () {
            for (var i=0; i<body.length;i++){
                //console.log("Body: "+i +' :'+ body[i]);
            }

        });
        response.writeHead(200, {'Content-Type': 'text/html','Access-Control-Allow-Origin':'*'});
        response.end(JSON.stringify(timecodeReader.string()));
        //console.log(response);
    }


    //response.writeHeader(200, {"Content-Type": "text/plain"});
    //response.write("Hello World");
    //response.end();
}).listen(8080);

function toArrayBuffer(buffer) {
    var view = new Float32Array(buffer.length);
    var final = [];
    for (var i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i];
        final[i] = view[i];
    }
    return final;
}

/*
var options = {
    hostname: 'localhost',
    port: 8001,
    path: 'listen.m3u',
    method: 'GET'
};

var req = http.request(options, function(res) {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
        console.log('BODY: ' + chunk);
    });
});

req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
});

// write data to request body
req.write('data\n');
req.write('data\n');
req.end();
*/

/*
var parser = m3u8.createStream();
var file   = fs.createReadStream("./listen.m3u");
file.pipe(parser);

parser.on('item', function(item) {
    // emits PlaylistItem, MediaItem, StreamItem, and IframeStreamItem
});
parser.on('m3u', function(m3u) {
    // fully parsed m3u file
});
*/

/*
http.get("http://localhost:8001/", function(res) {
    console.log("Got response: " + res.statusCode);

    res.on('data', function (chunk) {
        console.log('BODY: ' + chunk.toString('utf-8'))
    });

}).on('error', function(e) {
        console.log("Got error: " + e.message);

    });
*/

//var file   = fs.createReadStream("./listen.m3u");

