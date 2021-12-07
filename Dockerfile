FROM node:16
WORKDIR /usr/src/app
COPY ./package.json .
RUN npm i
RUN "apt update && apt install ffmpeg webp -y"
COPY . .
CMD ["npx", "nodemon", "index.js"]
