set -e

NAME=$1

ORIGIN=$(git remote get-url origin)
FILES=(package.json README.md)

cp -f README-template.md README.md

for FILE in ${FILES[@]}
do
    sed -i '' "s/package-template/$NAME/g" $FILE
done

rm init.sh README-template.md

git remote set-url origin ${ORIGIN/package-template/$NAME}
git add --all
git commit --amend -m "initial"
git push
