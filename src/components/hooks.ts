import { onMounted, onUnmounted, ref, watch, Ref, computed } from 'vue';
import {
  getElSize,
  filterHandles,
  getId,
  getReferenceLineMap,
  addEvent,
  removeEvent,
} from './utils';
import {
  ContainerProvider,
  MatchedLine,
  ReferenceLineMap,
  ResizingHandle,
} from './types';

type HandleEvent = MouseEvent | TouchEvent;

export function useState<T>(initialState: T): [Ref<T>, (value: T) => T] {
  const state = ref(initialState) as Ref<T>;
  const setState = (value: T): T => {
    state.value = value;
    return value;
  };
  return [state, setState];
}

export function initState(props: any, emit: any) {
  const [width, setWidth] = useState<number>(props.w);
  const [height, setHeight] = useState<number>(props.h);
  const [left, setLeft] = useState<number>(props.x);
  const [top, setTop] = useState<number>(props.y);
  const [enable, setEnable] = useState<boolean>(props.active);
  const [dragging, setDragging] = useState<boolean>(false);
  const [resizing, setResizing] = useState<boolean>(false);
  const [resizingHandle, setResizingHandle] = useState<ResizingHandle>('');
  const [resizingMaxWidth, setResizingMaxWidth] = useState<number>(Infinity);
  const [resizingMaxHeight, setResizingMaxHeight] = useState<number>(Infinity);
  const [resizingMinWidth, setResizingMinWidth] = useState<number>(props.minW);
  const [resizingMinHeight, setResizingMinHeight] = useState<number>(
    props.minH
  );

  const aspectRatio = computed(() => height.value / width.value);

  watch(
    width,
    (newVal) => {
      emit('update:w', newVal);
    },
    { immediate: true }
  );
  watch(
    height,
    (newVal) => {
      emit('update:h', newVal);
    },
    { immediate: true }
  );
  watch(top, (newVal) => {
    emit('update:y', newVal);
  });
  watch(left, (newVal) => {
    emit('update:x', newVal);
  });
  watch(enable, (newVal, oldVal) => {
    emit('update:active', newVal);
    if (!oldVal && newVal) {
      emit('activated');
    } else if (oldVal && !newVal) {
      emit('deactivated');
    }
  });
  watch(
    () => props.active,
    (newVal: boolean) => {
      setEnable(newVal);
    }
  );
  return {
    id: getId(),
    width,
    height,
    top,
    left,
    enable,
    dragging,
    resizing,
    resizingHandle,
    resizingMaxHeight,
    resizingMaxWidth,
    resizingMinWidth,
    resizingMinHeight,
    aspectRatio,
    setEnable,
    setDragging,
    setResizing,
    setResizingHandle,
    setResizingMaxHeight,
    setResizingMaxWidth,
    setResizingMinWidth,
    setResizingMinHeight,
    setWidth: (val: number) => setWidth(Math.floor(val)),
    setHeight: (val: number) => setHeight(Math.floor(val)),
    setTop: (val: number) => setTop(Math.floor(val)),
    setLeft: (val: number) => setLeft(Math.floor(val)),
  };
}
// 防抖函数
function debounce(func: Function, delay: number) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return function(...args: any[]) {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      func(...args);
    }, delay);
  };
}
export function initParent(containerRef: Ref<HTMLElement | undefined>) {
  const parentWidth = ref(0);
  const parentHeight = ref(0);
  onMounted(() => {
    if (containerRef.value && containerRef.value.parentElement) {
      const { width, height } = getElSize(containerRef.value.parentElement);
      parentWidth.value = width;
      parentHeight.value = height;
    }
    // const myDiv = document.getElementById('mydiv');
    const myDiv = containerRef.value?.parentElement;
    if (myDiv) {
      if (typeof window !== 'undefined') {
        const resizeObserver = new ResizeObserver(
          debounce((entries: any) => {
            for (const entry of entries) {
              const { width, height } = entry.contentRect;
              parentWidth.value = width;
              parentHeight.value = height;
            }
          }, 300) // 防抖延迟 300ms，可以根据需要调整
        );
        resizeObserver.observe(myDiv);
      }
    }
  });

  return {
    parentWidth,
    parentHeight,
  };
}

export function initLimitSizeAndMethods(
  props: any,
  parentSize: ReturnType<typeof initParent>,
  containerProps: ReturnType<typeof initState>
) {
  const {
    width,
    height,
    left,
    top,
    resizingMaxWidth,
    resizingMaxHeight,
    resizingMinWidth,
    resizingMinHeight,
  } = containerProps;
  const { setWidth, setHeight, setTop, setLeft } = containerProps;
  const { parentWidth, parentHeight } = parentSize;
  const limitProps = {
    minWidth: computed(() => {
      return resizingMinWidth.value;
    }),
    minHeight: computed(() => {
      return resizingMinHeight.value;
    }),
    maxWidth: computed(() => {
      let max = Infinity;
      if (props.parent) {
        max = Math.min(parentWidth.value, resizingMaxWidth.value);
      }
      return max;
    }),
    maxHeight: computed(() => {
      let max = Infinity;
      if (props.parent) {
        max = Math.min(parentHeight.value, resizingMaxHeight.value);
      }
      return max;
    }),
    minLeft: computed(() => {
      return props.parent ? 0 : -Infinity;
    }),
    minTop: computed(() => {
      return props.parent ? 0 : -Infinity;
    }),
    maxLeft: computed(() => {
      return props.parent ? parentWidth.value - width.value : Infinity;
    }),
    maxTop: computed(() => {
      return props.parent ? parentHeight.value - height.value : Infinity;
    }),
    // 新增 maxX 属性
    maxX: computed(() => {
      return props.parent ? parentWidth.value - width.value : Infinity;
    }),
  };
  const limitMethods = {
    setWidth(val: number) {
      if (props.disabledW) {
        return width.value;
      }
      return setWidth(
        Math.min(
          limitProps.maxWidth.value,
          Math.max(limitProps.minWidth.value, val)
        )
      );
    },
    setHeight(val: number) {
      if (props.disabledH) {
        return height.value;
      }
      return setHeight(
        Math.min(
          limitProps.maxHeight.value,
          Math.max(limitProps.minHeight.value, val)
        )
      );
    },
    setTop(val: number) {
      if (props.disabledY) {
        return top.value;
      }
      return setTop(
        Math.min(
          limitProps.maxTop.value,
          Math.max(limitProps.minTop.value, val)
        )
      );
    },
    setLeft(val: number) {
      if (props.disabledX) {
        return left.value;
      }
      return setLeft(
        Math.min(
          limitProps.maxLeft.value,
          Math.max(limitProps.minLeft.value, val)
        )
      );
    },
    setstepNum(val: number) {
      return props.OFFSET
        ? (props.OFFSET * props.SCALE) / 100
        : (val * props.SCALE) / 100;
    },
    setScale(val: number) {
      return props.SCALE ? props.SCALE / 100 : val / 100;
    },
    setBorderwidth(val: number) {
      return props.BORDER_WIDTH ? props.BORDER_WIDTH : val;
    },
  };
  return {
    ...limitProps,
    ...limitMethods,
  };
}

const DOWN_HANDLES: (keyof HTMLElementEventMap)[] = ['mousedown', 'touchstart'];
const UP_HANDLES: (keyof HTMLElementEventMap)[] = ['mouseup', 'touchend'];
const MOVE_HANDLES: (keyof HTMLElementEventMap)[] = ['mousemove', 'touchmove'];

function getPosition(e: HandleEvent) {
  if ('touches' in e) {
    return [e.touches[0].pageX, e.touches[0].pageY];
  } else {
    return [e.pageX, e.pageY];
  }
}
const BORDER_WIDTH = 0; // 定义边框宽度
export function initDraggableContainer(
  containerRef: Ref<HTMLElement | undefined>,
  containerProps: ReturnType<typeof initState>,
  limitProps: ReturnType<typeof initLimitSizeAndMethods>,
  draggable: Ref<boolean>,
  emit: any,
  containerProvider: ContainerProvider | null,
  parentSize: ReturnType<typeof initParent>,
  OFFSET: any,
  SCALE: any,
  BORDER_WIDTH: any
) {
  const { left: x, top: y, width: w, height: h, dragging, id } = containerProps;
  const {
    setDragging,
    setEnable,
    setResizing,
    setResizingHandle,
  } = containerProps;
  const { setTop, setLeft, setstepNum, setScale, setBorderwidth } = limitProps;
  let lstX = 0;
  let lstY = 0;
  let lstPageX = 0;
  let lstPageY = 0;
  let referenceLineMap: ReferenceLineMap | null = null;
  const documentElement = document.documentElement;

  const _unselect = (e: HandleEvent) => {
    const target = e.target;
    if (!containerRef.value?.contains(<Node>target)) {
      //   setEnable(false);
      setDragging(false);
      setResizing(false);
      setResizingHandle('');
    }
  };

  const handleUp = () => {
    setDragging(false);
    removeEvent(documentElement, UP_HANDLES, handleUp);
    removeEvent(documentElement, MOVE_HANDLES, handleDrag);
    referenceLineMap = null;
    if (containerProvider) {
      containerProvider.updatePosition(id, {
        x: x.value,
        y: y.value,
        w: w.value,
        h: h.value,
      });
      containerProvider.setMatchedLine(null);
    }
  };

  const handleDrag = (e: MouseEvent) => {
    e.preventDefault();
    if (!(dragging.value && containerRef.value)) return;
    const [pageX, pageY] = getPosition(e);
    const deltaX = pageX - lstPageX;
    const deltaY = pageY - lstPageY;

    // 计算偏移量的倍数
    const multipleX = Math.round(deltaX / setstepNum(OFFSET));
    const multipleY = Math.round(deltaY / setstepNum(OFFSET));

    // 计算新的位置
    let newLeft = lstX + (multipleX * setstepNum(OFFSET)) / setScale(SCALE);
    let newTop = lstY + (multipleY * setstepNum(OFFSET)) / setScale(SCALE);

    if (referenceLineMap !== null) {
      const widgetSelfLine = {
        col: [newLeft, newLeft + w.value / 2, newLeft + w.value],
        row: [newTop, newTop + h.value / 2, newTop + h.value],
      };
      const matchedLine: unknown = {
        row: widgetSelfLine.row
          .map((i, index) => {
            let match = null;
            Object.values(referenceLineMap!.row).forEach((referItem) => {
              if (i >= referItem.min && i <= referItem.max) {
                match = referItem.value;
              }
            });
            if (match !== null) {
              if (index === 0) {
                newTop = match;
              } else if (index === 1) {
                newTop = Math.floor(match - h.value / 2);
              } else if (index === 2) {
                newTop = Math.floor(match - h.value);
              }
            }
            return match;
          })
          .filter((i) => i !== null),
        col: widgetSelfLine.col
          .map((i, index) => {
            let match = null;
            Object.values(referenceLineMap!.col).forEach((referItem) => {
              if (i >= referItem.min && i <= referItem.max) {
                match = referItem.value;
              }
            });
            if (match !== null) {
              if (index === 0) {
                newLeft = match;
              } else if (index === 1) {
                newLeft = Math.floor(match - w.value / 2);
              } else if (index === 2) {
                newLeft = Math.floor(match - w.value);
              }
            }
            return match;
          })
          .filter((i) => i !== null),
      };
      containerProvider!.setMatchedLine(matchedLine as MatchedLine);
    }
    emit('dragging', { x: setLeft(newLeft), y: setTop(newTop) });
  };

  const handleDown = (e: HandleEvent) => {
    if (!draggable.value) return;
    const el = containerRef.value;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const { clientX, clientY } = e as MouseEvent;

    // 判断鼠标点击位置是否在边框上

    const newBorder = setBorderwidth(BORDER_WIDTH);
    const isOnBorder =
      (clientX >= rect.left && clientX <= rect.left + newBorder) ||
      (clientX >= rect.right - newBorder && clientX <= rect.right) ||
      (clientY >= rect.top && clientY <= rect.top + newBorder) ||
      (clientY >= rect.bottom - newBorder && clientY <= rect.bottom) ||
      newBorder == 0;
    // console.log('isOnBorder', isOnBorder);

    if (isOnBorder) {
      setDragging(true);
      lstX = x.value;
      lstY = y.value;
      lstPageX = getPosition(e)[0];
      lstPageY = getPosition(e)[1];
      addEvent(documentElement, MOVE_HANDLES, handleDrag);
      addEvent(documentElement, UP_HANDLES, handleUp);
      if (containerProvider && !containerProvider.disabled.value) {
        referenceLineMap = getReferenceLineMap(
          containerProvider,
          parentSize,
          id
        );
      }
    }
  };

  watch(dragging, (cur, pre) => {
    if (!pre && cur) {
      emit('drag-start', { x: x.value, y: y.value });
      setEnable(true);
      setDragging(true);
    } else {
      emit('drag-end', { x: x.value, y: y.value });
      setDragging(false);
    }
  });

  onMounted(() => {
    const el = containerRef.value;
    if (!el) return;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    addEvent(documentElement, DOWN_HANDLES, _unselect);
    addEvent(el, DOWN_HANDLES, handleDown);
  });

  onUnmounted(() => {
    if (!containerRef.value) return;
    removeEvent(documentElement, DOWN_HANDLES, _unselect);
    removeEvent(documentElement, UP_HANDLES, handleUp);
    removeEvent(documentElement, MOVE_HANDLES, handleDrag);
  });

  return { containerRef };
}

export function initResizeHandle(
  containerProps: ReturnType<typeof initState>,
  limitProps: ReturnType<typeof initLimitSizeAndMethods>,
  parentSize: ReturnType<typeof initParent>,
  props: any,
  emit: any,
  containerProvider: any // 新增参数，用于设置匹配线
) {
  const { id } = containerProps;

  const { setWidth, setHeight, setLeft, setTop, setScale } = limitProps;
  const { width, height, left, top, aspectRatio } = containerProps;
  const {
    setResizing,
    setResizingHandle,
    setResizingMaxWidth,
    setResizingMaxHeight,
    setResizingMinWidth,
    setResizingMinHeight,
  } = containerProps;
  const { parentWidth, parentHeight } = parentSize;
  let lstW = 0;
  let lstH = 0;
  let lstX = 0;
  let lstY = 0;
  let lstPageX = 0;
  let lstPageY = 0;
  let tmpAspectRatio = 1;
  let idx0 = '';
  let idx1 = '';
  const documentElement = document.documentElement;

  const resizeHandleDrag = (e: HandleEvent) => {
    e.preventDefault();
    let [_pageX, _pageY] = getPosition(e);
    let deltaX = _pageX - lstPageX;
    let deltaY = _pageY - lstPageY;
    let _deltaX = deltaX;
    let _deltaY = deltaY;
    if (props.lockAspectRatio) {
      deltaX = Math.abs(deltaX);
      deltaY = deltaX * tmpAspectRatio;

      if (idx0 === 't') {
        if (_deltaX < 0 || (idx1 === 'm' && _deltaY < 0)) {
          deltaX = -deltaX;
          deltaY = -deltaY;
        }
      } else {
        if (_deltaX < 0 || (idx1 === 'm' && _deltaY < 0)) {
          deltaX = -deltaX;
          deltaY = -deltaY;
        }
      }
    }
    // ---------------
    // 计算偏移量的倍数
    const multipleX = Math.round(deltaX / props.OFFSET);
    const multipleY = Math.round(deltaY / props.OFFSET);

    // 计算新的宽度和高度变化量
    let newDeltaX = (multipleX * props.OFFSET) / setScale(props.SCALE);
    let newDeltaY = (multipleY * props.OFFSET) / setScale(props.SCALE);
    // 处理不同句柄位置的拖动逻辑
    switch (`${idx0}${idx1}`) {
      case 'tl': // 左上角
        setWidth(lstW - newDeltaX);
        setLeft(lstX - (width.value - lstW));
        setHeight(lstH - newDeltaY);
        setTop(lstY - (height.value - lstH));
        break;
      case 'tm': // 顶部中间
        newDeltaX = 0;
        setHeight(lstH - newDeltaY);
        setTop(lstY - (height.value - lstH));
        break;
      case 'tr': // 右上角
        setWidth(lstW + newDeltaX);
        setHeight(lstH - newDeltaY);
        setTop(lstY - (height.value - lstH));
        break;
      case 'ml': // 左侧中间
        newDeltaY = 0;
        setWidth(lstW - newDeltaX);
        setLeft(lstX - (width.value - lstW));
        break;
      case 'mr': // 右侧中间
        newDeltaY = 0;
        setWidth(lstW + newDeltaX);
        break;
      case 'bl': // 左下角
        setWidth(lstW - newDeltaX);
        setLeft(lstX - (width.value - lstW));
        setHeight(lstH + newDeltaY);
        break;
      case 'bm': // 底部中间
        newDeltaX = 0;
        setHeight(lstH + newDeltaY);
        break;
      case 'br': // 右下角
        setWidth(lstW + newDeltaX);
        setHeight(lstH + newDeltaY);
        break;
    }

    // ----------------
    // if (idx0 === 't') {
    //   setHeight(lstH - deltaY);
    //   setTop(lstY - (height.value - lstH));
    // } else if (idx0 === 'b') {
    //   setHeight(lstH + deltaY);
    // }
    // if (idx1 === 'l') {
    //   setWidth(lstW - deltaX);
    //   setLeft(lstX - (width.value - lstW));
    // } else if (idx1 === 'r') {
    //   setWidth(lstW + deltaX);
    // }
    //------------------
    emit('resizing', {
      x: left.value,
      y: top.value,
      w: width.value,
      h: height.value,
    });
    const newreferenceLineMap = getReferenceLineMap(
      containerProvider,
      parentSize,
      id
    );
    // console.log('props', props);

    // 新增：吸附检测逻辑
    const THRESHOLD = props.THRESHOLD; // 吸附阈值
    const positionStore = containerProvider.getPositionStore(id);
    const currentLeft = left.value;
    const currentTop = top.value;
    const currentRight = left.value + width.value;
    const currentBottom = top.value + height.value;

    Object.values(positionStore).forEach((pos: any) => {
      const otherLeft = pos.x;
      const otherTop = pos.y;
      const otherRight = pos.x + pos.w;
      const otherBottom = pos.y + pos.h;

      // 左侧吸附
      if (Math.abs(currentLeft - otherLeft) <= THRESHOLD) {
        setLeft(otherLeft);
      } else if (Math.abs(currentLeft - otherRight) <= THRESHOLD) {
        setLeft(otherRight);
      }

      // 右侧吸附
      if (Math.abs(currentRight - otherLeft) <= THRESHOLD) {
        setWidth(otherLeft - left.value);
      } else if (Math.abs(currentRight - otherRight) <= THRESHOLD) {
        setWidth(otherRight - left.value);
      }

      // 顶部吸附
      if (Math.abs(currentTop - otherTop) <= THRESHOLD) {
        setTop(otherTop);
      } else if (Math.abs(currentTop - otherBottom) <= THRESHOLD) {
        setTop(otherBottom);
      }

      // 底部吸附
      if (Math.abs(currentBottom - otherTop) <= THRESHOLD) {
        setHeight(otherTop - top.value);
      } else if (Math.abs(currentBottom - otherBottom) <= THRESHOLD) {
        setHeight(otherBottom - top.value);
      }
    });
    // 新增：计算和设置对齐辅助线
    if (containerProvider && newreferenceLineMap) {
      //   console.log('1111');

      const widgetSelfLine = {
        col: [
          left.value,
          left.value + width.value / 2,
          left.value + width.value,
        ],
        row: [
          top.value,
          top.value + height.value / 2,
          top.value + height.value,
        ],
      };
      const matchedLine: any = {
        row: widgetSelfLine.row,
        //   .map((i, index) => {
        //     let match = null;
        //     Object.values(newreferenceLineMap.row).forEach((referItem: any) => {
        //       if (i >= referItem.min && i <= referItem.max) {
        //         match = referItem.value;
        //       }
        //     });
        //     if (match !== null) {
        //       //   if (index === 0) {
        //       //     setTop(match);
        //       //   } else if (index === 1) {
        //       //     setTop(Math.floor(match - height.value / 2));
        //       //   } else if (index === 2) {
        //       //     setTop(Math.floor(match - height.value));
        //       //   }
        //     }
        //     return match;
        //   })
        //   .filter((i) => i !== null),
        col: widgetSelfLine.col,
        //   .map((i, index) => {
        //     let match = null;
        //     Object.values(newreferenceLineMap.col).forEach((referItem: any) => {
        //       if (i >= referItem.min && i <= referItem.max) {
        //         match = referItem.value;
        //       }
        //     });
        //     if (match !== null) {
        //       //   if (index === 0) {
        //       //     setLeft(match);
        //       //   } else if (index === 1) {
        //       //     setLeft(Math.floor(match - width.value / 2));
        //       //   } else if (index === 2) {
        //       //     setLeft(Math.floor(match - width.value));
        //       //   }
        //     }
        //     return match;
        //   })
        //   .filter((i) => i !== null),
      };
      containerProvider.setMatchedLine(matchedLine);
    } else {
      //   console.log('0000');
    }
  };

  const resizeHandleUp = () => {
    emit('resize-end', {
      x: left.value,
      y: top.value,
      w: width.value,
      h: height.value,
    });
    setResizingHandle('');
    setResizing(false);
    setResizingMaxWidth(Infinity);
    setResizingMaxHeight(Infinity);
    setResizingMinWidth(props.minW);
    setResizingMinHeight(props.minH);
    removeEvent(documentElement, MOVE_HANDLES, resizeHandleDrag);
    removeEvent(documentElement, UP_HANDLES, resizeHandleUp);
    // 新增：停止缩放时，将匹配线设置为 null
    if (containerProvider) {
      containerProvider.setMatchedLine(null);
    }
  };

  const resizeHandleDown = (e: HandleEvent, handleType: ResizingHandle) => {
    if (!props.resizable) return;
    e.stopPropagation();
    setResizingHandle(handleType);

    setResizing(true);
    idx0 = handleType[0];
    idx1 = handleType[1];

    let minHeight = props.minH as number;
    let minWidth = props.minW as number;
    if (props.lockAspectRatio) {
      if (minHeight / minWidth > aspectRatio.value) {
        minWidth = minHeight / aspectRatio.value;
      } else {
        minHeight = minWidth * aspectRatio.value;
      }
    }
    setResizingMinWidth(minWidth);
    setResizingMinHeight(minHeight);
    if (parent) {
      let maxHeight =
        idx0 === 't'
          ? top.value + height.value
          : parentHeight.value - top.value;
      let maxWidth =
        idx1 === 'l'
          ? left.value + width.value
          : parentWidth.value - left.value;
      if (props.lockAspectRatio) {
        if (maxHeight / maxWidth < aspectRatio.value) {
          maxWidth = maxHeight / aspectRatio.value;
        } else {
          maxHeight = maxWidth * aspectRatio.value;
        }
      }
      setResizingMaxHeight(maxHeight);
      setResizingMaxWidth(maxWidth);
    }
    lstW = width.value;
    lstH = height.value;
    lstX = left.value;
    lstY = top.value;
    const lstPagePosition = getPosition(e);
    lstPageX = lstPagePosition[0];
    lstPageY = lstPagePosition[1];
    tmpAspectRatio = aspectRatio.value;
    emit('resize-start', {
      x: left.value,
      y: top.value,
      w: width.value,
      h: height.value,
    });
    addEvent(documentElement, MOVE_HANDLES, resizeHandleDrag);
    addEvent(documentElement, UP_HANDLES, resizeHandleUp);
  };

  onUnmounted(() => {
    removeEvent(documentElement, UP_HANDLES, resizeHandleUp);
    removeEvent(documentElement, MOVE_HANDLES, resizeHandleDrag);
  });

  const handlesFiltered = computed(() =>
    props.resizable ? filterHandles(props.handles) : []
  );

  return {
    handlesFiltered,
    resizeHandleDown,
  };
}

export function watchProps(
  props: any,
  limits: ReturnType<typeof initLimitSizeAndMethods>
) {
  const { setWidth, setHeight, setLeft, setTop } = limits;
  watch(
    () => props.w,
    (newVal: number) => {
      setWidth(newVal);
    }
  );
  watch(
    () => props.h,
    (newVal: number) => {
      setHeight(newVal);
    }
  );
  watch(
    () => props.x,
    (newVal: number) => {
      setLeft(newVal);
    }
  );
  watch(
    () => props.y,
    (newVal: number) => {
      setTop(newVal);
    }
  );
}
