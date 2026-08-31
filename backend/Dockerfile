FROM node:24-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"

RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]