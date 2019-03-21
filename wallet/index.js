const { INITIAL_BALANCE } = require('../config');
const ChainUtil = require('../chain_util');
const Transaction = require('./transaction');

class Wallet {
  constructor() {
    this.balance = INITIAL_BALANCE;
    this.keyPair = ChainUtil.genKeyPair();
    this.publicKey = this.keyPair.getPublic().encode('hex');
  }

  toString() {
    return `Wallet -
      Balance   : ${this.balance}
      publicKey : ${this.publicKey.toString()}` 
  }

  sign(dataHash) {
    return this.keyPair.sign(dataHash);
  }

  //create transaction with the actual wallet
  createTransaction(recipient, amount, blockchain, transactionPool) {
    this.balance = this.calculateBalance(blockchain);
    
    if (amount > this.balance) {
      console.log(`Amount: ${amount} exceeds balance.`);
      return;
    }
    // it return if a transaction with thiw public key already exists in the pool
    let transaction = transactionPool.existingTransaction(this.publicKey);
     
    if (transaction) {
      transaction.update(this, recipient, amount);
    }
    else {
      transaction = Transaction.newTransaction(this, recipient, amount);
      transactionPool.updateOrAddTransaction(transaction);
    }
    return transaction;
  }

  calculateBalance(blockchain) {
    let balance = this.balance;
    let transactions = [];
    blockchain.chain.forEach(block => block.data.forEach(transaction => {
      transactions.push(transaction);
    }));
    //an array of input transactions for this specific wallet
    const walletInputTxs = transactions.filter(transaction => transaction.input.address === this.publicKey);
    let startTime = 0;
    //however we are only interested in having the last transaction that wallet made
    //in order to avoid double spending
    if (walletInputTxs.length > 0) {
      const recentInputTx = walletInputTxs.reduce(
        (prev, curr) => prev.input.timestamp > curr.input.timestamp ? prev : curr
      );

      balance = recentInputTx.outputs.find(output => output.address === this.publicKey).amount; 
      startTime = recentInputTx.input.timestamp;
    }
    
    

    transactions.forEach(transaction => {
      if (transaction.input.timestamp > startTime) {
        transaction.outputs.find(output => {
          if (output.address === this.publicKey) balance += output.amount;
        });
      }
    });
    return balance;
  }

  static blockchainWallet() {
    const blockchainWallet = new this();
    blockchainWallet.address = 'blockchain-wallet';
    return blockchainWallet;
  }
}

module.exports = Wallet;