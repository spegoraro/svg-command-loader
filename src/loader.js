import { DOMParser } from 'xmldom';
import parsePath from 'svg-path-parser';


function cleanProps(command) {
  const cmd = command;
  delete cmd.command;
  if (cmd.hasOwnProperty('xAxisRotation')) {
    cmd.rot = cmd.xAxisRotation;
    delete cmd.xAxisRotation;
  }
  if (cmd.hasOwnProperty('largeArc')) {
    cmd.lrg = cmd.largeArc;
    delete cmd.largeArc;
  }
  if (cmd.hasOwnProperty('sweep')) {
    cmd.swp = cmd.sweep;
    delete cmd.sweep;
  }
  if (cmd.hasOwnProperty('rx') && cmd.hasOwnProperty('ry')) {
    cmd.rad = {
      x: cmd.rx,
      y: cmd.ry,
    };
    delete cmd.rx;
    delete cmd.ry;
  }
  if (cmd.hasOwnProperty('x1') && cmd.hasOwnProperty('y1')) {
    cmd.cp1 = {
      x: cmd.x1,
      y: cmd.y1,
    };
    cmd.cp2 = {
      x: cmd.x2,
      y: cmd.y2,
    };
    delete cmd.x1;
    delete cmd.x2;
    delete cmd.y1;
    delete cmd.y2;
  }

  return cmd;
}

function makeAbsolute() {
  const cur = {
    x: 0,
    y: 0,
  };

  return (command) => {
    const cmd = command;
    if (cmd.relative) {
      Object.keys(cmd)
        .filter(k => k === 'x' || k === 'x1' || k === 'x2')
        .forEach(k => { cmd[k] += cur.x; });
      Object.keys(cmd)
        .filter(k => k === 'y' || k === 'y1' || k === 'y2')
        .forEach(k => { cmd[k] += cur.y; });
    }

    cmd.code = cmd.code.toUpperCase();
    delete cmd.relative;

    cur.x = cmd.x || cur.x;
    cur.y = cmd.y || cur.y;
    return cmd;
  };
}

export default function (content) {
  // Parse the XML into a DOM.
  const parser = new DOMParser();
  const dom = parser.parseFromString(content, 'image/svg+xml');

  // Extract the path commands and make sure they use absolute positions.
  const arry = Array.from(dom.getElementsByTagName('path'))
    .map(el => el.getAttribute('d'))
    .map(val => parsePath(val))
    .map(path => path.map(makeAbsolute()))
    .map(path => path.map(cleanProps))
    .reduce((prev, cur) => prev.concat(cur));

  return `module.exports = ${JSON.stringify(arry)};`;
}
