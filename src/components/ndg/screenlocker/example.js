import {v4 as uuidv4} from "uuid";

export const neteasemusic = {
  app: 'wangyiyun',
  name: '网易云音乐',
  time: Math.ceil(30 * Math.random()),
  title: '私信箱',
  subTitle: '您收到一条私信...',
  detail: '你好啊，很高兴认识你！',
  id: uuidv4()
}
export const zhifubao = {
  app: 'zhifubao',
  name: '支付宝',
  time: Math.ceil(30 * Math.random()),
  title: '收款',
  subTitle: '您收到一笔收款待查收...',
  detail: '收款50元',
  id: uuidv4()
}
export const eleme = {
  app: 'eliaomo',
  name: '饿了么',
  time: Math.ceil(30 * Math.random()),
  title: '订单状态',
  subTitle: '骑手正在派送中',
  detail: '剩余时间30min',
  id: uuidv4()
}
export const taobao = {
  app: 'taobao',
  name: '淘宝',
  time: Math.ceil(30 * Math.random()),
  title: '提醒',
  subTitle: '你关注的商品减价了',
  detail: '直降30￥',
  id: uuidv4()
}
export const wechat = {
  app: 'we-chat',
  name: '微信',
  time: Math.ceil(30 * Math.random()),
  title: '公众号',
  subTitle: '您订阅的实战精英有新文章发布',
  detail: '猪肉上市公司财报浅析',
  id: uuidv4(),
};
export const dongfangcaifu = {
  app: 'dongfangcaifuwang',
  name: '东方财富',
  time: Math.ceil(30 * Math.random()),
  title: '自选股',
  subTitle: '你关注的正邦集团涨停',
  detail: '',
  id: uuidv4(),
};
export const qqmail = {
  app: 'QQyouxiang',
  name: 'QQ邮箱',
  time: Math.ceil(30 * Math.random()),
  title: '来信提醒',
  subTitle: 'http://github.com/BodomLake/webpack-demo',
  detail: 'vue-draggable',
  id: uuidv4()
}
