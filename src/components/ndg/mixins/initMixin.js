let desks = [];
let deskNum = 2;
let folderNum = 16;
let appNum = 16;
// top:0,bottom:0,left:0,right:0,x:0,y:0,width:0,height:0

import {
  BACKGROUND,
  CONTAINER,
  GROUPAPPLIMIT,
} from "../common.js";
class Desk {
  constructor(id, name, order) {
    this.order = order;
    this.boxes = [];
    this.name = name;
    this.id = id;
  }
}
class Box {
  constructor(id, name, groupAppLimit) {
    this.id = id;
    this.name = name;
    this.apps = [];
    // 小窗口/模态窗口 显示的组号 默认第一组
    this.displayNo = 0;
    this.groupAppLimit = GROUPAPPLIMIT;
  }
}
class App {
  constructor(id, name) {
    this.name = name;
    this.id = id;
  }
}
import {
  stringify,
  v4 as uuidv4
} from "uuid";
export default {
  // 初始化 二维数组
  beforeCreate() {
    for (let i = 0; i < deskNum; i++) {
      // 新建一个桌面
      let desk = new Desk(uuidv4(), "第" + (i + 1) + "个桌面", i + 1);
      // 遍历 该个桌面下的 多个盒子
      for (let j = 0; j < folderNum; j++) {
        // 新建一个盒子
        let box = new Box(uuidv4(), "第" + (j + 1) + "个盒子");
        // 再往该盒子内填充App
        for (let k = 0; k < appNum; k++) {
          // 新建一个app，作为填充物
          // if (j == 1 || j == 3 || j == 4) continue;
          let app = new App(uuidv4(), "");
          box.apps.push(app);
          if (k == 0 && j == 1) break;
          if (k == 0 && j == 2) break;
          if (k == 0 && j == 4) break;
        }
        //
        desk.boxes.push(box);
      }
      // 填入桌面数组
      desks.push(desk);
      // desk[i].boxes.push(new Box(uuidv4(), '', {}));
    }

    desks[0].boxes[0].apps[0].name = "edge";
    desks[0].boxes[0].apps[1].name = "xunlei_nomarl";
    desks[0].boxes[0].apps[2].name = "Safari";
    desks[0].boxes[0].apps[3].name = "jiangxi";
    desks[0].boxes[0].apps[4].name = "zhongguoliantong";
    desks[0].boxes[0].apps[5].name = "xinlang";
    desks[0].boxes[0].apps[6].name = "taobao";
    desks[0].boxes[0].apps[7].name = "app-store";
    desks[0].boxes[0].apps[8].name = "we-chat";
    desks[0].boxes[0].apps[9].name = "meituan";
    desks[0].boxes[0].apps[10].name = "wangyiyun";

    desks[0].boxes[0].apps[11].name = "sougoup"
    desks[0].boxes[0].apps[12].name = "wangyiyun"
    desks[0].boxes[0].apps[13].name = "douyin"
    desks[0].boxes[0].apps[14].name = "shezhi"
    desks[0].boxes[0].apps[15].name = "tianmao"

    //
    desks[0].boxes[1].apps[0].name = "QQ";
    desks[0].boxes[2].apps[0].name = "chrome";
    desks[0].boxes[4].apps[0].name = "amap";

    desks[0].boxes[3].apps[0].name = "pdd";
    desks[0].boxes[3].apps[1].name = "51job";

    desks[1].boxes[0].apps[0].name = "jingdong";
    desks[1].boxes[0].apps[1].name = "xueqiu";
    desks[1].boxes[0].apps[2].name = "git1";
  },
  data() {
    return {
      desks,
      // deskWidth: (deskNum * 100) + '%',
      folderNum: folderNum,
      appNum: appNum,
      currentDeskNum: 0,
      groupAppLimit: GROUPAPPLIMIT
    };
  },
  model: {
    value: 'desks',
    event: 'changeDesk'
  },
  computed: {
    // 计算桌面总宽度
    deskWidth() {
      return deskNum * 100 + "%";
    },
    deskShiftOffset() {
      return 100 / deskNum;
    },
  },
  watch: {},
  methods: {
    locateCoordinate() {
      Array.from(document.querySelector("." + CONTAINER).children).forEach(
        (outer, oi) => {
          if (outer.className.indexOf("ndg-outer") != -1) {
            this.box[oi].DOMRect = outer.getBoundingClientRect();
          }
          // console.log(outer.children);
          Array.from(outer.children).forEach((inner, ii) => {
            if (inner.className.indexOf("ndg-inner") != -1) {
              this.box[oi].innerBox[ii].DOMRect = inner.getBoundingClientRect();
              // console.log(inner.getBoundingClientRect());
            }
          });
        }
      );
    },
    switchUnit(orientation) {
      // 切换桌面
      let transform = () => {
        document.querySelector(
          "div." + BACKGROUND
        ).style.transform = `translateX(-${this.deskShiftOffset * this.currentDeskNum}%)`;
      };
      switch (orientation) {
        case "right":
          if (this.currentDeskNum + 1 < this.desks.length) {
            this.currentDeskNum++;
            transform();
          }
          break;
        case "left":
          transform();
          if (this.currentDeskNum > 0) {
            this.currentDeskNum--;
            transform();
          }
          break;
        default:
          console.log("wtf");
      }
    }
  }
};
