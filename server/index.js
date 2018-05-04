'use strict';
const Koa = require('koa');
var Router = require('koa-router');
var mongoose = require('mongoose');
var log = require('loglevel');
var cors = require('koa-cors');
var autoIncrement = require('mongoose-auto-increment');
var Schema = mongoose.Schema;

log.setLevel('debug');
mongoose.connect('mongodb://mongo:27017/myproject');
var connection = mongoose.createConnection("mongodb://mongo:27017/myproject");

autoIncrement.initialize(connection);

let _ = require('lodash');
const bouncer = require('koa-bouncer');
var passwordSalt  = require('./salt.js');
const koaBody = require('koa-body');

var md5 = require('md5');

var db = mongoose.connection;

var TestCaseResult = mongoose.model('TestCaseResult',{
    groupid:{type:String,require:true},
    title:{type:String,require:true},
    result:{type:String,require:true},
    resultdate:{type:Date}
});

var TestGroupSchema = new Schema({
    groupid:{ type: String,required: true, index: true,unique: true, dropDups: true, sparse: true },
    grouptitle:{type:String,require:true},
    username:{type:String,require:true},
    state:{type:String,require:true}
});

var TestGroup = connection.model('TestGroup', TestGroupSchema);

TestGroupSchema.plugin(autoIncrement.plugin, {
    model: 'TestGroup',
    field: 'groupid',
    startAt: 1,
    incrementBy: 1
});

var UserInfo = mongoose.model('UserInfo', {
    username:{ type: String,required: true, index: true,unique: true, dropDups: true, sparse: true },
    password:{ type: String,required: true},
    token:{ type: String,},
    tokenValidDate:{type:Date}
});

var TestCaseSchema = new Schema({
    title:{type:String,request: true,index:true,unique:true,dropDups:true,sparse:true},
    correct:{ type: String,required: true},
    createdDate:{type:Date},
    testcaseid:{type:Number,requiree:true},
    tags:[]
});

var TestCase = connection.model('TestCase',TestCaseSchema);

TestCaseSchema.plugin(autoIncrement.plugin, {
    model: 'TestCase',
    field: 'testcaseid',
    startAt: 1,
    incrementBy: 1
});

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('opended mongodb');
});

const app = new Koa();
var router = new Router();
app.use(koaBody());
app.use(cors({
    origin: 'http://localhost:3030',
    credentials:true
}));

app.use(async (ctx, next) => {
    log.debug('method is:',ctx.method,' index:',["GET", "HEAD", "DELETE"].indexOf(ctx.method.toUpperCase()));
    if (["GET", "HEAD", "DELETE"].indexOf(ctx.method.toUpperCase()) >= 0) {
        ctx.request.body = ctx.request.query;
    }
    log.debug('post body is:',ctx.request.body);
    let context = ctx;
    const cookieHeader = context.headers.cookie;
    if (cookieHeader) {
        const cookies = cookieHeader.split(';');
        context.cookie = {};
        cookies.forEach(function (item) {
            const crumbs = item.split('=');
            if (crumbs.length > 1) context.cookie[crumbs[0].trim()] = crumbs[1].trim();
        });
    }
    if (ctx.cookie && ctx.cookie.token) {
        ctx.request.body.token = ctx.cookie.token;
    }
    if (ctx.cookie && ctx.cookie.username) {
        ctx.request.body.username = ctx.cookie.username;
    }
    await next();
});

app.use(bouncer.middleware());
app.use(router.routes())
    .use(router.allowedMethods());

async function check_testcase_exist(ctx,title){
    let testcase = await TestCase.find({title:title});
    log.debug('query test case is:',testcase);
    if(testcase.length > 0){
        return true;
    }
    return false;
}

async function check_token(ctx,token,username,tokenDate){
    let now = new Date();
    let allUserInfo = await UserInfo.find();
    
    
    let tokenAuthed = await UserInfo.findOne({token:ctx.vals.token,username:ctx.vals.username});
    
    if (tokenAuthed) {
        let tokenDate = tokenAuthed.tokenValidDate;
        let offset = _.subtract(now - tokenDate);
        if(offset > _.multiply(7,_.multiply(_.multiply(_.multiply(1000,60),60),24))){
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
        log.debug('uesr info cookie is:',ctx.cookie);
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

router.get('/debug_query_test_case', async(ctx,next)=>{
    try{
        ctx.validateBody('tags')
            .isString()
            .trim();
        let tags = ctx.vals.tags.split(',');
        log.debug('tags is:',tags);
        let debugTestCasesAll = await TestCase.find();
        
        let findTestCases = await TestCase.find({tags:{"$all" :['carlos','hi'] }});
        log.debug('find test cases is:',findTestCases);
        ctx.status = 200;
    }
    catch(e){
        ctx.throw(e);
    }
});

router.get('/gettestgroups',async (ctx,next)=>{
    ctx.validateBody('username')
        .isString()
        .trim();
    ctx.validateBody('token')
        .isString()
        .trim();
    let tokenAuthed = await check_token(ctx,ctx.vals.token,ctx.vals.uesrname);

    await next();
    var debugTestgroupAll = await TestGroup.find();
    ctx.body = debugTestgroupAll;
    ctx.status = 200;
});

router.post('/newtestgroup',async (ctx,next)=>{
    ctx.validateBody('username')
        .isString()
        .trim();
    ctx.validateBody('token')
        .isString()
        .trim();
    ctx.validateBody('grouptitle')
        .isString()
        .trim();

    let tokenAuthed = await check_token(ctx,ctx.vals.token,ctx.vals.uesrname);
    await next();
    var testgroup = new TestGroup();
    testgroup.grouptitle = ctx.vals.grouptitle;
    testgroup.username = ctx.vals.username;
    testgroup.state = 'wip';
    var ret = await testgroup.save();
    ctx.status = 200;
});

router.post('/debugpost',async(ctx,next)=>{
    log.debug('post body is:',ctx.request.body);
    await next();
    ctx.status = 200;
});

router.get('/testcases',async (ctx,next)=>{
    ctx.validateBody('username')
        .isString()
        .trim();
    ctx.validateBody('token')
        .isString()
        .trim();
    let tokenAuthed = await check_token(ctx,ctx.vals.token,ctx.vals.uesrname);
    await next();
    let testcases = await TestCase.find();
    ctx.body = testcases;
    ctx.status = 200;
});

router.post('/addTestCase',async(ctx,next)=>{
    try {
        log.debug('add test case cookie is:',ctx.cookie);
        //     .isString()
        //     .trim();
        ctx.validateBody('username')
            .isString()
            .trim();
        ctx.validateBody('token')
            .isString()
            .trim();
        ctx.validateBody('title')
            .isString()
            .trim();
        ctx.validateBody('correct')
            .isString()
            .trim();
        ctx.validateBody('tags')
            .optional()
            .isString()
            .trim();
        // ctx.vals.token = ctx.cookie.token;
        // ctx.vals.username = ctx.cookie.username;
        // ctx.validateBody('token')
        let tags = [];
        if(ctx.vals.tags){
            tags = ctx.vals.tags.split(',');
        }
        let testcaseExist = await  check_testcase_exist(ctx,ctx.vals.title);
        if(testcaseExist){
            ctx.status = 400;
            ctx.body = "title is exist";
            return;
        }
        let tokenAuthed = await check_token(ctx,ctx.vals.token,ctx.vals.uesrname);
        await next();
        let newTestCase = new TestCase({
            title:ctx.vals.title,
            correct:ctx.vals.correct,
            createdDate: new Date(),
            tags:tags
        });
        let saveRet = await newTestCase.save();
        
        ctx.status = 200;
    } catch (err) {
        log.debug('err is:',err);
        // ctx.throw(err);
        ctx.status = 500;
    } finally {
    }
});

router.get('/debug_inser_test_case', async(ctx,next)=>{
    try{
        let newTestCase = new TestCase({
            title:'hi123',
            correct:'hello',
            createdDate: new Date(),
            tags:["carlos",'hisadfasf']
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
    try{
        log.debug('login cookie is:',ctx.cookie);
        ctx.validateBody('username')
            .isString()
            .trim();
        ctx.validateBody('password')
            .isString()
            .trim();
        let password = md5(ctx.vals.password+passwordSalt);

        let loginRet = await UserInfo.findOne({username:ctx.vals.username,password:password});
        if (loginRet) {
            ctx.status = 200;
            let time = new Date();
            let token = md5(ctx.vals.username+ctx.vals+password+time);
            loginRet.token = token;
            loginRet.tokenValidDate = time;
            let saveRet = await loginRet.save();
            log.debug('save login Ret is:',saveRet);
            ctx.body = {token:token};
            ctx.cookies.set('token', token);
            ctx.cookies.set('username',ctx.vals.username);

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
