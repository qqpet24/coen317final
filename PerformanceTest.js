const axios = require("axios");
class PerformanceTest{
    constructor(baseURL) {
        this.baseURL = baseURL;
    }
    async generateAddFileTest(totalCnt){
        let timeout = 1000;
        let successCnt = 0;
        let totalTime = 0;
        let sleepInterval = 1;
        let concurrentBatch = 10;
        setTimeout(() => {
            console.log(`Total Requests: ${totalCnt}, within ${timeout} ms,${successCnt} requests success,${totalCnt-successCnt} requests failed,${totalTime/successCnt} ms average successful requests' response time`);
        }, timeout);
        for(var i = 0;i<totalCnt;i++){
            try{
                let nowTime = new Date().getTime();
                this.addFileSingle(Math.random()+"",timeout)
                    .then(resolve=>{successCnt++;totalTime+=(new Date().getTime())-nowTime;})
                    .catch(err=>{});
            }catch (e){

            }
            if(i!== 0 && i % concurrentBatch=== 0) await this.sleep(sleepInterval);
        }
    }
    async generateGetSingleFileTest(totalCnt){
        let timeout = 1000;
        let successCnt = 0;
        let totalTime = 0;
        let sleepInterval = 1;
        let concurrentBatch = 2;
        let fileID = "934fc3b55e0f5d82a87200a4fc91a858fd01300accf4632cb07da72bacfc8c1e";
        setTimeout(() => {
            console.log(`Total Requests: ${totalCnt}, within ${timeout} ms,${successCnt} requests success,${totalCnt-successCnt} requests failed,${totalTime/successCnt} ms average successful requests' response time`);
        }, timeout);
        for(var i = 0;i<totalCnt;i++){
            try{
                let nowTime = new Date().getTime();
                this.getFileSingle(fileID,timeout)
                    .then(resolve=>{successCnt++;totalTime+=(new Date().getTime())-nowTime;})
                    .catch(err=>{});
            }catch (e){

            }
            if(i!== 0 && i % concurrentBatch === 0) await this.sleep(sleepInterval);
        }
    }
    async addFileSingle(userName = "",timeout){
        const postData = {
            title: "TestPerformanceUser"+userName,
            content: Math.random()+""+Math.random(),
            timestamp: parseInt(new Date().getTime() / 1000).toString(), // Add the timestamp property
        };
        await axios.post(`http://${this.baseURL}/addFile`,postData,{timeout:timeout});
    }
    async getFileSingle(fileID,timeout){
        await axios.get(`http://${this.baseURL}/getFile?id=${fileID}`,{timeout:timeout});
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
(async ()=>{
    try{
        for(var i = 1000;i<=30000;i+=1000){
            var performanceTest = new PerformanceTest("127.0.0.1:8081");
            performanceTest.generateGetSingleFileTest(i);
            await performanceTest.sleep(1500);
        }
        // performanceTest.generateGetSingleFileTest();
    }catch (e){
        console.log(e);
    }
})();