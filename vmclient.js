"use strict";

const { Client, Blockchain } = require('spartan-gold');

const GleamVirtualMachine = require('./gleam.js').GleamVirtualMachine;

const fs = require('fs');

module.exports = class VmClient extends Client {

  // This transaction deploys a new contract to the list stored on the block.
  postContractDeployTransaction(outputs, data, fee=Blockchain.DEFAULT_TX_FEE) {
    this.lastBlock.updateContracts(this.blocks.get(this.lastBlock.prevBlockHash), data.bytecode);

    return this.postGenericTransaction({
      outputs: outputs,
      fee: fee,
      data: {
        type: 'DEPLOY',
        bytecode: data.bytecode
      }
    });
  }

  // This transaction calls an existing contract from the list stored on the
  // block.
  postContractCallTransaction(outputs, data, fee=Blockchain.DEFAULT_TX_FEE) {
    let bytecodeString = this.lastBlock.contracts.get(data.contractAddress);
    let bytecodeFile = this.lastBlock.vm.constructor.writeToGleamBytecode(bytecodeString, "sample", data.args);
    let result = this.lastBlock.vm.evaluate(bytecodeFile, 1000);
    outputs.push({amount: data.amount, address: result});

    return this.postGenericTransaction({
      outputs: outputs,
      fee: fee,
      data: {
        type: 'CALL',
        args: data.args,
        contractAddress: data.contractAddress
      }
    });
  }
}
