var page = require('webpage').create();
console.log('The default user agent is ' + page.settings.userAgent);
page.settings.userAgent = 'SpecialAgent';
page.open('http://videohost.site/play/A11QStEaNdVZfvV/', function(status) {
  if (status !== 'success') {
    console.log('Unable to access network');
  } else {
    var html = page.evaluate(function() {
      return document.getElementsByTagName('body')[0].innerHTML;
    });
    console.log(html);
  }
  phantom.exit();
});