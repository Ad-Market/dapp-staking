import React, { Component } from "react";
import HappyChefContract from "./contracts/HappyChef.json";
import getWeb3 from "./getWeb3";

import Button from 'react-bootstrap/Button';
import CardDeck from 'react-bootstrap/CardDeck';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';

import Pool from './components/Pool';

import "./App.css";


class App extends Component {
  state = { pools: [], web3: null, accounts: null, contract: null };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = HappyChefContract.networks[networkId];
      console.log('HappyChef address = ' + deployedNetwork.address);
      const instance = new web3.eth.Contract(
        HappyChefContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Callback when account is changed in Metamask
      window.ethereum.on('accountsChanged', accounts => {
          console.log(`Accounts updated: ${accounts}`);
          this.setState({ accounts: accounts });
      });

      window.ethereum.on('chainChanged', networkId => {
          console.log(`Network updated: ${networkId}`);
      });

      this.setState({ web3, accounts, contract: instance }, this.populate);
    } catch (error) {
      alert(`Failed to load web3, accounts, or contract. Check console for details.`,);
      console.error(error);
    }
  };


  populate = async () => {
    const { contract } = this.state;

    const nbPools = await contract.methods.getNbPools().call();
    var pools = Array.from({length: nbPools}, (_, i) => i)
   
    this.setState({ pools: pools });
  };


  ellipsis(s) {
    return s.substring(0, 6) + '...' + s.substring(s.length - 4, s.length);
  }


  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }

    return (
      <div>
        <Navbar bg="light">
          <Navbar.Brand className="brand">
            <img src="images/happy.png" alt="Happy" height="30" className="d-inline-block align-top" />
            { ' ' } Happy Staking
          </Navbar.Brand>
          <Navbar.Collapse className="justify-content-end">
                <Button variant="outline-primary">{ this.state.accounts ? this.ellipsis(this.state.accounts[0]) : 'Connect' }</Button>
          </Navbar.Collapse>
        </Navbar>

        <Container>
            <CardDeck style={{ padding: '16px' }}>
              { this.state.pools.map(pool => (
                <Pool web3={this.state.web3} contract={this.state.contract} account={this.state.accounts[0]} id={pool} key={pool} />
              ))}
            </CardDeck>
        </Container>
      </div>
    );
  }
}

export default App;
