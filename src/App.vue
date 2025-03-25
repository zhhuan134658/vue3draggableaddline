<template>
  <div id="app">
    <div>
      x:{{ x }} <button @click="x += 10">+</button
      ><button @click="x -= 10">-</button>
    </div>
    <div>
      y:{{ y }}<button @click="y += 10">+</button
      ><button @click="y -= 10">-</button>
    </div>
    <div>
      w:{{ w }}<button @click="w += 10">+</button
      ><button @click="w -= 10">-</button>
    </div>
    <div>
      h: {{ h }}<button @click="h += 10">+</button
      ><button @click="h -= 10">-</button>
    </div>
    <div>active:{{ active }}<br /></div>
    <div @click="setStep">100</div>
    <div
      class="parent"
      id="mydiv"
      :style="{
        width: `${totalWidth}px`,
        height: `${totalHeight}px`,
      }"
    >
      <DraggableContainer :allLines="allLines">
        <Vue3DraggableResizable
          v-for="(item, index) in items"
          :initW="40"
          :initH="80"
          v-model:x="item.x"
          v-model:y="item.y"
          v-model:w="item.width"
          v-model:h="item.height"
          :OFFSET="item.OFFSET"
          :THRESHOLD="item.THRESHOLD"
          v-model:active="item.active"
          :draggable="item.draggable"
          :resizable="item.resizable"
          :parent="true"
          :disabledX="false"
          :disabledW="false"
          :disabledH="false"
          :disabledY="false"
          classNameHandle="my-handle"
          @activated="print('activated')"
          @deactivated="print('deactivated')"
          @drag-start="print('drag-start', $event)"
          @resize-start="print('resize-start', $event)"
          @dragging="onDragging(item, $event)"
          @resizing="print('resizing', $event)"
          @drag-end="print('drag-end', $event)"
          @resize-end="print('resize-end', $event)"
        >
          This is a test example111{{ index }}
        </Vue3DraggableResizable>
        <!-- <Vue3DraggableResizable :initW="40" :initH="80" v-model:x="sx" v-model:y="sy" v-model:w="sw"
                    v-model:h="sh" :OFFSET="sOFFSET" v-model:active="sactive" :draggable="sdraggable"
                    :resizable="sresizable" :parent="true" :disabledX="false" :disabledW="false" :disabledH="false"
                    :disabledY="false" classNameHandle="my-handle" @activated="print('activated')"
                    @deactivated="print('deactivated')" @drag-start="print('drag-start', $event)"
                    @resize-start="print('resize-start', $event)" @dragging="print('dragging', $event)"
                    @resizing="print('resizing', $event)" @drag-end="print('drag-end', $event)"
                    @resize-end="print('resize-end', $event)">
                    This is a test example
                </Vue3DraggableResizable> -->
      </DraggableContainer>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import Vue3DraggableResizable from './components/Vue3DraggableResizable';
import DraggableContainer from './components/DraggableContainer';
import { getStartAndEnd } from './components/count';
export default defineComponent({
  components: { DraggableContainer, Vue3DraggableResizable },
  data() {
    return {
      totalWidth: 500,
      totalHeight: 500,
      items: [
        {
          id: 1,
          x: 100,
          y: 100,
          height: 200,
          width: 200,
          active: false,
          draggable: true,
          resizable: true,
          OFFSET: 10, //偏移量
          THRESHOLD: 5, //吸附灵敏度、吸附阈值
        },
        {
          id: 2,
          x: 100,
          y: 100,
          height: 200,
          width: 200,
          active: false,
          draggable: true,
          resizable: true,
          OFFSET: 10, //偏移量
          THRESHOLD: 5, //吸附灵敏度、吸附阈值
        },
      ],

      allLines: [],
      sx: 100,
      sy: 100,
      sh: 100,
      sw: 100,
      active: false,
      sdraggable: true,
      sresizable: true,
      sOFFSET: 20,
    };
  },
  mounted() {},
  methods: {
    print(val, e) {
      // console.log(val, e)
    },
    setStep() {
      this.totalWidth += 100;
      this.totalHeight += 100;
    },
    //拖拽中
    onDragging(currentItem) {
      this.allLines = getStartAndEnd(currentItem, this.items);
    },
  },
});
</script>
<style lang="less" scoped>
.parent {
  // position: absolute;
  // top: 100px;
  // left: 200px;
  position: relative;
  border: 1px solid #000;
  user-select: none;

  ::v-deep {
    .vdr-container {
      border-color: #999;
    }
  }
}
</style>
