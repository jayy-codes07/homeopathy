FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY src ./src
# Multer writes uploads here before they are pushed to Cloudinary.
RUN mkdir -p public/tempUserAvatar

ENV NODE_ENV=production
ENV PORT=8000
EXPOSE 8000

CMD ["node", "src/index.js"]
