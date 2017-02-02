const request = require('request')
const cheerio = require('cheerio')
const NightMare = require('nightmare')
const jsdom = require('jsdom')

module.exports = {
    index: function(req,res){
        moviemodel = []
  //All the web scraping magic will happen here
  console.log('Scraping xmovies8...')
  url = 'http://xmovies8.tv/language/hindi'
  if (url) {
    const nightmare = NightMare({show: false})
    nightmare
      .goto(url)
      .wait('#movie-player')
      .evaluate(function () {

        // return document.body.innerHTML; //pass all of the html as text return
        // document.body.innerHTML
        // eval(document.body.getElementsByTagName("script")[1].innerHTML)
        let tpScripts = document
          .body
          .getElementsByTagName("script")
        let scriptSources = []
        for (let i = 0; i < tpScripts.length; i++) {
          if (tpScripts[i].src) {
            scriptSources.push(tpScripts[i].src)
          }
        }
        return {myHTML: document.body.innerHTML, scripts: scriptSources}

      })
      .end()
      .then(function (body) {
        //  console.log(body.myHTML)
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
        
    }
    
}