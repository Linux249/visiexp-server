from os import listdir, path
import time


p = "../images/2582_sub_wikiarts/"
n = 10
out = {}

start = time.time()
while n < 150:
    subPath = p + str(n)
    print(subPath)
    for file in listdir(subPath):
        imgPath = path.join(subPath, file)
        f = open(imgPath , "r")
        out[imgPath] = f.read()
    end = time.time()
    print(end - start)
    n += 10

end = time.time()
print(end - start)
