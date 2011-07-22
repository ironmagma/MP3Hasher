var x = new MD5Builder();
x.update("H");
x.update("e");
x.update("ll");
x.update("o, world");
print(x.compute());
