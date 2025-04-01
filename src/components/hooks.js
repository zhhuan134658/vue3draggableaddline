"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.watchProps = exports.initResizeHandle = exports.initDraggableContainer = exports.initLimitSizeAndMethods = exports.initParent = exports.initState = exports.useState = void 0;
var vue_1 = require("vue");
var utils_1 = require("./utils");
function useState(initialState) {
    var state = vue_1.ref(initialState);
    var setState = function (value) {
        state.value = value;
        return value;
    };
    return [state, setState];
}
exports.useState = useState;
function initState(props, emit) {
    var _a = useState(props.initW), width = _a[0], setWidth = _a[1];
    var _b = useState(props.initH), height = _b[0], setHeight = _b[1];
    var _c = useState(props.x), left = _c[0], setLeft = _c[1];
    var _d = useState(props.y), top = _d[0], setTop = _d[1];
    var _e = useState(props.active), enable = _e[0], setEnable = _e[1];
    var _f = useState(false), dragging = _f[0], setDragging = _f[1];
    var _g = useState(false), resizing = _g[0], setResizing = _g[1];
    var _h = useState(''), resizingHandle = _h[0], setResizingHandle = _h[1];
    var _j = useState(Infinity), resizingMaxWidth = _j[0], setResizingMaxWidth = _j[1];
    var _k = useState(Infinity), resizingMaxHeight = _k[0], setResizingMaxHeight = _k[1];
    var _l = useState(props.minW), resizingMinWidth = _l[0], setResizingMinWidth = _l[1];
    var _m = useState(props.minH), resizingMinHeight = _m[0], setResizingMinHeight = _m[1];
    var aspectRatio = vue_1.computed(function () { return height.value / width.value; });
    vue_1.watch(width, function (newVal) {
        emit('update:w', newVal);
    }, { immediate: true });
    vue_1.watch(height, function (newVal) {
        emit('update:h', newVal);
    }, { immediate: true });
    vue_1.watch(top, function (newVal) {
        emit('update:y', newVal);
    });
    vue_1.watch(left, function (newVal) {
        emit('update:x', newVal);
    });
    vue_1.watch(enable, function (newVal, oldVal) {
        emit('update:active', newVal);
        if (!oldVal && newVal) {
            emit('activated');
        }
        else if (oldVal && !newVal) {
            emit('deactivated');
        }
    });
    vue_1.watch(function () { return props.active; }, function (newVal) {
        setEnable(newVal);
    });
    return {
        id: utils_1.getId(),
        width: width,
        height: height,
        top: top,
        left: left,
        enable: enable,
        dragging: dragging,
        resizing: resizing,
        resizingHandle: resizingHandle,
        resizingMaxHeight: resizingMaxHeight,
        resizingMaxWidth: resizingMaxWidth,
        resizingMinWidth: resizingMinWidth,
        resizingMinHeight: resizingMinHeight,
        aspectRatio: aspectRatio,
        setEnable: setEnable,
        setDragging: setDragging,
        setResizing: setResizing,
        setResizingHandle: setResizingHandle,
        setResizingMaxHeight: setResizingMaxHeight,
        setResizingMaxWidth: setResizingMaxWidth,
        setResizingMinWidth: setResizingMinWidth,
        setResizingMinHeight: setResizingMinHeight,
        setWidth: function (val) { return setWidth(Math.floor(val)); },
        setHeight: function (val) { return setHeight(Math.floor(val)); },
        setTop: function (val) { return setTop(Math.floor(val)); },
        setLeft: function (val) { return setLeft(Math.floor(val)); }
    };
}
exports.initState = initState;
// 防抖函数
function debounce(func, delay) {
    var timer = null;
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(function () {
            func.apply(void 0, args);
        }, delay);
    };
}
function initParent(containerRef) {
    var parentWidth = vue_1.ref(0);
    var parentHeight = vue_1.ref(0);
    vue_1.onMounted(function () {
        var _a;
        if (containerRef.value && containerRef.value.parentElement) {
            var _b = utils_1.getElSize(containerRef.value.parentElement), width = _b.width, height = _b.height;
            parentWidth.value = width;
            parentHeight.value = height;
        }
        // const myDiv = document.getElementById('mydiv');
        var myDiv = (_a = containerRef.value) === null || _a === void 0 ? void 0 : _a.parentElement;
        if (myDiv) {
            if (typeof window !== 'undefined') {
                var resizeObserver = new ResizeObserver(debounce(function (entries) {
                    for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
                        var entry = entries_1[_i];
                        var _a = entry.contentRect, width = _a.width, height = _a.height;
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
        parentWidth: parentWidth,
        parentHeight: parentHeight
    };
}
exports.initParent = initParent;
function initLimitSizeAndMethods(props, parentSize, containerProps) {
    var width = containerProps.width, height = containerProps.height, left = containerProps.left, top = containerProps.top, resizingMaxWidth = containerProps.resizingMaxWidth, resizingMaxHeight = containerProps.resizingMaxHeight, resizingMinWidth = containerProps.resizingMinWidth, resizingMinHeight = containerProps.resizingMinHeight;
    var setWidth = containerProps.setWidth, setHeight = containerProps.setHeight, setTop = containerProps.setTop, setLeft = containerProps.setLeft;
    var parentWidth = parentSize.parentWidth, parentHeight = parentSize.parentHeight;
    var limitProps = {
        minWidth: vue_1.computed(function () {
            return resizingMinWidth.value;
        }),
        minHeight: vue_1.computed(function () {
            return resizingMinHeight.value;
        }),
        maxWidth: vue_1.computed(function () {
            var max = Infinity;
            if (props.parent) {
                max = Math.min(parentWidth.value, resizingMaxWidth.value);
            }
            return max;
        }),
        maxHeight: vue_1.computed(function () {
            var max = Infinity;
            if (props.parent) {
                max = Math.min(parentHeight.value, resizingMaxHeight.value);
            }
            return max;
        }),
        minLeft: vue_1.computed(function () {
            return props.parent ? 0 : -Infinity;
        }),
        minTop: vue_1.computed(function () {
            return props.parent ? 0 : -Infinity;
        }),
        maxLeft: vue_1.computed(function () {
            return props.parent ? parentWidth.value - width.value : Infinity;
        }),
        maxTop: vue_1.computed(function () {
            return props.parent ? parentHeight.value - height.value : Infinity;
        }),
        // 新增 maxX 属性
        maxX: vue_1.computed(function () {
            return props.parent ? parentWidth.value - width.value : Infinity;
        })
    };
    var limitMethods = {
        setWidth: function (val) {
            if (props.disabledW) {
                return width.value;
            }
            return setWidth(Math.min(limitProps.maxWidth.value, Math.max(limitProps.minWidth.value, val)));
        },
        setHeight: function (val) {
            if (props.disabledH) {
                return height.value;
            }
            return setHeight(Math.min(limitProps.maxHeight.value, Math.max(limitProps.minHeight.value, val)));
        },
        setTop: function (val) {
            if (props.disabledY) {
                return top.value;
            }
            return setTop(Math.min(limitProps.maxTop.value, Math.max(limitProps.minTop.value, val)));
        },
        setLeft: function (val) {
            if (props.disabledX) {
                return left.value;
            }
            return setLeft(Math.min(limitProps.maxLeft.value, Math.max(limitProps.minLeft.value, val)));
        },
        setstepNum: function (val) {
            return props.OFFSET
                ? (props.OFFSET * props.SCALE) / 100
                : (val * props.SCALE) / 100;
        },
        setScale: function (val) {
            return props.SCALE ? props.SCALE / 100 : val / 100;
        },
        setBorderwidth: function (val) {
            return props.BORDER_WIDTH ? props.BORDER_WIDTH : val;
        }
    };
    return __assign(__assign({}, limitProps), limitMethods);
}
exports.initLimitSizeAndMethods = initLimitSizeAndMethods;
var DOWN_HANDLES = ['mousedown', 'touchstart'];
var UP_HANDLES = ['mouseup', 'touchend'];
var MOVE_HANDLES = ['mousemove', 'touchmove'];
function getPosition(e) {
    if ('touches' in e) {
        return [e.touches[0].pageX, e.touches[0].pageY];
    }
    else {
        return [e.pageX, e.pageY];
    }
}
var BORDER_WIDTH = 0; // 定义边框宽度
function initDraggableContainer(containerRef, containerProps, limitProps, draggable, emit, containerProvider, parentSize, OFFSET, SCALE, BORDER_WIDTH) {
    var x = containerProps.left, y = containerProps.top, w = containerProps.width, h = containerProps.height, dragging = containerProps.dragging, id = containerProps.id;
    var setDragging = containerProps.setDragging, setEnable = containerProps.setEnable, setResizing = containerProps.setResizing, setResizingHandle = containerProps.setResizingHandle;
    var setTop = limitProps.setTop, setLeft = limitProps.setLeft, setstepNum = limitProps.setstepNum, setScale = limitProps.setScale, setBorderwidth = limitProps.setBorderwidth;
    var lstX = 0;
    var lstY = 0;
    var lstPageX = 0;
    var lstPageY = 0;
    var referenceLineMap = null;
    var documentElement = document.documentElement;
    var _unselect = function (e) {
        var _a;
        var target = e.target;
        if (!((_a = containerRef.value) === null || _a === void 0 ? void 0 : _a.contains(target))) {
            setEnable(false);
            setDragging(false);
            setResizing(false);
            setResizingHandle('');
        }
    };
    var handleUp = function () {
        setDragging(false);
        utils_1.removeEvent(documentElement, UP_HANDLES, handleUp);
        utils_1.removeEvent(documentElement, MOVE_HANDLES, handleDrag);
        referenceLineMap = null;
        if (containerProvider) {
            containerProvider.updatePosition(id, {
                x: x.value,
                y: y.value,
                w: w.value,
                h: h.value
            });
            containerProvider.setMatchedLine(null);
        }
    };
    var handleDrag = function (e) {
        e.preventDefault();
        if (!(dragging.value && containerRef.value))
            return;
        var _a = getPosition(e), pageX = _a[0], pageY = _a[1];
        var deltaX = pageX - lstPageX;
        var deltaY = pageY - lstPageY;
        // 计算偏移量的倍数
        var multipleX = Math.round(deltaX / setstepNum(OFFSET));
        var multipleY = Math.round(deltaY / setstepNum(OFFSET));
        // 计算新的位置
        var newLeft = lstX + (multipleX * setstepNum(OFFSET)) / setScale(SCALE);
        var newTop = lstY + (multipleY * setstepNum(OFFSET)) / setScale(SCALE);
        if (referenceLineMap !== null) {
            var widgetSelfLine = {
                col: [newLeft, newLeft + w.value / 2, newLeft + w.value],
                row: [newTop, newTop + h.value / 2, newTop + h.value]
            };
            var matchedLine = {
                row: widgetSelfLine.row
                    .map(function (i, index) {
                    var match = null;
                    Object.values(referenceLineMap.row).forEach(function (referItem) {
                        if (i >= referItem.min && i <= referItem.max) {
                            match = referItem.value;
                        }
                    });
                    if (match !== null) {
                        if (index === 0) {
                            newTop = match;
                        }
                        else if (index === 1) {
                            newTop = Math.floor(match - h.value / 2);
                        }
                        else if (index === 2) {
                            newTop = Math.floor(match - h.value);
                        }
                    }
                    return match;
                })
                    .filter(function (i) { return i !== null; }),
                col: widgetSelfLine.col
                    .map(function (i, index) {
                    var match = null;
                    Object.values(referenceLineMap.col).forEach(function (referItem) {
                        if (i >= referItem.min && i <= referItem.max) {
                            match = referItem.value;
                        }
                    });
                    if (match !== null) {
                        if (index === 0) {
                            newLeft = match;
                        }
                        else if (index === 1) {
                            newLeft = Math.floor(match - w.value / 2);
                        }
                        else if (index === 2) {
                            newLeft = Math.floor(match - w.value);
                        }
                    }
                    return match;
                })
                    .filter(function (i) { return i !== null; })
            };
            containerProvider.setMatchedLine(matchedLine);
        }
        emit('dragging', { x: setLeft(newLeft), y: setTop(newTop) });
    };
    var handleDown = function (e) {
        if (!draggable.value)
            return;
        var el = containerRef.value;
        if (!el)
            return;
        var rect = el.getBoundingClientRect();
        var _a = e, clientX = _a.clientX, clientY = _a.clientY;
        // 判断鼠标点击位置是否在边框上
        var newBorder = setBorderwidth(BORDER_WIDTH);
        var isOnBorder = (clientX >= rect.left && clientX <= rect.left + newBorder) ||
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
            utils_1.addEvent(documentElement, MOVE_HANDLES, handleDrag);
            utils_1.addEvent(documentElement, UP_HANDLES, handleUp);
            if (containerProvider && !containerProvider.disabled.value) {
                referenceLineMap = utils_1.getReferenceLineMap(containerProvider, parentSize, id);
            }
        }
    };
    vue_1.watch(dragging, function (cur, pre) {
        if (!pre && cur) {
            emit('drag-start', { x: x.value, y: y.value });
            setEnable(true);
            setDragging(true);
        }
        else {
            emit('drag-end', { x: x.value, y: y.value });
            setDragging(false);
        }
    });
    vue_1.onMounted(function () {
        var el = containerRef.value;
        if (!el)
            return;
        el.style.left = x + 'px';
        el.style.top = y + 'px';
        utils_1.addEvent(documentElement, DOWN_HANDLES, _unselect);
        utils_1.addEvent(el, DOWN_HANDLES, handleDown);
    });
    vue_1.onUnmounted(function () {
        if (!containerRef.value)
            return;
        utils_1.removeEvent(documentElement, DOWN_HANDLES, _unselect);
        utils_1.removeEvent(documentElement, UP_HANDLES, handleUp);
        utils_1.removeEvent(documentElement, MOVE_HANDLES, handleDrag);
    });
    return { containerRef: containerRef };
}
exports.initDraggableContainer = initDraggableContainer;
function initResizeHandle(containerProps, limitProps, parentSize, props, emit, containerProvider // 新增参数，用于设置匹配线
) {
    var id = containerProps.id;
    var setWidth = limitProps.setWidth, setHeight = limitProps.setHeight, setLeft = limitProps.setLeft, setTop = limitProps.setTop, setScale = limitProps.setScale;
    var width = containerProps.width, height = containerProps.height, left = containerProps.left, top = containerProps.top, aspectRatio = containerProps.aspectRatio;
    var setResizing = containerProps.setResizing, setResizingHandle = containerProps.setResizingHandle, setResizingMaxWidth = containerProps.setResizingMaxWidth, setResizingMaxHeight = containerProps.setResizingMaxHeight, setResizingMinWidth = containerProps.setResizingMinWidth, setResizingMinHeight = containerProps.setResizingMinHeight;
    var parentWidth = parentSize.parentWidth, parentHeight = parentSize.parentHeight;
    var lstW = 0;
    var lstH = 0;
    var lstX = 0;
    var lstY = 0;
    var lstPageX = 0;
    var lstPageY = 0;
    var tmpAspectRatio = 1;
    var idx0 = '';
    var idx1 = '';
    var documentElement = document.documentElement;
    var resizeHandleDrag = function (e) {
        // e.preventDefault();
        var _a = getPosition(e), _pageX = _a[0], _pageY = _a[1];
        var deltaX = _pageX - lstPageX;
        var deltaY = _pageY - lstPageY;
        var _deltaX = deltaX;
        var _deltaY = deltaY;
        if (props.lockAspectRatio) {
            deltaX = Math.abs(deltaX);
            deltaY = deltaX * tmpAspectRatio;
            if (idx0 === 't') {
                if (_deltaX < 0 || (idx1 === 'm' && _deltaY < 0)) {
                    deltaX = -deltaX;
                    deltaY = -deltaY;
                }
            }
            else {
                if (_deltaX < 0 || (idx1 === 'm' && _deltaY < 0)) {
                    deltaX = -deltaX;
                    deltaY = -deltaY;
                }
            }
        }
        // ---------------
        // 计算偏移量的倍数
        var multipleX = Math.round(deltaX / props.OFFSET);
        var multipleY = Math.round(deltaY / props.OFFSET);
        // 计算新的宽度和高度变化量
        var newDeltaX = (multipleX * props.OFFSET) / setScale(props.SCALE);
        var newDeltaY = (multipleY * props.OFFSET) / setScale(props.SCALE);
        // 处理不同句柄位置的拖动逻辑
        switch ("" + idx0 + idx1) {
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
            h: height.value
        });
        var newreferenceLineMap = utils_1.getReferenceLineMap(containerProvider, parentSize, id);
        // console.log('props', props);
        // 新增：吸附检测逻辑
        var THRESHOLD = props.THRESHOLD; // 吸附阈值
        var positionStore = containerProvider.getPositionStore(id);
        var currentLeft = left.value;
        var currentTop = top.value;
        var currentRight = left.value + width.value;
        var currentBottom = top.value + height.value;
        Object.values(positionStore).forEach(function (pos) {
            var otherLeft = pos.x;
            var otherTop = pos.y;
            var otherRight = pos.x + pos.w;
            var otherBottom = pos.y + pos.h;
            // 左侧吸附
            if (Math.abs(currentLeft - otherLeft) <= THRESHOLD) {
                setLeft(otherLeft);
            }
            else if (Math.abs(currentLeft - otherRight) <= THRESHOLD) {
                setLeft(otherRight);
            }
            // 右侧吸附
            if (Math.abs(currentRight - otherLeft) <= THRESHOLD) {
                setWidth(otherLeft - left.value);
            }
            else if (Math.abs(currentRight - otherRight) <= THRESHOLD) {
                setWidth(otherRight - left.value);
            }
            // 顶部吸附
            if (Math.abs(currentTop - otherTop) <= THRESHOLD) {
                setTop(otherTop);
            }
            else if (Math.abs(currentTop - otherBottom) <= THRESHOLD) {
                setTop(otherBottom);
            }
            // 底部吸附
            if (Math.abs(currentBottom - otherTop) <= THRESHOLD) {
                setHeight(otherTop - top.value);
            }
            else if (Math.abs(currentBottom - otherBottom) <= THRESHOLD) {
                setHeight(otherBottom - top.value);
            }
        });
        // 新增：计算和设置对齐辅助线
        if (containerProvider && newreferenceLineMap) {
            //   console.log('1111');
            var widgetSelfLine = {
                col: [
                    left.value,
                    left.value + width.value / 2,
                    left.value + width.value,
                ],
                row: [
                    top.value,
                    top.value + height.value / 2,
                    top.value + height.value,
                ]
            };
            var matchedLine = {
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
                col: widgetSelfLine.col
            };
            containerProvider.setMatchedLine(matchedLine);
        }
        else {
            //   console.log('0000');
        }
    };
    var resizeHandleUp = function () {
        emit('resize-end', {
            x: left.value,
            y: top.value,
            w: width.value,
            h: height.value
        });
        setResizingHandle('');
        setResizing(false);
        setResizingMaxWidth(Infinity);
        setResizingMaxHeight(Infinity);
        setResizingMinWidth(props.minW);
        setResizingMinHeight(props.minH);
        utils_1.removeEvent(documentElement, MOVE_HANDLES, resizeHandleDrag);
        utils_1.removeEvent(documentElement, UP_HANDLES, resizeHandleUp);
        // 新增：停止缩放时，将匹配线设置为 null
        if (containerProvider) {
            containerProvider.setMatchedLine(null);
        }
    };
    var resizeHandleDown = function (e, handleType) {
        if (!props.resizable)
            return;
        e.stopPropagation();
        setResizingHandle(handleType);
        setResizing(true);
        idx0 = handleType[0];
        idx1 = handleType[1];
        var minHeight = props.minH;
        var minWidth = props.minW;
        if (props.lockAspectRatio) {
            if (minHeight / minWidth > aspectRatio.value) {
                minWidth = minHeight / aspectRatio.value;
            }
            else {
                minHeight = minWidth * aspectRatio.value;
            }
        }
        setResizingMinWidth(minWidth);
        setResizingMinHeight(minHeight);
        if (parent) {
            var maxHeight = idx0 === 't'
                ? top.value + height.value
                : parentHeight.value - top.value;
            var maxWidth = idx1 === 'l'
                ? left.value + width.value
                : parentWidth.value - left.value;
            if (props.lockAspectRatio) {
                if (maxHeight / maxWidth < aspectRatio.value) {
                    maxWidth = maxHeight / aspectRatio.value;
                }
                else {
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
        var lstPagePosition = getPosition(e);
        lstPageX = lstPagePosition[0];
        lstPageY = lstPagePosition[1];
        tmpAspectRatio = aspectRatio.value;
        emit('resize-start', {
            x: left.value,
            y: top.value,
            w: width.value,
            h: height.value
        });
        utils_1.addEvent(documentElement, MOVE_HANDLES, resizeHandleDrag);
        utils_1.addEvent(documentElement, UP_HANDLES, resizeHandleUp);
    };
    vue_1.onUnmounted(function () {
        utils_1.removeEvent(documentElement, UP_HANDLES, resizeHandleUp);
        utils_1.removeEvent(documentElement, MOVE_HANDLES, resizeHandleDrag);
    });
    var handlesFiltered = vue_1.computed(function () {
        return props.resizable ? utils_1.filterHandles(props.handles) : [];
    });
    return {
        handlesFiltered: handlesFiltered,
        resizeHandleDown: resizeHandleDown
    };
}
exports.initResizeHandle = initResizeHandle;
function watchProps(props, limits) {
    var setWidth = limits.setWidth, setHeight = limits.setHeight, setLeft = limits.setLeft, setTop = limits.setTop;
    vue_1.watch(function () { return props.w; }, function (newVal) {
        setWidth(newVal);
    });
    vue_1.watch(function () { return props.h; }, function (newVal) {
        setHeight(newVal);
    });
    vue_1.watch(function () { return props.x; }, function (newVal) {
        setLeft(newVal);
    });
    vue_1.watch(function () { return props.y; }, function (newVal) {
        setTop(newVal);
    });
}
exports.watchProps = watchProps;
