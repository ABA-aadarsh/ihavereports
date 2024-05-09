const fs=require("fs")
const {exec,execFile,spawn, execSync}=require("child_process")
require('console.history')
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
                const child=execSync(`gcc ./modifiedCodes/${file} -o c${_+1} & move /y c${_+1}.exe ./executables/`)
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



const executeCodes=async ()=>{
    const programProcess = spawn('./executables/c1.exe', { stdio: ['pipe', 'pipe', 'pipe'], detached:false});

    const outputFileStream = fs.createWriteStream('output.txt');

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
      exit()
    });


    // const exe = spawn('cmd.exe', ['/c', 'cd ./executables & c1.exe'],
    //     {
    //         detached:false,
    //         stdio:[process.stdin,process.stdout,"pipe"]
    //     }
    // );

    // exe.stderr.on('data', (data) => { 
    //     console.error(data.toString()); 
    // }); 
    
    // exe.on('exit', (code) => { 
    //     console.log(`\n\nChild exited with code ${code}`); 
    //     console.log(console.history[0].arguments)
    // }); 

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
    modifyCodes
}