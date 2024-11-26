# BUILD IMAGE
FROM node:18.16-alpine
RUN apk add --no-cache git

RUN corepack enable
RUN corepack prepare yarn@4.1.0 --activate

WORKDIR /opt/sisyfos-audio-controller

COPY . .
RUN yarn install  --mode=update-lockfile
RUN yarn build
RUN yarn install --mode=update-lockfile --production
RUN yarn cache clean

# DEPLOY IMAGE
FROM node:18.16-alpine
WORKDIR /opt/sisyfos-audio-controller
COPY --from=0 /opt/sisyfos-audio-controller .
EXPOSE 1176/tcp
EXPOSE 1176/udp
EXPOSE 5255/tcp
EXPOSE 5255/udp
CMD ["yarn", "start"]
