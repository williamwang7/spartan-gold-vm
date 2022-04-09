"use strict";

const { Block } = require('spartan-gold');

const GleamVirtualMachine = require('./gleam.js').GleamVirtualMachine;

const fs = require('fs');

module.exports = class VmBlock extends Block {

  constructor(rewardAddr, prevBlock, target, coinbaseReward) {
    super(rewardAddr, prevBlock, target, coinbaseReward);

    this.updateContracts(prevBlock);
  }

  // Update the list of contracts and the VM stored on the block.
  updateContracts(prevBlock, bytecode="") {
    this.vm = prevBlock ? prevBlock.vm : new GleamVirtualMachine(0, {});
    this.numContracts = prevBlock ? prevBlock.numContracts : 0;
    this.contracts = prevBlock ? new Map(prevBlock.contracts) : new Map();

    if (bytecode.length > 0) {
      this.contracts.set(this.numContracts, bytecode);
      this.numContracts++;
    }
  }

  rerun(prevBlock) {
    this.updateContracts(prevBlock);
    return super.rerun(prevBlock);
  }
}
