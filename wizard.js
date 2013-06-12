var PROBE_DOMAIN, async, common, fs, input, output;

fs = require('fs');

async = require('async');

common = require('./common');

PROBE_DOMAIN = '3e06671903a7134da0d0e8f6fff25ffb';

input = process.argv[2];

output = process.argv[3];

if ((!(input != null)) || (!(output != null))) {
  console.log("Usage: " + process.argv[1] + " {input-file} {output-file}");
  return;
}

process.stdin.resume();

process.stdin.setEncoding('utf8');

fs.readFile(input, 'utf8', function(err, data) {
  if (err != null) {
    throw err;
  }
  return fs.readFile(input, 'utf8', function(err, data) {
    var availabilityChecks, iterator, tlds, whoisServers;
    whoisServers = JSON.parse(data);
    availabilityChecks = {};
    iterator = function(tld, cb) {
      var probeDomain, whoisServer;
      console.log('TLD: ', tld);
      whoisServer = whoisServers[tld];
      console.log('whois server: ', whoisServer);
      probeDomain = PROBE_DOMAIN + '.' + tld;
      return common.whoisRequest(whoisServer, probeDomain, function(err, result) {
        if (err != null) {
          console.log('error in whois request', err);
          return cb();
        }
        console.log(result);
        console.log('please enter availability check');
        return process.stdin.once('data', function(availabilityCheck) {
          availabilityChecks[whoisServer] = availabilityCheck.replace('\n', '');
          return fs.writeFile(output, JSON.stringify(availabilityChecks, null, 4), 'utf8', cb);
        });
      });
    };
    tlds = Object.keys(whoisServers);
    return async.forEachSeries(tlds, iterator, function(err) {
      if (err != null) {
        throw err;
      }
      return process.stdin.pause();
    });
  });
});
