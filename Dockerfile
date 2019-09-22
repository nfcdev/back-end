FROM node:10.16.3
WORKDIR /back-end
COPY package*.json /back-end/
RUN npm install
COPY . /back-end/
EXPOSE 3000
CMD ["npm", "start"]