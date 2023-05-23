FROM --platform=linux/amd64 node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
RUN npm install -g typescript ts-node

COPY . .

# Create a new shell script file
RUN echo '#!/bin/sh\n\
if [ "$WORKER_TYPE" = "activity" ] ; then\n\
    ts-node ./temporal/worker.activity.ts\n\
else\n\
    ts-node ./temporal/worker.workflow.ts\n\
fi' > /usr/src/app/entrypoint.sh

# Give execute permissions to the shell script
RUN chmod +x /usr/src/app/entrypoint.sh

# Use the shell script as the entry point
ENTRYPOINT ["sh", "/usr/src/app/entrypoint.sh"]
