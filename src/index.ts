import express from "express"
import bodyParser from "body-parser";
import {ChatGPTAPI} from "chatgpt";
import pTimeout from "p-timeout";
import request from "request"

function unSupportMsg(res: any, ToUserName: any, FromUserName: any, MsgId: any) {
    sendTextMsg(res, ToUserName, FromUserName, '暂不支持的消息类型')
    console.log(MsgId + '-不支持的消息类型')
}

function sendTextMsg(res: any, ToUserName: any, FromUserName: any, Content: any) {
    console.log('FromUserName: ' + FromUserName + ', Response: ' + Content)
    res.send({
        ToUserName: FromUserName,
        FromUserName: ToUserName,
        CreateTime: new Date().getTime(),
        MsgType: 'text',
        Content: Content
    })
}

function getConversation(contactId: any) {
    if (conversationMap.has(contactId)) {
        return conversationMap.get(contactId);
    }
    const conversation = chatGPT.getConversation();
    conversationMap.set(contactId, conversation);
    return conversation;
}

async function getChatGPTReply(MsgId: any, content: any, contactId: any) {
    const currentConversation = getConversation(contactId);
    // send a message and wait for the response
    const threeMinutesMs = 3 * 60 * 1000
    // response is a markdown-formatted string
    return pTimeout(
        currentConversation.sendMessage(content),
        {
            milliseconds: threeMinutesMs,
            message: 'ChatGPT timed out waiting for response'
        }
    );
}

async function replyMessage(MsgId: any, content: any, contactId: any) {
    try {
        return await getChatGPTReply(MsgId, content, contactId)
    } catch (e: any) {
        console.error(e);
        if (e.message.includes('timed out')) {
            return 'Please try again, ChatGPT timed out waiting for response.';
        }
        conversationMap.delete(contactId);
    }
}

function sendmess (appid:any, mess:any) {
    return new Promise((resolve, reject) => {
        request({
            method: 'POST',
            url: `http://api.weixin.qq.com/cgi-bin/message/custom/send?from_appid=${appid}`,
            body: JSON.stringify(mess)
        }, function (error:any, response:any) {
            if (error) {
                console.log('接口返回错误', error)
                reject(error.toString())
            } else {
                console.log('接口返回内容', response.body)
                resolve(response.body)
            }
        })
    })
}

const config = {
    ChatGPTSessionToken: process.env.GPT_TOKEN
}
// Create a new express application instance
const app: express.Application = express();
const conversationMap = new Map();
const chatGPT = new ChatGPTAPI({sessionToken: config.ChatGPTSessionToken === undefined ? '' : config.ChatGPTSessionToken});
// 用 body-parser 库进行数据格式转换
app.use(bodyParser.raw())
app.use(bodyParser.urlencoded({extended: true})) // 是否进行url解码
app.use(bodyParser.json()) // 将数据转换为json格式


app.all('/api/chat', async (req, res) => {
    const {ToUserName, FromUserName, MsgType, MsgId, Content} = req.body
    console.log('收到' + FromUserName + '的消息-' + MsgId + ', 消息类型: ' + MsgType)
    if (MsgType === 'text') {
        console.log('FromUserName: ' + FromUserName + ', MsgId: ' + MsgId + ', Content: ' + Content)
        let resp:any = await replyMessage(MsgId, Content, FromUserName)
        console.log('FromUserName: ' + FromUserName + ', MsgId: ' + MsgId + ', Response: ' + resp)
        const appid = req.headers['x-wx-from-appid'] || ''
        await sendmess(appid, {
            touser: FromUserName,
            msgtype: 'text',
            text: {
                content: resp
            }
        })
        // sendTextMsg(res, ToUserName, FromUserName, resp);
        sendTextMsg(res, ToUserName, FromUserName, "您好，这是 Assistant，一个由 OpenAI 训练的大型语言模型。我为您提供支持和帮助。请问有什么我可以为您做的吗？");
    } else if (MsgType === 'image') {
        unSupportMsg(res, ToUserName, FromUserName, MsgId);
    } else if (MsgType === 'voice') {
        unSupportMsg(res, ToUserName, FromUserName, MsgId);
    } else if (MsgType === 'video') {
        unSupportMsg(res, ToUserName, FromUserName, MsgId);
    } else if (MsgType === 'music') {
        unSupportMsg(res, ToUserName, FromUserName, MsgId);
    } else if (MsgType === 'news') {
        unSupportMsg(res, ToUserName, FromUserName, MsgId);
    } else {
        res.send('success');
    }
})

app.listen(80, () => {
    console.log('ChatGPT listening on port 80!');
});
