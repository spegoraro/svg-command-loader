'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (content) {
  // Parse the XML into a DOM.
  var parser = new _xmldom.DOMParser();
  var dom = parser.parseFromString(content, 'image/svg+xml');

  // Extract the path commands and make sure they use absolute positions.
  var arry = Array.from(dom.getElementsByTagName('path')).map(function (el) {
    return el.getAttribute('d');
  }).map(function (val) {
    return (0, _svgPathParser2.default)(val);
  }).map(function (path) {
    return path.map(makeAbsolute());
  }).map(function (path) {
    return path.map(cleanProps);
  }).reduce(function (prev, cur) {
    return prev.concat(cur);
  });

  return 'module.exports = ' + JSON.stringify(arry) + ';';
};

var _xmldom = require('xmldom');

var _svgPathParser = require('svg-path-parser');

var _svgPathParser2 = _interopRequireDefault(_svgPathParser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function cleanProps(command) {
  var cmd = command;
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
      y: cmd.ry
    };
    delete cmd.rx;
    delete cmd.ry;
  }
  if (cmd.hasOwnProperty('x1') && cmd.hasOwnProperty('y1')) {
    cmd.cp1 = {
      x: cmd.x1,
      y: cmd.y1
    };
    cmd.cp2 = {
      x: cmd.x2,
      y: cmd.y2
    };
    delete cmd.x1;
    delete cmd.x2;
    delete cmd.y1;
    delete cmd.y2;
  }

  return cmd;
}

function makeAbsolute() {
  var cur = {
    x: 0,
    y: 0
  };

  return function (command) {
    var cmd = command;
    if (cmd.relative) {
      Object.keys(cmd).filter(function (k) {
        return k === 'x' || k === 'x1' || k === 'x2';
      }).forEach(function (k) {
        cmd[k] += cur.x;
      });
      Object.keys(cmd).filter(function (k) {
        return k === 'y' || k === 'y1' || k === 'y2';
      }).forEach(function (k) {
        cmd[k] += cur.y;
      });
    }

    cmd.code = cmd.code.toUpperCase();
    delete cmd.relative;

    cur.x = cmd.x || cur.x;
    cur.y = cmd.y || cur.y;
    return cmd;
  };
}

module.exports = exports['default'];
