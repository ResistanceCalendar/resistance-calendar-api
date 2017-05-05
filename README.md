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
* https://resistance-calendar.herokuapp.com/v1/events/{:id}
* https://resistance-calendar.herokuapp.com/v1/events?page=0&per_page=25

### Queries

Queries are intended to comply with the [ODATA standard](http://docs.oasis-open.org/odata/odata/v4.0/errata03/os/complete/part2-url-conventions/odata-v4.0-errata03-os-part2-url-conventions-complete.html) and use [odata-v4-mongodb](https://github.com/jaystack/odata-v4-mongodb) to do so which implements much, but not all of the standard. Some examples of common queries are:

#### Start date
Filter by start date (dates in [ISO8601 format](https://en.wikipedia.org/wiki/ISO_8601)):
* [https://resistance-calendar.herokuapp.com/v1/events?$filter=start_date gt '2017-03-01'](https://resistance-calendar.herokuapp.com/v1/events?$filter=start_date%20gt%20'2017-03-01')
* [https://resistance-calendar.herokuapp.com/v1/events?$filter=start_date gt '2017-03-01' and start_date lt '2017-03-02' ](https://resistance-calendar.herokuapp.com/v1/events?$filter=start_date%20gt%20'2017-03-01'%20and%20start_date%20lt%20'2017-03-02')

#### Nested properties
Filter by nested property (postal_code and locality/city):
* [https://resistance-calendar.herokuapp.com/v1/events?$filter=location/postal_code eq '22980'](https://resistance-calendar.herokuapp.com/v1/events?$filter=location/postal_code%20eq%20'22980')
* [https://resistance-calendar.herokuapp.com/v1/events?$filter=contains(location/locality, 'Savannah')](https://resistance-calendar.herokuapp.com/v1/events?$filter=contains%28location/locality,%20'Savannah'%29)

#### Location
Filtering by location is based on coordinates (longitude, latitude), city, or postal code and distance in meters. If coordinates are specified, they are used as they are the preferred method of location based searching since postal_codes are **only supported for US and may be out of date**.
* [http://resistance-calendar.herokuapp.com/v1/events?distance_coords=[-98.435508,29.516496]&distance_max=10000](http://resistance-calendar.herokuapp.com/v1/events?distance_coords=[-98.435508,29.516496]&distance_max=10000)
* [http://resistance-calendar.herokuapp.com/v1/events?distance_postal_code=94110&distance_max=10000](http://resistance-calendar.herokuapp.com/v1/events?distance_postal_code=94110&distance_max=10000)
* [http://resistance-calendar.herokuapp.com/v1/events?distance_city=Albuquerque&distance_max=10000](http://resistance-calendar.herokuapp.com/v1/events?distance_city=Albuquerque&distance_max=10000)

#### Text searching
This can be done via multiple contains functions combined via and / or logical operators and are not case sensitive.
* Require both via and:
 * [https://resistance-calendar.herokuapp.com/v1/events?$filter=contains(name, 'Sessions'%27') and contains(name, 'Fire')](https://resistance-calendar.herokuapp.com/v1/events?$filter=contains%28name,%20%27Sessions%27%29%20and%20contains%28name,%20%27Fire%27%29)
* Require any via or:
 * [https://resistance-calendar.herokuapp.com/v1/events?$filter=contains(name, 'Sessions') or contains(name, 'DeVos')](https://resistance-calendar.herokuapp.com/v1/events?$filter=contains%28name,%20%27Sessions%27%29%20or%20contains%28name,%20%27DeVos%27%29)

### Ordering

Again, using the [ODATA standard](http://www.odata.org/documentation/odata-version-2-0/uri-conventions/), ordering is done like so:

* Single field sort: [http://resistance-calendar.herokuapp.com/v1/events?$orderby=start_date](https://resistance-calendar.herokuapp.com/v1/events?$orderby=start_date)
* Multi field sort: [http://resistance-calendar.herokuapp.com/v1/events?$orderby=start_date asc](https://resistance-calendar.herokuapp.com/v1/events?$orderby=start_date,title)
* Ascending (the default): [http://resistance-calendar.herokuapp.com/v1/events?$orderby=start_date asc](https://resistance-calendar.herokuapp.com/v1/events?$orderby=start_date%20asc)
* Descending: [http://resistance-calendar.herokuapp.com/v1/events?$orderby=start_date,title desc](https://resistance-calendar.herokuapp.com/v1/events?$orderby=start_date,title%20desc)

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
