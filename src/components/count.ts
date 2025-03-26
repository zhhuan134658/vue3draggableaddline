import { ref } from 'vue';
// 计算连接线的起点和终点
export function calculateLinePoints(rect1: any, rect2: any) {
  let start, end;
  const horizontalDistance = Math.max(
    0, // 如果重叠，距离为0
    rect1.x - rect2.width - rect2.x, // rect1在rect2左侧
    rect2.x - rect1.width - rect1.x // rect1在rect2右侧
  );
  const verticalDistance = Math.max(
    0, // 如果重叠，距离为0
    rect2.y - rect1.height - rect1.y, // rect1在rect2上方
    rect1.y - rect2.height - rect2.y // rect1在rect2下方
  );
  if (horizontalDistance > verticalDistance) {
    if (rect1.x + rect1.width < rect2.x) {
      // rect1的右中点
      const r1RightMid = getMidpoint(
        rect1.x + rect1.width,
        rect1.y,
        rect1.x + rect1.width,
        rect1.y + rect1.height
      );

      if (r1RightMid.y <= rect2.y + rect2.height && r1RightMid.y >= rect2.y) {
        start = { x: r1RightMid.x, y: r1RightMid.y };
        end = { x: rect2.x, y: r1RightMid.y };
      } else if (
        r1RightMid.y >= rect2.y + rect2.height &&
        rect2.y + rect2.height >= rect1.y
      ) {
        start = { x: rect1.x + rect1.width, y: rect2.y + rect2.height };
        end = { x: rect2.x, y: rect2.y + rect2.height };
      } else if (r1RightMid.y <= rect2.y && rect2.y <= rect1.y + rect1.height) {
        start = { x: rect1.x + rect1.width, y: rect2.y };
        end = { x: rect2.x, y: rect2.y };
      } else {
        start = { x: 0, y: 0 };
        end = { x: 0, y: 0 };
      }

      // console.log('rect1在rect2左侧');
    } else {
      // rect1的左中点
      const r1LeftMid = getMidpoint(
        rect1.x,
        rect1.y,
        rect1.x,
        rect1.y + rect1.height
      );
      if (r1LeftMid.y <= rect2.y + rect2.height && r1LeftMid.y >= rect2.y) {
        start = { x: rect2.x + rect2.width, y: r1LeftMid.y };
        end = { x: r1LeftMid.x, y: r1LeftMid.y };
      } else if (
        r1LeftMid.y >= rect2.y + rect2.height &&
        rect2.y + rect2.height >= rect1.y
      ) {
        start = { x: rect2.x + rect2.width, y: rect2.y + rect2.height };
        end = { x: r1LeftMid.x, y: rect2.y + rect2.height };
      } else if (r1LeftMid.y <= rect2.y && rect2.y <= rect1.y + rect1.height) {
        start = { x: rect2.x + rect2.width, y: rect2.y };
        end = { x: rect1.x, y: rect2.y };
      } else {
        start = { x: 0, y: 0 };
        end = { x: 0, y: 0 };
      }
      // console.log('rect1在rect2右侧');
    }
  } else {
    if (rect1.y + rect1.height < rect2.y) {
      // rect1的下中点
      const r1BottomMid = getMidpoint(
        rect1.x,
        rect1.y + rect1.height,
        rect1.x + rect1.width,
        rect1.y + rect1.height
      );
      if (r1BottomMid.x <= rect2.x + rect2.width && r1BottomMid.x >= rect2.x) {
        // console.log('垂直重叠');
        start = { x: r1BottomMid.x, y: r1BottomMid.y };
        end = { x: r1BottomMid.x, y: rect2.y };
      } else if (rect2.x <= rect1.x + rect1.width && r1BottomMid.x <= rect2.x) {
        start = {
          x: rect2.x,
          y: rect2.y,
        };
        end = { x: rect2.x, y: r1BottomMid.y };
      } else if (
        rect1.x <= rect2.x + rect2.width &&
        r1BottomMid.x >= rect2.x + rect2.width
      ) {
        start = { x: rect2.x + rect2.width, y: rect2.y };
        end = { x: rect2.x + rect2.width, y: rect1.y + rect1.height };
      } else {
        start = { x: 0, y: 0 };
        end = { x: 0, y: 0 };
      }
      // console.log('rect1在rect2上方');
    } else {
      // rect1的上中点
      const r1TopMid = getMidpoint(
        rect1.x,
        rect1.y,
        rect1.x + rect1.width,
        rect1.y
      );
      if (r1TopMid.x <= rect2.x + rect2.width && r1TopMid.x >= rect2.x) {
        start = { x: r1TopMid.x, y: r1TopMid.y };
        end = { x: r1TopMid.x, y: rect2.y + rect2.height };
      } else if (rect2.x <= rect1.x + rect1.width && r1TopMid.x <= rect2.x) {
        start = { x: rect2.x, y: rect2.y + rect2.height };
        end = { x: rect2.x, y: rect1.y };
      } else if (
        rect1.x <= rect2.x + rect2.width &&
        r1TopMid.x >= rect2.x + rect2.width
      ) {
        start = { x: rect2.x + rect2.width, y: rect2.y + rect2.height };
        end = { x: rect2.x + rect2.width, y: r1TopMid.y };
      } else {
        start = { x: 0, y: 0 };
        end = { x: 0, y: 0 };
      }
      // console.log('rect1在rect2下方');
    }
  }

  return { start, end };
}

// 计算中点
function getMidpoint(x1: number, y1: number, x2: number, y2: number) {
  return {
    x: (x1 + x2) / 2,
    y: (y1 + y2) / 2,
  };
}

// 计算两点之间的距离
export function calculateDistance(point1: any, point2: any) {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  return distance;
}
//通过id获取数组元素
export function getArrayItemById(id: any, array: any) {
  return array.find((item: any) => item.id === id);
}

// 获取svg各个起始点和结束点
export function getStartAndEnd(currentItem: any, items: any) {
  const currentRect = currentItem;
  const newLines: any = [];
  items.forEach((item: any, i: any) => {
    if (item.id !== currentItem.id) {
      // 检查是否重叠
      const isOverlapping =
        currentRect.x + currentRect.width >= item.x &&
        currentRect.x <= item.x + item.width &&
        currentRect.y + currentRect.height >= item.y &&
        currentRect.y <= item.y + item.height;

      if (!isOverlapping) {
        const otherRect = items[i];
        const { start, end } = calculateLinePoints(currentRect, otherRect);
        // console.log('12121', currentRect, otherRect);

        const distance = calculateDistance(start, end);
        const position = {
          x: (start.x + end.x) / 2,
          y: (start.y + end.y) / 2,
        };
        newLines.push({
          distance,
          start,
          end,
          position,
        });
      }
    }
  });
  //   console.log('2313232', newLines);

  return newLines;
}
