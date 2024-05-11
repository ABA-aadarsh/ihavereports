const fs=require("fs")
const {exec,execFile,spawn, execSync}=require("child_process")
const readline = require('readline');
const { exit } = require('process');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal:true
});
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const compileCodes=async ()=>{
    try{
        const files=fs.readdirSync("./modifiedCodes")
        files.forEach(async(file,_)=>{
            try{
                execSync(`gcc ./modifiedCodes/${file} -o c${_+1} & move /y c${_+1}.exe ./executables/`)
            }catch(err){
                console.log(err)
            }
        })
        return true
    }catch(err){
        console.log(err)
        return false
    }

}

const clearFiles=()=>{
    const deleteFileInsideFolder=(folder)=>{
        if(["executables","outputs","modifiedCodes"].includes(folder)){
            const files=fs.readdirSync("./"+folder)
            for(let i=0;i<files.length;i++){
                fs.unlinkSync("./"+folder+"/"+files[i])
            }
        }
    }
    deleteFileInsideFolder("executables")
    deleteFileInsideFolder("outputs")
    deleteFileInsideFolder("modifiedCodes")
}



const executeCodes=async ()=>{
    const executePromiseSeries=async (iterable,action)=>{
        try{
            for (const x of iterable) {
                    await action(x)
            }
            return true
        }catch(err){
            console.log(err)
            return false
        }
    }
    const executables=fs.readdirSync("./executables")
    const executePromise=(e)=>new Promise((resolve,reject)=>{
            const programProcess = spawn(`./executables/${e}`, { stdio: ['pipe', 'pipe', 'pipe'], detached:false});
            const outputFileStream = fs.createWriteStream(`./outputs/${e.split(".")[0]+".txt"}`);
            programProcess.stdout.on('data', (data) => {
                console.log(`${data}`);
                outputFileStream.write(data);
            });

            rl.on('line', (input) => {
                programProcess.stdin.write(input + '\n');
                outputFileStream.write(input+"\n")
            });

            programProcess.on('close', (code) => {
                console.log('Program exited with code', code);
                outputFileStream.end();
                resolve()
            });
        }
    )
    const res = await executePromiseSeries(executables,executePromise)
    console.log(res)
}
const modifyCodes=async()=>{
    function addFlush(str) {
        const pattern = /printf\s*\(([^)]+)\);(\s*)scanf\s*\(([^)]+)\);/g;
        return str.replace(pattern, (match, printfArgs, space, scanfArgs) => {
            return `printf(${printfArgs});${space}fflush(stdout);${space}scanf(${scanfArgs});`;
        });
    }
    
    const files=fs.readdirSync("./codes")
    files.forEach(async(file)=>{
        try{
            const a=fs.readFileSync('./codes/'+file, "utf-8")
            const modified=addFlush(a);
            const f=fs.writeFileSync(`./modifiedCodes/${file}`,modified)
        }catch(err){
            console.log(err)
        }
    })

    return true
}

module.exports = {
    compileCodes,
    executeCodes,
    modifyCodes,
    clearFiles
}