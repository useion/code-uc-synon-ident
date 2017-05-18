/**
 * Created by Michal Krempasky
 * FIIT STU BA
 */

var Promise= require('promise');

module.exports = {

    selectUCidByName: function (uid) {
        return new Promise(function(resolve,reject){
            db.all("SELECT uid FROM Use_cases WHERE name= ?",[uid],function(err,res){

                if(err != null && res == null ){
                    console.log("Select UC by name error "+ err);
                    reject(err);
                }
                resolve(res);
            });
        });
    },

    selectStepsAndSid: function(){
        return new Promise(function(resolve,reject){
            db.all("SELECT sid AS id, step FROM Steps",function(err,res){

                if(err != null && res == null ){
                    console.log("Select steps and SID error "+ err);
                    reject(err);
                }
                resolve(res);
            });
        });
    },

    selectSidsFromSteps: function(){
        return new Promise(function(resolve,reject){
            db.all("SELECT sid FROM Steps",function(err,res){
                if(err != null && res == null ){
                    console.log("Select SIDs error "+ err);
                    reject(err);
                }
                resolve(res);
            });
        });
    },

    selectWordsData: function(){
        return new Promise(function(resolve,reject){
            db.all("SELECT wid,word,posmap FROM Words",function(err,res){
                if(err != null && res == null ){
                    console.log("select words data error "+ err);
                    reject(err);
                }
                resolve(res);
            });
        });
    },

    selectUseCaseIdAndName: function () {
        return new Promise(function (resolve, reject) {
            db.all("SELECT uid AS id,name FROM Use_cases", function (err, res) {

                if(err != null && res == null ){
                        console.log(err);
                        reject(err);
                    }


                resolve(res);
            });
        });
    },

    selectStepsByUid: function (uid) {
        return new Promise(function (resolve, reject) {

        db.all("SELECT sid,step,step_number from Steps " +
            "JOIN Use_cases ON Use_cases.uid=Steps.uid WHERE Steps.uid= ?"
            ,[uid], function (err, res) {
                if(err != null && res == null ){
                console.log("select data error " + err);
                reject(err);
            }
            resolve(res);
        });
    });
},

    selectWordsByStepId: function(sid){
        return new Promise(function(resolve,reject){
            db.all("select Words.word,Words.word_default,Words.wid,Step_word.sid as step_word_id from Words "+
                " join Step_word on Step_word.wid=Words.wid "+
                " join Steps on Steps.sid=Step_word.sid "+
                " where (Steps.sid= ? )"+
                " AND (Words.posmap ='v' OR Words.posmap ='n' OR Words.posmap ='a' )",
            [sid],function(err,res){
                if(err != null && res == null ){
                    console.log("select words data error "+ err);
                    reject(err);
                }
                resolve(res);
            });
        });
    },
    selectWordsIdByStepId: function(sid){
        return new Promise(function(resolve,reject){

            db.all("select Words.wid, Words.swmap from Words "+
                " join Step_word on Step_word.wid=Words.wid "+
                " join Steps on Steps.sid=Step_word.sid "+
                " where (Steps.sid= ? )"+
                " AND (Words.posmap ='v' OR Words.posmap ='n' OR Words.posmap ='a' )",
                [sid],function(err,res){
                    if(err != null && res == null ){
                        console.log("select words data error "+ err);
                        reject(err);
                    }
                    resolve(res);
                });
        });


    },
    selectSimWords: function(wid,builderArr){
        return new Promise(function(resolve,reject){

            db.all("SELECT word, swmap FROM Words WHERE swmap=?",[wid],function(err,res){
                if(err != null && res == null ){
                    console.log("select words data error "+ err);
                    reject(err);
                }
                builderArr.push(res);
                resolve();
            });
        });
    },
    countRelevantWordsInStep: function(sid){
        return new Promise(function(resolve,reject){

            db.all("select Words.wid from Words "+
                " join Step_word on Step_word.wid=Words.wid "+
                " join Steps on Steps.sid=Step_word.sid "+
                " where (Steps.sid= ? )"+
                " AND Words.swmap = 0 "+
                " AND (Words.posmap ='v' OR Words.posmap ='n' OR Words.posmap ='a' )",
                [sid],function(err,res){
                    if(err != null && res == null ){
                        console.log("select words data error "+ err);
                        reject(err);
                    }
                    resolve(res);
                });
        });


    },



};
