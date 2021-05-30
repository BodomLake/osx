let desks = [];
let deskNum = 3;
let folderNum = 16;
let appNum = 9;
// top:0,bottom:0,left:0,right:0,x:0,y:0,width:0,height:0
import {
  v4 as uuidv4
} from "uuid";
class Desk {
  constructor(id, name, order) {
    this.order = order;
    this.boxes = [];
    this.name = name;
    this.id = id;
  }
}
class Box {
  constructor(id, name, DOMRect) {
    this.name = name;
    this.id = id;
    this.innerBoxes = [];
    this.DOMRect = DOMRect;
  }
}
class App {
  constructor(id, name) {
    this.name = name;
    this.id = id;
  }
}
export default {
  // 初始化 二维数组
  beforeCreate() {

    for (let i = 0; i < deskNum; i++) {
      // 新建一个桌面
      let desk = new Desk(uuidv4(), '第' + (i + 1) + '个桌面', i + 1);
      // 遍历 该个桌面下的 多个盒子
      for (let j = 0; j < folderNum; j++) {
        // 新建一个盒子
        let box = new Box(uuidv4(), '', {});
        // 再往该盒子内填充App
        for (let k = 0; k < appNum; k++) {
          // 新建一个app，作为填充物
          if (j == 1) break;
          let app = new App(uuidv4(), '');
          box.innerBoxes.push(app);
          if (k == 2 && j == 2) break;
        }
        // 
        desk.boxes.push(box);
      }
      // 填入桌面数组
      desks.push(desk);
      // desk[i].boxes.push(new Box(uuidv4(), '', {}));
    }

    desks[0].boxes[0].innerBoxes[0].name = "edge";
    desks[0].boxes[0].innerBoxes[1].name = "xunlei_nomarl";
    desks[0].boxes[0].innerBoxes[2].name = "Safari";
    desks[0].boxes[0].innerBoxes[3].name = "jiangxi";
    desks[0].boxes[0].innerBoxes[4].name = "zhongguoliantong";
    desks[0].boxes[0].innerBoxes[5].name = "xinlang";
    desks[0].boxes[0].innerBoxes[6].name = "taobao";
    desks[0].boxes[0].innerBoxes[7].name = "app-store";
    desks[0].boxes[0].innerBoxes[8].name = "we-chat";

    desks[0].boxes[1].name = "QQ";

    desks[0].boxes[2].innerBoxes[0].name = "pdd";
    desks[0].boxes[2].innerBoxes[1].name = "51job";
    desks[1].boxes[2].name = "jingdong";
    desks[1].boxes[3].name = "taobao";
  },
  data() {
    return {
      desks,
      deskWidth: (deskNum * 100) + '%',
      folderNum: folderNum,
      appNum: appNum,
    }
  },
  methods: {
    locateCoordinate() {
      Array.from(document.querySelector("." + container).children).forEach(
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
    isNumber(val) {
      if (val == undefined || val == null) {
        return false;
      }
      if (val === 0 || val ==0) {
        return true;
      }
      return !isNaN(val);
    }
  },
}
