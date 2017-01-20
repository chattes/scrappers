const express = require('express')
const fs = require('fs')
const request = require('request')
const cheerio = require('cheerio')
const app = express()
const NightMare = require('nightmare')
const nightmare = NightMare()
const router = express.Router()
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors')

app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
//Scrape URL and resolve to get Direct Video Link
router.get('/resolve', function (req, res) {

  //All the web scraping magic will happen here
  console.log('Scrape')
  // url = 'http://videohost.site/play/A11QStEaNdVZfvV/'
  url = req.query.url
  if(url){
  nightmare
    .goto(url)
    .evaluate(function(){
      
        // return document.body.innerHTML; //pass all of the html as text
        return document.body.innerHTML
    }
    )
    .end()   
    .then(function (body) {
      $ = cheerio.load(body)
      let resolvedUrl = $('video').attr('src')
      res.json({resolvedURL: resolvedUrl})
    })
    .catch(function (error) {
      console.error('Search failed:', error)
      res.json({Error: error })
    })

  }else{
    // TODO
    res.send('No URL Provided')
  }

})
app.use(router)
app.listen('3030')
console.log('Magic happens on port 3030')
exports = module.exports = app
