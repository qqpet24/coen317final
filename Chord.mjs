// Import the necessary Node.js modules and external packages.
import fs from 'fs'; // fs文件系统操作
import SHA256 from 'js-sha256'; // SHA256 哈希
import http from 'http'; // 创建 HTTP 服务器
import { EventEmitter } from 'events'; // 事件处理
import axios from 'axios'; // 发出 HTTP 请求
import express from "express";
// const express = require("express");
// const cors = require("cors"); // Import the cors package
import cors from "cors";


const app = express();
app.use(cors()); // Use the cors middleware


export default class Chord{
    // The key feature of Chord is its ability to
    // efficiently locate a node in a network given a key.
    constructor(ip,port,defaultFilePath,initMode) {
        this.defaultFilePath = defaultFilePath;
        this.ip = ip;
        this.port = port;
        this.url = this.ip+":"+this.port;
        this.nodeID = this.getNodeId(this.url);
        this.fingerTable = [];
        //创建了一个 HTTP 服务器来处理传入的请求。
        const server = http.createServer ( async (request,response)=>{

            let result = this.formCommonResponse(404);
            // console.log(result.code); // 404
            // console.log(result.header); // Object containing headers
            // console.log(result.message); // Message string
            const eventEmitter = new events.EventEmitter();
            // 创建类的实例。EventEmitterevents
            // 该类EventEmitter允许您在 Node.js 中创建和管理自定义事件。
            // 在这种情况下，将创建一个事件发射器来处理“finally”事件。
            //该eventEmitter.on("finally", () => { ... })代码为“finally”事件
            // 定义了一个事件侦听器。
            eventEmitter.on("finally",()=>{

                // 当“finally”事件被触发时（
                // 通常是通过调用eventEmitter.emit("finally")），
                // 箭头函数中指定的回调函数被执行。
                // response.setHeader("Access-Control-Allow-Origin", "*"); // Set Access-Control-Allow-Origin header to allow all origins
                // response.writeHead(result.code,result.header);

                const {code,header,message} = result;
                //解构赋值
                response.writeHead(code,header);
                // 回调函数负责写入 HTTP 响应标头并结束响应。
                response.end(message);
                //它使用response从 HTTP 服务器接收到的对象
                //来设置响应标头response.writeHead(result.code, result.body)
                // 并发送响应主体response.end(result.message)
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
                    //addNode功能是指将新节点添加到 Chord 网络的过程。
                    // Chord 协议是一种分布式哈希表 (DHT) 算法，
                    // 允许节点加入和离开网络，同时保持可扩展且高效的键值查找机制。
                }else if(request.url.indexOf("/addNodeStep1") === 0 && request.method === "GET"){
                    //该路由负责发起添加新节点的过程。
                    // 它接收新节点的 URL 作为查询参数并执行任何必要的验证。
                    // 如果 URL 有效，则继续下一步 ( addNodeStep2)，
                    // 否则返回400 Bad Request响应。
                    if(request.url.split("=").length!==2) result = this.formCommonResponse(400);
                    else result = await this.addNodeServerStep1(request.url.split("=")[1]);
                    eventEmitter.emit("finally");
                }else if(request.url.indexOf("/addNodeStep2") === 0 && request.method === "GET"){
                    //此路由在网络中的现有节点上执行。它接收新节点的 URL 作为查询参数。
                    // 它检查新节点的 URL 是否已经存在于网络中以避免重复节点。
                    // 如果 URL 已经存在，它会返回一个409 Conflict响应。
                    // 如果 URL 有效且唯一，它会将新节点添加到自己的节点中fingerTable，
                    // 并通知网络中的其他节点相应地更新它们的手指表。
                    if(request.url.split("=").length!==2) result = this.formCommonResponse(400);
                    else result = await this.addNodeServerStep2(request.url.split("=")[1]);
                    eventEmitter.emit("finally");
                }
                    //该路由在网络中的所有节点上执行，包括新节点。它接收另一个节点的 URL 作为查询参数。
                    // 它检查节点 URL 是否已经存在，fingerTable以避免重复条目。
                    // 如果 URL 已经存在，它会返回一个200 OK响应。
                // 如果 URL 有效且唯一，它会将节点添加到其fingerTable并返回200 OK响应。
                else if(request.url.indexOf("/addNodeStep3") === 0 && request.method === "GET"){
                    if(request.url.split("=").length!==2) result = this.formCommonResponse(400);
                    else result = await this.addNodeServerStep3(request.url.split("=")[1]);
                    eventEmitter.emit("finally");
                }
                    // 这条路线负责获取所有的博客文章。
                    // 它从目录中读取文件defaultFilePath并创建一个包含帖子 ID 和内容的帖子对象数组。
                // 然后它返回状态代码为 200 的响应和帖子数组。
                else if (request.url === "/api/posts" && request.method === "GET") {
                    result = await this.getAllPosts();
                    eventEmitter.emit("finally");
                }
                    //此路由用于创建新的博客文章。它接收请求正文中的帖子数据，
                    // 并使用 SHA256 哈希为帖子生成唯一 ID。
                    // 它检查目录defaultFilePath中是否已存在具有相同 ID 的文件
                    //如果是，它会返回状态代码为 409（冲突）的响应。
                    // 如果该文件不存在，它会将帖子数据写入具有生成的 ID 的文件，
                // 并返回状态代码为 200 的响应和已创建帖子的 ID。
                else if (request.url === "/api/posts" && request.method === "POST") {
                    let body = "";

                    request.on("data", (data) => {
                        body += data;
                    });

                    request.on("end", async () => {
                        result = await this.createPost(body);
                        eventEmitter.emit("finally");
                    });
                }
                    // 此路由根据提供的postId参数获取单个博客文章。
                    // 它检查目录中是否存在具有给定 ID 的文件defaultFilePath。
                    // 如果是，它会从文件中读取内容并返回状态代码为 200 的响应以及包含 ID 和内容的 post 对象。
                // 如果文件不存在，它会返回状态代码为 404（未找到）的响应。
                else if (
                    request.url.startsWith("/api/posts/") &&
                    request.method === "GET"
                ) {
                    const postId = request.url.split("/").pop();
                    result = await this.getPost(postId);
                    eventEmitter.emit("finally");
                }

                else{
                    eventEmitter.emit("finally");
                }
            }catch (e){
                result = this.formCommonResponse(500);
                console.log(e);
                eventEmitter.emit("finally");
            }
        });
        server.listen(this.port);

        //如果initMode参数设置为"startNode"，它会将当前节点添加到fingerTable.
        if(initMode === "startNode"){
            this.fingerTable.push({"url":this.url,"nodeID":this.nodeID});
        }else{
        }
    }

    //getNodeId函数使用 SHA256 哈希计算基于 URL 的节点 ID，
    // 并返回十六进制哈希的最后 12 个字符。
    getNodeId =(url)=>{
        const hash = SHA256.sha256.create();//它创建一个 SHA256 哈希对象
        hash.update(url);//updates it with the url
        return parseInt(hash.hex().slice(52),16);//extracts the last 12 characters of the hexadecimal hash as the node ID.
    }
    sortFingerTable=()=>{
        this.fingerTable.sort((a,b) => a.nodeID - b.nodeID);
        //函数fingerTable根据nodeID属性按升序对数组进行排序

    }

    //它使用Array.prototype.sort方法和比较器函数来执行排序
    getProperNode = (hash) =>{
        //确定适当的节点以fingerTable存储或检索具有给定hash.
        const fileID = parseInt(hash.slice(52), 16);
        let l = 0, r = this.fingerTable.length - 1;
        while(l<r){
            const mid = parseInt((l + r) / 2 + "");
            if(fileID>this.fingerTable[mid].nodeID) l = mid+1;
            else r = mid;
        }
        if(this.fingerTable[l].nodeID<fileID) l=r=0;
        return l;
    }
    sleep =(ms) =>{
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    formResponse = (code,message)=>{return {
        "code":code,//code：提供的code参数值。
        "header":{
            //包含与响应相关的标头的对象
            "Content-Type":"application/json",
            //指定响应为JSON格式。
            "Access-Control-Allow-Origin": "*",
            //注意：在生产环境中，建议将此标头设置为前端应用程序的特定来源以获得更好的安全性。）
            "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
            //指定 CORS 请求允许的 HTTP 方法。,
            "Access-Control-Max-Age": 86400
            //指定可以缓存响应的最长时间（以秒为单位）。
        },
        "message": JSON.stringify({"code":code,"message":message})
        //一个字符串化的 JSON 对象，包含code并message作为formResponse函数的参数提供。
    }}
    formCommonResponse=(code)=>{
        if(code === 200) return this.formResponse(200,"OK");
        else if(code === 400) return this.formResponse(400,"Bad Request");
        else if(code === 404) return this.formResponse(404,"No Found");
        else if(code === 409) return this.formResponse(409,"Conflict");
        else if(code === 500) return this.formResponse(500,"Internal Server Error");
    }
    // writeFile方法是处理文件写入的异步函数。
    // allows the use of await inside the function body.
    // await用于等待异步操作（例如写入文件或发出 HTTP 请求
    // it means it will always return a promise.
    writeFile=async(data)=>{
        // data:它表示需要写入文件的数据。
        const hash = SHA256.sha256.create();
        hash.update(data);
        const properNodeID = this.getProperNode(hash.hex());
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
    getFile=async (hash)=>{
        const properNodeID = this.getProperNode(hash);
        if(this.fingerTable[properNodeID].nodeID === this.nodeID){
            if(!fs.existsSync(`${this.defaultFilePath}/${hash}`)) return this.formCommonResponse(404);
            else {
                const data = fs.readFileSync(`${this.defaultFilePath}/${hash}`).toString();
                return this.formResponse(200,data);
            }
        }else{
            return this.formResponse(230,this.fingerTable[properNodeID].url);
        }
    }
    ping=async(ip,port)=>{
        try{
            const {data} = await axios.get(`http://${ip}:${port}/ping`);
            if(data.code === 200 && data.message === "OK") return true;
            else return false;
        }catch (e){
            console.log(e);
            return false;
        }
    }

    getAllPosts=async ()=> {
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
    }

    createPost=async (data)=> {
        //使用 SHA256 哈希计算帖子的唯一 ID
        console.log(data);
        const hash = SHA256.sha256.create();//创建一个新的 SHA256 哈希对象
        hash.update(data);//使用data请求正文中收到的更新它
        const postId = hash.hex();
        //Check if the file with the generated ID already exists
        if (!fs.existsSync(this.defaultFilePath)) {
            fs.mkdirSync(this.defaultFilePath);
        }
        //如果是，则使用 返回状态代码为 409（冲突）的响应
        // this.formCommonResponse(409)。
        if (fs.existsSync(`${this.defaultFilePath}/${postId}`)) {
            return this.formCommonResponse(409);
        }
        //Create a new file with the generated ID and write the post data
        //用于fs.writeFileSync()将post数据写入目录中具有生成ID的文件defaultFilePath
        await fs.writeFileSync(`${this.defaultFilePath}/${postId}`, data);
        return this.formResponse(200, { id: postId });
    }

    getPost=async (postId)=> {
        if (!fs.existsSync(`${this.defaultFilePath}/${postId}`)) {
            return this.formCommonResponse(404);
        }

        const data = fs.readFileSync(`${this.defaultFilePath}/${postId}`).toString();
        const post = {
            id: postId,
            content: data,
        };

        return this.formResponse(200, post);
    }
    ack=async()=>{
        return this.formCommonResponse(200);
    }
    addNodeServerStep1=async(url)=>{
        const newNodeId = this.getNodeId(url);
        this.sortFingerTable();
        const flag = 0;
        for(let i = 0; i<this.fingerTable.length; i++){
            if(this.fingerTable[flag].nodeID>=newNodeId) break;
        }
        const previousFlag = flag === 0 ? 0 : flag - 1;
        return this.formResponse(200, {"url":this.fingerTable[flag].url,"previousNodeUrl":this.fingerTable[previousFlag].url});
    }
    addNodeServerStep2=async(url)=>{
        try{
            let i;
            for(i = 0; i<this.fingerTable.length; i++){
                if(this.getNodeId(url) === this.fingerTable[i].nodeID) return this.formCommonResponse(409);
            }
            this.fingerTable.push({"url":url,"nodeID":this.getNodeId(url)});
            this.sortFingerTable();
            for(i = 0; i<this.fingerTable.length; i++){
                const {data} = await axios.get(`http://${this.fingerTable[i].url}/addNodeStep3&url=${url}`);
                const {data1} = await axios.get(`http://${url}/addNodeStep3&url=${this.fingerTable[i].url}`);
            }
            return this.formCommonResponse(200);
        }catch (e){
            return this.formCommonResponse(500);
        }
    }
    addNodeServerStep3=async(url)=>{
        for(let i = 0; i<this.fingerTable.length; i++){
            if(url === this.fingerTable[i].url) return this.formCommonResponse(200);
        }
        this.fingerTable.push({"url":url,"nodeID":this.getNodeId(url)});
        this.sortFingerTable();
        return this.formCommonResponse(200);
    }
    addNodeClient=async (serverUrl)=>{
        try{
            const {data} = await axios.get(`http://${serverUrl}/addNodeStep1&url=${this.url}`);
            const {data1} = await axios.get(`http://${data.message.previousNodeUrl}/addNodeStep2&url=${this.url}`);
            return true;
        }catch (e){
            console.log(e);
            return false;
        }
    }
    showData=()=>{
        {console.log(this.fingerTable);}
    }
}

