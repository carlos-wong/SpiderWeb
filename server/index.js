'use strict';
const Koa = require('koa');
var Router = require('koa-router');
var mongoose = require('mongoose');
mongoose.connect('mongodb://mongo:27017/myproject');
var log = require('loglevel');
log.setLevel('debug');

let _ = require('lodash');

const bouncer = require('koa-bouncer');

var passwordSalt  = require('./salt.js');

var md5 = require('md5');

var db = mongoose.connection;

const app = new Koa();
var router = new Router();

app.use(async (ctx, next) => {
    ctx.request.body = ctx.request.query;
    await next();
});

app.use(bouncer.middleware());
app.use(router.routes())
    .use(router.allowedMethods());

var UserInfo = mongoose.model('UserInfo', {
    username:{ type: String,required: true, index: true,unique: true, dropDups: true, sparse: true },
    password:{ type: String,required: true},
    token:{ type: String,},
    tokenValidDate:{type:Date}
});

var TestCase = mongoose.model('TestCase',{
    title:{type:String,request: true,index:true,unique:true,dropDups:true,sparse:true},
    correct:{ type: String,required: true},
    createdDate:{type:Date},
    tags:{type:Array}
});

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('opended mongodb');
});

async function check_token(ctx,token,username,tokenDate){
    let now = new Date();
    let tokenAuthed = await UserInfo.findOne({token:ctx.vals.token,username:ctx.vals.username});
    if (tokenAuthed) {
        let tokenDate = tokenAuthed.tokenValidDate;
        log.debug('tokenDate offset is:',now - tokenDate);
        let offset = _.subtract(now - tokenDate);
        // if(offset > _.multiply(7,_.multiply(_.multiply(_.multiply(1000,60),60),24))){
        if(offset > 100){
            ctx.throw(400, 'it\'s too long after last login' );
        }
        return tokenAuthed;
    }
    else{
        ctx.throw(400, 'token invalid');
    }
};

async function  userinfo_check_userexist(username){
    let ret = await UserInfo.findOne({username:username});
    if(ret){
        return false;
    }
    else{
        return true;
    }
}

router.get('/userinfo',async (ctx,next)=>{
    try{
        ctx.validateBody('token')
            .isString()
            .trim();
        ctx.validateBody('username')
            .isString()
            .trim();
        let tokenAuthed = await check_token(ctx,ctx.vals.token,ctx.vals.uesrname);
        log.debug('debug token authed is:',tokenAuthed);
        await next();
        ctx.status = 200;
    }
    catch(e){
        ctx.throw(e);
        // log.debug(e);
    }
    // ctx.status = 200;
});

router.get('/debug_inser_test_case', async(ctx,next)=>{
    try{
        let newTestCase = new TestCase({
            title:'hi',
            correct:'hello',
            createdDate: new Date(),
            tags:["carlos",'hi']
        });
        let saveRet = await newTestCase.save();
        log.debug('debug save ret is:',saveRet);
        await next();
        ctx.status = 200;
    }
    catch(e){
        // log.debug('debug insert test case catch e:',e);
        try{
            ctx.throw(e);
        }
        catch(e){
            ctx.throw(400, 'debug insert data error');
        }
    }
});

router.get('/login', async (ctx,next)=>{
    let query = ctx.request.query;
    try{
        ctx.validateBody('username')
            .isString()
            .trim();
        ctx.validateBody('password')
            .isString()
            .trim();
        let password = md5(ctx.vals.password+passwordSalt);

        let loginRet = await UserInfo.findOne({username:ctx.vals.username,password:password});
        log.debug('login ret is:',loginRet);
        if (loginRet) {
            ctx.status = 200;
            let time = new Date();
            let token = md5(ctx.vals.username+ctx.vals+password+time);
            loginRet.token = token;
            loginRet.tokenValidDate = time;
            let saveRet = await loginRet.save();
            log.debug('save Ret is:',saveRet);
            ctx.body = {token:token};
            return;
        }
        else{
            ctx.status = 401;
            return;
        }
    }
    catch(e){
        ctx.body = e;
        ctx.status = 400;
    }
});

router.get('/register', async (ctx, next) => {
    let query = ctx.request.query;
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
