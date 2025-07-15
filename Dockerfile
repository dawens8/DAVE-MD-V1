FROM node:lts-buster
RUN git clone https://github.com/dawens8/DAVE-MD-V1/root/dawens8
WORKDIR /root/dawens8
RUN npm install && npm install -g pm2 || yarn install --network-concurrency 1
COPY . .
EXPOSE 9090
CMD ["npm", "start"]