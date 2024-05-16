#!/usr/bin/env node
const {compileCodes,executeCodes,modifyCodes,clearFiles}=require("./execFile.js")
const {createDocData}=require("./docTemplate.js")
const {Packer}=require("docx")
const fs=require("fs")
const { exit } = require("process")
const collectData=async ()=>{
  let data=[]
  const codes=fs.readdirSync("./codes")
  const ouputs=fs.readdirSync("./outputs")
  for(let i=0;i<codes.length;i++){
    const o=fs.readFileSync(`./outputs/${ouputs[i]}`,"utf-8")
    let c=fs.readFileSync(`./codes/${codes[i]}`,"utf-8")
    let q;
    const questionRegex = /#question\(([\s\S]*?)\)/;
    const clearRegex= /\/\*[\s\S]*?\*\//g;
    const match = c.match(questionRegex);
    if (match && match[1]) {
      q = match[1]
      .split('\n')
      .map(line => line.trim())
      .join('\n');
    } else {
      q="--Write question here--"
    }
    c=c.replace(clearRegex,"").trimStart()
    data.push({question:q ,code:c,output:o})
  }
  return data
}

const run=async ()=>{
  try{
    clearFiles()
    modifyCodes().then(()=>{
      compileCodes().then(()=>{
        executeCodes().then(()=>{
          collectData().then((data)=>{
            createDocData(data).then((docData)=>{
              Packer.toBuffer(docData).then((buffer) => {
                fs.writeFileSync("My Document.docx", buffer);
                clearFiles()
                exit()
              });
            })
          })
        })
      })
    })
  }catch(err){
    console.log(err)
  }
}


run()