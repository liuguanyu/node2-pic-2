const program = require('commander')
const { createCanvas, loadImage } = require('canvas')
const chalk = require("chalk")
const fs = require("fs")

const log = console.log

const FILE_NOT_EXISTS = "file not exists!"
const MAX_COLOR_SPACE = 255
const MAX_COLS = 0.618

const CHARS = " .,:;i1tfLCG08@"

const output = process.stdout

program
  .version(require('./package').version)
  .usage('<command> [options]')
  .option("-f, --file [value]", "pic file name")
  .parse(process.argv)

~(async () => { 
  let f = program.file

  if (!fs.existsSync(f)) { 
    log(chalk.red(FILE_NOT_EXISTS))
    return
  }

  let image = await loadImage(f)
  try {
    let [maxCols, maxRows] = [output.columns, output.rows]
    let [width, height] = [image.width, image.height]

    height = Math.ceil(height/2) // coz the letter height is twice size of width

    if (width < maxCols && height > maxRows) {
      width =  Math.ceil(maxRows/height*width)
      height = maxRows 
    }
    else if (width > maxCols && height < maxRows){
      height =  Math.ceil(maxCols/width*height)
      width = maxCols 
    }
    else if (width > maxCols && height > maxRows){
      let ratio = Math.min(maxCols/width, maxRows/height)
      width =  Math.ceil(width*ratio)
      height = Math.ceil(height*ratio) 
    }

    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext('2d')
    ctx.drawImage(image, 0, 0, width, height)

    let rows = [...Array(height)].map(_ => 0)
    let cols = [...Array(width)].map(_ => 0)
    

    rows.forEach((r, i) => { 
      let str = []

      cols.forEach((c, j) => { 
        let [r, g, b, a] = ctx.getImageData(j, i, 1, 1).data;
        let value = (r + g + b) * a / MAX_COLOR_SPACE;
        let precision = MAX_COLOR_SPACE * 3 / (CHARS.length - 1)

        let char = CHARS[Math.floor((value / precision) + 0.5)]

        str.push(chalk.rgb(r, g, b).bold(char));
      })

      log(str.join(""))
    })
  }
  catch (e) { 
    log(chalk.red(e.message))
  }
})()