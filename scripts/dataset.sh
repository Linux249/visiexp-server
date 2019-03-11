#!/bin/bash

path="/net/hci-storage02/groupfolders/compvis/datasets/Animals_with_Attributes2/"
#subfolder=ls ${path}/JPEGImages/

for d in $(find ${path}/JPEGImages -maxdepth 1 -type d)
do
  #Do something, the directory is accessible with $d:
  echo ${d}
done

#ln -s ${path}/JPEGImages/antelope/* ${path}/single_folder_images2/
