FROM nginx:alpine

# Remove default config and clear conf.d directory to avoid any conflicts
RUN rm -f /etc/nginx/conf.d/default.conf && \
    rm -rf /etc/nginx/conf.d/*

# Copy your full config to the main nginx.conf location
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
