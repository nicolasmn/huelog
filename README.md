# huelog

Tiny CLI utility that transforms Phillips Hue API lights status responses to CSV logs, keeping only state information.

See [`test/example-transformed.csv`](./test/example-transformed.csv) for an example output.

## Setup

`npm install huelog -g`

## Usage

Flag       | Shortcut | Type   | Description
-----------|----------|--------|-------------
`--header` | `-H`     | `bool` | Force column headers to be printed in output
`--output` | `-o`     | `file` | Write to FILE rather than stdout
`--skip`   | `-s`     | `bool` | Skip logging of duplicated status responses
`--time`   | `-t`     | `date` | Pass a time to be logged instead of current time

huelog doesn't collect data by itself, it gets feed with data from other sources:

### Log to stdout with column headers
```sh
$ hueadm lights --json | huelog --header
```

### Log to file
```sh
$ hueadm lights --json | huelog --output ./huelog.csv
```
Data will be appended if the output file exists.

### Note

In the examples above I'm piping in data using [hueadm](https://github.com/bahamas10/hueadm), a CLI to [phillips hue](http://meethue.com/) that allows for easy management of your lights and much more.

You can however use any tool you want to collect the lights data, input just has to be a valid Phillips Hue API response in JSON for the `/lights` endpoint, e.g.:

<details>
<summary>Example JSON response</summary>
<pre>
{
  "1": {
    "state": {
      "on": true,
      "bri": 141,
      "hue": 13122,
      "sat": 211,
      "xy": [
        0.5119,
        0.4147
      ],
      "ct": 467,
      "alert": "none",
      "effect": "none",
      "colormode": "xy",
      "reachable": true
    },
    "type": "Extended color light",
    ...
  },
  "2": {
    "state": {
      "on": false,
      "bri": 127,
      "hue": 8499,
      "sat": 140,
      "xy": [
        0.4564,
        0.4107
      ],
      "ct": 362,
      "alert": "none",
      "effect": "none",
      "colormode": "xy",
      "reachable": true
    },
    "type": "Extended color light",
    ...
  }
}
</pre>
</details>
