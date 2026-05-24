FROM node:18
WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .

EXPOSE 5001

CMD [ "node","app.js" ]