#!/usr/bin/env node

// import readline from "readline"
// import { Packer } from "docx";
// import {doc} from "./docTemplate.js"
// import * as fs from "fs";
// import { exec } from "child_process";
// import { compileCodes, executeCodes} from "./execFile.js";
const {compileCodes,executeCodes,modifyCodes}=require("./execFile.js")
const {doc}=require("./docTemplate.js")
const {Packer}=require("docx")
const fs=require("fs")
const { exit } = require("process")

// await compileCodes().then(async()=>{
//   await executeCodes()
// })


// compileCodes().then(()=>{
//   executeCodes()
// })
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync("My Document.docx", buffer);
});

const run=async ()=>{
  try{
    const modified=await modifyCodes()
    if(modified){
      const compiled=await compileCodes()
      if(compiled){
        await executeCodes()
      }
    }
  }catch(err){
    console.log(err)
  }
}


run()