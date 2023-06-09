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
        let concurrentBatch = 1;
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
        let fileID = "fed4749bca53d8f83ed623d8687149ed1fb4b619b17a85b15bf521c3b92db248";
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
        for(var i = 200;i<=4000;i+=200){
            var performanceTest = new PerformanceTest("34.16.130.141:8088");
            performanceTest.generateGetSingleFileTest(i);
            await performanceTest.sleep(1500);
        }
        // performanceTest.generateGetSingleFileTest();
    }catch (e){
        console.log(e);
    }
})();