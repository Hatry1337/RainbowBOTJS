//const { NFNetwork } = require("./NFNetwork");
const fsp = require("fs/promises");
const fs = require("fs");
const brain = require("brain.js");

//let nfn = new NFNetwork;

const dict = fs.readFileSync("/home/thomas/Документы/VSCodeProjects/RainbowBOTJS DEV/src/Modules/NeuralFrog/dictionary.txt").toString().split("\n");

/**
 * @param {string} str 
 */
function stringToNumbers(str){
    let words = str.toLowerCase().split(" ");
    let nums = [];
    for(let w of words){
        let indx = dict.indexOf(w);
        if(indx === -1) indx = 1;
        nums.push(indx);
    }
    return nums;
}

function numbersToString(nums){
    let str = "";
    for(let n of nums){
        str += dict[n] + " ";
    }
}

(async () => {
    let data = JSON.parse((await fsp.readFile("/home/thomas/Документы/VSCodeProjects/RainbowBOTJS DEV/src/Modules/NeuralFrog/tr_data.json")).toString());
    let training = [];
    for(let d of data){
        training.push({
            input: d.q,
            output: d.a
        });
    }

    let lstm = new brain.recurrent.LSTM();

    const config = {
        log: true,
        logPeriod: 1,
        iterations: 100
    };

    //lstm.fromJSON(JSON.parse((await fsp.readFile("/home/thomas/Документы/VSCodeProjects/RainbowBOTJS DEV/netwrk.json")).toString()));
    lstm.train(training, config);
    await fsp.writeFile("netwrk.json", JSON.stringify(lstm.toJSON()));
    console.log(lstm.run("Здарова заебал"));
})();