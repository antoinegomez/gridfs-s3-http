'use strict';

import config from 'config';
import { GridFSService } from '../service';
import koa from 'koa';
import KoaRouter from 'koa-router';
import url from 'url';
import stream from 'stream';
import koaBunyanLogger from 'koa-bunyan-logger';

const port = config.server.port || process.env.PORT || 3000;
const app = new koa();
const router = new KoaRouter();

const GridFSServiceInstance = GridFSService();

app.use(koaBunyanLogger());
app.use(koaBunyanLogger.requestIdContext());
app.use(koaBunyanLogger.requestLogger());

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    if (err.status) {
      ctx.status = err.status;
    }
    ctx.body = err;
  }
});

app.use(async (ctx, next) => {
  if (ctx.req.headers && ctx.req.headers.host) {
    const urlObject = url.parse(['http://', ctx.req.headers.host].join(''));
    const bucket = urlObject.hostname.split('.').shift();
    ctx.bucket = bucket;
  } else {
    ctx.bucket = config.gridfs.default_root_fs;
  }

  await next();
});

router.put('/:key', async (ctx) => {
  const options = {
    filename: ctx.params.key,
    content_type: ctx.request.headers['content-type'],
    root: ctx.bucket,
  };

  const getRawBody = require('raw-body')
  const string = await getRawBody(ctx.req, {
    length: ctx.length,
    limit: '10mb',
    encoding: ctx.charset
  });

  const input = new stream.Readable();
  input.push(string);
  input.push(null);

  const content = await GridFSServiceInstance.putObject(input, options);
  ctx.set('ETag', content.md5);
  ctx.body = '';
});

router.get('/:key', async (ctx) => {
  const options = {
    filename: ctx.params.key,
    root: ctx.bucket,
  };

  const object = await GridFSServiceInstance.getObject(options);
  ctx.set('ETag', object.metadata.md5);
  ctx.set('Content-Length', object.metadata.length);
  ctx.type = object.metadata.contentType;
  ctx.body = object.content;
});

router.delete('/:key', async (ctx) => {
  ctx.body = await GridFSServiceInstance.removeObject({ filename: ctx.params.key });
});

app
.use(router.routes())
.use(router.allowedMethods());

app.listen(port, () => {
  console.log('listening...');
});
