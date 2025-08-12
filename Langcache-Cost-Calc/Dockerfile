# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app
RUN npm install -g serve

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist

# Create the startup script with AWS credentials
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'echo "window.VITE_GOOGLE_API_KEY=\"$VITE_GOOGLE_API_KEY\"" > /app/dist/env.js' >> /app/start.sh && \
    echo 'echo "window.VITE_AWS_ACCESS_KEY_ID=\"$VITE_AWS_ACCESS_KEY_ID\"" >> /app/dist/env.js' >> /app/start.sh && \
    echo 'echo "window.VITE_AWS_SECRET_ACCESS_KEY=\"$VITE_AWS_SECRET_ACCESS_KEY\"" >> /app/dist/env.js' >> /app/start.sh && \
    echo 'echo "window.VITE_AWS_REGION=\"$VITE_AWS_REGION\"" >> /app/dist/env.js' >> /app/start.sh && \
    echo 'echo "<script src=\"/env.js\"></script>" >> /app/dist/index.html' >> /app/start.sh && \
    echo 'exec serve -s dist --listen $PORT' >> /app/start.sh && \
    chmod +x /app/start.sh

CMD ["/app/start.sh"]
