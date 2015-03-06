# Meteor Timeout Bug

This repository demonstrates an issue regarding request timeout in Meteor's Webapp package.

## Request Timeouts in Meteor

Internally, Meteor uses Node.js's [http.Server](http://nodejs.org/api/all.html#all_class_http_server) to handle incoming requests.

Timeouts to these requests are handled in two stages:
 - First timeout occurs 5 seconds after the connection has been enstalibhsed, unless the `request` event on http.Server has been triggered
 - The `request` event handler increases the timeout value to 120 seconds for the duration of the request handling, and resets it back to 5 seconds when the `finish` event on the [http.ServerResponse](http://nodejs.org/api/all.html#all_class_http_serverresponse) is triggered

The timeouts are defined as [`SHORT_SOCKET_TIMEOUT` and `LONG_SOCKET_TIMEOUT` variables](https://github.com/meteor/meteor/blob/d4d349ca96b57f4cbf36d84b41bcb3ca5bd70850/packages/webapp/webapp_server.js#L17) in webapp.js:

```
var SHORT_SOCKET_TIMEOUT = 5*1000;
var LONG_SOCKET_TIMEOUT = 120*1000;
```
## The problem

Even by increasing the LONG_SOCKET_TIMEOUT value beyond two minutes connections are closed after 120 seconds.

## Demonstration

This repository contains a vanilla Meteor 1.0.3.2 installation with two server side routes: one returning a response after 10 seconds, and the other after 130 seconds.

In addition this repository overwrites the `webapp` package and [sets the `LONG_SOCKET_TIMEOUT` value to 180 seconds](https://github.com/nnevala/meteor-timeout-bug/blob/master/packages/webapp/webapp_server.js#L18).

This means that both routes **should** return a response. This is what happens instead:

### 10 second timeout:

```
> $ time curl -v localhost:3000/timeout-10sec
*   Trying ::1...
* connect to ::1 port 3000 failed: Connection refused
*   Trying 127.0.0.1...
* Connected to localhost (127.0.0.1) port 3000 (#0)
> GET /timeout-10sec HTTP/1.1
> User-Agent: curl/7.40.0
> Host: localhost:3000
> Accept: */*
>
< HTTP/1.1 200 OK
< vary: Accept-Encoding
< content-type: text/plain
< date: Fri, 06 Mar 2015 15:07:32 GMT
< connection: keep-alive
< transfer-encoding: chunked
<
ping
* Connection #0 to host localhost left intact
curl -v localhost:3000/timeout-10sec  0.00s user 0.00s system 0% cpu 10.012 total
```

After 10 seconds `ping` is returned from the server as expected.

### 130 second timeout:

```
> $ time curl -v localhost:3000/timeout-130sec
*   Trying ::1...
* connect to ::1 port 3000 failed: Connection refused
*   Trying 127.0.0.1...
* Connected to localhost (127.0.0.1) port 3000 (#0)
> GET /timeout-130sec HTTP/1.1
> User-Agent: curl/7.40.0
> Host: localhost:3000
> Accept: */*
>
* Empty reply from server
* Connection #0 to host localhost left intact
curl: (52) Empty reply from server
curl -v localhost:3000/timeout-130sec  0.00s user 0.00s system 0% cpu 2:00.01 total
```

After 2 minutes the connection is killed, even though `LONG_SOCKET_TIMEOUT` value is configured to 3 minutes.
