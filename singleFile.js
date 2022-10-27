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

    // https://stackoverflow.com/questions/1145850/how-to-get-height-of-entire-document-with-javascript#41181003
    const [documentWidth, documentHeight] = await page.evaluate(() => {

        function getPageWidth() {
            var pageWidth = 0;

            function findHighestNode(nodesList) {
                for (var i = nodesList.length - 1; i >= 0; i--) {
                    if (nodesList[i].scrollWidth && nodesList[i].clientWidth) {
                        var elWidth = Math.max(nodesList[i].scrollWidth, nodesList[i].clientWidth);
                        pageWidth = Math.max(elWidth, pageWidth);
                    }
                    if (nodesList[i].childNodes.length) findHighestNode(nodesList[i].childNodes);
                }
            }

            findHighestNode(document.documentElement.childNodes);

            // The entire page width is found
            return pageWidth
        }

        function getPageHeight() {
            var pageHeight = 0;

            function findHighestNode(nodesList) {
                for (var i = nodesList.length - 1; i >= 0; i--) {
                    if (nodesList[i].scrollHeight && nodesList[i].clientHeight) {
                        var elHeight = Math.max(nodesList[i].scrollHeight, nodesList[i].clientHeight);
                        pageHeight = Math.max(elHeight, pageHeight);
                    }
                    if (nodesList[i].childNodes.length) findHighestNode(nodesList[i].childNodes);
                }
            }

            findHighestNode(document.documentElement.childNodes);

            // The entire page height is found
            return pageHeight
        }

        return [
            getPageWidth(),
            getPageHeight(),
        ]
    })
    // console.log(documentWidth, documentHeight)

    // await page.evaluate(() => {
    // document.body.style=''
    // })

    // or a .pdf file
    await page.pdf({
        // format: 'Letter',
        // format: 'A4',
        scale: 1,
        //defaults to px I think
        width: documentWidth,
        height: documentHeight,
        // width: '1079px',
        // height: '1304px',
        // height: '1303px',
        // scale: 1.85,
        // scale: 2,
        printBackground: true,
        path: pdfPath,
    })

    // close the browser
    await browser.close()

})()


