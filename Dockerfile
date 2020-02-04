FROM node:10.16.3
WORKDIR /back-end
COPY package*.json ./
RUN npm install
COPY . ./
EXPOSE 9000
CMD npm run start