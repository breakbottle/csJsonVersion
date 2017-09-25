/**
 * Author: Clint Small Cain
 * Date: 1/1/2017
 * Updated: 2/18/2017
 * Description: Updates the version of each provided *.json file then process a commit/tag and push
 */
var jsonfile = require('jsonfile');
require('shelljs/global');
var count = 0;
var status = {
    version:null,
    filesProcessed:[]
};
/**
 * Uses git to commit changes *.json files
 * @param version {string} - The version to be used.
 * @param commit {boolean} - True to commit tag and push, False only commit and tag
 * @param commands {string} - CLI expressions
 * @param branch {string} - Branch you want to push to use 'commit' set to true
 * @param callback {Function} - call back after before update
 * @returns {boolean}
 */
var commitDetails = function(version,commit,commands,branch,callback){
    if(!version ) return false;//no version no update
    if(callback){
        callback(version,function(){
            addToGit(commit,version,commands,branch);
        });
    } else {
        addToGit(commit,version,commands,branch);
    }

    return true;
};
/**
 * add to git repository with conditions
 * @param commit
 * @param version
 * @param commands
 * @param branch
 */
var addToGit  = function(commit,version,commands,branch){
    if(commit){
        exec('git add -u');
        exec('git commit -a -m "v'+version+'"');
        exec('git tag v'+version);
        if(branch) exec('git push --follow-tags origin '+branch);
        if(commands) exec(commands);
    } else {
        exec('git tag v'+version);
        exec('git add -u');
        if(commands) exec(commands);
    }
};

/**
 * Create the version based on inputs.
 * @param fileVersion {string} - The semantic version to be used to calculate the next version
 * @param limits {object} - contains the patchLimit & minorLimit, these are defaulted to 50 & 10
 * @returns {string} - Returns the final calculated version
 */
var makeVersion = function(fileVersion,limits){//to be used with automation
    fileVersion = fileVersion || '0.1.0';
    limits = limits || {};

    var levels = fileVersion.split(".");//expects 0.0.0 Semantic Version
    var patchLimit = limits.patchLimit || 50;
    var minorLimit = limits.minorLimit || 10;
    if(levels[2] < patchLimit){
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
};

/**
 * Read in the *.json file version, calculate the new version & write json file
 * @param configFile {string} - the JSON file path, e.g. custom.json
 * @param version {string} - use this version instead of the file version
 * @param limits {object} - contains the patchLimit & minorLimit, these are defaulted to 50 & 10
 * @param callback {Function}
 */
var changeVersion = function (configFile,version,limits,callback) {
    jsonfile.readFile(configFile, function (err, obj) {
        if(err){
            console.error(configFile+" read error: --->", (err || 'none'));
            return false;
        }

        //calculate
        if(!version){
            version = makeVersion(obj.version,limits);
        }

        //change config file option on the fly, for builds
        if(version){
            obj.version = version;
            status.version = version;
            jsonfile.writeFile(configFile, obj,{spaces:2}, function (err) {
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

/**
 * Process the config file with options recursively
 * @param config {object} - contains the options for this module.
 */
var process = function(config){
    if(typeof config.listOfFiles[count] == 'string'){
        status.filesProcessed.push(config.listOfFiles[count]);
        changeVersion(config.listOfFiles[count],config.optionalVersion,config.limits,function(v){
            count++;
            process(config);
        });
    } else {
        commitDetails(status.version,config.useCommitOptions,config.postCommands,config.branch,config.returnVersion);
        console.log("Results:",status);
    }
};
/**
 * Validate config options and begin process
 * @param configs {object} - {
 *      listOfFiles:[],
 *      optionalVersion:null, //The full Semantic Version will be used [ 1.0.3 ]
 *      useCommitOptions:boolean:false, //Use default commit,tag,push to origin (branch) master
 *      postCommands:string //cli commands to run after git tag
 *      branch:string //default master
 *      returnVersion:Function, //callback function
 *      limits:{
 *          patchLimit:50,//when we hit this limit we go up 1 on the main version number
 *          minorLimit:10//when we hit this limit we go up 1 on the patch version number
 *      }
 * }
 */
var validate = function (configs) {
    if(typeof configs != 'object'){
        console.error("configs provided is not an object",configs);
        return null;
    }
    process(configs);
};

module.exports =  {
    run:validate
    /*csVersion.run({
        listOfFiles:['../cs-config.json','package.json']
     });
     */
};