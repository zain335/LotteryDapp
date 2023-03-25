const HDWalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");
const { abi, bytecode } = require("./compile");

const provider = new HDWalletProvider(
  "robust fun ginger increase click promote cushion appear pass bike canyon sure",
  "https://goerli.infura.io/v3/bffe7942157c48cf8559fe5befce644e"
);

const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log("Account 0:", accounts[0]);

  const lottery = await new web3.eth.Contract(abi)
    .deploy({ data: bytecode })
    .send({
      from: accounts[0],
      gas: "1000000",
    });

  console.log("Deployed Address", lottery.options.address);
  console.log(abi);
};
deploy();
