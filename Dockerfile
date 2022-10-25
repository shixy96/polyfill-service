FROM node:19.0.0-slim

WORKDIR /usr/polyfill

COPY package*.json ./
RUN npm install --registry=https://registry.npm.taobao.org  --disturl=https://npm.taobao.org/mirrors/node
COPY . .
RUN npm run clean & npm run build

EXPOSE 8080
CMD [ "npm", "run", "start" ]
