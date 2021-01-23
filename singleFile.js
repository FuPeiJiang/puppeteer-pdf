const fs = require('fs')
const puppeteer = require('puppeteer')

const forwardSlashDirname = __dirname.replace(/\\/g, '/')

const filenameNoExt='template';

// Immediately-invoked Function Expressions https://flaviocopes.com/javascript-iife/
// always put a semi-colon before these
(async () => {
    let htmlPath = `${forwardSlashDirname}/${filenameNoExt}.html`
    let pdfPath = `${forwardSlashDirname}/${filenameNoExt}.pdf`

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

})()


