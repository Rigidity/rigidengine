#!/bin/bash -e

clear
git rm --cached -r .
git add .
git status
commit_message=$1
git commit -m "$commit_message"
git push -u origin master
clear
echo $1
