FROM ubuntu:20.04

SHELL ["/bin/bash", "-c"]

WORKDIR /tmp

RUN apt-get update && apt-get upgrade -y && \
    DEBIAN_FRONTEND=noninteractive apt-get install \
    -y --no-install-recommends --no-install-suggests \
    curl \
    libspatialindex-dev \
    python3 \
    python3-dateutil \
    python3-numpy \
    python3-pip \
    python3-setuptools

RUN echo LANG="en_US.UTF-8" > /etc/default/locale

# Install latest nodejs 12.x version
RUN curl -sL https://deb.nodesource.com/setup_12.x  | bash -
RUN apt-get -y install nodejs

# Reduce the image size
RUN apt-get autoremove -y
RUN apt-get clean -y

# Install Python requirements
WORKDIR /scripts
ADD requirements.txt /scripts
RUN pip3 install -r /scripts/requirements.txt
RUN python3 -m spacy download fr_core_news_sm

# Copy all the code
WORKDIR /home/app
COPY . /home/app

# Install JS dependencies
RUN mkdir /home/app/dist
RUN npm install

# Create a wrapper script to dispatch to the
# appropriate npm run command (build or watch)
# according to the NODE_ENV environnement variable
RUN printf "#!/bin/bash \n\
if [ \"\${NODE_ENV}\" = \"production\" ]; then \n\
    python3 server_app.py & npm run build \n\
else \n\
    python3 server_app.py & npm run watch \n\
fi\n" >> cmd.sh && chmod +x cmd.sh

EXPOSE 8008
CMD ["./cmd.sh"]
