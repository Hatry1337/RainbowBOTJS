FROM node:19-alpine
RUN adduser -Dg rainbowbot -g /bin/sh rainbowbot

RUN apk add graphicsmagick git python3 pkgconf cairo pango libjpeg-turbo giflib librsvg

USER rainbowbot
WORKDIR /home/rainbowbot
RUN git clone https://github.com/Hatry1337/RainbowBOTJS
WORKDIR /home/rainbowbot/RainbowBOTJS
RUN npm i
RUN npx tsc

RUN apk del git python3 pkgconf

CMD node dist/bot.js
