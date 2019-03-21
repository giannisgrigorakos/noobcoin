const Transaction = require('./transaction'); 

class TransactionPool {
  constructor() {
    this.transactions = [];

  }

  updateOrAddTransaction(transaction) {
    //we have to ckeck if the transaction already exists in the pool
    let transactionWithId = this.transactions.find(t => t.id === transaction.id);
    if (transactionWithId) {
      //we replace it with a new one
      this.transactions[this.transactions.indexOf(transactionWithId)] = transaction;
    } 
    else {
      this.transactions.push(transaction);
    }
  }

  existingTransaction(address) {
    return this.transactions.find(t => t.input.address === address);
  }

  validTransactions() {
    return this.transactions.filter(transaction => {
      const outputTotal = transaction.outputs.reduce((total, output) => {
        return parseInt(total) + parseInt(output.amount);
      },0);
      console.log('output total = ',outputTotal);
      //if the input amount and the total of output amounts is not equal then..
      if (transaction.input.amount !== outputTotal) {
        console.log(`Invalid transaction from ${transaction.input.address}`);
        return;
      }

      //if the current's transaction signature cannot be verified then... 
      if (!Transaction.verifyTransaction(transaction)) { 
        console.log(`Invalid signature from ${transaction.input.address}`);
        return;
      }
      //if they pass the tests then..
      return transaction;
    }); 
  }

  clear() {
    this.transactions = [];
  }
}

module.exports = TransactionPool;