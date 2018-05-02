const Koa = require('koa');
const app = new Koa();
var Router = require('koa-router');
var router = new Router();

router.get('/', async (ctx, next) => {
    // ctx.router available
    await next();
    ctx.body = 'Hello World carlos';
});

app.use(router.routes())
    .use(router.allowedMethods());

app.listen(3000);
