const Koa = require('koa');
var Router = require('koa-router');
var mongoose = require('mongoose');
mongoose.connect('mongodb://mongo:27017/myproject');
var db = mongoose.connection;

const app = new Koa();
var router = new Router();

var UserInfo = mongoose.model('UserInfo', {
    username:{ type: String,required: true, index: true,unique: true, dropDups: true, sparse: true },
    password:{ type: String,required: true}
});

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('opended mongodb');
});

router.get('/register', async (ctx, next) => {
    console.log('debug register ctx:',ctx.request.query);
    await next();
    ctx.status = 200;
    // ctx.body = 'Hello World carlos';
});

router.get('/', async (ctx, next) => {
    // ctx.router available
    await next();
    ctx.body = 'Hello World carlos';
});

app.use(router.routes())
    .use(router.allowedMethods());

app.listen(3000);
