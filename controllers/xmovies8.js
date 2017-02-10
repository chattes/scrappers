const request = require('request')
// const jar = request.jar()
const cheerio = require('cheerio')
// const NightMare = require('nightmare')
var nightmare = null
const async = require('async')
const resolver = require('resolver')
// const moviedb = require('moviedb')
const log = require('simple-node-logger').createSimpleFileLogger('xmovies8.log')
const realdebridconf = require('../config')

module.exports = {
  init: (mynightmare) => {
    if (mynightmare) {
      nightmare = mynightmare
    }
  },
  listMovies: (req, res) => {
    //All the web scraping magic will happen here
    async.waterfall(
      [
        //Step 1- Initiate Nightmare Instance
        //Visit Page & Store Cookies in Cookie JAR!
        (callback) => {
          let page = req.query.page
          let url = 'http://xmovies8.tv/language/hindi?page=' + page
          nightmare
            .goto(url)
            .wait('.list_movies')
            .evaluate(() => {
              return document.body.innerHTML
            })
            .then((body) => {
              // that.moviemodel.movies = []
              mymoviemodel = []
              $ = cheerio.load(body)
              $('.thumb.cluetip', '.item_movie').each(function (index, element) {
                mymoviemodel.push('http:' + $(this).attr('rel'))
              })
              callback(null, mymoviemodel)
            })
            .catch(function (error) {
              callback(true,error)
            })

        },
        (moviemodel, callback) => {
          moviedetails = []
          async.eachSeries(moviemodel, (link, cb) => {
            nightmare.goto(link)
              .evaluate(() => {
                return document.body.innerHTML
              })
              .then((info) => {
                let metadata = {}
                $ = cheerio.load(info)
                metadata.quality = $('.quality').text()
                metadata.title = $('.title').text()
                metadata.overview = $('.desc').text()
                metadata.playurl = 'http:' + $('.watch-now.btn.full.btn-gray').attr('href')
                metadata.image = 'https://s-media-cache-ak0.pinimg.com/originals/69/d6/70/69d67084313d99996ea5920409012a08.jpg'
                moviedetails.push(metadata)
                cb()


                //              Get image
                // moviedb.searchMovie({
                //   query: metadata.title.split('(')[0]
                // }, (err, response) => {
                //   if (!err && response.results[0] !== undefined) {
                //     metadata.image = 'http://image.tmdb.org/t/p/w500'+response.results[0].poster_path
                //   }else{
                //   }
                // })
              })
              .catch((error) => {
                cb(error)
              })
          }, (err) => {
            callback(err,moviedetails)
          })


        }
      ],
      (error, data) => {
        if (error) {
          log.error(error,new Date().toJSON())
          return res.sendStatus(400)
        }
        res.json(data)
      }
    )
  },
  playMovie: (req, res) => {
    // Lets Try to Find a Playable link
    url = req.query.url //Test url
    nightmare
      .goto(url)
      .wait('#movie-player')
      .evaluate(() => {
        return document.body.innerHTML
      })
      .then((body) => {
        $ = cheerio.load(body)
        if ($('#frame-player').length > 0) {
          //OpenLoad has loaded as source
          let src = $('#frame-player').attr('src')
          if (src.indexOf('xmovies8.tv') !== -1) {
            //Need to Resolve URL and get the actual URL
            if (!src.includes('http')) {
              src = 'http:' + src
            }
            resolver.resolve(src, (err, resolvedURL, filename, contentType) => {

              if (err) {
                return res.sendStatus('400')
              }
              const url = 'https://api.real-debrid.com/rest/1.0/unrestrict/link'

              function callback(error, response, body) {
                if (!error && response.statusCode == 200) {
                  res.send({
                    url: JSON.parse(body).download
                  })
                } else {
                  res.send({
                    url: resolvedURL
                  })

                }
              }
              httpbody = 'link=' + resolvedURL
              options = {
                url: 'https://api.real-debrid.com/rest/1.0/unrestrict/link',
                method: 'POST',
                body: httpbody,
                auth: {
                  'bearer': realdebridconf.realdebrid
                }
              }
              request(options, callback);

            })
          }
        } else if ($('.jw-video.jw-reset').length > 0) {
          //Source 2
          console.log($('.jw-video.jw-reset').attr('src'))
          res.send({
            url: $('.jw-video.jw-reset').attr('src')
          })
        } else {
          //Unsupported Source
          log.info('Unsupported source:', new Date().toJSON())
          res.sendStatus(400)
        }
      })
      .catch((err) => {
        log.info(err, new Date().toJSON())
        res.sendStatus(400)
      })
  }
}