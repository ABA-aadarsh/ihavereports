// const fs=require("fs")
// const { AlignmentType, Header, Document, HeadingLevel,  Paragraph, TextRun,  PageNumber, PageBreak } = require("docx");

// const PageTemplate=(question,code,output, last=false, questionIndex)=>{
//     const questionArray=question.split("\n").filter(_=>_!="")
//     const d = [
//         new Paragraph(
//             {
//                 heading:HeadingLevel.HEADING_1,
//                 children:
//                 [
//                     new TextRun({
//                         bold:true,
//                         text:`Question ${questionIndex} : `
//                     }),
//                     new TextRun({
//                         text: `${questionArray[0]}`
//                     })
//                 ]
//             }
//         ),
//         ...questionArray.splice(1).map((line,_)=>(
//             new Paragraph({
//                 text: line
//             })
//         )),
//         new Paragraph({
//             heading:"Heading2",
//             text:"Code"
//         }),
//         ...code.split("\n").map((line)=>(
//             new Paragraph({
//                 text: line
//             })
//         )),
//         new Paragraph({
//             heading:"Heading2",
//             text:"Output"
//         }),
//         ...output.split("\n").map((line)=>(
//             new Paragraph({
//                 style:"codeOutput",
//                 text: line
//             })
//         )),
//     ]
//     if(last!=true){
//         d.push(
//             new Paragraph(
//                 {
//                     children:[
//                         new PageBreak()
//                     ]
//                 }
//             )
//         )
//     }

//     return d
// }

// const doc =(data=[])=>new Document({
//     styles: {
//         default: {
//             heading1: {
//                 run: {
//                     size: 24,
//                     bold: false,
//                     font:{
//                         name:"Calibri"
//                     }
//                 },
//                 paragraph: {
//                     spacing: {
//                         after: 120,
//                     },
//                 },
//             },
//             heading2: {
//                 run: {
//                     size: 24,
//                     bold: true,
//                 },
//                 paragraph: {
//                     spacing: {
//                         before: 360,
//                         after: 240,
//                     },
//                 },
//             },
//             document: {
//                 run: {
//                     size: "11pt",
//                     font: "Calibri",
//                 },
//                 paragraph: {
//                     alignment: AlignmentType.LEFT,
//                 },
//             },
//         },
//         paragraphStyles:[
//             {
//                 id: "pageNumber",
//                 name: "Page Number",
//                 basedOn: "Normal",
//                 quickFormat: true,
//                 run: {
//                     font:{
//                         name:"Monospace",
                        
//                     },
//                     size:18,
//                     color:"2D3142"
//                 },
//             },
//             {
//                 id: "codeOutput",
//                 name: "Code Output",
//                 basedOn: "Normal",
//                 quickFormat: true,
//                 run: {
//                     font:{
//                         name:"Consolas",
                        
//                     },
//                     color:"4C566A",
//                     size:22
//                 },
//             }
//         ]
//     },
//     sections: [
//         {
//             headers:{
//                 default: new Header({
//                     children:[
//                         new Paragraph({
//                             style:"pageNumber",
//                             children:[
//                                 new TextRun({
//                                     children:[PageNumber.CURRENT,"/",PageNumber.TOTAL_PAGES]
//                                 })
//                             ]
//                         })
//                     ]
//                 })
//             },
//             children: [
//                 ...data
//             ]
//         },
//     ],
// });


// const createDocData=async(data=[])=>{
//    let docData=[]
//     for(let i=0;i<data.length;i++){
//         docData.push(...PageTemplate(data[i].question,data[i].code,data[i].output,i==data.length-1,i+1))
//     }
//     return doc(docData)
// }

// module.exports= {
//     createDocData
// }























