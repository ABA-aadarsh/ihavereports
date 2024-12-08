import process from "node:process";
import {CommandExec, allowedExtensions} from "./commandExecutor.js"
import { checkFolderExists } from "./lib.js";
import { createDocData } from "./docGenerator.js";
import fs from "node:fs"
import path from "node:path"
import { Packer } from "docx";
import rl from "./readLineHandler.js";

function getUserInput(question: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

const main = async () => {
    console.log(":) ihavereports\n\n");
    let codeFolderPath;
    const argv = process.argv;
    if (argv.length < 3) {
        codeFolderPath =
            (
                await getUserInput(
                    "Enter the folder path where your codes are saved \n(if this progam exist in the same folder just press enter): ",
                )
            ).trim();
        if (codeFolderPath == "") {
            codeFolderPath = ".";
        }
    } else {
        codeFolderPath = argv[2]; //TODO: Verify
    }

    const folderStatus = checkFolderExists(codeFolderPath);
    if (!folderStatus) {
        console.log(
            "Error in accessing folder\nProbably the directory does not exists",
        );
        process.exit(1);
    }
    let author = await getUserInput(
        "\nEnter author name (this would be shown in output)\n(user) ",
    );
    if (author == "\n") author = "user";
    console.log(`Set ${author} as author\n\n`);

    const executor = new CommandExec(codeFolderPath);

    const codeFiles = fs
        .readdirSync(path.resolve(codeFolderPath))
        .filter((i) => allowedExtensions.has(i.split(".")[1]))
        .map((i) => ({
            path: path.join(codeFolderPath, i),
            name: i.split(".")[0],
            ext: i.split(".")[1],
            question: null,
            consoleInterface: null,
            code: null,
        }))
        .sort((a, b) => {
            return Number(a.name) - Number(b.name);
        });

    if (codeFiles.length == 0) {
        console.log("It seems there is no codes files inside. Exiting\n");
        process.exit(0);
    }

    executor.setCodeFiles(codeFiles);
    console.log("Codes are being compiled.\nWait.")
    executor.modifyCode();

    executor.compileAll();

    await executor.executeAll();
    console.log(
        "-----------\nPrograms execution done. \n\nNow collecting data...\n",
    );
    const data = executor.collectData();
    console.log("Done\n");
    executor.clearTemps();
    const docData = await createDocData(data, author);
    Packer.toBuffer(docData).then(async (buffer) => {
        fs.writeFileSync(path.join(codeFolderPath, "Report.docx"), buffer);
        console.log(`Report.docx is created at path ${codeFolderPath}`);
        console.log(
            "\nSource code available at https://github.com/ABA-aadarsh/ihavereports\n\n",
        );

        await getUserInput("Press enter to exit: ");
        rl.close();
        process.exit(0);
    });
};

main();
