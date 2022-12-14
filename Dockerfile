FROM node:lts-alpine

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories

RUN apk add tzdata && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && echo "Asia/Shanghai" > /etc/timezone && apk del tzdata

ENV LANG zh_CN.UTF-8
ENV LANGUAGE zh_CN.UTF-8
ENV TZ Asia/Shanghai

RUN apk add g++ make python3

COPY . /app
WORKDIR /app
RUN npm install --registry=https://registry.npm.taobao.org
RUN npm run build
CMD npm run dev
