# cs-json-version

Updates the version of each provided *.json file then process a commit/tag and push
## install

~~~`npm install cs-json-version`~~~ haven't published to npm, quick deal for me

  `npm install https://github.com/breakbottle/csJsonVersion.git`

## use

```javascript

  var csVersion = require('cs-version');
//long version
  csVersion.changeVersion('../cs-config.json',params[3],function(v){
      csVersion.changeVersion('package.json',params[3],function(version){
          csVersion.commitDetails(version,true);//shouldWeCommitFull:true
          console.info('version added: ',version);
      });
  });
//short quick version
//@params listOfFiles, shouldWeCommitFull,optionalVersion
  csVersion.run(['../cs-config.json','package.json'],true,params[3]);
```
## author(s)
  Clint W. Cain (Small)
## summary

This module updates the version number of all given *.json files, then adds a tag and commit and pushes to repo. If version number is provided in 0.1.0 Semantic Version, it will update with exact number provided. If no version is provided it will auto increment the patch up to a limit of 50, the minor to a limit of 10.

> Note: git globals configs may need to be updated to use the git functionality. todo:)

## license

[MIT](LICENSE)
