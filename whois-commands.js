module.exports = {
  'whois.denic.de': function(domain) {
    return '-T dn,ace ' + domain;
  }
};
