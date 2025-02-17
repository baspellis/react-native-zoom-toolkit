"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _reactNativeReanimated = _interopRequireWildcard(require("react-native-reanimated"));
var _reactNativeGestureHandler = require("react-native-gesture-handler");
var _crop = require("../../commons/utils/crop");
var _useSizeVector = require("../../commons/hooks/useSizeVector");
var _getCropRotatedSize = require("../../commons/utils/getCropRotatedSize");
var _usePanCommons = require("../../commons/hooks/usePanCommons");
var _usePinchCommons = require("../../commons/hooks/usePinchCommons");
var _getMaxScale = require("../../commons/utils/getMaxScale");
var _useVector = require("../../commons/hooks/useVector");
var _withCropValidation = _interopRequireDefault(require("../../commons/hoc/withCropValidation"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const TAU = Math.PI * 2;
const RAD2DEG = 180 / Math.PI;
const CropZoom = props => {
  const {
    reference,
    children,
    cropSize,
    resolution,
    minScale = 1,
    maxScale: userMaxScale,
    scaleMode = 'bounce',
    panMode = 'free',
    allowPinchPanning = true,
    onUpdate,
    onGestureEnd,
    OverlayComponent,
    onPanStart: onUserPanStart,
    onPanEnd: onUserPanEnd,
    onPinchStart: onUserPinchStart,
    onPinchEnd: onUserPinchEnd,
    onTap
  } = props;
  const initialSize = (0, _getCropRotatedSize.getCropRotatedSize)({
    crop: cropSize,
    resolution: resolution,
    angle: 0
  });
  const translate = (0, _useVector.useVector)(0, 0);
  const offset = (0, _useVector.useVector)(0, 0);
  const scale = (0, _reactNativeReanimated.useSharedValue)(minScale);
  const scaleOffset = (0, _reactNativeReanimated.useSharedValue)(minScale);
  const rotation = (0, _reactNativeReanimated.useSharedValue)(0);
  const rotate = (0, _useVector.useVector)(0, 0);
  const container = (0, _useSizeVector.useSizeVector)(initialSize.width, initialSize.height);
  const detector = (0, _useSizeVector.useSizeVector)(initialSize.width, initialSize.height);
  const sizeAngle = (0, _reactNativeReanimated.useSharedValue)(0);
  const maxScale = (0, _reactNativeReanimated.useDerivedValue)(() => {
    const {
      width,
      height
    } = container;
    const scaleValue = (0, _getMaxScale.getMaxScale)({
      width: width.value,
      height: height.value
    }, resolution);
    return userMaxScale ?? scaleValue;
  }, [container, userMaxScale, resolution]);
  (0, _reactNativeReanimated.useDerivedValue)(() => {
    const size = (0, _getCropRotatedSize.getCropRotatedSize)({
      crop: cropSize,
      resolution,
      angle: sizeAngle.value
    });
    container.width.value = (0, _reactNativeReanimated.withTiming)(size.width);
    container.height.value = (0, _reactNativeReanimated.withTiming)(size.height);
    const isFlipped = rotation.value % Math.PI !== 0;
    detector.width.value = isFlipped ? size.height : size.width;
    detector.height.value = isFlipped ? size.width : size.height;
  }, [cropSize, resolution, sizeAngle, rotation]);
  (0, _reactNativeReanimated.useDerivedValue)(() => {
    onUpdate === null || onUpdate === void 0 || onUpdate({
      width: container.width.value,
      height: container.height.value,
      translateX: translate.x.value,
      translateY: translate.y.value,
      scale: scale.value,
      rotate: rotation.value,
      rotateX: rotate.x.value,
      rotateY: rotate.y.value
    });
  }, [container, translate, scale, rotate, rotation]);
  const boundsFn = optionalScale => {
    'worklet';

    const scaleVal = optionalScale ?? scale.value;
    let size = {
      width: container.width.value,
      height: container.height.value
    };
    const isInInverseAspectRatio = rotation.value % Math.PI !== 0;
    if (isInInverseAspectRatio) {
      size = {
        width: size.height,
        height: size.width
      };
    }
    const boundX = Math.max(0, size.width * scaleVal - cropSize.width) / 2;
    const boundY = Math.max(0, size.height * scaleVal - cropSize.height) / 2;
    return {
      x: boundX,
      y: boundY
    };
  };
  const {
    gesturesEnabled,
    onTouchesDown,
    onTouchesMove,
    onTouchesUp,
    onPinchStart,
    onPinchUpdate,
    onPinchEnd
  } = (0, _usePinchCommons.usePinchCommons)({
    container: detector,
    translate,
    offset,
    scale,
    scaleOffset,
    minScale,
    maxScale,
    allowPinchPanning,
    scaleMode,
    pinchCenteringMode: 'sync',
    boundFn: boundsFn,
    userCallbacks: {
      onGestureEnd: onGestureEnd,
      onPinchStart: onUserPinchStart,
      onPinchEnd: onUserPinchEnd
    }
  });
  const {
    onPanStart,
    onPanChange,
    onPanEnd
  } = (0, _usePanCommons.usePanCommons)({
    container: detector,
    translate,
    offset,
    panMode,
    boundFn: boundsFn,
    userCallbacks: {
      onGestureEnd: onGestureEnd,
      onPanStart: onUserPanStart,
      onPanEnd: onUserPanEnd
    }
  });
  const pinch = _reactNativeGestureHandler.Gesture.Pinch().withTestId('pinch').manualActivation(true).onTouchesDown(onTouchesDown).onTouchesMove(onTouchesMove).onTouchesUp(onTouchesUp).onStart(onPinchStart).onUpdate(onPinchUpdate).onEnd(onPinchEnd);
  const pan = _reactNativeGestureHandler.Gesture.Pan().withTestId('pan').enabled(gesturesEnabled).maxPointers(1).onStart(onPanStart).onChange(onPanChange).onEnd(onPanEnd);
  const tap = _reactNativeGestureHandler.Gesture.Tap().withTestId('tap').enabled(gesturesEnabled).maxDuration(250).numberOfTaps(1).runOnJS(true).onEnd(e => onTap === null || onTap === void 0 ? void 0 : onTap(e));
  const detectorStyle = (0, _reactNativeReanimated.useAnimatedStyle)(() => {
    return {
      width: detector.width.value,
      height: detector.height.value,
      position: 'absolute',
      transform: [{
        translateX: translate.x.value
      }, {
        translateY: translate.y.value
      }, {
        scale: scale.value
      }]
    };
  }, [detector, translate, scale]);
  const childStyle = (0, _reactNativeReanimated.useAnimatedStyle)(() => {
    return {
      width: container.width.value,
      height: container.height.value,
      transform: [{
        translateX: translate.x.value
      }, {
        translateY: translate.y.value
      }, {
        scale: scale.value
      }, {
        rotate: `${rotation.value}rad`
      }, {
        rotateX: `${rotate.x.value}rad`
      }, {
        rotateY: `${rotate.y.value}rad`
      }]
    };
  }, [container, translate, scale, rotation, rotate]);

  // Reference handling section
  const resetTo = (st, animate = true) => {
    translate.x.value = animate ? (0, _reactNativeReanimated.withTiming)(st.translateX) : st.translateX;
    translate.y.value = animate ? (0, _reactNativeReanimated.withTiming)(st.translateY) : st.translateY;
    scale.value = animate ? (0, _reactNativeReanimated.withTiming)(st.scale) : st.scale;
    scaleOffset.value = st.scale;
    rotate.x.value = animate ? (0, _reactNativeReanimated.withTiming)(st.rotateX) : st.rotateX;
    rotate.y.value = animate ? (0, _reactNativeReanimated.withTiming)(st.rotateY) : st.rotateY;
    rotation.value = animate ? (0, _reactNativeReanimated.withTiming)(st.rotate, undefined, () => {
      canRotate.value = true;
      rotation.value = rotation.value % TAU;
    }) : st.rotate % TAU;
  };
  const canRotate = (0, _reactNativeReanimated.useSharedValue)(true);
  const handleRotate = (animate = true, clockwise = true, cb) => {
    if (!canRotate.value) return;
    if (animate) canRotate.value = false;

    // Determine the direction multiplier based on clockwise or counterclockwise rotation
    const direction = clockwise ? 1 : -1;
    const toAngle = rotation.value + direction * (Math.PI / 2);
    sizeAngle.value = toAngle;
    cb === null || cb === void 0 || cb(toAngle % TAU);
    resetTo({
      translateX: 0,
      translateY: 0,
      scale: minScale,
      rotate: toAngle,
      rotateX: rotate.x.value,
      rotateY: rotate.y.value
    }, animate);
  };
  const flipHorizontal = (animate = true, cb) => {
    const toAngle = rotate.y.value !== Math.PI ? Math.PI : 0;
    cb === null || cb === void 0 || cb(toAngle * RAD2DEG);
    rotate.y.value = animate ? (0, _reactNativeReanimated.withTiming)(toAngle) : toAngle;
  };
  const flipVertical = (animate = true, cb) => {
    const toAngle = rotate.x.value !== Math.PI ? Math.PI : 0;
    cb === null || cb === void 0 || cb(toAngle * RAD2DEG);
    rotate.x.value = animate ? (0, _reactNativeReanimated.withTiming)(toAngle) : toAngle;
  };
  const handleCrop = fixedWidth => {
    const context = {
      rotationAngle: rotation.value * RAD2DEG,
      flipHorizontal: rotate.y.value === Math.PI,
      flipVertical: rotate.x.value === Math.PI
    };
    const result = (0, _crop.crop)({
      scale: scale.value,
      cropSize: cropSize,
      resolution: resolution,
      itemSize: {
        width: container.width.value,
        height: container.height.value
      },
      translation: {
        x: translate.x.value,
        y: translate.y.value
      },
      isRotated: context.rotationAngle % 180 !== 0,
      fixedWidth
    });
    return {
      crop: result.crop,
      resize: result.resize,
      context
    };
  };
  const handleRequestState = () => ({
    width: container.width.value,
    height: container.height.value,
    translateX: translate.x.value,
    translateY: translate.y.value,
    scale: scale.value,
    rotate: rotation.value,
    rotateX: rotate.x.value,
    rotateY: rotate.y.value
  });
  const assignState = (state, animate = true) => {
    const toScale = (0, _reactNativeReanimated.clamp)(state.scale, minScale, maxScale.value);
    const {
      x: boundX,
      y: boundY
    } = boundsFn(toScale);
    const translateX = (0, _reactNativeReanimated.clamp)(state.translateX, -1 * boundX, boundX);
    const translateY = (0, _reactNativeReanimated.clamp)(state.translateY, -1 * boundY, boundY);
    const DEG90 = Math.PI / 2;
    const toRotate = Math.floor(state.rotate % (Math.PI * 2) / DEG90) * DEG90;
    const rotateX = Math.sign(state.rotateX - DEG90) === 1 ? Math.PI : 0;
    const rotateY = Math.sign(state.rotateY - DEG90) === 1 ? Math.PI : 0;
    resetTo({
      translateX,
      translateY,
      scale: toScale,
      rotate: toRotate,
      rotateX,
      rotateY
    }, animate);
  };
  (0, _react.useImperativeHandle)(reference, () => ({
    rotate: handleRotate,
    flipHorizontal: flipHorizontal,
    flipVertical: flipVertical,
    reset: animate => resetTo({
      translateX: 0,
      translateY: 0,
      scale: minScale,
      rotate: 0,
      rotateX: 0,
      rotateY: 0
    }, animate),
    crop: handleCrop,
    requestState: handleRequestState,
    assignState: assignState
  }));
  const rootStyle = {
    minWidth: cropSize.width,
    minHeight: cropSize.height
  };
  return /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: [rootStyle, styles.root, styles.center]
  }, /*#__PURE__*/_react.default.createElement(_reactNativeReanimated.default.View, {
    style: childStyle
  }, children), /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.absolute,
    pointerEvents: 'none'
  }, OverlayComponent === null || OverlayComponent === void 0 ? void 0 : OverlayComponent()), /*#__PURE__*/_react.default.createElement(_reactNativeGestureHandler.GestureDetector, {
    gesture: _reactNativeGestureHandler.Gesture.Race(pinch, pan, tap)
  }, /*#__PURE__*/_react.default.createElement(_reactNativeReanimated.default.View, {
    style: detectorStyle
  })));
};
const styles = _reactNative.StyleSheet.create({
  root: {
    flex: 1
  },
  absolute: {
    position: 'absolute'
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center'
  }
});
var _default = exports.default = (0, _withCropValidation.default)(CropZoom);
//# sourceMappingURL=CropZoom.js.map