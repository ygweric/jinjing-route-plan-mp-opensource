
Created by Toar+vue3


### run
```
yarn dev
```

### default location
```
lat 40.064863
long 116.408665
```



## tips
* **pnpm run dev**时候，**components.d.ts**会被一直编译，导致**lint-staged**反复失败，可以手动**git add** 所有文件（除了**components.d.ts**）



* **run build:weapp** 的**NODE_ENV**是生产，但**run build:weapp -- -- watch**就又是开发了，不过代码会压缩

* 小程序需要使用crypto-js@3.3.0，因为v4使用了原生的nodejs的random函数，小程序不支持