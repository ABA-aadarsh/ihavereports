const fs = require("fs")
const path = require("path")
const checkFolderExists =  (folderpath)=>{
    if(fs.existsSync(folderpath)) return true;
    return false;
}
const createEmptyFolder = (basepath, folderName) =>  {
    const givenFolderPath = path.resolve(basepath, folderName)
    if (fs.existsSync(givenFolderPath)) {
        fs.readdirSync(givenFolderPath).forEach(file => {
            const curPath = path.resolve(givenFolderPath, file);
            fs.unlinkSync(curPath);
        });
    } else {
        fs.mkdirSync( givenFolderPath, { recursive: true });
    }
}


const clearExecutables = (folderpath)=>{
    fs.readdirSync(
        folderpath
    ).forEach(file => {
        if(file.split(".")[1]=="o" || file.split(".")[1]=="exe"){
            const currentPath = path.resolve(folderpath, file)
            fs.unlinkSync(currentPath)
        }
    })
}

module.exports ={
    checkFolderExists,
    createEmptyFolder,
    clearExecutables
}