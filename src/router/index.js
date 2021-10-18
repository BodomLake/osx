import Vue from "vue";
import Router from "vue-router";

import DraggableDND from "@/components/experience/Draggable-DND";
import FolderList from "@/components/experience/FolderList";
import DND from "@/components/experience/DND";
import DoubleDND from "@/components/experience/doubleDND";

import Grid from "@/components/experience/Grid";
import Home from "@/components/home/Home";
import Parent from "@/components/experience/model/Parent";
import Stars from "@/components/experience/Stars";
// Nested Drag Grid
import NestedDragGrid from "@/components/ndg/NestedDragGrid";
import MainEnter  from "@/components/ndg/screenlocker/MainEnter";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/",
      redirect: "/mainEnter"
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
      path: "/stars",
      name: "Stars",
      component: Stars,
      meta: {
        keepAlive: true // 需要被缓存
      }
    },
    {
      path: "/mainEnter",
      name: "MainEnter",
      component: MainEnter,
      children: [
        {
          path: "/draggableDND",
          name: "draggableDND",
          component: DraggableDND
        },
        {
          path: "/folderList",
          name: "FolderList",
          component: FolderList
        },
        {
          path: "/dnd",
          name: "DND",
          component: DND
        },
        {
          path: "/doubleDND",
          name: "DoubleDND",
          component: DoubleDND
        },
        {
          path: "/grid",
          name: "Grid",
          component: Grid
        },
        {
          path: "parent",
          name: "Parent",
          component: Parent
        }
      ]
    }
  ]
});
