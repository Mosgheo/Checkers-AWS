FROM node:latest
RUN mkdir -p /app/UserService
WORKDIR /app/UserService
COPY . /app/UserService
RUN npm install --unsafe-perm
EXPOSE 3031
CMD npm run deploy