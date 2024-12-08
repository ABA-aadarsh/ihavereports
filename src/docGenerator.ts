import fs from "node:fs"
import { AlignmentType, Header, Document, HeadingLevel,  Paragraph, TextRun,  PageNumber, PageBreak } from "docx"
import { randomDrive } from "./lib";

const PageTemplate=({
    question,
    code,
    output,
    last=false,
    questionIndex,
    author,
    fileName,
    drive
}: {
    question: string,
    code: string,
    output: string,
    last: boolean,
    questionIndex: number,
    author: string,
    fileName: string,
    drive: string
})=>{
    const questionArray=question.split("\n").filter(_=>_!="")
    const d = [
        new Paragraph(
            {
                heading:HeadingLevel.HEADING_1,
                children:[
                    new TextRun({
                        bold:true,
                        text:`Question ${questionIndex} : `
                    }),
                    new TextRun({
                        text: `${questionArray[0]}`
                    })
                ]
            }
        ),
        ...questionArray.splice(1).map((line,_)=>(
            new Paragraph({
                text: line
            })
        )),
        new Paragraph({
            heading:"Heading2",
            text:"Code"
        }),
        ...code.split("\n").map((line)=>(
            new Paragraph({
                text: line,
                spacing: {
                    after: 180
                }
            })
        )),
        new Paragraph({
            text: "",
            spacing: {
                after: 180
            }
        }),
        new Paragraph({
            heading:"Heading2",
            text:"Output"
        }),
        new Paragraph({
            style:"codeOutput",
            text: drive+`:\\${author}\\codes > ./${fileName}.o`
        }),
        new Paragraph({
            style:"codeOutput",
            text: ""
        })
        ,
        ...output.split("\n").map((line)=>(
            new Paragraph({
                style:"codeOutput",
                text: line
            })
        )),
    ]
    if(last!=true){
        d.push(
            new Paragraph(
                {
                    children:[
                        new PageBreak()
                    ]
                }
            )
        )
    }

    return d
}

const doc =(data:any[]=[])=>new Document({
    styles: {
        default: {
            heading1: {
                run: {
                    size: 24,
                    bold: false,
                    font:{
                        name:"Calibri"
                    }
                },
                paragraph: {
                    spacing: {
                        after: 120,
                    },
                },
            },
            heading2: {
                run: {
                    size: 24,
                    bold: true,
                },
                paragraph: {
                    spacing: {
                        before: 360,
                        after: 240,
                    },
                },
            },
            document: {
                run: {
                    size: "11pt",
                    font: "Calibri",
                },
                paragraph: {
                    alignment: AlignmentType.LEFT,
                },
            },
        },
        paragraphStyles:[
            {
                id: "pageNumber",
                name: "Page Number",
                basedOn: "Normal",
                quickFormat: true,
                run: {
                    font:{
                        name:"Monospace",
                        
                    },
                    size:18,
                    color:"2D3142"
                },
            },
            {
                id: "codeOutput",
                name: "Code Output",
                basedOn: "Normal",
                quickFormat: true,
                run: {
                    font:{
                        name:"Consolas",
                        
                    },
                    color:"4C566A",
                    size:22
                },
            }
        ]
    },
    sections: [
        {
            headers:{
                default: new Header({
                    children:[
                        new Paragraph({
                            style:"pageNumber",
                            children:[
                                new TextRun({
                                    children:[PageNumber.CURRENT,"/",PageNumber.TOTAL_PAGES]
                                })
                            ]
                        })
                    ]
                })
            },
            children: [
                ...data
            ]
        },
    ],
});


export const createDocData=async(
    data: {
        code:string,
        name:string,
        consoleInterface: string,
        question: string,
    }[], 
    author:string = "user"
): Promise<Document>=>{
    const drive = randomDrive(["C","D","E"])
   let docData=[]
    for(let i=0;i<data.length;i++){
        docData.push(...PageTemplate(
            {
                author: author,
                code: data[i].code,
                fileName: data[i].name,
                output: data[i].consoleInterface,
                question: data[i].question,
                questionIndex: i+1,
                last: i==data.length-1,
                drive: drive
            }
        ))
    }
    return doc(docData)
}