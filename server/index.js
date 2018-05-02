'use strict';
const Koa = require('koa');
var Router = require('koa-router');
var mongoose = require('mongoose');
mongoose.connect('mongodb://mongo:27017/myproject');
var log = require('loglevel');
log.setLevel('debug');

const bouncer = require('koa-bouncer');

var passwordSalt  = require('./salt.js');

var md5 = require('md5');

var db = mongoose.connection;

const app = new Koa();
var router = new Router();

app.use(bouncer.middleware());
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
    let ret = await UserInfo.findOne({username:username});
    if(ret){
        return false;
    }
    else{
        return true;
    }
}

router.get('/register', async (ctx, next) => {
    let query = ctx.request.query;
    ctx.request.body = ctx.request.query;
    log.debug('debug register ctx:',query);
    log.debug('debug request body is:',ctx.request.body);
    try{
        ctx.validateBody('username')
            .isString()
            .trim();
        ctx.validateBody('password')
            .isString()
            .trim();

        ctx.validateBody('username')
            .check(await userinfo_check_userexist(query.username), 'Username taken');

        log.debug(ctx.vals);
        let newsuer = new UserInfo({
            username:query.username,
            password:md5(query.password+passwordSalt)
        });
        let ret = await newsuer.save();
        log.debug("save user ret:",ret);
        await next();
        ctx.status = 200;
    }
    catch(e){
        log.error(e);
        ctx.body = e;
        ctx.status = 400;
    }
});

router.get('/', async (ctx, next) => {
    // ctx.router available
    await next();
    ctx.body = 'Hello World carlos';
});

app.listen(3000);
