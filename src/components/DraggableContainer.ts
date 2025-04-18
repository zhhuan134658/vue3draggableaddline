import { computed, defineComponent, h, provide, reactive, toRef } from 'vue';
import {
  PositionStore,
  Position,
  UpdatePosition,
  GetPositionStore,
  MatchedLine,
  SetMatchedLine,
} from './types';
import { IDENTITY } from './utils';

export default defineComponent({
  name: 'DraggableContainer',
  props: {
    showRedLine: {
      type: Boolean,
      default: true,
    },
    allLines: {
      type: Array,
      default: [],
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    adsorbParent: {
      type: Boolean,
      default: true,
    },
    adsorbCols: {
      type: Array,
      default: null,
    },
    adsorbRows: {
      type: Array,
      default: null,
    },
    referenceLineVisible: {
      type: Boolean,
      default: true,
    },
    referenceLineColor: {
      type: String,
      default: '#f00',
    },
  },
  setup(props) {
    const showLine = computed(
      () => props.allLines.length !== 0 && props.showRedLine
    );
    const positionStore = reactive<PositionStore>({}); // 代码位置：[DraggableContainer.ts](./src/components/DraggableContainer.ts#L10-L10)
    const updatePosition: UpdatePosition = (id: string, position: Position) => {
      positionStore[id] = position;
    };
    const getPositionStore: GetPositionStore = (excludeId?: string) => {
      const _positionStore = Object.assign({}, positionStore);
      if (excludeId) {
        delete _positionStore[excludeId];
      }
      return _positionStore;
    };
    const state = reactive<{
      matchedLine: MatchedLine | null;
    }>({
      matchedLine: null,
    });
    const matchedRows = computed(
      () => (state.matchedLine && state.matchedLine.row) || []
    );
    const matchedCols = computed(
      () => (state.matchedLine && state.matchedLine.col) || []
    );
    const setMatchedLine: SetMatchedLine = (
      matchedLine: MatchedLine | null
    ) => {
      state.matchedLine = matchedLine;
    };
    provide('identity', IDENTITY);
    provide('updatePosition', updatePosition);
    provide('getPositionStore', getPositionStore);
    provide('setMatchedLine', setMatchedLine);
    provide('disabled', toRef(props, 'disabled'));
    provide('adsorbParent', toRef(props, 'adsorbParent'));
    provide('adsorbCols', props.adsorbCols || []);
    provide('adsorbRows', props.adsorbRows || []);
    return {
      matchedRows,
      matchedCols,
      showLine,
    };
  },
  methods: {
    renderReferenceLine() {
      if (!this.referenceLineVisible) {
        return [];
      }
      return [
        ...this.matchedCols.map((item) => {
          return h('div', {
            style: {
              width: '0',
              height: '100%',
              top: '0',
              left: item + 'px',
              borderLeft: `1px dashed ${this.referenceLineColor}`,
              position: 'absolute',
            },
          });
        }),
        ...this.matchedRows.map((item) => {
          return h('div', {
            style: {
              width: '100%',
              height: '0',
              left: '0',
              top: item + 'px',
              borderTop: `1px dashed ${this.referenceLineColor}`,
              position: 'absolute',
            },
          });
        }),
      ];
    },
  },
  render() {
    const connectionLine = this.showLine
      ? this.allLines.map((line: any) => {
          return h(
            'svg',
            {
              class: 'connection-line',
              width: '100%',
              height: '100%',
            },
            [
              h('line', {
                x1: line.start.x,
                y1: line.start.y,
                x2: line.end.x,
                y2: line.end.y,
                stroke: 'red',
                strokeWidth: 1,
              }),
            ]
          );
        })
      : '';

    const distanceLabels = this.showLine
      ? this.allLines.map((line: any, index) => {
          if (line.distance == 0) return null;
          return h(
            'div',
            {
              class: 'distance-label',
              style: {
                top: `${line.position.y}px`,
                left: `${line.position.x}px`,
              },
            },
            [line.distance]
          );
        })
      : '';
    return h(
      'div',
      {
        style: { width: '100%', height: '100%', position: 'relative' },
      },
      [
        this.$slots.default && this.$slots.default(),
        ...this.renderReferenceLine(),
        ...connectionLine,
        ...distanceLabels,
      ]
    );
  },
});
