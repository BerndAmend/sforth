// requires the following arudino program
// void setup() {
//   Serial.begin(115200);
// }

// void loop() {
//   if (Serial.available()) {
//     Serial.write(Serial.read());
//   }
// }

include "forth.fs"
include »console.fs«
"https://raw.githubusercontent.com/BerndAmend/deno_serial/master/main.ts" import await { serial }

:[ new serial.SerialPort("/dev/ttyACM0") ]: { port }

:[ { baudRate: 115200 } ]: port.open(1) await;

:[ const lineReader = port.readable
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new TransformStream(new serial.LineBreakTransformer()));
];

// write stuff every 200msec
:async writeStuff {}
    new TextEncoder const encoder
    port.writable.getWriter(0) const writable
    try
        0 1000 1 do i
          `Test message ${i}\n` encoder.encode(1) writable.write(1) await;
          200 sleep await;
        loop
		catch e
			`\n${SForthSystem.demangle(e.stack)}\n` .
		endtry
;

:async readStuff {}
lineReader.getReader(0) { reader }
    0 begin
      reader.read(0) await { line }
      line.done if break endif
      line.value "\n" + .
    again
;

// both functions run in the background
writeStuff
readStuff

  // exit after 5 seconds
5000 sleep(1) await;
port.close(0);