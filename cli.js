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
  let fileExists = false

  if (flags.output) {
    fileExists = cli.native.fs.existsSync(flags.output);

    if (!fileExists) {
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

  huelog.statusDidChange(dataout, fileExists ? flags.output : false).then(change => {
    if (!change && flags.skip) {
      cli.info('Data did not change, skip logging.');
    } else {
      huelog.writeData(dataout, wstream, flags.header);
    }
  });

});
