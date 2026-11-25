FROM nginx:stable-alpine

LABEL org.opencontainers.image.title="AI-Plugins" \
      org.opencontainers.image.description="Claude Code Arsenal — top 50 plugins et 50 skills" \
      org.opencontainers.image.source="https://github.com/Shemsouu/AI-Plugins"

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY index.html /usr/share/nginx/html/index.html
COPY assets/ /usr/share/nginx/html/assets/

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/ || exit 1
