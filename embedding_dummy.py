import pickle
import sys  
import socket


class Node(object):
   def __init__(self, name, x, y, links=None, label=None, modified=False, dragged=False):
       self.dict = {'name': name, 'x': x, 'y': y, 'links': links, 'label': label}

   def update(self, **kwargs):
       self.dict.update(kwargs)

   def __repr__(self):
       return str(self.dict)


def print_graph(graph=[]):
    with open('example_graph2.pkl', 'rb') as infile:
        graph = pickle.load(infile)
    return graph

if __name__ == "__main__":
    print_graph()