const Websocket = require('ws');
const P2P_PORT = process.env.P2P_PORT || 5001;
//we have an env variable peers that contains all the peers splitted by ','
const peers =  process.env.PEERS ? process.env.PEERS.split(',') : [];
//we do this because when we broadcast a message the handler doesn't know the distinction between a 
//broacasted chain/transaction so we create the following types
const MESSAGE_TYPES = {
  chain: 'CHAIN',
  transaction: 'TRANSACTION',
  clear_transactions: 'CLEAR_TRANSACTIONS'
};

class P2pServer{
  constructor(blockchain, transactionPool) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.sockets = [];
  }

  //generate a server for other instances to connect to
  listen() {
    const server = new Websocket.Server({ port: P2P_PORT });
    server.on('connection', socket => this.connectSocket(socket));  //event listener
    this.connectToPeers();
    console.log(`Listening for p2p connections on ${P2P_PORT}`);
  }


  // a peer is a string that contains an address like:
  // ws://localhost:5001
  connectToPeers() {
    peers.forEach(peer => {
      const socket = new Websocket(peer);
      //we add an event listener because we might not have started 
      //our localhost yet
      socket.on('open', () => this.connectSocket(socket));
    });
  }

  connectSocket(socket) {
    this.sockets.push(socket);
    console.log('Socket connected');
    this.messageHandler(socket);
    this.sendChain(socket);
  }

  messageHandler(socket) {
    socket.on('message', message => {
      const data = JSON.parse(message);
      switch(data.type) {
        case MESSAGE_TYPES.chain:
          this.blockchain.replaceChain(data.chain);
          break;
        case MESSAGE_TYPES.transaction:
          this.transactionPool.updateOrAddTransaction(data.transaction);
          break;
        case MESSAGE_TYPES.crear_transactions:
          this.transactionPool.clear();
          break;    
      }
    });
  }

  sendChain(socket) {
    socket.send(JSON.stringify({
      type: MESSAGE_TYPES.chain, 
      chain: this.blockchain.chain
    }));
  }

  syncChains() {
    this.sockets.forEach(socket => this.sendChain(socket));
  }

  sendTransaction(socket, transaction) {
    socket.send(JSON.stringify({
      type: MESSAGE_TYPES.transaction,
      transaction //es6 distracting syntax so we dont need to put the key because it maps itself
    }));
  }

  broadcastTransaction(transaction) {
    this.sockets.forEach(socket => this.sendTransaction(socket, transaction));
  }

  broadcastClearTransactions() {
    this.sockets.forEach(socket => socket.send(JSON.stringify({
      type: MESSAGE_TYPES.clear_transactions
    })));
  } 
}

module.exports = P2pServer;