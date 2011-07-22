import subprocess
import sys

files = [
   "md5.air.FileStream.js",
   "md5.js",
   "MD5Builder.js",
   "test.js"
]

inp = "\n".join([open(x, "r").read() for x in files])

subprocess.Popen(['/usr/local/bin/js', '-e', inp]).wait()


