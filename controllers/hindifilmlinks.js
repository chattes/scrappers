const request = require('request')
const cheerio = require('cheerio')
const log = require('simple-node-logger').createSimpleFileLogger('hindifilms.log')
const NightMare = require('nightmare')
const jsdom = require('jsdom')
const Xvfb = require('xvfb')
const env = process.env.NODE_ENV

module.exports = {
    scrapeHFLM: (req, res) => {
        //All the web scraping magic will happen here
        var xvfb = new Xvfb()
        url = req.query.url
        log.info(url, new Date().toJSON())
        if (url) {
            if(env === 'PROD'){
            xvfb.startSync()
            }
            const nightmare = NightMare({
                show: false, waitTimeout: 30000 // in ms
            })

            nightmare.goto(url)
            // .wait('.jw-media.jw-reset')
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
                            if ((tpScripts[i].src).indexOf(justMovies) !== -1) {
                                autoplay = true
                            }
                            scriptSources.push(tpScripts[i].src)
                        }

                    }
                    if (autoplay) {
                        jwplayer('Myp').play(true)
                    }
                    return {myHTML: document.body.innerHTML, scripts: scriptSources}
                    // return document.body.innerHTML

                })
                .end()
                .then(function (body) {
                    // log.info(body.myHTML)
                    $ = cheerio.load(body.myHTML)
                    let resolvedUrl = $('video').attr('src')
                    if(env === 'PROD'){
                        xvfb.stopSync()
                    }
                    return res.json({url: resolvedUrl})

                })
                .catch(function (error) {
                    log.error(error, new Date().toJSON())
                    nightmare.end()
                    if(env === 'PROD'){
                    xvfb.stopSync()
                    }
                    return res.sendStatus(400)
                })
        } else {
            // TODO
            return res.json({status: 400, error: 'No URL provided'})
        }

    }
}