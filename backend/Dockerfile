FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --only=production
COPY src ./src
COPY server.js .
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 CMD node -e "require('http').get('http://localhost:5000/ready', (r) => {if (r.statusCode !== 200) process.exit(1)})"
CMD ["node", "server.js"]
