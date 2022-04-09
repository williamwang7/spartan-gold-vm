'use strict';

const { Blockchain } = require('spartan-gold');

let opcodes = {};

/**
 * An OpCode has a cost in gas and an evaluate method
 * that takes in any arguments it might have and the
 * vm.
 */
class OpCode {
  constructor(gasPrice, evaluate = ()=>{ throw new Error("Not implemented.") }) {
    this.gasPrice = gasPrice;
    this.evaluate = evaluate;
  }
}

// Arithmetic operations
opcodes['ADD'] = new OpCode(3, (args,vm) => {
  let x = vm.stack.pop();
  let y = vm.stack.pop();
  vm.stack.push(x + y);
});
opcodes['SUB'] = new OpCode(3, (args,vm) => {
  let x = vm.stack.pop();
  let y = vm.stack.pop();
  // Reversing the order for ease of evaluation.
  vm.stack.push(y - x);
});
opcodes['MUL'] = new OpCode(5, (args,vm) => {
  let x = vm.stack.pop();
  let y = vm.stack.pop();
  vm.stack.push(x * y);
});
opcodes['DIV'] = new OpCode(5, (args,vm) => {
  let x = vm.stack.pop();
  let y = vm.stack.pop();
  // Reversing the order for ease of evaluation.
  vm.stack.push(y / x);
});
opcodes['MOD'] = new OpCode(5, (args,vm) => {
  let x = vm.stack.pop();
  let y = vm.stack.pop();
  // Reversing the order for ease of evaluation.
  vm.stack.push(y % x);
});

// Logic operations
opcodes['LT'] = new OpCode(3, (args,vm) => {
  let x = vm.stack.pop();
  let y = vm.stack.pop();
  let res = x < y ? 1 : 0;
  vm.stack.push(res);
});
opcodes['GT'] = new OpCode(3, (args,vm) => {
  let x = vm.stack.pop();
  let y = vm.stack.pop();
  let res = x > y ? 1 : 0;
  vm.stack.push(res);
});
opcodes['EQ'] = new OpCode(3, (args,vm) => {
  let x = vm.stack.pop();
  let y = vm.stack.pop();
  let res = x === y ? 1 : 0;
  vm.stack.push(res);
});
opcodes['ISZERO'] = new OpCode(3, (args,vm) => {
  let x = vm.stack.pop();
  let res = x === 0 ? 1 : 0;
  vm.stack.push(res);
});

// Stack operations
opcodes['PUSH'] = new OpCode(3, (args,vm) => {
  let n = parseInt(args.shift());
  vm.stack.push(n);
});
opcodes['PUSHARG'] = new OpCode(3, (args,vm) => {
  let val = args.shift();
  vm.stack.push(val);
})
opcodes['POP'] = new OpCode(2, (args,vm) => {
  vm.stack.pop();
});
opcodes['LOAD'] = new OpCode(3, (args,vm) => {
  // Get the argument to determine the memory address,
  // look up the corresponding value in the VM's memory,
  // and push the memory on to the stack.
  let n = parseInt(args.shift());
  let memVal = vm.memory[n];
  vm.stack.push(memVal);
});
opcodes['STORE'] = new OpCode(3, (args,vm) => {
  // Get the memory address from the first argument,
  // pop the value from the top of the stack,
  // and store it in the VM's memory at the specified address.
  let n = parseInt(args.shift());
  let val = vm.stack.pop();
  vm.memory[n] = val;
});

// Process flow operations
opcodes['JUMP'] = new OpCode(8, (args,vm) => {
  let label = args.shift();
  vm.pc = vm.labels[label];
});
opcodes['JZ'] = new OpCode(10, (args,vm) => {
  // Jump to the specified label if the
  // value on top of the stack is 0.
  let label = args.shift();
  let x = vm.stack.pop();
  if (x === 0) {
    vm.pc = vm.labels[label];
  }
});
opcodes['JNZ'] = new OpCode(10, (args,vm) => {
  // Jump to the specified label if the
  // value on top of the stack is not a 0.
  let label = args.shift();
  let x = vm.stack.pop();
  if (x != 0) {
    vm.pc = vm.labels[label];
  }
});
opcodes['RETURN'] = new OpCode(0, (args,vm) => {
  let val = vm.stack.pop();
  // let val = parseInt(vm.stack.pop());
  return val;
});

// Environment operations
opcodes['TIMESTAMP'] = new OpCode(5, (args,vm) => {
  let x = vm.stack.pop();
  let block = Blockchain.deserializeBlock(x);
  vm.stack.push(block.timestamp);
});

// Debugging opcodes -- not used in a VM like the EVM.
opcodes['PRINT'] = new OpCode(0, (args,vm) => {
  let val = parseInt(vm.stack.pop());
  console.log(val);
});
opcodes['PRINTARG'] = new OpCode(0, (args,vm) => {
  let val = vm.stack.pop();
  console.log(val);
});

exports.opcodes = opcodes;
