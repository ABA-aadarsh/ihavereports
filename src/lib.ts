import fs from "node:fs"
import path from "node:path"

export const checkFolderExists =  (folderpath: string)=>{
    return fs.existsSync(folderpath);
}
export const createEmptyFolder = (basepath:string, folderName: string) =>  {
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


export const clearExecutables = (folderpath:string)=>{
    // only on production Mode 
    const ignore = [process.argv[0]]
    fs.readdirSync(
        folderpath
    ).forEach(file => {
        const filepath = path.resolve(folderpath, file)
        if(ignore.includes(filepath)){
            return 
        }else{
            if(file.split(".")[1]=="o" || file.split(".")[1]=="exe"){
                const currentPath = filepath
                fs.unlinkSync(currentPath)
            }
        }
    })
}


export const randomDrive = (list:string[]=[])=>{
    const i = Math.floor(Math.random()*list.length)
    return list[i]
}