import Vue from 'vue'
import Router from 'vue-router'
import DraggableDND from "@/components/Draggable-DND";
import FolderList from "@/components/FolderList";
import DND from "@/components/DND";
import DoubleDND from "@/components/doubleDND";
import Grid from "@/components/grid/Grid";
import Home from "@/components/home/Home";
import Parent from "@/components/model/Parent";
import Stars from "@/components/Stars";
// Nested Drag Grid
import NestedDragGrid from "@/components/ndg/NestedDragGrid"

Vue.use(Router)

export default new Router({
  routes: [{
      path: '/',
      redirect: '/home'
    },
    {
      path: "/nestedDragGrid",
      name: "NestedDragGrid",
      component: NestedDragGrid,
      meta: {
        keepAlive: true // 需要被缓存
      }
    },
    {
      path: "/home",
      name: "Home",
      component: Home,
      children: [{
          path: "draggableDND",
          name: "draggableDND",
          component: DraggableDND
        },
        {
          path: "folderList",
          name: "FolderList",
          component: FolderList
        },
        {
          path: "dnd",
          name: "DND",
          component: DND
        },
        {
          path: "doubleDND",
          name: "DoubleDND",
          component: DoubleDND
        },
        {
          path: "grid",
          name: "Grid",
          component: Grid
        },
        {
          path: "parent",
          name: "Parent",
          component: Parent
        },
        {
          path: "stars",
          name: "Stars",
          component: Stars
        },

      ]
    },

  ]
});
