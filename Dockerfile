FROM node:19
RUN useradd -ms /bin/bash rainbowbot

RUN apt update && apt install -y graphicsmagick

USER rainbowbot
WORKDIR /home/rainbowbot
RUN git clone https://github.com/Hatry1337/RainbowBOTJS
WORKDIR /home/rainbowbot/RainbowBOTJS
RUN mkdir -p ~/.local/share/fonts && cp assets/fonts/* ~/.local/share/fonts && fc-cache -f -v
RUN npm i
RUN npx tsc

CMD node dist/bot.js