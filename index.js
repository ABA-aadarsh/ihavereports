const { exit } = require("process")
const {  allowedExtensions , CommandExec} = require("./commandExecutor.js")
const { checkFolderExists } = require("./lib.js")
const { createDocData } = require("./docGenerator.js")
const fs = require("fs")
const path = require("path")
const { Packer } = require("docx")
const {rl}=require("./readLineHandler.js")

function getUserInput(question) {
    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        resolve(answer);
      });
    });
}


const main = async () => {

    const argv = process.argv
    if (argv.length < 3) {
        console.log("You haven't specified folder name")
        exit(1)
    }
    const codeFolderPath = argv[2] //TODO: Verify

    const folderStatus = checkFolderExists(codeFolderPath)
    if (!folderStatus) {
        console.log("Error in accessing folder\nProbably the directory does not exists")
        exit(1)
    }

    let author = await getUserInput("Enter author name (this would be shown in output)\n(user) ")
    if(author=='\n') author = "user"
    console.log(`Set ${author} as author\n\n`)

    const executor = new CommandExec(codeFolderPath)

    const codeFiles = fs.readdirSync(
        path.resolve(codeFolderPath)
    ).filter(i => allowedExtensions.includes(i.split(".")[1])).map(i => (
        {
            path: path.join(codeFolderPath, i),
            name: i.split(".")[0],
            ext: i.split(".")[1],
            question: null,
            consoleInterface: null,
            code: null
        }
    ))

    executor.setCodeFiles(
        codeFiles
    )

    executor.modifyCode()

    executor.compileAll()

    await executor.executeAll()
    console.clear()
    console.log("-----------\nPrograms execution done. \n\nNow collecting data...\n")
    const data = executor.collectData()
    console.log("Done\n")
    executor.clearTemps()
    const docData = await createDocData(data, author)
    Packer.toBuffer(docData).then(async (buffer) => {
        fs.writeFileSync(path.join(codeFolderPath,"Report.docx"), buffer);
        console.log(`Report.docx is created at path ${codeFolderPath}`);
        rl.close()
        exit(0)
    });
}



main()