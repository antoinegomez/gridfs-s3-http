# gridfs-s3-http

* GridFS HTTP frontend compatible with Amazon S3 API *

* Work in progress *

This is a simple frontend HTTP server made to interact with a GridFS backend to store and retrieve files.
It has been designed with Amazon S3 API compatibility in mind but all operations are and won't be supported.

It uses koa v2 with some new ES7 sugar syntax but not to much to allow compatibility from node v4.

Usage as a npm package is not yet supported.

## Supported operations

* PUT Object
* GET Object
* DELETE Object

## Installation

```
$ git clone https://github.com/antoinegomez/gridfs-s3-http
$ cd gridfs-s3-http
$ npm install
```

## Configure

Module used: https://www.npmjs.com/package/config

Create a new file under the config directory.
Leave default.yml untouched. You should create a local.yml or {NODE_ENV}.yml file.
You can of course use any format and not only YAML.

See https://github.com/lorenwest/node-config/wiki/Configuration-Files


## Run

```
$ node build/server
```

## Buckets

In Amazon S3 the bucket comes from the ```Host``` header. It is also used here but we will also include support
to set the bucket via a queryString param and also a header.

Because of the nature of mongodb there is no need of a POST Bucket endpoint but it will be added.


## Sample client

Via s3 package: https://www.npmjs.com/package/s3


```
var s3 = require('s3');

// Client config
var client = s3.createClient({
  maxAsyncS3: 20,
  s3RetryCount: 1,
  s3RetryDelay: 1000,
  multipartUploadThreshold: 20971520,
  multipartUploadSize: 15728640,
  s3Options: {
    // Authentication not yet supported so you can put anything here
    accessKeyId: 'XXXXXX',
    secretAccessKey: 'YYYYYYYY',
    endpoint: 'http://localhost:3000',
    sslEnabled: false,
  },
});

// Upload a local file
var params = {
  localFile: 'myfile.jpg',
  s3Params: {
    ContentType: 'image/jpeg',
    Bucket: "images",
    Key: "myfile.jpg",
  },
};

var downloader = client.uploadFile(params);
downloader.on('error', function(err) {
  console.error("unable to download:", err.stack);
});
downloader.on('progress', function() {
  console.log("progress", downloader.progressAmount, downloader.progressTotal);
});
downloader.on('end', function() {
  console.log("done downloading");
});


// Download the uplaoded file
var params = {
  localFile: 'myfile.downloaded.jpg',
  s3Params: {
    Bucket: "images",
    Key: "myfile.jpg",
  },
};

var downloader = client.downloadFile(params);

downloader.on('error', function(err) {
  console.error("unable to download:", err.stack);
});

downloader.on('progress', function() {
  console.log("progress", downloader.progressAmount, downloader.progressTotal);
});

downloader.on('end', function(result) {
  console.log("done downloading");
});
```
