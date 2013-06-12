var async, common, fs, getDomains, getWhoisServer, input, output;

fs = require('fs');

async = require('async');

common = require('./common');

getDomains = function(data) {
  var lines, trimmed;
  lines = data.split('\n');
  trimmed = lines.map(function(line) {
    return line.replace(/^\s+|\s+$/g, "");
  });
  return trimmed.filter(function(line) {
    return line !== '' && 0 !== line.indexOf('#');
  });
};

getWhoisServer = function(domain, cb) {
  return common.whoisRequest('whois.iana.org', domain, function(err, result) {
    var match;
    if (err != null) {
      return cb(err);
    }
    match = /whois:\s+(\S+)/.exec(result);
    if ((match != null ? match[1] : void 0) == null) {
      return cb();
    }
    return cb(null, match[1]);
  });
};

input = process.argv[2];

output = process.argv[3];

if ((!(input != null)) || (!(output != null))) {
  console.log("Usage: " + process.argv[1] + " {input-file} {output-file}");
  return;
}

fs.readFile(input, 'utf8', function(err, data) {
  var domains, iterator, whoisServers;
  if (err != null) {
    throw err;
  }
  domains = getDomains(data);
  whoisServers = {};
  iterator = function(domain, cb) {
    var delayed;
    console.log('TLD: ', domain);
    delayed = function() {
      return getWhoisServer(domain, function(err, whoisServer) {
        if (err != null) {
          return cb(err);
        }
        if (whoisServer == null) {
          console.log('whois server: not found');
          return cb();
        }
        console.log('whois server: ', whoisServer);
        whoisServers[domain.toLowerCase()] = whoisServer;
        return cb();
      });
    };
    return setTimeout(delayed, 300);
  };
  return async.forEachSeries(domains, iterator, function(err) {
    if (err != null) {
      return cb(err);
    }
    return fs.writeFile('whois-servers.json', JSON.stringify(whoisServers, null, 4), 'utf8', function(err) {
      if (err != null) {
        throw err;
      }
    });
  });
});

