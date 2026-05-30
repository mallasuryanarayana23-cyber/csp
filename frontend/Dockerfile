FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build the frontend (if needed, otherwise we can just run dev for testing)
# RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "dev"]
