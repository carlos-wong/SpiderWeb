'use strict';
const Koa = require('koa');
var Router = require('koa-router');
var mongoose = require('mongoose');
mongoose.connect('mongodb://mongo:27017/myproject');
var log = require('loglevel');
log.setLevel('debug');

var db = mongoose.connection;

const app = new Koa();
var router = new Router();
require('koa-validate')(app);
app.use(require('koa-body')({multipart:true , formidable:{keepExtensions:true}}));

app.use(router.routes())
    .use(router.allowedMethods());

var UserInfo = mongoose.model('UserInfo', {
    username:{ type: String,required: true, index: true,unique: true, dropDups: true, sparse: true },
    password:{ type: String,required: true}
});

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('opended mongodb');
});

async function  userinfo_check_userexist(username){
    return UserInfo.findOne({username:username});
}

router.get('/register', async (ctx, next) => {
    let query = ctx.request.query;
    log.debug('debug register ctx:',query);
    ctx.checkBody('username').notEmpty().len(1, 128,"username 1-128 chars");
    ctx.checkBody('password').notEmpty().len(1, 128,"password is need");

    if (ctx.errors) {
        ctx.status = 400;
        ctx.body = ctx.errors;
        return;
    }
    {
        let userinfo = await userinfo_check_userexist(query.username);
        log.debug('user info is:',userinfo);
        if (userinfo) {
            ctx.body = 'user exist';
            ctx.status = 400;
        }
        else{
            let newsuer = new UserInfo({
                username:query.username,
                password:'123'
            });
            let ret = await newsuer.save();
            log.debug("save user ret:",ret);
            await next();
            ctx.status = 200;
        }
    }
    // ctx.body = 'Hello World carlos';
});

router.get('/', async (ctx, next) => {
    // ctx.router available
    await next();
    ctx.body = 'Hello World carlos';
});

app.listen(3000);
