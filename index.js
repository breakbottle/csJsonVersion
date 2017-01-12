/**
 * Author: Clint Small Cain
 * Date: 1/1/2017
 * Time: 10:34 AM
 * Description:
 */
var jsonfile = require('jsonfile');
require('shelljs/global');
var count = 0;
var status = {
    version:null,
    filesProcessd:[]
}
var commitDetails = function(version,commit,commands,branch){
    if(!version ) return false;//no verion no update
    if(commit){
        var br = branch || 'master'
        exec('git add -u');
        exec('git commit -a -m "v'+version+'"');
        exec('git tag v'+version);
        exec('git push --follow-tags origin '+br)
        if(commands) exec(commands);
    } else {
        exec('git tag v'+version);
        exec('git add -u');
        if(commands) exec(commands);
    }
    

};
var makeVersion = function(fileVersion){//to be used with automation
    fileVersion = (fileVersion)?fileVersion:'0.1.0';

    var levels = fileVersion.split(".");//expects 0.0.0 Semantic Version
    var patchLimit = 50;
    var minorLimit = 10;

    if(levels[2] <= patchLimit){
        levels[2] = parseInt(levels[2])+1;
    } else {
        levels[2] = 0;
        if(levels[1] < minorLimit){
            levels[1] = parseInt(levels[1])+1;
        } else {
            levels[1] = 0;
            levels[0]++;
        }
    }
    return levels[0] + "." + levels[1] + "." + levels[2];
};//
var changeVersion = function (configFile,version,callback) {
    jsonfile.readFile(configFile, function (err, obj) {
        //calculate
        if(!version){
            version = makeVersion(obj.version);
        }

        //change tsConfig option on the fly, for builds
        if(version){
            obj.version = version;
            status.version = version;
            jsonfile.writeFile(configFile, obj, function (err) {
                if (err) {
                    console.error(configFile+" json error: --->", (err || 'none'));
                }
                if(callback){
                    callback(obj.version);
                }
                
            });

        }

    });
};//

var called = function(listOfFiles,ver,commit,commands,branch){
    if(typeof listOfFiles[count] == 'string'){
        status.filesProcessd.push(listOfFiles[count]);
        changeVersion(listOfFiles[count],ver,function(v){
            count++;
            called(listOfFiles,status.version,commit);

        });
    } else {
        commitDetails(status.version,commit,commands,branch);
        console.log("Results:",status);
    }

};
/**
 * configs = {
 *      listOfFiles:[],
 *      optionalVersion:null, //The full Semantic Version will be used [ 1.0.3 ]
 *      useCommitOptions:boolean:false, //Use default commit,tag,push to origin master
 *      postCommands:string //cli commands to run after git tag
 *      branch:string //default master
 * }
 */
var config = function (configs) {
    if(typeof configs != 'object'){
        console.error("configs provided is not an object",configs);
        return null;
    }
    if(configs.useCommitOptions){
        called(configs.listOfFiles,configs.optionalVersion,configs.useCommitOptions,configs.postCommands,configs.branch);
    } else {
        called(configs.listOfFiles,configs.optionalVersion,false,configs.postCommands,configs.branch);
    }
    
};

module.exports =  {
    run:config
    /*csVersion.run({
       listOfFiles:['../cs-config.json','package.json']
     });
  */
};