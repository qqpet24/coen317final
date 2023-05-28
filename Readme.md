COEN 317 Spring 2023 Final Project
Group members: W1650189, W1651034, W1650949, W1651155

I. API
1. AddFile
1) Client upload files to server
2) Server calculate hash, if FindProperNode(hash)===this.NodeID, store on it.
else bypass the files to proper server, which FindProperNode(hash)===this.NodeID
3) FindProperNode(hash)
Previous_Node_ID<hash%MAX_NODE_ID<=Now_Node_ID. If Now_Node is the first node, the previous node is the last node.
For example, suppose that we have node 7->10->12->15.
If we have file 8, 7<8<10, then store 8 in 10.
If we have file 12, 10<12<=12, then store 12 in 12.
If a file has ID>15 & ID<=7, then store it in 7.
POST http://127.0.0.1:8889/addFile body:Files

2. GetFile
GET http://127.0.0.1:8889/getFile&id=a44bf66de2c6581be2ad4385747b120559f63b6bac1ebcb1466a6883db6908de
1) {"code":230,"message":"127.0.0.1:8083"} Redirect to "http://127.0.0.1:8083"
2) {"code":200,"message":"1"} FileContent is "1"
3) {"code":404,"message":"No Found"} File should exist on this server, but no found.

3. Ping
GET http://127.0.0.1:8889/ping
{"code":200,"message":"OK"}

4. AddNodeStep1
Find out the previous node that new node should contact with.
GET http://127.0.0.1:8889/addNodeStep1&url=127.0.0.1:8081
url: new node url

5. AddNodeStep2
1) New node will nodeify previous node that new node will join it.
2) Previous node will broadcast new node's url with all node in its fingerTable.
3) Previous node will broadcast all url in its fingerTable to new node.
If any steps failed, it will return 500, then addNodeClient() should be called again.
If new node already existed in fingerTable, it will return 409.
GET http://127.0.0.1:8889/addNodeStep2&url=127.0.0.1:8081
url: new node url
{"code":200,"message":"OK"} {"code":409,"message":"Conflict"} {"code":500,"message":"Internal Server Error"}

6. AddNodeStep3
GET http://127.0.0.1:8889/addNodeStep2&url=127.0.0.1:8081
url: url that may be inserted in fingerTable
{"code":200,"message":"OK"}

II. Design
1) Only support IPv4; Url = ip+":"+port.
2) fingerTable = [{"url":this.url,"nodeID":this.nodeID}]; // Should be sorted ascending by nodeID.
3) nodeID = parseInt(hash.update(url).hex().slice(52),16); // hash is SHA256(ip+":"+port);
4) Can keep data even if the node crashed, however, all node should restart.
5) var chord = new Chord("127.0.0.1",8081,"./files1","startNode");// "startNode": init as start Node. "addNode": init as new node.
But you should make sure that this program can take this ip and port.
6)  await chord.addNodeClient("127.0.0.1:8081");
Node init as "addNode" can join into this network by connecting to any node in this network.
7) Files should upload into the network after all node had join the network, because I don't implement move files features.
8) Only support English text files now. Other files may have bug.