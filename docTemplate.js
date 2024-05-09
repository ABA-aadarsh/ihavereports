// Example on how to customize the look at feel using Styles

const fs=require("fs")
const { AlignmentType, Header, Document, HeadingLevel, LevelFormat, Packer, Paragraph, TextRun, UnderlineType, PageNumber } = require("docx");

const doc = new Document({
    styles: {
        default: {
            heading1: {
                run: {
                    size: 28,
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
                        before: 240,
                        after: 120,
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
                new Paragraph(
                    {
                        text:"Problem 1: Write a program to display sum of two numbers.",
                        heading:HeadingLevel.HEADING_1
                    }
                ),
                new Paragraph({
                    heading:"Heading2",
                    text:"Code"
                }),
                new Paragraph(
                    {
                        children:[
                            new TextRun(
                                {
                                    text: "#include<stdio.h>",
                                    font:{
                                        name:"Monospace"
                                    }
                                }
                            )
                        ]
                    }
                ),
                new Paragraph({
                    heading:"Heading2",
                    text:"Output"
                }),
            ]
        },
    ],
});

module.exports= {
    doc
}