import express = require('express');
import bodyParser from "body-parser";

function unSupportMsg(res: any, ToUserName: any, FromUserName: any) {
    sendTextMsg(res, ToUserName, FromUserName, '暂不支持的消息类型')
}

function sendTextMsg(res: any, ToUserName: any, FromUserName: any, Content: any) {
    res.send({
        ToUserName: FromUserName,
        FromUserName: ToUserName,
        CreateTime: new Date().getTime(),
        MsgType: 'text',
        Content: Content
    })
}


// Create a new express application instance
const app: express.Application = express();
// 用 body-parser 库进行数据格式转换
app.use(bodyParser.urlencoded({extended: true})) // 是否进行url解码
app.use(bodyParser.json()) // 将数据转换为json格式


app.all('/api/chat', async (req, res) => {
    console.log('消息推送', req.body)
    const {ToUserName, FromUserName, MsgType, Content, CreateTime} = req.body
    if (MsgType === 'text') {
        sendTextMsg(res, ToUserName, FromUserName, '这是回复的消息');
    } else if (MsgType === 'image') {
        unSupportMsg(res, ToUserName, FromUserName);
    } else if (MsgType === 'voice') {
        unSupportMsg(res, ToUserName, FromUserName);
    } else if (MsgType === 'video') {
        unSupportMsg(res, ToUserName, FromUserName);
    } else if (MsgType === 'music') {
        unSupportMsg(res, ToUserName, FromUserName);
    } else if (MsgType === 'news') {
        unSupportMsg(res, ToUserName, FromUserName);
    } else {
        res.send('success');
    }
})

app.listen(8080, () => {
    console.log('ChatGPT listening on port 8080!');
});
