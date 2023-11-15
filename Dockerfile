FROM node:19-alpine
RUN adduser -Dg rainbowbot -g /bin/sh rainbowbot

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
    rm -rf /root/.npm /root/.cache

RUN apk add --no-cache graphicsmagick cairo pango libjpeg-turbo giflib librsvg

USER rainbowbot
WORKDIR /home/rainbowbot/RainbowBOTJS
CMD node dist/bot.js
