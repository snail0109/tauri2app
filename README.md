## 开发
```
npm install
npm run dev
```

## 创建签名
```
keytool -genkey -v -keystore ~/sensor-tool-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias sensor-tool
```
src-tauri/gen/android/ 创建 keystore.properties 文件，内容如下：
```
keyAlias=sensor-tool
password=XXXX
storeFile=/Users/xxxx/sensor-tool-keystore.jks
```