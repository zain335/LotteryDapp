const path = require("path");
const fs = require("fs");
const solc = require("solc");

const inboxPath = path.resolve(__dirname, "contracts", "Lottery.sol");
const source = fs.readFileSync(inboxPath, "utf8");

// var input = {
//   language: "Solidity",
//   sources: {
//     "Lottery.sol": {
//       content: source,
//     },
//   },
//   settings: {
//     outputSelection: {
//       "*": {
//         "*": ["*"],
//       },
//     },
//   },
// };

const input = {
  language: "Solidity",
  sources: {
    "Lottery.sol": {
      content: source,
    },
  },
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
    outputSelection: {
      "*": {
        "": ["ast"],
        "*": [
          "abi",
          "metadata",
          "devdoc",
          "userdoc",
          "storageLayout",
          "evm.legacyAssembly",
          "evm.bytecode",
          "evm.deployedBytecode",
          "evm.methodIdentifiers",
          "evm.gasEstimates",
          "evm.assembly",
        ],
      },
    },
    evmVersion: "byzantium",
  },
};

var output = JSON.parse(solc.compile(JSON.stringify(input)));


exports.abi = output.contracts["Lottery.sol"]["Lottery"].abi;
exports.bytecode = output.contracts["Lottery.sol"]["Lottery"].evm.bytecode.object;
