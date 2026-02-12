# gps 助手

## 开发
```
npm install
# 安卓
npm run tauri android init
npm run tauri android dev
```

## 本地打包
### 制作签名
```
keytool -genkey -v -keystore ~/sensor-tool-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias sensor-tool
```

### 从应用程序中引用密钥库
`src-tauri/gen/android/` 目录下创建一个 `keystore.properties` 文件
```
keyAlias=sensor-tool
password=<password from previous step>
storeFile=<密钥存储文件的位置，例如 /Users/xxx/keystore/tauri/sensor-tool-keystore.jks>
```

### 打包
```
# android
npm run tauri android build
```
