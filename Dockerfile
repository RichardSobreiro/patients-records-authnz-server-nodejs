FROM node:16-alpine
WORKDIR /src
COPY package.json ./
COPY .env ./
COPY tsconfig.json ./
COPY dist/oidc/src ./src
RUN ls -a
RUN npm install
EXPOSE 80
CMD ["nodemon dist/oidc/src"]
##RUN npm run build
#RUN tsc

## this is stage two , where the app actually runs
# FROM node:16-alpine
# WORKDIR /usr
# COPY package.json ./
# RUN npm install --only=production
# COPY --from=0 /usr/dist .
# ##RUN npm install pm2 -g
# EXPOSE 80
# ##CMD ["pm2-runtime","app.js"]
# CMD ["nodemon dist/oidc/src"]