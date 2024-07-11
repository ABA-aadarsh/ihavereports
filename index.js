const { exit } = require("process")
const {CommandExec, allowedExtensions} = require("./commandExecutor.js")
const {checkFolderExists} = require("./lib.js")
// const {createDocData} = require("./docGenerator.js")
const fs = require("fs")
const path = require("path")
const argv = process.argv
if(argv.length < 3){
    console.log("You haven't specified folder name")
    exit(1)
}
const codeFolderPath = argv[2] //TODO: Verify

const folderStatus = checkFolderExists(codeFolderPath)
if(!folderStatus){
    console.log("Error in accessing folder\nProbably the directory does not exists")
    exit(1)
}

const executor = new CommandExec(codeFolderPath)

const codeFiles = fs.readdirSync(
    path.resolve(codeFolderPath)
).filter(i=>allowedExtensions.includes(i.split(".")[1])).map(i=>(
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

executor.executeAll().then(
    ()=>{
        const data = executor.collectData()
        console.log(data)
        exit(0)
    }
).catch(
    (error)=>{
        console.log(error)
        exit(1)
    }
)