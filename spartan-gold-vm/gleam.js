'use strict';

const fs = require('fs');
const opcodes = require('./op-codes.js').opcodes;

/**
 * GLEAM is the Gas-Limited EVM-like virtuAl Machine.
 */
class GleamVirtualMachine {

  constructor() {
    this.stack = [];
    this.memory = [];
    this.labels = {};
  }

  /*
  * Converts raw bytecode into a GLEAM-readable bytecode file.
  */
  static writeToGleamBytecode(bytecodeString, contractName, args) {
    let bytecodeFile = contractName + ".gleam";
    fs.writeFileSync(bytecodeFile, "");

    let commands = bytecodeString.split("\n");
    commands.forEach((command, i) => {
      if (command.charAt(0) == "<") {
        let arg_name = command.substring(1, command.length - 1);
        command = "PUSHARG " + args[arg_name] + "\n";
      } else {
        command = command + "\n";
      }
      fs.appendFileSync(bytecodeFile, command);
    });
    return bytecodeFile;
  }

  /**
   * Loads a bytecode file and returns an array of strings,
   * which are the commands within the file.
   */
  static loadBytecode(bytecodeFile) {
    let contents = fs.readFileSync(bytecodeFile, 'utf8');
    let lines = contents.trim().split('\n');
    return lines.map((ln) => ln.replace(/\s*#.*/, ''));
  }

  /**
   * Evaluates the specified file, throwing an exception
   * if the gasLimit is exceeded.
   */
  evaluate(bytecodeFile, gasLimit) {
    this.bytecode = this.constructor.loadBytecode(bytecodeFile);

    // Get all the labels.
    for (let i = 0; i < this.bytecode.length; i++) {
      if (this.bytecode[i].trim().endsWith(":")) {
        this.labels[this.bytecode[i].trim().replace(/:/, '')] = i;
      }
    }

    // Initializing the program counter to keep track of our
    // place within the program.
    this.pc = 0;

    while (this.pc<this.bytecode.length) {
      let ln = this.bytecode[this.pc];

      // Skip label lines (already processed)
      if (!ln.trim().endsWith(":")) {
        let [opcode, ...args] = ln.split(/\s+/);
        let op = opcodes[opcode];

        let val;
        if (op.gasPrice <= gasLimit) {
          val = op.evaluate(args, this);
          gasLimit -= op.gasPrice;
        } else {
          throw new Error("Out of gas!");
        }

        // Check for an early return;
        if (val !== undefined) return val;
      }

      // Incrementing ther program counter to process the next line.
      this.pc++;
    }
  }
}

exports.GleamVirtualMachine = GleamVirtualMachine;
