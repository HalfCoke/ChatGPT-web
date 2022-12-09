const config = {
  ChatGPTSessionToken: process.env.GPT_TOKEN
}

function getConversation (contactId) {
  if (conversationMap.has(contactId)) {
    return conversationMap.get(contactId);
  }
  const conversation = chatGPT.getConversation();
  conversationMap.set(contactId, conversation);
  return conversation;
}

async function getChatGPTReply (MsgId, content, contactId) {
  const currentConversation = getConversation(contactId);
  console.log('MsgId: ' + MsgId + ' Content: ', content);
  // send a message and wait for the response
  const threeMinutesMs = 3 * 60 * 1000
  const response = await pTimeout(
      currentConversation.sendMessage(content),
      {
        milliseconds: threeMinutesMs,
        message: 'ChatGPT timed out waiting for response'
      }
  )
  console.log('MsgId: ' + MsgId + ' Response: ', response);
  // response is a markdown-formatted string
  return response
}

async function replyMessage (MsgId, content, contactId) {
  try {
    return await getChatGPTReply(MsgId, content, contactId)
  } catch (e) {
    console.error(e);
    if (e.message.includes('timed out')) {
      return 'Please try again, ChatGPT timed out waiting for response.';
    }
    conversationMap.delete(contactId);
  }
}

function buildResponse (FromUserName, ToUserName, content) {
  var xmlContent = '<xml><ToUserName><![CDATA[' + FromUserName + ']]></ToUserName>'
  xmlContent += '<FromUserName><![CDATA[' + ToUserName + ']]></FromUserName>'
  xmlContent += '<CreateTime>' + new Date().getTime() + '</CreateTime>'
  xmlContent += '<MsgType><![CDATA[text]]></MsgType>'
  xmlContent += '<Content><![CDATA[' + content + ']]></Content></xml>'
  return xmlContent
}


const Koa = require('koa');
const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');
const cors = require("koa2-cors");
import { ChatGPTAPI } from 'chatgpt'
import pTimeout from 'p-timeout'

const conversationMap = new Map();
const chatGPT = new ChatGPTAPI({ sessionToken: config.ChatGPTSessionToken });

const app = new Koa();
app.use(bodyParser());
const router = new Router({
  prefix: '/api/chat'
});

// 状态
router.get('/', async ctx => {

  let test = await status(ctx.params.action);
  if (test) {
    ctx.body = { status: 200 }
  } else {
    if (ctx.params.MsgType === "text") {
      var contactId = ctx.params.FromUserName
      var content = ctx.params.Content
      var MsgId = ctx.params.MsgId
      console.log('MsgId: ' + MsgId + ' Talker: ' + contactId)
      ctx.body = replyMessage(MsgId, content, contactId)
    } else {
      ctx.body = buildResponse(ctx.params.FromUserName, ctx.params.ToUserName, "请发送纯文本消息")
    }
  }
});


app.use(cors());
app.use(router.routes());
app.listen(8080);
console.log('[' + new Date() + '] listening on http 8080');

