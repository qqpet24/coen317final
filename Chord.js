const fs = require("fs");
const SHA256 = require("js-sha256");
const http = require('http');
const events = require('events');
const axios = require('axios');
class Chord{
    constructor(ip,port,defaultFilePath,initMode) {
        this.defaultFilePath = defaultFilePath;
        this.ip = ip;
        this.port = port;
        this.url = this.ip+":"+this.port;
        this.nodeID = this.getNodeId(this.url);
        this.fingerTable = [];

        var server = http.createServer ( async (request,response)=>{
            var result = this.formCommonResponse(404);
            var eventEmitter = new events.EventEmitter();
            eventEmitter.on("finally",()=>{
                response.writeHead(result.code,result.header);
                response.end(result.message);
            });
            try{
                if(request.url === "/addFile" && request.method === "POST"){
                    let body = "";
                    request.on("data",(data)=>{body+=data});
                    request.on("end",async ()=>{result = await this.writeFile(body);eventEmitter.emit("finally");})
                }else if(request.url.indexOf("/getFile") === 0 && request.method === "GET"){
                    if(request.url.split("=").length!==2) result = this.formCommonResponse(400);
                    else result = await this.getFile(request.url.split("=")[1]);
                    eventEmitter.emit("finally");
                }else if(request.url===("/ping") && request.method === "GET"){
                    result = await this.ack();
                    eventEmitter.emit("finally");
                }else if(request.url.indexOf("/addNodeStep1") === 0 && request.method === "GET"){
                    if(request.url.split("=").length!==2) result = this.formCommonResponse(400);
                    else result = await this.addNodeServerStep1(request.url.split("=")[1]);
                    eventEmitter.emit("finally");
                }else if(request.url.indexOf("/addNodeStep2") === 0 && request.method === "GET"){
                    if(request.url.split("=").length!==2) result = this.formCommonResponse(400);
                    else result = await this.addNodeServerStep2(request.url.split("=")[1]);
                    eventEmitter.emit("finally");
                }else if(request.url.indexOf("/addNodeStep3") === 0 && request.method === "GET"){
                    if(request.url.split("=").length!==2) result = this.formCommonResponse(400);
                    else result = await this.addNodeServerStep3(request.url.split("=")[1]);
                    eventEmitter.emit("finally");
                }else if (request.url === "/api/posts" && request.method === "GET") {
                    result = await this.getAllPosts();
                    eventEmitter.emit("finally");
                }else if(request.method==="OPTIONS"){
                    result = this.formCommonResponse(200);
                    eventEmitter.emit("finally");
                }else{
                    eventEmitter.emit("finally");
                }
            }catch (e){
                result = this.formCommonResponse(500);
                console.log(e);
                eventEmitter.emit("finally");
            }
        });
        server.listen(this.port);
        if(initMode === "startNode"){
            this.fingerTable.push({"url":this.url,"nodeID":this.nodeID});
        }else{
        }
    }
    getNodeId(url){
        var hash = SHA256.sha256.create();
        hash.update(url);
        return parseInt(hash.hex().slice(52),16);
    }
    sortFingerTable(){
        this.fingerTable.sort((a,b) => a.nodeID - b.nodeID);
    }
    getProperNode(hash){
        var fileID = parseInt(hash.slice(52),16);
        var l=0,r=this.fingerTable.length-1;
        while(l<r){
            var mid = parseInt((l+r)/2+"");
            if(fileID>this.fingerTable[mid].nodeID) l = mid+1;
            else r = mid;
        }
        if(this.fingerTable[l].nodeID<fileID) l=r=0;
        return l;
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    formResponse(code,message){return {
        "code":code,
        "header":{
            "Content-Type":"application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
            "Access-Control-Max-Age": 86400,
            "Access-Control-Allow-Headers":"Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
        },
        "message": JSON.stringify({"code":code,"message":message})
    }}
    formCommonResponse(code){
        if(code === 200) return this.formResponse(200,"OK");
        else if(code === 400) return this.formResponse(400,"Bad Request");
        else if(code === 404) return this.formResponse(404,"No Found");
        else if(code === 409) return this.formResponse(409,"Conflict");
        else if(code === 500) return this.formResponse(500,"Internal Server Error");
    }
    async writeFile(data){
        var hash = SHA256.sha256.create();
        hash.update(data);
        var properNodeID = this.getProperNode(hash.hex());
        if(this.fingerTable[properNodeID].nodeID===this.nodeID){
            if(!fs.existsSync(this.defaultFilePath)) fs.mkdirSync(this.defaultFilePath);
            if(fs.existsSync(`${this.defaultFilePath}/${hash.hex()}`)) return this.formCommonResponse(409);
            await fs.writeFileSync(`${this.defaultFilePath}/${hash.hex()}`,data);
            return this.formResponse(200,hash.hex());
        }else{
            const {returnData} = await axios.post(`http://${this.fingerTable[properNodeID].url}/addFile`,data);
            return this.formResponse(200,hash.hex());
        }
    }
    async getFile(hash){
        var properNodeID = this.getProperNode(hash);
        if(this.fingerTable[properNodeID].nodeID === this.nodeID){
            if(!fs.existsSync(`${this.defaultFilePath}/${hash}`)) return this.formCommonResponse(404);
            else {
                var data = fs.readFileSync(`${this.defaultFilePath}/${hash}`).toString();
                return this.formResponse(200,data);
            }
        }else{
            return this.formResponse(230,this.fingerTable[properNodeID].url);
        }
    }
    async ping(ip,port){
        try{
            var {data} = await axios.get(`http://${ip}:${port}/ping`);
            if(data.code === 200 && data.message === "OK") return true;
            else return false;
        }catch (e){
            console.log(e);
            return false;
        }
    }
    async ack(){
        return this.formCommonResponse(200);
    }
    async addNodeServerStep1(url){
        var newNodeId = this.getNodeId(url);
        this.sortFingerTable();
        var flag = 0;
        for(var i = 0;i<this.fingerTable.length;i++){
            if(this.fingerTable[flag].nodeID>=newNodeId) break;
        }
        var previousFlag = flag === 0?0:flag-1;
        return this.formResponse(200, {"url":this.fingerTable[flag].url,"previousNodeUrl":this.fingerTable[previousFlag].url});
    }
    async addNodeServerStep2(url){
        try{
            for(var i = 0;i<this.fingerTable.length;i++){
                if(this.getNodeId(url) === this.fingerTable[i].nodeID) return this.formCommonResponse(409);
            }
            this.fingerTable.push({"url":url,"nodeID":this.getNodeId(url)});
            this.sortFingerTable();
            for(var i = 0;i<this.fingerTable.length;i++){
                var {data} = await axios.get(`http://${this.fingerTable[i].url}/addNodeStep3&url=${url}`);
                var {data1} = await axios.get(`http://${url}/addNodeStep3&url=${this.fingerTable[i].url}`);
            }
            return this.formCommonResponse(200);
        }catch (e){
            return this.formCommonResponse(500);
        }
    }
    async addNodeServerStep3(url){
        for(var i = 0;i<this.fingerTable.length;i++){
            if(url === this.fingerTable[i].url) return this.formCommonResponse(200);
        }
        this.fingerTable.push({"url":url,"nodeID":this.getNodeId(url)});
        this.sortFingerTable();
        return this.formCommonResponse(200);
    }
    async addNodeClient(serverUrl){
        try{
            var {data} = await axios.get(`http://${serverUrl}/addNodeStep1&url=${this.url}`);
            var {data1} = await axios.get(`http://${data.message.previousNodeUrl}/addNodeStep2&url=${this.url}`);
            return true;
        }catch (e){
            console.log(e);
            return false;
        }
    }
    async getAllPosts(){
        try{
            if(!fs.existsSync(this.defaultFilePath)) fs.mkdirSync(this.defaultFilePath);
            const posts = [];
            const files = fs.readdirSync(this.defaultFilePath);
            for (const file of files) {
                const data = fs.readFileSync(`${this.defaultFilePath}/${file}`).toString();
                const post = {
                    id: file,
                    content: data,
                };
                posts.push(post);
            }
            return this.formResponse(200, posts);
        }catch (e){
            console.log(e);
            return this.formCommonResponse(500);
        }
    }
    showData(){
        {console.log(this.fingerTable);}
    }
}
module.exports = Chord;