FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package.json ./
COPY yarn.lock ./

RUN npm install

COPY . .

RUN npm run build



EXPOSE 4000
CMD [ "node", "dist/index.js" ]
USER node