var availabilityChecks, common, punycode, whoisCommands, whoisServers;

punycode = require('punycode');

common = require('./common');

whoisServers = require('./whois-servers');

whoisCommands = require('./whois-commands');

availabilityChecks = require('./availability-checks');

module.exports = function(domain, cb) {
  var availabilityCheck, command, domainParts, domainPunycode, tld, whoisServer;
  if (domain === '') {
    return process.nextTick(function() {
      return cb(new Error('domain must not be empty'));
    });
  }
  domainPunycode = punycode.toASCII(domain);
  domainParts = domainPunycode.split('.');
  tld = domainParts[domainParts.length - 1];
  whoisServer = whoisServers[tld];
  if (whoisServer == null) {
    return process.nextTick(function() {
      return cb(new Error("no whois server for tld " + tld));
    });
  }
  availabilityCheck = availabilityChecks[whoisServer];
  if (availabilityCheck == null) {
    return process.nextTick(function() {
      return cb(new Error("no check for availability for whois server " + whoisServer));
    });
  }
  command = whoisCommands[whoisServer] || function(x) {
    return x;
  };
  return common.whoisRequest(whoisServer, command(domainPunycode), function(err, response) {
    var isAvailable;
    if (err != null) {
      return cb(err);
    }
    isAvailable = -1 !== response.indexOf(availabilityCheck);
    return cb(null, response, isAvailable);
  });
};

