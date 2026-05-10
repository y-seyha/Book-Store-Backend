FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build


#  PRODUCTION STAGE

FROM node:20 AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm install --omit=dev


COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]


## optional: if you use runtime assets
#COPY --from=builder /app/.env ./.env