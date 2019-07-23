### install

#### clone
```
git clone https://github.com/Linux249/visiexp-server.git myNodeProject
cd myNodeProject
npm i
```

#### start
Deployed to `compvis10` with the `www-data-user`
```
cd ~/visiexp/visiexp-server
pm2 start
```

#### update
Pull everything from remote/master and run build
```
cd ~/jl_visiexp/visiexp-server
npm run deploy
pm2 restart all
```

The app is provided under `localhost:3000`. The Apache2 server is configured to redirect everything with `[domain}/api/v1/..` here. 
 


### Node schema
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
- client id mitsenden, immer, datensatz erstmal auch
