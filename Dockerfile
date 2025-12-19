FROM node:20-bullseye

RUN apt-get update && apt-get install -y \
  tesseract-ocr \
  libtesseract-dev \
  libleptonica-dev \
  ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .

RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
