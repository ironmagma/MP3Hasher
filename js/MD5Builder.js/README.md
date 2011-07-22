Usage
=====

```javascript
var b = new MD5Builder();
b.update("H");
b.update("el");
b.update("lo");
b.update("world");
console.log(b.calc());
```
