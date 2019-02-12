/**
 * This can be a script that is executed by a build server, task runner or git pre-commit
 */

//use the following for you app
//var csVersion = require('cs-json-version');
var csVersion = require('./index');

csVersion.run({
    listOfFiles:['test.json','package.json'],
    useCommitOptions:true,
    postCommands:'echo message after tagged. ',
    branch:"development",
    limits:{
        patchLimit:21,
    }
});


/**
 * Run with version already provided by other system.
 * Running this will just update the JSON files listed
 */

// csVersion.run({
//     listOfFiles:['test.json','package.json'],
//     useCommitOptions:true,
//     optionalVersion:process.argv[2], //this can be your command line option or other provided options
//     postCommands:'echo message after tagged. ',
//     branch:"development",
//     limits:{
//         patchLimit:21,
//     }
// });

/**
 * Run with pre option before git commands 
 */

// csVersion.run({
//     listOfFiles:['test.json','package.json'],
//     useCommitOptions:true,
//     postCommands:'echo message after tagged. ',
//     branch:"development",
//     returnVersion:function(newVersion,RunGitCommandFunction){
//         //You have the newVersion to pass to another system, print to log or whatever 
//         console.log('The new version is %s',newVersion);
        
            /**
             * If you choose to use the returnVersion option, this will 
             * automatically prevent `useCommitOptions`:TRUE from executing 
             * the automatic run of git Commands. You will have to execute 
             * RunGitCommandFunction() to execute 
             * git commands (Stage,Commit,Push[will onl work if your globals configs is set])
             * keeping `useCommitOptions` as true
             */
//         RunGitCommandFunction();
//     },
//     limits:{
//         patchLimit:21,
//     }
// });



