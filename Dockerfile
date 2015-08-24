FROM	 	ubuntu:latest
	
# Install nodejs
RUN 		sudo apt-get update
RUN 		sudo apt-get install -y build-essential libssl-dev curl
ENV 		NVM_DIR /usr/local/nvm
ENV 		NODE_VERSION 0.10.35
ENV			RUNNING_DOCKER true

# Install nvm with node and npm
# Replace shell with bash so we can source files
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

# Set debconf to run non-interactively
RUN echo 'debconf debconf/frontend select Noninteractive' | debconf-set-selections

RUN 		curl https://raw.githubusercontent.com/creationix/nvm/v0.20.0/install.sh | bash \
    && 		source $NVM_DIR/nvm.sh \
    && 		nvm install $NODE_VERSION \
    && 		nvm alias default $NODE_VERSION \
    && 		nvm use default

ENV 		NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV 		PATH      $NVM_DIR/v$NODE_VERSION/bin:$PATH

# Install forever
RUN 		npm install -g forever

# Copy the code
WORKDIR		/src
COPY 		. /src

# Run tally
EXPOSE		3000
CMD			["node", "app.js"]