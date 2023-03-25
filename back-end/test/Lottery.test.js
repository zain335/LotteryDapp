const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());
const { abi, bytecode } = require("../compile");

let accounts;
let lottery;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
  lottery = await new web3.eth.Contract(abi)
    .deploy({ data: bytecode })
    .send({ from: accounts[0], gas: 1000000 });
});

describe("Lottery unit testing", () => {
  it("deployment check", () => {
    assert.ok(lottery.options.address);
  });

  it("multiple players should be able to enter in lottery", async () => {
    // enter player 0
    await lottery.methods
      .enterLottery()
      .send({ from: accounts[0], value: web3.utils.toWei("0.1", "ether") });

    // enter player 1
    await lottery.methods
      .enterLottery()
      .send({ from: accounts[1], value: web3.utils.toWei("0.1", "ether") });

    // enter player 2
    await lottery.methods
      .enterLottery()
      .send({ from: accounts[2], value: web3.utils.toWei("0.1", "ether") });

    const players = await lottery.methods
      .getPlayers()
      .call({ from: accounts[0] });

    assert.equal(accounts[0], players[0]);
    assert.equal(accounts[1], players[1]);
    assert.equal(accounts[2], players[2]);

    assert.equal(3, players.length);
  });

  it("requires a min ammount of ethers to enter in lottery", async () => {
    try {
      await lottery.methods
        .enterLottery()
        .send({ from: accounts[0], value: 200 });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it("only manager shloud be allowed to pick winner", async () => {
    try {
      await lottery.methods.pickWinner().send({ from: accounts[1] });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it("sends money to winner and resets the lottery", async () => {
    // get initial balance of player
    const initialBalance = await web3.eth.getBalance(accounts[0]);

    // enter a player
    await lottery.methods
      .enterLottery()
      .send({ from: accounts[0], value: web3.utils.toWei("1", "ether") });

    // get escrow balance
    let escrow = await lottery.methods.escrow().call();

    // check its equal to deposit ammount by player
    assert.equal(escrow, web3.utils.toWei("1", "ether"));

    // get final balance of player
    const finalBalance = await web3.eth.getBalance(accounts[0]);

    // check player balance reduciton by 1 ether after entring in lottery
    assert(initialBalance - finalBalance > web3.utils.toWei("1", "ether")); // user greater sign as some gas is also used

    // pick winner
    await lottery.methods.pickWinner().send({ from: accounts[0] });

    // assert reset of lottery
    const players = await lottery.methods.getPlayers().call();
    escrow = await lottery.methods.escrow().call();

    assert.equal(0, players.length);
    assert.equal(0, escrow);

    // get winner balance
    const winnerBalance = await web3.eth.getBalance(accounts[0]);
    // assert winner balance incremented
    assert(finalBalance - winnerBalance < web3.utils.toWei("0.001", "ether")); // 0.001 eth margin for gas used
  });
});
