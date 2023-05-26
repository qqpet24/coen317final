const Chord = require("./Chord");
var tmp = [
    { url: '127.0.0.1:8084', nodeID: 76974636707237 },
    { url: '127.0.0.1:8083', nodeID: 150018320588472 },
    { url: '127.0.0.1:8081', nodeID: 150155277036494 },
    { url: '127.0.0.1:8082', nodeID: 231826776989255 }
]

(async ()=>{
    console.log(parseInt("3d7f261dd3a7debf482a841ea1d7bfa597dbaee2dd0df860e2ebf2b182d93c69".slice(52),16)-231826776989255);
})();