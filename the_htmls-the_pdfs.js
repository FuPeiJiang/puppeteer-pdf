const fs = require('fs')
const puppeteer = require('puppeteer')

const sourceFolder = 'the_htmls'
const saveFolder = 'the_pdfs'
const forwardSlashDirname = __dirname.replace(/\\/g, '/')

// loop ALL files in folder
/* var arr = fs.readdirSync(sourceFolder);
// natural sort https://stackoverflow.com/questions/2802341/javascript-natural-sort-of-alphanumerical-strings#38641281
var collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
var arr = arr.sort(collator.compare) */

//OR

// only these, in this order
var nameOnlyArr = ['complete', 'foobar', 0]


const startAt = ''
var unlocked = false;
// Immediately-invoked Function Expressions https://flaviocopes.com/javascript-iife/
// always put a semi-colon before these
(async () => {
    for (let i = 0, len = nameOnlyArr.length; i < len; i++) {
        let filenameNoExt = nameOnlyArr[i]
        await new Promise(async resolve => {
            let htmlPath = `${forwardSlashDirname}/${sourceFolder}/${filenameNoExt}.html`
            let pdfPath = `${forwardSlashDirname}/${saveFolder}/${filenameNoExt}.pdf`

            if (startAt) {
                if (filenameNoExt = startAt)
                    unlocked = true
                if (!unlocked)
                    resolve()
            }
            console.log(`file:///${htmlPath}`)

            // launch a new chrome instance
            const browser = await puppeteer.launch({
                headless: true
            })

            // create a new page
            const page = await browser.newPage()


            await page.goto(`file:///${htmlPath}`, {
                waitUntil: 'networkidle0'
            })

            // https://stackoverflow.com/questions/1145850/how-to-get-height-of-entire-document-with-javascript#1147768
            const [documentWidth, documentHeight] = await page.evaluate(() => {
                var body = document.body,
                    html = document.documentElement
                return [
                    Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth),
                    Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight),
                ]
            })

            // await page.evaluate(() => {
            // document.body.style=''
            // })

            // or a .pdf file
            await page.pdf({
                width: documentWidth,
                height: documentHeight,
                scale: 1,
                printBackground: true,
                path: pdfPath,
            })

            // close the browser
            await browser.close()

            resolve()

        })
    }
})()


