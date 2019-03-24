# noobcoin
~ Open in fullscreen to maintain the layout ~

~ For linux users:
    cd /path_to_noobcoin_folder/noobcoin
    
    Initial installs:    
        --> sudo apt install node
        --> sudo apt install nodemon
        --> sudo npm i   (To install every npm package the package.json includes)
   
     To run the tests:
        --> npm run test
 
     To run noobcoin:
        Noobcoin links the wallets with websockets using the npm package ws.
        So in order to run multiple wallets(nodes) you should execute the commands as follows
        (first/base wallet) --> npm run dev                                                     (initial http port->3000 and initial p2p port -> 5000)
        (second wallet) --> HTTP_PORT=3001 P2P_PORT=5001 PEERS=ws://localhost:5000 npm run dev  (or every http/p2p port of your choice and in PEERS you add every.. 
                                                                                                 ..other node/wallet separated by ',')
        (third wallet) -->  HTTP_PORT=3002 P2P_PORT=5002 PEERS=ws://localhost:5000,ws://localhost:5001 npm run dev
        ......and so on

    Endpoints:
      The endpoints send/retrieve JSON objects
      GET / blocks       --> Get the blocks of the valid blockchain
      GET / transactions --> Get the open transactions stored in the transaction pool
      POST/ transact     --> Make a transaction from a wallet to another wallet. The body of requests:"recipient":"recipient's_puclic_key","amount":"amount_to_send"
      GET / public_key   --> Get the public key of a wallet/node. e.g. http://localhost:3001/public-key to retrieve the public key of the wallet in port 3001
      GET / mine-transactions --> Mine the transactions in the transaction pool and put them in a block and insert it in the blockchain.The the new blockchain is..
                                  ..broadcasted in the other nodes and the valid one is kept.The miner is rewarded with 10 coins.
      GET /balance       --> Get the balance of the current wallet.   
