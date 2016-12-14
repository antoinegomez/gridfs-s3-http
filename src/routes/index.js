'use strict';

import { GridFSService } from '../service';
import koa from 'koa';
import KoaRouter from 'koa-router';
import url from 'url';

const app = new koa();
const router = new KoaRouter();

const GridFSServiceInstance = GridFSService();

app.use(async (ctx, next) => {
  const startTime = new Date().getTime();
  await next();
  const endTime = new Date().getTime();
  console.log(`Request time: ${endTime - startTime}ms`);
});

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error(err.stack);
    ctx.body = err;
  }
});

app.use(async (ctx, next) => {
  if (ctx.req.headers && ctx.req.headers.host) {
    const urlObject = url.parse(['http://', ctx.req.headers.host].join(''));
    const bucket = urlObject.hostname.split('.').shift();
    ctx.bucket = bucket;
  } else {
    ctx.bucket = 'fs';
  }

  await next();
});

router.put('/:key', async (ctx) => {
  const options = {
    filename: ctx.params.key,
    content_type: 'text/plain',
    root: ctx.bucket,
  };

  ctx.body = await GridFSServiceInstance.putObject(`${__dirname}/../../test.txt`, options);
});

router.get('/:key', async (ctx) => {
  const options = {
    filename: ctx.params.key,
    root: ctx.bucket,
  };

  const object = await GridFSServiceInstance.getObject(options);
  ctx.type = object.metadata.contentType;
  ctx.body = object.content;
});

router.delete('/:key', async (ctx) => {
  ctx.body = await GridFSServiceInstance.removeObject({ filename: ctx.params.key });
});

app
.use(router.routes())
.use(router.allowedMethods());

app.listen(3000, () => {
  console.log('listening...');
});
