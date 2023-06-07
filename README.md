# DistributedHashTable


*Please insert a brief project description here.*

## I. API

### 1. AddFile
- Client uploads files to the server
- Server calculates hash, if `FindProperNode(hash)===this.NodeID`, store on it. Else, bypass the files to the proper server, where `FindProperNode(hash)===this.NodeID`.
- `FindProperNode(hash)`: `Previous_Node_ID<hash%MAX_NODE_ID<=Now_Node_ID`. If Now_Node is the first node, the previous node is the last node. See examples below.
  - For example, suppose that we have node 7->10->12->15.
  - If we have file 8, 7<8<10, then store 8 in 10.
  - If we have file 12, 10<12<=12, then store 12 in 12.
  - If a file has ID>15 & ID<=7, then store it in 7.
- POST `http://127.0.0.1:8889/addFile` body:Files

### 2. GetFile
- GET `http://127.0.0.1:8889/getFile&id=a44bf66de2c6581be2ad4385747b120559f63b6bac1ebcb1466a6883db6908de`
  - `{"code":230,"message":"127.0.0.1:8083"}` Redirect to "http://127.0.0.1:8083"
  - `{"code":200,"message":"1"}` FileContent is "1"
  - `{"code":404,"message":"No Found"}` File should exist on this server, but no found.

### 3. Ping
- GET `http://127.0.0.1:8889/ping`
- `{"code":200,"message":"OK"}`

### 4. AddNodeStep1
- Find out the previous node that the new node should contact with.
- GET `http://127.0.0.1:8889/addNodeStep1&url=127.0.0.1:8081`
- `url`: new node url

### 5. AddNodeStep2
- New node will notify the previous node that the new node will join it.
- Previous node will broadcast new node's url with all nodes in its `fingerTable`.
- Previous node will broadcast all urls in its `fingerTable` to the new node.
- If any steps failed, it will return 500, then `addNodeClient()` should be called again.
- If new node already existed in `fingerTable`, it will return 409.
- GET `http://127.0.0.1:8889/addNodeStep2&url=127.0.0.1:8081`
- `url`: new node url
- `{"code":200,"message":"OK"}`
- `{"code":409,"message":"Conflict"}`
- `{"code":500,"message":"Internal Server Error"}`

### 6. AddNodeStep3
- GET `http://127.0.0.1:8889/addNodeStep2&url=127.0.0.1:8081`
- `url`: url that may be inserted in `fingerTable`
- `{"code":200,"message":"OK"}`

## II. Design
1. Onlysupport IPv4; Url = ip+":"+port.
2. `fingerTable = [{"url":this.url,"nodeID":this.nodeID}]`; // Should be sorted ascending by `nodeID`.
3. `nodeID = parseInt(hash.update(url).digest('hex').slice(52),16)`; // hash is SHA256(ip+":"+port);
4. Can keep data even if the node crashed, however, all nodes should restart.
5. `var chord = new Chord("127.0.0.1",8081,"./files1","startNode")`; // "startNode": init as start Node. "addNode": init as new node. But you should make sure that this program can take this ip and port.
6. `await chord.addNodeClient("127.0.0.1:8081")`;
Node init as "addNode" can join into this network by connecting to any node in this network.
7. Files should upload into the network after all nodes have joined the network, because I don't implement move files features.
8. Only support English text files now. Other files may have bugs.

*Feel free to customize this template as needed, and make sure to fill in any missing information, especially the project description at the top.*
