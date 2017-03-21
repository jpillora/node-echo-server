:warning: This project is no longer being maintained. It has been rewritten in Go (https://github.com/jpillora/go-echo-server) and supports similar features.

---

# <name>node-echo-server</end>

## Summary

<description>An HTTP which responds with the request in JSON</end>

## Private Usage

```
npm install -g echo-server
```

## Public Usage

* Git clone
* Add heroku remote
* Push

Currently running at http://echo.jpillora.com

## Example

Start server
```
$ echo-server 5000
listening on 5000...
```

Make your requests
```
$ curl http://localhost:5000/foo/bar
{
  "ip": "127.0.0.1",
  "method": "GET",
  "url": "/foo/bar",
  "body": "",
  "headers": {
    "user-agent": "curl/7.21.4 (universal-apple-darwin11.0) libcurl/7.21.4 OpenSSL/0.9.8x zlib/1.2.5",
    "host": "localhost:5000",
    "accept": "*/*"
  },
  "meta": {
    "total": 1,
    "live": 1
  }
}
```

## Simulate delays

Include `/delay/<time in ms>` in the url

## Simulate non-200 status codes

Include `/status/<status code>` in the url

## Meta data

`total` number of requests sent to the server

`live` number of requests currently open on the server

# Stores metrics in MongoDB

Just set your `MONGOLAB_URI` env var and it will start storing `echo` documents

#### MIT License

Copyright &copy; 2013 Jaime Pillora &lt;dev@jpillora.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
