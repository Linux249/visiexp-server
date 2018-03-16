
import socket
import sys
import time
import datetime
import sys

sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

server_address = ('localhost', 3000)
print ('connecting to %s port %s' % server_address)
sock.connect(server_address)

sock.sendall("python start".encode())

while True:
    veri="fromPython"
    veriler = ("%s,%s"%(veri,str(datetime.datetime.now())))
 
    
    sock.sendall(veriler.encode())
    print(veriler)
    time.sleep(5)