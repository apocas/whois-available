# whois-available

whois-available returns whois information and checks whether domains are available

### install

```
npm install whois-available
```

### use

```coffeescript
whoisAvailable = require('whois-available')

whoisAvailable('google.com', function(err, whoisResponse, isAvailable) {
  //...
});
```

### license: MIT
