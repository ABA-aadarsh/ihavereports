const path = require("path")
const fs = require("fs")
const {spawn, execSync}=require("child_process")
const {createEmptyFolder, clearExecutables} = require("./lib.js")
const {rl} = require("./readLineHandler.js")

const os = {
    linux : "linux",
    windows: "win32"
}
const allowedExtensions = ["cpp","c"]

class CommandExec {
    constructor(folderPath, list =[]){
        this.folderPath = folderPath

        if(process.platform==os.linux){
            this.machine = os.linux
        }else if(process.platform==os.windows){
            this.machine=os.windows
        }
        else{
            throw Error("Seems application can't run on this machine")
        }

        this.folderNames = {
            consoleOutput: "consoleInterface",
            modifiedCodes: "modifiedCodes"
        }

        this.codesFiles = list.filter(i=>allowedExtensions.includes(i?.ext || null))


        createEmptyFolder(this.folderPath, this.folderNames.modifiedCodes)
        createEmptyFolder(this.folderPath, this.folderNames.consoleOutput)
        clearExecutables(this.folderPath)
    }

    setCodeFiles( list = []){
        this.codesFiles = list.filter(i=>allowedExtensions.includes(i.ext))
    }
    getCompileCommand (ext, fullpath, fileName, exePaths){
        const compiler = ext == "c" ? "gcc" : "g++"
        const outputType = this.machine == os.linux ? "o" : "exe"
        return `${compiler} ${fullpath} -o ${path.resolve(exePaths, fileName)}.${outputType}`
    }
    async executeAll(){
        const executePromiseSeries=async (iterable,action)=>{
            try{
                for (const x of iterable) {
                        console.log("Executing Program : ", x);
                        await action(x)
                        console.log("\n")
                }
                return true
            }catch(err){
                console.log(err)
                return false
            }
        }
        const executables=fs.readdirSync(
            path.resolve(this.folderPath)
        ).filter(i=>{
            if(this.machine==os.linux){
                return i.split(".")[1]=="o"
            }else if(this.machine==os.windows){
                return i.split(".")[1]=="exe"
            }else{
                return false
            }
        })

        const executePromise=(e)=>new Promise((resolve,reject)=>{
                const programProcess = spawn(
                    path.resolve(this.folderPath, e),
                    { 
                        stdio: ['pipe', 'pipe', 'pipe'], 
                        detached:false,
                        cwd: path.resolve(this.folderPath)
                    }
                );
                const outputFileStream = fs.createWriteStream(
                    path.resolve(this.folderPath, this.folderNames.consoleOutput, `${e.split(".")[0]}.txt`)
                )
                programProcess.stdout.on('data', (data) => {
                    console.log(`${data}`);
                    outputFileStream.write(data);
                });
                rl.on('line', (input) => {
                    programProcess.stdin.write(input + '\n');
                    outputFileStream.write(input+"\n")
                });
    
                programProcess.on('close', (code) => {
                    console.log('Program execution completed.\n Execution code = ', code);
                    outputFileStream.end();
                    resolve()
                });
            }
        )
        await executePromiseSeries(executables,executePromise)
    }
    compile({fileName, sourcepath, executablePath, ext}){
        const command = this.getCompileCommand(
            ext, 
            sourcepath, 
            fileName, 
            executablePath
        )
        execSync(command)
        return true
    }
    compileAll (){
        for(let i = 0; i<this.codesFiles.length ; i++){
            const _ = this.codesFiles[i]
            this.compile(
                {
                    fileName: _.name,
                    sourcepath: _.path,
                    executablePath: this.folderPath,
                    ext: _.ext
                }
            )
        }
    }
    modifyCode(){
        function addFlushToPrintf(code) {
            const pattern = /printf\s*\(([^)]+)\);/g;
            return code.replace(pattern, (match, printfArgs) => {
                return `printf(${printfArgs}); fflush(stdout);`;
            });
        }

        const targetedFiles = this.codesFiles.filter(i=>i.ext=="c")

        targetedFiles.forEach(async(file, _)=>{
            const fileFullName = file.name + "." + file.ext
            const a=fs.readFileSync(
                file.path
                , "utf-8"
            )
            const modified=addFlushToPrintf(a);
            const f=fs.writeFileSync(
                path.resolve(this.folderPath, this.folderNames.modifiedCodes, fileFullName)    
                ,modified
            )
            targetedFiles[_].path = path.resolve(this.folderPath, this.folderNames.modifiedCodes, fileFullName)
        })
        return true
    }


    collectData(){
        // collect console interface and questions
        const consoleBasePath = path.join(this.folderPath, this.folderNames.consoleOutput)
        const questionRegex = /#question\(([\s\S]*?)\)/;
        const clearRegex= /\/\*[\s\S]*?\*\//g;
        let question;
        this.codesFiles.forEach((i, index)=>{
            const consoleData = fs.readFileSync(
                path.join(consoleBasePath, `${i.name}.txt`),
                "utf-8" 
            )
            const codeData = fs.readFileSync(
                path.join(this.folderPath, `${i.name}.${i.ext}`),
                "utf-8"
            )
            
            const questionMatch = codeData.match(questionRegex) 
            if(questionMatch && questionMatch[1]){
                question = questionMatch[1].split("\n").map(line => line.trim()).join("\n")
            }else{
                question = "__ Write Question Here __"
            }
            this.codesFiles[index].code = codeData.replace(clearRegex,"").trimStart()
            this.codesFiles[index].consoleInterface = consoleData
            this.codesFiles[index].question = question
        })
        return this.codesFiles
    }
    clearTemps(){
        createEmptyFolder(this.folderPath, this.folderNames.modifiedCodes)
        createEmptyFolder(this.folderPath, this.folderNames.consoleOutput)
        fs.rmdirSync(path.join(this.folderPath, this.folderNames.modifiedCodes))
        fs.rmdirSync(path.join(this.folderPath, this.folderNames.consoleOutput))
    }
}

module.exports ={
    CommandExec,
    allowedExtensions
}

