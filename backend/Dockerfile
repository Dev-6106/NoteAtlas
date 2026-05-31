FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Usually you'd compile TS to JS here. For simplicity, we use tsx directly.
CMD ["npm", "run", "dev"]
