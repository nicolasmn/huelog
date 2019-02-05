const stream = require('stream');
const csv = require('csv');
const equal = require('deep-equal');
const tail = require('read-last-lines');
const { flatten, unflatten } = require('flat');

/**
 * Transform a data blob to an array of state objects.
 *
 * @param  {String} blob  RAW log data that will be parsed to JSON
 * @return {Array}        Array of state objects for each light
 */
exports.transformData = function (blob) {
  const json = JSON.parse(blob);
  return Object.values(json).map(dataset => ({
    name: dataset.name,
    uniqueid: dataset.uniqueid,
    ...dataset.state
  }))
}

/**
 * Compose with datetime
 *
 * @param  {String}  blob   RAW log data (should be parsable as JSON)
 * @param  {Date}   [date]  Date object or undefined for current date
 * @return {Object}         Composed and flattened data
 * 
 */
exports.composeData = function (blob, date) {
  const stamp = date ? date.valueOf() : Date.now();
  const data = exports.transformData(blob);
  return obj = flatten({
    timestamp: stamp,
    lights: data
  });
}

/**
 * Convert CSV text input to arrays or objects.
 *
 * @param  {String}  string   String to parse
 * @param  {Object}  options  Parse options
 * @return {Promise}          Resolves with parsed arrays or objects
 */
exports.parseData = function (string, options) {
  return new Promise((resolve, reject) => {
    csv.parse(string, options, (err, output) => {
      if (err !== null) return reject(err);
      resolve(output);
    });
  });
}

/**
 * Check if new data and data from last line of given file differ.
 *
 * @param  {Object}  data  Status object
 * @param  {String}  file  Path to an existing file
 * @return {Promise}       Resolves with boolean
 */
exports.statusDidChange = function (data, file) {
  if (file) {
    return tail.read(file, 1)
      .then(res => exports.parseData(res, {
        columns: Object.keys(data)
      }))
      .then(res => !equal(
        unflatten(res[0]).lights,
        unflatten(data).lights
      ));
  } else {
    return Promise.resolve(true);
  }
}

/**
 * Write data to writable stream.
 *
 * @param  {Object}                         data      Data to write
 * @param  {stream.Writable|fs.writeStream} writable  Writable stream
 * @param  {Boolean}                        header    Prints CSV header if true
 * @return {Void}
 */
exports.writeData = function (data, writable, header) {
  const columns  = Object.keys(data),
        readable = new stream.Readable({ objectMode: true });

  readable.push(data);
  readable.push(null);
  readable
    .pipe(csv.stringify({ header, columns }))
    .pipe(writable);
}
