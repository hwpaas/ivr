FROM ubuntu:14.04

RUN apt-get update

# Required packages
RUN apt-get install -y git software-properties-common python python-software-properties g++ make

# Init node.js
RUN add-apt-repository -y ppa:chris-lea/node.js
RUN apt-get update
RUN apt-get -y install apt-utils supervisor nodejs

# Removed unnecessary packages
# RUN apt-get purge -y software-properties-common python python-software-properties g++ make
# RUN apt-get autoremove -y

# Clear package repository cache
# RUN apt-get clean all

ADD . /var/www
RUN cd /var/www && npm install
ADD ./docker/config.js.docker /var/www/config.js
ADD ./docker/supervisor.conf /etc/supervisor/conf.d/supervisor.conf
RUN mkdir /var/log/ivr

ENV NODE_ENV production
ENV NODE_PORT 3000

EXPOSE 3000

WORKDIR /var/www

CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisor/supervisord.conf"]