# Resistance Calendar API

API for Resistance Calendar events

![Codeship Status](https://codeship.com/projects/14cd3280-e2a5-0134-1b72-664f30205a5b/status?branch=master)

# Getting Started

## Prerequisites

* [MongoDB](https://www.mongodb.com) from the [downloads page](https://www.mongodb.com/download-center?jmp=nav#community)
* [Node Package Manager](https://www.npmjs.com)

## Run the server
```
cd resistance-calendar-api

# Export the facebook token. Eventually this can be made to auto-refresh using the app secret.
export FB_GRAPH_API_TOKEN=[YOUR FACEBOOK TOKEN]

# Start mongodb
mkdir .db
mongod --dbpath .db/

# Always a good idea to install packages
npm install && npm install semistandard -g

# Run the service
npm run
```

# Technical Architecture

The service is a node service based on the [hapijs](https://hapijs.com) framework and uses [mongodb](https://www.mongodb.com/)
