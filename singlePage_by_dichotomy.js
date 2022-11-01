const fs = require('fs')
const puppeteer = require('puppeteer')

const forwardSlashDirname = __dirname.replace(/\\/g, '/')

const filenameNoExt = 'template'

async function main() {

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
            var pageWidth = 0

            function findHighestNode(nodesList) {
                for (var i = nodesList.length - 1; i >= 0; i--) {
                    if (nodesList[i].scrollWidth && nodesList[i].clientWidth) {
                        var elWidth = Math.max(nodesList[i].scrollWidth, nodesList[i].clientWidth)
                        pageWidth = Math.max(elWidth, pageWidth)
                    }
                    if (nodesList[i].childNodes.length) findHighestNode(nodesList[i].childNodes)
                }
            }

            findHighestNode(document.documentElement.childNodes)

            // The entire page width is found
            return pageWidth
        }

        function getPageHeight() {
            var pageHeight = 0

            function findHighestNode(nodesList) {
                for (var i = nodesList.length - 1; i >= 0; i--) {
                    if (nodesList[i].scrollHeight && nodesList[i].clientHeight) {
                        var elHeight = Math.max(nodesList[i].scrollHeight, nodesList[i].clientHeight)
                        pageHeight = Math.max(elHeight, pageHeight)
                    }
                    if (nodesList[i].childNodes.length) findHighestNode(nodesList[i].childNodes)
                }
            }

            findHighestNode(document.documentElement.childNodes)

            // The entire page height is found
            return pageHeight
        }

        return [
            getPageWidth(),
            getPageHeight(),
        ]
    })
    console.log(documentWidth, documentHeight)

    //orientation/pageSizeType is dependent on css, same thing is size:${}in ${}in
    const styleText = `@page{margin:0;size:8.5in 11in;}`

    console.log(styleText)
    await page.evaluate(function (styleText) {

        const style_el = document.createElement('style')
        style_el.textContent = styleText
        document.body.appendChild(style_el)

    }, styleText)

    console.log(documentWidth, documentHeight)

    await page.pdf({
        printBackground: true,
        preferCSSPageSize: true,
        path: pdfPath,
    })

    // close the browser
    await browser.close()

}
main()
