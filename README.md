# Resistance Calendar API

API for Resistance Calendar events

![Codeship Status](https://codeship.com/projects/14cd3280-e2a5-0134-1b72-664f30205a5b/status?branch=master)

# Getting Started

## Prerequisites

* [MongoDB](https://www.mongodb.com) from the [downloads page](https://www.mongodb.com/download-center?jmp=nav#community)
* [Node Package Manager](https://www.npmjs.com)

## Demo

An instance of the application is running at the following location:

https://resistance-calendar.herokuapp.com/v1/events

### Endpoints

All endpoints try to be compliant with the [OSDI Events](https://opensupporter.github.io/osdi-docs/events.html) standard which exposes two high level endpoints and a few options for paging:
* https://resistance-calendar.herokuapp.com/v1/events
* https://resistance-calendar.herokuapp.com/v1/events/{:id} (TODO: #46)
* https://resistance-calendar.herokuapp.com/v1/events?page=0&per_page=25

### Queries

Queries are intended to comply with the [ODATA standard](http://docs.oasis-open.org/odata/odata/v4.0/errata03/os/complete/part2-url-conventions/odata-v4.0-errata03-os-part2-url-conventions-complete.html) and use [odata-v4-mongodb](https://github.com/jaystack/odata-v4-mongodb) to do so which implements much, but not all of the standard. Some examples of common queries are:
* Filter by start date (dates in [ISO8601 format](https://en.wikipedia.org/wiki/ISO_8601)):
 * [https://resistance-calendar.herokuapp.com/v1/events?$filter=start_date gt '2017-03-01'](https://resistance-calendar.herokuapp.com/v1/events?$filter=start_date%20gt%20'2017-03-01')
 * [https://resistance-calendar.herokuapp.com/v1/events?$filter=start_date gt '2017-03-01' and start_date lt '2017-03-02' ](https://resistance-calendar.herokuapp.com/v1/events?$filter=start_date%20gt%20'2017-03-01'%20and%20start_date%20lt%20'2017-03-02')
* Filter by nested property (postal_code and locality/city):
 * [https://resistance-calendar.herokuapp.com/v1/events?$filter=location/postal_code eq '22980'](https://resistance-calendar.herokuapp.com/v1/events?$filter=location/postal_code%20eq%20'22980')
 * [https://resistance-calendar.herokuapp.com/v1/events?$filter=contains(location/locality, 'Savannah')](https://resistance-calendar.herokuapp.com/v1/events?$filter=contains%28location/locality,%20'Savannah'%29)

### Ordering

Again, using the [ODATA standard](http://www.odata.org/documentation/odata-version-2-0/uri-conventions/), ordering is done like so:

* Single field sort: [http://resistance-calendar.herokuapp.com/v1/events?$orderby=start_date](https://resistance-calendar.herokuapp.com/v1/events?$orderby=start_date)
* Multi field sort: [http://resistance-calendar.herokuapp.com/v1/events?$orderby=start_date asc](https://resistance-calendar.herokuapp.com/v1/events?$orderby=start_date,title)
* Ascending (the default): [http://resistance-calendar.herokuapp.com/v1/events?$orderby=start_date asc](https://resistance-calendar.herokuapp.com/v1/events?$orderby=start_date%20asc)
* Descending: [http://resistance-calendar.herokuapp.com/v1/events?$orderby=start_date,title desc](https://resistance-calendar.herokuapp.com/v1/events?$orderby=start_date,title%20desc)

### Known limitations

Only the first contains clause is used in the following query and a [PR has been filed](https://github.com/jaystack/odata-v4-mongodb/pull/4) to fix:
 * [https://resistance-calendar.herokuapp.com/v1/events?$filter=contains(title, 'Meetup') or contains(name, 'Meetup') or contains(description, 'Meetup')](https://resistance-calendar.herokuapp.com/v1/events?$filter=contains%28title,%20'Meetup'%29%20or%20contains%28name,%20'Meetup'%29%20or%20contains%28description,%20'Meetup'%29)

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
