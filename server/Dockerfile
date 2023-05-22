FROM --platform=linux/amd64 node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
RUN npm install -g typescript ts-node

COPY . .

EXPOSE 3000

CMD [ "ts-node", "./index.ts" ]