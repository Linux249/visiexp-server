
#### start 
Deployed to `compvis10` with the `www-data-user`
```
cd ~/jl_visiexp/visiexp-server
pm2 start
```


#### update
```
cd ~/jl_visiexp/visiexp-server
npm run deploy
pm2 restart all
```
Pulls everything from remote/master and run build

#### API
The app is provided under `localhost:3000`. The Apache2 server is configured to redirect everything with `[domain}/api/v1/..` here. 
 
### Dataset
A `.json` file have to exists before adding a new dataset here
1. Change to config file under ``src/config/datasets.js`` and add a entry with the following schema
```
{
    id: '002', // it has to be a number with three digits, the 001 sets the default dataset
    name: 'Wikiart_Elgammal_EQ_style_test',     // a name that is equal to the basename of the .json file 
    description: 'description text missing',    // description text shown in the ui
    imgPath: '/net/hcihome/storage/www-data-login-cv/visiexp/datasets/raw/Wikiart_Elgammal/',   // full path to the images
    size: 1584,     // count of images in the folder/imgPath
},
```
2. Commit the changes to the file and push to `origin/master`. Or change the file directly on github. 
3. update the server
4. run `npm run datasets:prod` to build the image files for the client
5. after finishing 4. the new dataset can used in the UI.

### Python API
To change the url where to find the python api just change this file 
1. change file here on github and commit: [/src/config/pythonApi.js](/src/config/pythonApi.js)
2. login to compvis10 with `www-data-login` and go to `cd ~/jl_visiexp/visiexp-client`
3. run `npm run deploy`

That way 


### (old) Node schema
```
node = {
    index: number,  // identifier
    name: string,   // name of the picture,
    label: string,  // group name
    x: number,
    y: number,
    links: {
        10: 0.5     // key is target-index and value is strength
    }, // list of links to other nodes - target = index of neighbour node
    mPosition: boolean,     // position modified?
    mLinks: boolean,        // links modified?
}
```

### TODO 
