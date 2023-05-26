const Chord = require("./Chord");

(async ()=>{
    var chord = new Chord("127.0.0.1",8084,"./files4","addNode");
    // setInterval(()=>{chord.showData()},2000);
    await chord.addNodeClient("127.0.0.1:8081");
})();