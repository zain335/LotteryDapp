import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";

import web3 from "./web3";
import lottery from "./lottery";

class App extends Component {
  state = {
    manager: "",
    players: [],
    balance: "",
    value: "",
    message: "",
    winner: "",
  };

  async componentDidMount() {
    const manager = await lottery.methods.manager().call();
    const players = await lottery.methods.getPlayers().call();
    const balance = await web3.eth.getBalance(lottery.options.address);

    this.setState({ manager, players, balance });
  }

  onSubmit = async (event) => {
    event.preventDefault();

    const accounts = await web3.eth.getAccounts();

    this.setState({ message: "Waiting on transaction success..." });

    await lottery.methods.enterLottery().send({
      from: accounts[0],
      value: web3.utils.toWei(this.state.value, "ether"),
    });

    this.setState({ message: "You have been entered!" });
  };

  onPickWinner = async (event) => {
    event.preventDefault();

    this.setState({ message: "Wating on transaction success..." });

    await lottery.methods.pickWinner().send({
      from: this.state.manager,
    });

    const winner = await lottery.methods.winner().call();

    this.setState({ winner });

    this.setState({ message: "A Winner has been picked!" });
  };
  render() {
    return (
      <div>
        <h2>Lottery Contract</h2>
        <p>
          This Contract is managed by {this.state.manager}
          <br />
          Thre are currently {this.state.players.length} competeing to win{" "}
          {web3.utils.fromWei(this.state.balance, "ether")} ether!
        </p>
        <hr />
        <form onSubmit={this.onSubmit}>
          <h4>Want to try your luck?</h4>
          <div>
            <label>Amount of Ether to enter</label>
            <input
              value={this.state.value}
              onChange={(event) => this.setState({ value: event.target.value })}
            />
            <br />
          </div>
          <button>Enter</button>
        </form>
        <hr />
        <div>
          <label>
            <h5>Pick Winner</h5>
            <button onClick={this.onPickWinner}>Pick Winner</button>
          </label>
        </div>
        <hr />
        <div>
          <p>
            <h5>The Winner is </h5>
            <h3>{this.state.winner}</h3>
          </p>
        </div>
        <h1>{this.state.message}</h1>
      </div>
    );
  }
}

export default App;
