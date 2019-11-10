# -*- coding: utf-8 -*-
"""
Created on Thu Feb 27 09:25:24 2018
@author: jlibor
"""
### Aktuelle Version als Hilfe ausgeben
import os
import sys
import time
from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer       # python 2
#from http.server import BaseHTTPRequestHandler, HTTPServer        # python 3
import json
#from compute_embedding import compute_graph
"""
def format_string(graph):
    s = str(graph)
    s = s.replace("'", '"').replace(': ', ':').replace('False', 'false').replace('True', 'true')\
        .replace(', ', ',').replace(':u"', ':"')
    return s
"""
### prod server
def get_graph(userData=[]):
    graph = compute_graph(userData)
    return graph
    #return userData

"""
### dev Server
def get_graph(userData = []):
    filename = "data/response_data.txt"
    with open(filename, "rb") as f:
        return f.read()
"""

## MyHTTPHandler beschreibt den Umgang mit HTTP Requests
class MyHTTPHandler(BaseHTTPRequestHandler):

    def do_OPTIONS(self):
        self.send_response(200, "ok")
        self.send_header('Access-Control-Allow-Origin', self.headers['origin'])
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-type')

        self.end_headers()

    def do_GET(self):
        """
        default route /
        for fast checking if server is online
        """
        if(self.path == "/"):
            print("GET /")
            self.send_response(200)
            self.end_headers()
            self.wfile.write('server online')

        """
        example: /snapshots?userid=3&dataset=003
        used for loading all saved snapshots for the given dataset
        """
        if("/snapshots" in self.path):
            print("GET /snapshot")
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()

            # get params
            query = self.path.split('?')[1]
            dataset = self.path.split('&')[0].split('=')[1]
            userid = self.path.split('&')[1].split('=')[1]

            print 'DEBUG: loading snapshots: ', userid, dataset

            # path to jsons
            json_dir = os.path.join(sys.path[0], 'user_models', userid, dataset)

            print 'DEBUG: ' ,json_dir # DEBUG

            # send empty back if nothing is saved
            if not os.path.isdir(json_dir):
                print 'DEBUG: no files found' # DEBUG
                self.wfile.write('[]')

            # get all json files name
            json_files = [pos_json for pos_json in os.listdir(json_dir) if pos_json.endswith('.json')]

            content = []
            for index, json_file in enumerate(json_files):
                with open(os.path.join(json_dir, json_file)) as file:
                    content.append(json.load(file))

            self.wfile.write(json.dumps(content))

    def do_POST(self):
        """
        definiert den Umgang mit POST Requests
        Liest den Body aus - gibt in zum konvertieren weiter

        """
        if(self.path == "/nodes"):
            print("post /nodes")
            ### POST Request Header ###
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            #self.send_header('Access-Control-Allow-Origin', self.headers['origin'])
            self.end_headers()

            # get body from request
            content_len = int(self.headers['Content-Length'])
            body = self.rfile.read(content_len)

            # convert body to list
            data = json.loads(str(body).decode('utf-8'))  # python 2
            #data = json.loads(str(body, encoding='utf-8'))      # python 3
            print(data)

            ## Katjas code goes here
            #data = get_graph(data)


            testDict = {}
            testDict[0] = {'name': 'vincent-van-gogh_sower-1888-1', 'links': {1: 0.5}, 'x': 5, 'y': -5}
            testDict[1] = {'name': 'vincent-van-gogh_sower-1888-1', 'links': {19: 0.5}, 'x': -10, 'y': 10}
            testDict[2] = {'name': 'vincent-van-gogh_sower-1888-1', 'links': {}, 'x': -5, 'y': 5}
            # make json
            testDict = json.dumps(testDict).encode()
            self.wfile.write(testDict)  #body zurueckschicken


        """
        Save a snapshot persistently
        """
        if("/snapshots" in self.path):
            print("post /nodes")
            ### POST Request Header ###
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()

            # get body from request
            content_len = int(self.headers['Content-Length'])
            body = self.rfile.read(content_len)

            # convert body to list
            data = json.loads(str(body).decode('utf-8'))  # python 2
            #data = json.loads(str(body, encoding='utf-8'))      # python 3

            userid = data["userid"] # userid of the logged in user
            dataset = data["dataset"] # name of the dataset/or number
            count = data["count"] # count of the images to separate snaps

            print 'DEBUG: ', userid, dataset, count

            #path for file to save snapshot
            snapfile = "./user_models/{}/".format(userid)

            if not os.path.isdir(snapfile):
                os.makedirs(snapfile)

            # add dataset id to path
            snapfile = os.path.join(snapfile, "{}".format(dataset))
            if not os.path.isdir(snapfile):
                os.makedirs(snapfile)

            snapfile = os.path.join(snapfile, "{}.json".format(count))

            with open(snapfile, 'w') as f:
                json.dump(data, f)

            self.wfile.write('ok')  #body zurueckschicken

        return

if __name__ == "__main__":
    # config
    HOST_NAME = "localhost"
    PORT_NUMBER = 8001
    try:
        http_server = HTTPServer((HOST_NAME, PORT_NUMBER), MyHTTPHandler)
        print(time.asctime(), 'Server Starts - %s:%s' % (HOST_NAME, PORT_NUMBER), '- Beenden mit STRG+C')
        http_server.serve_forever()
    except KeyboardInterrupt:
        print(time.asctime(), 'Server Stops - %s:%s' % (HOST_NAME, PORT_NUMBER), '- Beenden mit STRG+C')
http_server.socket.close()
