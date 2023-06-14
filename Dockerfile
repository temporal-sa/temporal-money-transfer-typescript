FROM --platform=linux/amd64 node:18

WORKDIR /usr/src/app

COPY ./ui/ ./ui/
COPY ./server/ ./server/

RUN npm install -g typescript ts-node

WORKDIR /usr/src/app/ui
RUN npm install

WORKDIR /usr/src/app/server
RUN npm install

# COPY ./ui ./ui
# COPY ./server ./server

EXPOSE 3000

CMD [ "npm", "run", "start" ]
