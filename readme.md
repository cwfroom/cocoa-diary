# Cocoa Diary  
Cocoa diary is a web app written in React for personal use.  
## Features  
Currently this app consists of two major components: Diary and Logbook. Login is required to access Diary. The public can view Logbook, but only the authorized user can edit it. Access control is limited to a single password.
Data is stored as json files with an extension of "zzd". It is assumed that the user knows how to edit these files manually. Diary zzd files are compitable with [zzDiary](https://github.com/cwfroom/zzDiary)
## Config File  
Password: SHA256 hash of password. There is no way to register a user, password need to be generated from an external tool. e.g. https://www.xorbin.com/tools/sha256-hash-calculator  
Secret: Secret used to generate JSON Web Token. Can be any string.  
DataPath: Path to data folder.  
FirstYear: Which year should Diary begin.
## Folder Structure  
```
/data
    /Diary
        /[Year]
            /[Month].zzd
    /Logbook
        /[Category].zzd
```
## File Structure  
### Diary Month File  
```javascript
{
    "Year": YYYY,
    "Month": MM,
    "List": [
        {
        "Title": string,
        "Content": string with /r/n endings
        }
    ]
}
```
### Logbook File
```javascript
{
    "Category": string,
    "Columns": [
        column0, column1...
    ]
    "List": [
        {
            column0: string,
            column1: string
        }
    ]
}
```