FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma/
# Generate Prisma Client
RUN npx prisma generate

COPY . .

# Ensure ts-node is available for starting
RUN npm install -g ts-node typescript

EXPOSE 4000

CMD ["npm", "start"]
