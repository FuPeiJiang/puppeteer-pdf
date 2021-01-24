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
var arr = ['complete', 'foobar', 0]


const startAt = ''
var unlocked = false;
// Immediately-invoked Function Expressions https://flaviocopes.com/javascript-iife/
// always put a semi-colon before these
(async () => {
    for (let i = 0, len = arr.length; i < len; i++) {
        let filenameNoExt = arr[i]
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

            // await page.evaluate(() => {
            // document.body.style=''
            // })

            // or a .pdf file
            await page.pdf({
                format: 'Letter',
                // format: 'A4',
                scale: 1,
                // scale: 1.85,
                // scale: 2,
                printBackground: true,
                path: pdfPath,
            })

            // close the browser
            await browser.close()

            resolve()

        })
    }
})()


