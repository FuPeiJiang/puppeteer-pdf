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

    let low = 0
    let high = documentHeight*2/96
    let mid = (high + low)/2
    let lastGood
    let buf

    const constantWidth = documentWidth/96

    while (true) {

        //orientation/pageSizeType is dependent on css, same thing is size:${}in ${}in
        const styleText = `@page{margin:0;size:${constantWidth}in ${mid}in;}`

        console.log(styleText)
        await page.evaluate(function (styleText) {

            const element = document.getElementById("remove-this-please")
            if (element) {
                element.remove()
            }

            const style_el = document.createElement('style')
            style_el.textContent = styleText
            style_el.id = "remove-this-please"
            document.body.appendChild(style_el)

        }, styleText)

        console.log(documentWidth, documentHeight)

        buf = await page.pdf({
            printBackground: true,
            preferCSSPageSize: true,
        })

        if (high === 0) {
            break
        }

        const occurence_count = occurrences(buf, "/Page\n")
        if (occurence_count > 1) {
            if (low === mid) {
                mid = lastGood
                high = 0
                continue
            }
            low = mid
            mid = (high + low)/2
            continue
        } else {
            if (high === mid) {
                break
            }
            high = mid
            lastGood = mid
            if (mid < 5) {
                mid=documentHeight/96
                high = 0
                continue
            }
            mid = (high + low)/2
            continue
        }

    }
    fs.writeFileSync(pdfPath, buf)

    // close the browser
    await browser.close()

}
main()

function occurrences(str_, subStr) {
    let occurence_count = 0
    let pos = -subStr.length
    while ((pos = str_.indexOf(subStr, pos + subStr.length)) > -1) {
        occurence_count++
    }
    return occurence_count
}