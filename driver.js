"use strict";

const { Blockchain, Block, Client, FakeNet, Miner, Transaction } = require('spartan-gold');

const VmBlock = require('./vmblock.js');

const VmClient = require('./vmclient.js');

console.log("Starting simulation.  This may take a moment...");

let contractAddress;

if (process.argv.length >= 2) {
  contractAddress = process.argv[2];
}

let fakeNet = new FakeNet();

// Clients
let alice = new VmClient({name: "Alice", net: fakeNet});
let bob = new Client({name: "Bob", net: fakeNet});
let charlie = new Client({name: "Charlie", net: fakeNet});

// Miners
let minnie = new Miner({name: "Minnie", net: fakeNet});
let mickey = new Miner({name: "Mickey", net: fakeNet});

// Creating genesis block
let genesis = Blockchain.makeGenesis({
  blockClass: VmBlock,
  transactionClass: Transaction,
  clientBalanceMap: new Map([
    [alice, 10000],
    [bob, 500],
    [charlie, 500],
    [minnie, 400],
    [mickey, 300]
  ]),
});

// Showing the initial balances from Alice's perspective, for no particular reason.
console.log("Initial balances:");
alice.showAllBalances();

fakeNet.register(alice, bob, charlie, minnie, mickey);

// Miners start mining.
minnie.initialize();
mickey.initialize();

// Alice deploys a contract.
setTimeout(() => {
  alice.postContractDeployTransaction([], {
    bytecode: "<block>\nSTORE 0\n<even_addr>\nSTORE 1\n<odd_addr>\nSTORE 2\nLOAD 0\nTIMESTAMP\nPUSH 2\nMOD\nJNZ odd\nLOAD 1\nJUMP end\nodd:\nLOAD 2\nend:\nRETURN",
    gasPrice: 100,
    gasLimit: 100000
  });
}, 1000);

// Alice pays Bob or Charlie, depending on the outcome of the contract.
setTimeout(() => {
  alice.postContractCallTransaction([], {
    args: {
      block: alice.lastBlock.serialize(),
      even_addr: bob.address,
      odd_addr: charlie.address
    },
    amount: 100,
    contractAddress: 0,
    gasPrice: 100,
    gasLimit: 100000
  });
}, 1000);

// Alice pays Bob or Charlie, depending on the outcome of the contract, which
// might be different from the previous call.
setTimeout(() => {
  alice.postContractCallTransaction([], {
    args: {
      block: alice.lastBlock.serialize(),
      even_addr: bob.address,
      odd_addr: charlie.address
    },
    amount: 100,
    contractAddress: 0,
    gasPrice: 100,
    gasLimit: 100000
  });
}, 1000);

// Print out the final balances after it has been running for some time.
setTimeout(() => {
  console.log("Final balances (Alice's perspective):");
  alice.showAllBalances();

  process.exit(0);
}, 10000);
