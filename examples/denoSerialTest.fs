include "forth.fs"
include »console.fs«

"https://deno.land/x/deno_serial@0.1.0/main.ts" import await { denoSerial }

"/dev/ttyUSB0" :[ { baudrate: denoSerial.Baudrate.B115200, minimum_number_of_chars_read: 0, timeout_in_deciseconds: 10} ]: denoSerial.open(2) await { serial }
"Fisch\n" serial.write_string(1) await;
serial.read_string() await .
serial.read_string() await .
