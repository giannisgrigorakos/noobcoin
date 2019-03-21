const Transaction = require('../wallet/transaction');
const Wallet = require('../wallet/index');
const { CAPACITY } = require('../config');

class Miner {
  constructor(blockchain, transactionPool, wallet, p2pServer) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.wallet = wallet;
    this.p2pServer = p2pServer;
  }

  mine() {
    const validTransactions = this.transactionPool.validTransactions();
    //include a reward for the miner
    validTransactions.push(Transaction.rewardTransaction(this.wallet, Wallet.blockchainWallet()));
    //create a block consisting of the valid transactions
    const block = this.blockchain.addBlock(validTransactions);
    //sync chains in the p2p server
    this.p2pServer.syncChains();
    //clear the transaction pool(tp) 
    this.transactionPool.clear();
    //broadcast to every miner to clear their tp 
    this.p2pServer.broadcastClearTransactions();
    //and finally return the block
    return block;
  }
}

module.exports = Miner;