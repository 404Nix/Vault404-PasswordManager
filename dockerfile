#Build the frontend [dist folder]
#copy the dist folder to the backend/public folder

FROM node:20-alpine AS frontend-build

COPY ./frontend-Vault404 /app

WORKDIR /app

RUN npm install

RUN npm run build

#build the backend

FROM node:20-alpine AS backend-build

COPY ./backend-Vault404 /app

WORKDIR /app

RUN npm install

COPY --from=frontend-build /app/dist /app/public

CMD [ "node", "index.js" ]
