FROM --platform=linux/amd64 node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
RUN npm install -g typescript ts-node

COPY . .

# Create a new shell script file
RUN echo '#!/bin/sh\n\
ts-node ./temporal/worker.ts\n\
' > /usr/src/app/entrypoint.sh

# Give execute permissions to the shell script
RUN chmod +x /usr/src/app/entrypoint.sh

# Use the shell script as the entry point
ENTRYPOINT ["sh", "/usr/src/app/entrypoint.sh"]
