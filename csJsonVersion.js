/**
 * Author: Clint W. Cain
 * Date: 1/1/2017
 * Updated: 2/12/2019
 * Description: Updates the version of each provided *.json file then optionally process a commit/tag and push
 */
const jsonfile = require('jsonfile');
require('shelljs/global');


class csJsonVersion{

    constructor(){
        this.status = {
            version:null,
            filesProcessed:[]
        };
        this.count = 0;
        this.config = null;
    }
    /**
     * Uses git to commit changes *.json files
     * @param version {string} - The version to be used.
     * @returns {boolean}
     */
    commitDetails(version){
        if(!version ) return false;//no version no update
        if(this.config.returnVersion){
            this.config.returnVersion(version,function(){
                this.addToGit(version);
            });
        } else {
            this.addToGit(version);
        }

        return true;
    };
    /**
     * add to git repository with conditions
     * @param version
     */
    addToGit(version){

        if(this.config.useCommitOptions){
            exec('git commit -a -m "v'+version+'"');
            exec('git tag v'+version);
            if(this.config.branch) exec('git push --follow-tags origin '+this.config.branch);
            if(this.config.postCommands) exec(this.config.postCommands);
        } else {
            exec('git tag v'+version);
            exec('git add -u');
            if(this.config.postCommands) exec(this.config.postCommands);
        }
    };
    /**
     * Create the version based on inputs.
     * @param fileVersion {string} - The semantic version to be used to calculate the next version
     * @param callback {Function} - provides the final version
     */
    makeVersion(fileVersion,callback){//to be used with automation
        fileVersion = fileVersion || '0.1.0';
        let limits = this.config.limits || {};
        let levels = fileVersion.split(".");//expects 0.0.0 Semantic Version
        const patchLimit = limits.patchLimit || 50;
        const minorLimit = limits.minorLimit || 10;
        const modScoreP = limits.modifyScoreP || 25;
        const modScoreM = limits.modifyScoreM || 75;
        

        if(this.config.useCommitOptions){
            exec('git add -u'); 
            exec('git diff --cached --shortstat',function(code, stdout, stderr){ //numstat
                if(!stderr){
                    let out = stdout.split(",");
                    var fileChanged = parseInt(out[0]);//.substr(0,2)
                    let insertions = parseInt(out[1]);//.substr(0,2)
                    let deletions =parseInt(out[2]);//.substr(0,2)
                    let fileModificationScore = Math.abs((insertions - deletions) / fileChanged);
                 
                    if(fileModificationScore <= modScoreP){
                        levels[2] = parseInt(levels[2])+1;
                        if(levels[2] > patchLimit){
                            levels[2] = 0;
                            if(levels[1] < minorLimit){
                                levels[1] = parseInt(levels[1])+1;
                            } else {
                                levels[1] = 0;
                                levels[0]++;
                            }
                        }
                        //console.log('patch');
                    } else if(fileModificationScore > modScoreP && fileModificationScore <= modScoreM){
                        levels[1] = parseInt(levels[1])+1;
                        if(levels[1] > minorLimit){
                            levels[1] = 0;
                            levels[2] = 0;
                            levels[0]++;
                        }
                        //console.log('minor');
                    } else {
                        levels[0] = parseInt(levels[0])+1;
                        //console.log('major');
                    }
                    callback(levels[0] + "." + levels[1] + "." + levels[2]);
                } else 
                    throw new Error("Problem getting git stats: "+stderr);
            });
        } else { 
            callback(this.setVersion(levels,patchLimit,minorLimit));
        }
        
    };
    /**
     * Set the version properties
     * @param {Array} levels 
     * @param {number} patchLimit 
     * @param {number} minorLimit 
     */
    setVersion(levels,patchLimit,minorLimit){
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
    }
    /**
     * Read in the *.json file version, calculate the new version & write json file
     * @param configFile {string} - the JSON file path, e.g. custom.json
     * @param callback {Function}
     */

    changeVersion(configFile,callback) {
        let _this = this;

        jsonfile.readFile(configFile, function (err, fileContents) {
            if(err){
                console.error(configFile+" read error: --->", (err || 'none'));
                return false;
            } else if(!_this.config.optionalVersion){ 
                _this.makeVersion(fileContents.version,(dynamicVersion)=>{
                    _this.writeVersion(configFile,fileContents,dynamicVersion,callback)
                });
            } else {
               _this.writeVersion(configFile,fileContents,_this.config.optionalVersion,callback)
            }
            
        });
    };
    /**
     * Write version to a file
     * @param {String} configFile 
     * @param {String} fileContents JSON string
     * @param {String} version 
     * @param {Function} callback 
     */
    writeVersion(configFile,fileContents,version,callback){
        if(version){
            fileContents.version = version;
            this.status.version = version;
            jsonfile.writeFile(configFile, fileContents,{spaces:2}, function (err) {
                if (err) {
                    console.error(configFile+" json error: --->", (err || 'none'));
                }
                if(callback){
                    callback(fileContents.version);
                }

            });

        }
    }
    /**
     * Process the config file with options recursively
     * @param config {object} - contains the options for this module.
     */
    start(config){
        if(typeof config.listOfFiles[this.count] == 'string'){  
            this.status.filesProcessed.push(config.listOfFiles[this.count]);
            const _this = this;
            this.changeVersion(config.listOfFiles[this.count],function(v){
                _this.count++;
                _this.start(config);
            });
        } else {
            this.commitDetails(this.status.version);
            console.log("Results:",this.status);
        }
    }
    /**
     * Validate config options and begin process
     * @param configs {object} - {
     *      listOfFiles:[],
     *      optionalVersion:boolean,
     *      postCommands:String 
     *      branch:String 
     *      returnVersion:Function, 
     *      limits:{
     *          patchLimit:50,
     *          minorLimit:10
     *          modifyScoreP:25,
     *          modifyScoreM:75
     *      }
     * }
     */
    validate(configs) {
        if(typeof configs != 'object'){
            console.error("configs provided is not an object",configs);
            return null;
        }
        this.config = configs;
        this.start(configs);
    };
}

const JSONVersion = new csJsonVersion();
module.exports =  {
    run:JSONVersion.validate.bind(JSONVersion)
};