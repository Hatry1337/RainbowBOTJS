FROM node:20-alpine3.18
RUN adduser -Dg rainbowbot -u 2770 -g /bin/sh rainbowbot

RUN apk add --no-cache graphicsmagick

RUN apk add --no-cache --virtual .build-deps \
    git \ 
    python3 \ 
    pkgconf \ 
    make \ 
    g++ \ 
    cairo-dev \ 
    pango-dev \ 
    libjpeg-turbo-dev \ 
    giflib-dev \ 
    librsvg-dev \ 
    ; \
    cd /home/rainbowbot && git clone https://github.com/Hatry1337/RainbowBOTJS && cd RainbowBOTJS \ 
    ; \ 
    npm i && npx tsc \ 
    ; \ 
    chown -R rainbowbot:rainbowbot /home/rainbowbot \ 
    ; \ 
    apk del --no-network .build-deps \ 
    ; \ 
    rm -rf \ 
        /root/.npm \ 
        /root/.cache \ 
        /home/rainbowbot/RainbowBOTJS/src \ 
        /home/rainbowbot/RainbowBOTJS/typings \ 
    ; \ 
    apk add --no-cache cairo pango libjpeg-turbo giflib librsvg

 

USER rainbowbot
WORKDIR /home/rainbowbot/RainbowBOTJS
CMD node dist/bot.js
