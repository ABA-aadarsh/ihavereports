const { exit } = require("process");
const { allowedExtensions, CommandExec } = require("./src/commandExecutor.js");
const { checkFolderExists } = require("./src/lib.js");
const { createDocData } = require("./src/docGenerator.js");
const fs = require("fs");
const path = require("path");
const { Packer } = require("docx");
const { rl } = require("./src/readLineHandler.js");

function getUserInput(question) {
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
            ).trim() || "";
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
        exit(1);
    }
    let author = await getUserInput(
        "\nEnter author name (this would be shown in output)\n(user) ",
    );
    if (author == "\n") author = "user";
    console.log(`Set ${author} as author\n\n`);

    const executor = new CommandExec(codeFolderPath);

    const codeFiles = fs
        .readdirSync(path.resolve(codeFolderPath))
        .filter((i) => allowedExtensions.includes(i.split(".")[1]))
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
        exit(0);
    }

    executor.setCodeFiles(codeFiles);

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
        exit(0);
    });
};

main();
