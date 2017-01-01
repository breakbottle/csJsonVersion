/**
 * Author: Clint Small Cain
 * Date: 1/1/2017
 * Time: 10:34 AM
 * Description:
 */
var jsonfile = require('jsonfile');
require('shelljs/global');

var commitDetails = function(version,commit){
    if(commit){
        exec('git add -u');
        exec('git commit -a -m "v'+version+'"');
        exec('git tag v'+version);
        exec('git push --follow-tags origin master')
    } else {
        exec('git tag v'+version);
        exec('git add -u');
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
            jsonfile.writeFile(configFile, obj, function (err) {
                if (err) {
                    console.error(configFile+" json error: --->", (err || 'none'));
                }
                if(callback){
                    callback(obj.version);
                }
                console.error(configFile+": json set: --->", obj.version)
            });

        }

    });
};//
var count = 0;
var called = function(listOfFiles,ver,commit){
    if(typeof listOfFiles[count] == 'string'){
        changeVersion(listOfFiles[count],ver,function(v){
            count++;
            called(listOfFiles,ver,commit);

        });
    } else {
        
        commitDetails(ver,commit);
    }

};
var config = function (listOfFiles,optionalVersion,commit) {
    called(listOfFiles,optionalVersion,commit)
};

module.exports =  {
    changeVersion:changeVersion,
    commitDetails:commitDetails,
    //COMMAND: @params: version [OPTIONAL:IF NOT PASSED IT WILL AUTO INCREMENT - 5.0.5]
    //example: Called Manually for changeVersion and commitDetails
        /*
            var csVersion = require('cs-version');
            csVersion.changeVersion('../cs-config.json',params[3],function(v){
                csVersion.changeVersion('package.json',params[3],function(version){
                    csVersion.commitDetails(version);
                    console.info('version added: ',version);
                });
            });
         */
    run:config
    //csVersion.run(['../cs-config.json','package.json'],params[3]);
};