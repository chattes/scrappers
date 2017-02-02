const express = require('express')
const fs = require('fs')
const request = require('request')
const cheerio = require('cheerio')
const app = express()
const NightMare = require('nightmare')
const router = express.Router()
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors')
const jsdom = require('jsdom')
const xmovies = require('./controllers/xmovies8')

app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
//Scrape URL and resolve to get Direct Video Link
router.get('/resolve', function (req, res) {

  //All the web scraping magic will happen here
  console.log('Scrape')
  // url = 'http://videohost.site/play/A11QStEaNdVZfvV/'
  url = req.query.url
  if (url) {
    const nightmare = NightMare({show: false})
    nightmare
      .goto(url)
      .evaluate(function () {

        // return document.body.innerHTML; //pass all of the html as text return
        // document.body.innerHTML
        // eval(document.body.getElementsByTagName("script")[1].innerHTML)
        let tpScripts = document
          .body
          .getElementsByTagName("script")
        let scriptSources = []
        let justMovies = 'justmoviesonline'
        let autoplay = false
        for (let i = 0; i < tpScripts.length; i++) {
          if (tpScripts[i].src) {
            if((tpScripts[i].src).indexOf(justMovies)!== -1){
              autoplay = true
            }
            scriptSources.push(tpScripts[i].src)
          }

        }
        if(autoplay){
        jwplayer('Myp').play(true)
        }
        return {myHTML: document.body.innerHTML, scripts: scriptSources}

      })
      .end()
      .then(function (body) {
        // console.log(body.myHTML)
        $ = cheerio.load(body.myHTML)
        let resolvedUrl = $('video').attr('src')
        res.json(resolvedUrl)

      })
      .catch(function (error) {
        console.error('Search failed:', error)
        res.json({Error: error})
      })
  } else {
    // TODO
    res.send('No URL Provided')
  }

})

router.get('/xmovies',xmovies.index)

app.use(router)
app.listen('3030')
console.log('Magic happens on port 3030')
exports = module.exports = app
