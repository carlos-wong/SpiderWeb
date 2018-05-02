const Koa = require('koa');
var Router = require('koa-router');
var mongoose = require('mongoose');
mongoose.connect('mongodb://mongo:27017/myproject');
var db = mongoose.connection;

const app = new Koa();
var router = new Router();

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('opended mongodb');
});

router.get('/', async (ctx, next) => {
    // ctx.router available
    await next();
    ctx.body = 'Hello World carlos';
});

app.use(router.routes())
    .use(router.allowedMethods());

app.listen(3000);
