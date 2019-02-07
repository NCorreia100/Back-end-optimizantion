FROM node:10
##mkdir docker first
WORKDIR /home/ec2-user/docker
COPY package*.json ./
RUN npm i 
COPY . .
EXPOSE 3010
CMD ["node","public/bundle-server.js"]



