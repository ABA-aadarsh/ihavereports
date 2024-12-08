import fs from "node:fs"
import {spawn, execSync} from "node:child_process"
import {createEmptyFolder, clearExecutables} from "./lib.js"
import rl from "./readLineHandler.js";
const os = {
    linux: "linux",
    windows: "win32",
};
export const allowedExtensions = new Set(["cpp", "c"]);

export class CommandExec {
    private folderPath: string;
    private machine: string
    private folderNames = {
        consoleOutput: "consoleInterface",
        modifiedCodes: "modifiedCodes",
    };
    private codesFiles: {
        path: string,
        name: string,
        ext: string,
        question: string | null,
        consoleInterface: string | null,
        code: string | null
    }[]

    constructor(folderPath:string, list:{
        path: string,
        name: string,
        ext: string,
        question: string | null,
        consoleInterface: string | null,
        code: string | null
    }[] = []) {
        this.folderPath = folderPath;

        if (process.platform == os.linux) {
            this.machine = os.linux;
        } else if (process.platform == os.windows) {
            this.machine = os.windows;
        } else {
            throw Error("Seems application can't run on this machine");
        }
        this.codesFiles = list.filter((i) =>
            allowedExtensions.has(i.ext)
        );

        createEmptyFolder(this.folderPath, this.folderNames.modifiedCodes);
        createEmptyFolder(this.folderPath, this.folderNames.consoleOutput);
        clearExecutables(this.folderPath);
    }

    setCodeFiles(list: typeof this.codesFiles = []) {
        this.codesFiles = list.filter((i) => allowedExtensions.has(i.ext));
    }
    getCompileCommand(ext: string, fullpath:string, fileName:string, exePaths: string) {
        const outputType = this.machine == os.linux ? "o" : "exe";
        return `${ext == "c" ? "gcc" : "g++"} ${require("path").resolve(fullpath).replace(/ /g, `\\ `)} -o ${require("path").resolve(exePaths, fileName).replace(/ /g, `\\ `)}.${outputType}`;
    }
    async executeAll() {
        const executePromiseSeries = async (iterable: string[], action: (data:any)=>any) => {
            try {
                for (const x of iterable) {
                    console.log("Executing Program : ", x);
                    await action(x);
                    console.log("\n");
                }
                return true;
            } catch (err) {
                console.log(err);
                return false;
            }
        };
        const executables = this.codesFiles.map((i) => {
            return i.name + (this.machine == os.linux ? ".o" : ".exe");
        });

        const executePromise = (e: string) =>
            new Promise((resolve) => {
                const programProcess = spawn(
                    require("path").resolve(this.folderPath, e),
                    {
                        stdio: ["pipe", "pipe", "pipe"],
                        detached: false,
                        cwd: require("path").resolve(this.folderPath),
                    },
                );
                const outputFileStream = fs.createWriteStream(
                    require("path").resolve(
                        this.folderPath,
                        this.folderNames.consoleOutput,
                        `${e.split(".")[0]}.txt`,
                    ),
                );
                programProcess.stdout.on("data", (data) => {
                    console.log(`${data}`);
                    outputFileStream.write(data);
                });
                rl.on("line", (input) => {
                    programProcess.stdin.write(input + "\n");
                    outputFileStream.write(input + "\n");
                });

                programProcess.on("close", (code) => {
                    console.log(
                        "Program execution completed.\n Execution code = ",
                        code,
                    );
                    outputFileStream.end();
                    resolve(1);
                });
            });
        await executePromiseSeries(executables, executePromise);
    }
    compile({ fileName, sourcepath, executablePath, ext }:{
        fileName: string, sourcepath: string, executablePath: string, ext: string
    }) {
        const command = this.getCompileCommand(
            ext,
            sourcepath,
            fileName,
            executablePath,
        );
        execSync(command);
        return true;
    }
    compileAll() {
        for (let i = 0; i < this.codesFiles.length; i++) {
            const _ = this.codesFiles[i];
            this.compile({
                fileName: _.name,
                sourcepath: _.path,
                executablePath: this.folderPath,
                ext: _.ext,
            });
        }
    }
    modifyCode() {
        function addFlushToPrintf(code: string) {
            const pattern = /printf\s*\(([^)]+)\);/g;
            return code.replace(pattern, (match, printfArgs) => {
                return `printf(${printfArgs}); fflush(stdout);`;
            });
        }

        const targetedFiles = this.codesFiles.filter((i) => i.ext == "c");

        targetedFiles.forEach(async (file, _) => {
            const fileFullName = file.name + "." + file.ext;
            const a = fs.readFileSync(file.path, "utf-8");
            const modified = addFlushToPrintf(a);
            targetedFiles[_].path = require("path")
                .resolve(
                    this.folderPath,
                    this.folderNames.modifiedCodes,
                    fileFullName,
                )
                .replace(/ /g, `\\ `);
        });
        return true;
    }

    collectData(): 
    {   path: string;
        name: string;
        ext: string;
        question: string
        consoleInterface: string
        code: string
    }[]
    {
        // collect console interface and questions
        const consoleBasePath = require("path").join(
            this.folderPath,
            this.folderNames.consoleOutput,
        );
        const questionRegex = /#question\(([\s\S]*?)\)/;
        const clearRegex = /\/\*[\s\S]*?\*\//g;
        let question;
        this.codesFiles.forEach((i, index) => {
            const consoleData = fs.readFileSync(
                require("path").join(consoleBasePath, `${i.name}.txt`),
                "utf-8",
            );
            const codeData = fs.readFileSync(
                require("path").join(this.folderPath, `${i.name}.${i.ext}`),
                "utf-8",
            );

            const questionMatch = codeData.match(questionRegex);
            if (questionMatch && questionMatch[1]) {
                question = questionMatch[1]
                    .split("\n")
                    .map((line) => line.trim())
                    .join("\n");
            } else {
                question = "__ Write Question Here __";
            }
            this.codesFiles[index].code = codeData
                .replace(clearRegex, "")
                .trimStart();
            this.codesFiles[index].consoleInterface = consoleData;
            this.codesFiles[index].question = question;
        });
        return this.codesFiles.map(
            i=>(
                {
                    ...i,
                    code: i.code || "",
                    question: i.question || "",
                    consoleInterface: i.consoleInterface || ""
                }
            )
        );
    }
    clearTemps() {
        createEmptyFolder(this.folderPath, this.folderNames.modifiedCodes);
        createEmptyFolder(this.folderPath, this.folderNames.consoleOutput);
        fs.rmdirSync(
            require("path").join(
                this.folderPath,
                this.folderNames.modifiedCodes,
            ),
        );
        fs.rmdirSync(
            require("path").join(
                this.folderPath,
                this.folderNames.consoleOutput,
            ),
        );
    }
}