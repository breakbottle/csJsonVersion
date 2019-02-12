# cs-json-version

Updates the version of each provided *.json files then process a commit/tag and push
## install

  `npm install cs-json-version` 

## Requirements

To automatically allow the system to use git to commit and push your code, do the following:


```cmd
$ git config credential.helper store
$ git push http://example.com/repo.git
Username: <type your username>
Password: <type your password>

[several days later]
$ git push http://example.com/repo.git
[your credentials are used automatically]
```

## Config Options and Features

To use `cs-json-version` you will need to provide an object to access the features:

- **listOfFiles** - *REQUIRED* : An array of strings that contains the all the JSON files that need the version updated. 
  - Example: `['../cs-config.json','package.json','bower.json','random.json']`
  - > Some applications uses multiple JSON files that contains a `version` property that needs to be in sync with the rest of the application. Obviously if you're just using `package.json` the `cs-json-version` is not really needed as npm provides a way to easily update the version in the `package.json`. However, if using another tools that uses the JSON method to store configs with a version property, such as bower (Although these days, web packages tools [webpack,parcel,yarn,etc] now all refer to package.json) or you have sub packages that you want to increment as part of a global update. 
---
- **useCommitOptions** - *Boolean* - Defaults to false, provide advance `git` commands after version change.
  - Example: ` useCommitOptions:true`
  - > TRUE - Will stage, commit & tag uncommitted changes. Also gathers information about the staged files to determine which Semantic Version to update based on `limits`.
    - > If `branch` is provided it will push to origin & tags. NOTE: This only works if your global configs credentials are stored. 
    - > IF `postCommands` is provided it will execute the string provided in the terminal.
  - > FALSE - Will ONLY tag, stage uncommitted changes and update version based on `limits`.
    - > IF `postCommands` is provided it will execute the string provided in the terminal.
---
- **postCommands** - *OPTIONAL | String* - Executes the string provided in the terminal after git stage, commit & tag.
  - Example: `postCommands:'echo all done && node run anotherAction'`
---
- **branch** - *OPTIONAL | String* - When provided `git push` to origin of this branch.
  - Example: `branch:'dev' or branch:'master'`
  - > Pushing to this branch will only work if your global configs credentials are stored. 
---
- **optionalVersion** - *OPTIONAL | String* - The version to use to update all JSON files.
  - Example: `optionalVersion:'1.2.3'`
  - > If not provided, the version is read from the JSON files and increments are determined based on those values (if no version property is provided then 0.1.0 is used). However, if you provide a version, it's assume that version increments is handled outside if the system and the use of `cs-json-version` is only to update the JSON files.
---
- **returnVersion** - *OPTIONAL | Function* - A call back function that provides the parameters new `version` & function to execute git commands. 
  - Example: 
    ```js
    returnVersion:function(newVersion,RunGitCommandFunction){
        //You have the newVersion to pass to another system, print to log or whatever 
        console.log('The new version is %s',newVersion);
        
        /**
        * If you choose to use the returnVersion option, this will 
        * automatically prevent `useCommitOptions`:TRUE from executing 
        * the automatic run of git Commands. You will have to execute 
        * RunGitCommandFunction() to execute 
        * git commands (Stage,Commit,Push[will onl work if your globals configs is set])
        * keeping `useCommitOptions` as true
        */
        RunGitCommandFunction();
    }
    ```
  - > You may want to perform some action before the git command are ran while having the new version, this callback function provides this option for you. But remember once all action are completed with the new version you must run git commands function unless you choose not to.
---  
- **limits** - *OPTIONAL | Object* - Control how the Semantic version are set based on these limits.
  - Example: 
    ```js
           limits:{ //anything outside limits provided will update major number
               patchLimit:50,//when we hit this limit we go up 1 on the main version number
               minorLimit:10//when we hit this limit we go up 1 on the patch version number
               modifyScoreP:25, //Modification Score less & equal to 25 (number provided) will change patch number by one
               modifyScoreM:75 //Modification Score changed less & equal to 75 but greater than 25 (number provided) will change minor number by one      
     }
    ```
  - > Only you can really determine what was done in the project to get the versioning correct. This is only an attempt to automate this process. Every time `cs-json-version` is ran the limits are checked to ensure the correct number is updated based on these values. The Modification Score, again is just another attempt to look at changes stats to decide which number to update. The values listed are all defaults.
## How to use?
### Best Practice when using `useCommitOptions` as true
 - Make changes to files.
 - Stage your changes
 - Run versions

### Begin
1. Create a new js file 'version.js'
2. Add `const csVersion = require('cs-json-version');`
3. Add configs `const configs = {listOfFiles:['../cs-config.json','package.json','bower.json','random.json']}`
4. Execute ` csVersion.run(configs);` 
5. Call from terminal `node version` done.

---
### Use with VSCode commandbar.json
```json
  {
    "text": "$(key) version+",
    "tooltip": "Update Version and Push to Development",
    "color": "green",
    "command": "npm run version",
    "alignment": "left",
    "skipTerminateQuickPick": false,
    "priority": 0
  }
```
---
### Use with pre-commit & git-hooks
> `useCommitOptions` set to `false` in configs
> https://githooks.com/


### Build options, example Jenkins
> Use a build step to execute shell command `node version`;

### Other usage

```javascript
  //Basic usage
  const csVersion = require('cs-json-version');
  const configs = {
       listOfFiles:['../cs-config.json','package.json','bower.json','random.json'],
       optionalVersion:'1.2.3',
       useCommitOptions:false, 
       postCommands:"echo hello world",
       branch:"dev",
       limits:{
           patchLimit:50
       }
  }
  csVersion.run(configs);
////////////////////////////////////////////////
  //
  /**
   * Run with version already provided by other system.
   * Running this will just update the JSON files listed
   */
  let externalVersion = process.argv[2]
  csVersion.run({
      listOfFiles:['test.json','package.json'],
      useCommitOptions:true,
      optionalVersion:externalVersion, //this can be your command line option or other provided options
      postCommands:'echo message after tagged. ',
      branch:"development",
      limits:{
          patchLimit:21,
      }
  });

////////////////////////////////////////////////
  /**
   * Run with pre option before git commands 
   */

  csVersion.run({
      listOfFiles:['test.json','package.json'],
      useCommitOptions:true,
      postCommands:'echo message after tagged. ',
      branch:"development",
      returnVersion:function(newVersion,RunGitCommandFunction){
          //You have the newVersion to pass to another system, print to log or whatever 
          console.log('The new version is %s',newVersion);
          
          /**
           * If you choose to use the returnVersion option, this will 
           * automatically prevent `useCommitOptions`:TRUE from executing 
           * the automatic run of git Commands. You will have to execute 
           * RunGitCommandFunction() to execute 
           * git commands (Stage,Commit,Push[will onl work if your globals configs is set])
           * keeping `useCommitOptions` as true
          */
          RunGitCommandFunction();
      },
      limits:{
          patchLimit:21,
      }
  });

////////////////////////////////////////////////

  //Gulp Example
  gulp.task('version', function() {
    csVersion.run({
        listOfFiles:['../cs-config.json','package.json'],
        useCommitOptions:true,
        postCommands:'echo version from gulp',
        branch:"development"
    });
  });
```
## author(s)

  Clint W. Cain (Small)

## summary

This module updates the version number of all given *.json files, then adds a tag and commit and pushes to repo. If version number is provided in 0.1.0 Semantic Version, it will update with exact number provided. If no version is provided it will auto increment the patch up to a limit of 50, the minor to a limit of 10.

## license

[MIT](LICENSE)
