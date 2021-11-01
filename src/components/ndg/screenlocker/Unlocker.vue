<template>
  <div class="unlock">
    <div class="notice">
      <div class="words">
        {{ msg }}
      </div>
      <div class="inputed-bar">
        <template v-for="index in (1,pwdLen)">
          <div class="pwd-display" :style="{'width': pwdDisplayWidth}" :class="{'shakeAnime' : error}">
            <div class="pwd-circle" :style="{'background-color': inputed[index -1] ? 'white' : 'transparent'}"></div>
          </div>
        </template>
      </div>
    </div>
    <div class="unlock-kb">
      <div class="keyboard">
        <template v-for="num in (1,10)">
          <div class="button-border" @click="kbInput(num)">
            <div class="circle-button" :class="clickedIndex==num ? 'clicked': ''">
              <template v-if="num != 10">
                <div class="number">{{ num }}</div>
                <div class="letter">{{ keys[num] }}</div>
              </template>
              <template v-else>
                <div class="number">0</div>
              </template>
            </div>
          </div>
        </template>
      </div>
    </div>
    <div class="other">

    </div>
  </div>
</template>

<script>
// 数字对应的英文字母
const keys = [
  '', '', 'ABC', 'DEF', 'GHI', 'JKL', 'MNO', 'PQRS', 'TUV', 'WXYZ',
]
export default {
  name: "Unlocker",
  data() {
    return {
      keys: keys,
      // 用户输入的数字
      pwdLen: 6,
      inputed: [],
      correctPwd: [1, 2, 3, 4, 5, 6],
      msg: '请输入密码',
      clickedIndex: 0,
      error: false,
    }
  },
  beforeCreate() {
  },
  computed: {
    pwdDisplayWidth() {
      return 100 / this.pwdLen + '%'
    },
  },
  mounted() {
    window.addEventListener('keydown', this.keyBoard)
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.keyBoard);
  },
  methods: {
    keyBoard($event) {
      let keyCode = $event.key
      console.log($event.key)
      if (!isNaN(keyCode)) {
        this.kbInput(keyCode)
      } else if (keyCode == 'Backspace') {
        this.kbBackSpace()
      } else if (keyCode == 'Escape') {
        this.$emit('quitUnLockMode', this.msg)
      }
    },
    kbInput(num) {
      this.clickedIndex = num;
      setTimeout(() => {
        // 复位
        this.clickedIndex = 0;
      }, 100)
      if (this.inputed.length == this.pwdLen) {
        return;
      }
      if (this.inputed.length < this.pwdLen && !isNaN(num)) {
        this.inputed.push(Number(num));
        if (this.inputed.length == this.pwdLen) {
          this.checkInputedPwd()
        }
      }
    },
    kbBackSpace() {
      if (this.inputed.length > 0) {
        this.inputed.pop();
      }
    },
    checkInputedPwd() {
      let result = this.inputed.length == this.pwdLen;
      for (let i = 0; i < this.inputed.length; i++) {
        // 但凡有一个数字对不上，就是错误密码
        if (this.inputed[i] != this.correctPwd[i]) {
          this.msg = '请重新输入'
          result = false;
          break;
        }
      }
      if (result) {
        this.msg = '输入正确'
        this.$emit('pass', !this.error);
      } else {
        this.error = true;
      }
      setTimeout(() => {
        this.error = false;
        this.inputed = [];
      }, 200)
      return result;
    }
  }
}
</script>

<style scoped>
.unlock {
  width: 100%;
  height: 100%;
}

.unlock-kb {
  position: fixed;
  left: 50%;
  top: 48%;
  transform: translate(-50%, -50%);
  border: 0px solid white;
  height: 50vmin;
  width: 50vmin;
  transition: all 0.5s ease-in-out;
}

.keyboard {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  height: 100%;
  justify-content: center;
}

.button-border {
  min-width: calc(100% / 3);
  max-width: calc(100% / 3);
  width: calc(100% / 3);
  min-height: calc(100% / 3);
  max-height: calc(100% / 3);
  height: calc(100% / 3);
}

.circle-button {
  position: relative;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  height: 80%;
  width: 80%;
  border-radius: 100%;
  border: 3px solid white;
}

.clicked {
  /*动画结束后不使用动画中的任何一个状态*/
  animation: clicked 250ms none ease-in-out;
}

@keyframes clicked {
  0% {
    background-color: rgba(255, 255, 255, 0.1);
  }
  100% {
    background-color: rgba(255, 255, 255, 0.5);
  }
}

.button-border :hover {
  cursor: url("/static/cursor/link.cur"), auto;
}

.circle-button > .number {
  position: relative;
  left: 50%;
  top: 48%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 5vmin;
  font-weight: 600;
  user-select: none;
}

.circle-button > .letter {
  position: relative;
  left: 50%;
  top: 40%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 2vmin;
  font-weight: 400;
  user-select: none;
}

.notice {
  width: 40vmin;
  height: 10vmin;
  position: fixed;
  left: 50%;
  top: 12%;
  transform: translate(-50%, 0%);
  transition: all 0.5s ease-in-out;
}

.words {
  height: 35%;
  width: 100%;
  color: white;
}

.inputed-bar {
  display: flex;
  flex-wrap: nowrap;
  flex-direction: row;
  height: 65%;
  width: 100%;
}

.pwd-display {
  color: white;
}

.pwd-circle {
  position: relative;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  height: 50%;
  width: 50%;
  border-radius: 100%;
  border: 1px solid white;
  transition: all 0.5s ease-in-out;
}

.other {

}
</style>

<style scoped>
@media screen and (orientation: portrait) {
  .unlock-kb {
    height: 45vmax;
    width: 45vmax;
  }

  .circle-button > .number {
    font-size: 4vmax;
  }

  .circle-button > .letter {
    font-size: 2vmax;
  }

  .notice {
    width: 30vmax;
    height: 8vmax;
  }
}

.shakeAnime {
  animation: shakeAnime 250ms both infinite;
}

/* 实现抖动 */
@keyframes shakeAnime {
  0% {
    transform: scale(1) translate(1px, 0);
  }

  25% {
    transform: scale(1) translate(0, 1px);
  }

  50% {
    transform: scale(1) translate(-1px, 0);
  }

  75% {
    transform: scale(1) translate(0, -1px);
  }

  100% {
    transform: scale(1) translate(0, 0);
  }
}

</style>
