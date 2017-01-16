# cs-json-version

Updates the version of each provided *.json file then process a commit/tag and push
## install

  `npm install cs-json-version` 


## use

```javascript

  var csVersion = require('cs-version');


  var configs = {
       listOfFiles:['../cs-config.json','package.json','bower.json','random.json'],
       optionalVersion:'1.2.3', //The full Semantic Version will be used [ 1.0.3 ], this is optional, will take the version in the file if no version property in the file will default to 0.1.0
       useCommitOptions:false, //Use default commit,tag,push to origin master
       postCommands:"echo hello world" //cli commands to run after git tag
       branch:"dev" //no defaults
       limits:{
           patchLimit:50,//when we hit this limit we go up 1 on the main version number
           minorLimit:10,//when we hit this limit we go up 1 on the patch version number
       }
  }
  
  csVersion.run(configs);

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

> Note: git globals configs may need to be updated to use the git functionality. todo:)

## license

[MIT](LICENSE)
