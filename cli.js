#!/usr/bin/env node

const cli = require('cli')
const huelog = require('./index.js');

cli.enable('status', 'catchall');

const flags = cli.parse({
  header: [ 'H', 'Force column headers to be printed in output', 'bool' ],
  output: [ 'o', 'Write to FILE rather than stdout', 'file' ],
  skip:   [ 's', 'Skip logging of duplicated status responses', 'bool' ],
  time:   [ 't', 'Pass a time to be logged instead of current time', 'date' ],
});


cli.withStdin('utf-8', function(input) {

  // AUTOCONFIG

  let wstream = process.stdout

  if (flags.output) {
    const fileExists = cli.native.fs.existsSync(flags.output);

    if (fileExists) {
      // Compare generated output to last line of the output file if huelog
      // was called without a `compare` flag and the file already exists
      if (flags.force === null) {
        flags.force = true;
      }
    } else {
      // Print CSV header if huelog was called without a `header` flag
      // and the output file does not exist yet
      if (flags.header === null) {
        flags.header = true;
      }
    }
    // Set write stream to output file and set flags for appending to an
    // already existing file or creating a new one
    wstream = cli.native.fs.createWriteStream(flags.output, {
      flags: fileExists ? 'a' : 'w'
    });
  }

  // WRITE

  const dataout = huelog.composeData(input, flags.time);
  
  huelog.statusDidChange(dataout, flags.output).then(change => {
    if (!change && flags.skip) {
      cli.info('Data did not change, skip logging.');
    } else {
      huelog.writeData(dataout, wstream, flags.header);
    }
  });

});
