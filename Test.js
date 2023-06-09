const Chord = require("./Chord");

(async ()=>{
    var chord = new Chord("127.0.0.1",8081,"./files1","startNode");
    chord.startHeartbeatTimer();
    // setInterval(()=>{chord.showData()},2000);
})();