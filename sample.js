const { spawn } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const { exit } = require('process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Compile and run the C program
const compilerProcess = spawn('gcc', ['1.c', '-o', 'c1'], { stdio: 'pipe' });

compilerProcess.stderr.on('data', (data) => {
  console.error(`Compiler error: ${data}`);
});

compilerProcess.on('close', (code) => {
  if (code === 0) {
    console.log('Compilation successful. Running program...');

    const programProcess = spawn('c1.exe', { stdio: ['pipe', 'pipe', 'pipe'], detached:false});

    const outputFileStream = fs.createWriteStream('output.txt');

    programProcess.stdout.on('data', (data) => {
      console.log(`${data}`);
      outputFileStream.write(data);
    });

    rl.on('line', (input) => {
      programProcess.stdin.write(input + '\n');
      outputFileStream.write(input+"\n")
    });

    programProcess.on('close', (code) => {
      console.log('Program exited with code', code);
      outputFileStream.end();
      exit()
    });
  } else {
    console.error('Compilation failed.');
  }
});
