all:
	npm install;
	heroku plugins:install heroku-builds;

deploy:
	gulp clean-build;
	(cd ./dist; heroku builds:create);

heroku: heroku_app heroku_addons heroku_config

heroku_app:
	echo "What is the name of the heroku app?"; \
	read heroku_app; \
	heroku apps:create $$heroku_app; \

heroku_addons:
	heroku addons:create mongolab; \
	heroku addons:create logentries; \

heroku_config:
	heroku config:set NODE_ENV=production

add-collab:
	echo "Who to add as collaborator?"; \
	read collab; \
	heroku sharing:add $$collab
