import {
  BASE_OPTION_DEFAULTS,
  ElementDragging,
  ElementScrollController,
  Emitter,
  EventApi,
  Interaction,
  ScrollController,
  WindowScrollController,
  __assign,
  __extends,
  allowContextMenu,
  allowSelection,
  applyMutationToEventStore,
  applyStyle,
  buildEventApis,
  compareNumbers,
  computeInnerRect,
  computeRect,
  config,
  constrainPoint,
  createDuration,
  createEmptyEventStore,
  createEventInstance,
  createPlugin,
  diffDates,
  diffPoints,
  disableCursor,
  elementClosest,
  elementMatches,
  enableCursor,
  eventTupleToStore,
  getClippingParents,
  getDefaultEventEnd,
  getElRoot,
  getElSeg,
  getEventTargetViaRoot,
  getRectCenter,
  getRelevantEvents,
  identity,
  interactionSettingsStore,
  interactionSettingsToStore,
  intersectRects,
  isDateSelectionValid,
  isDateSpansEqual,
  isInteractionValid,
  mapHash,
  parseDragMeta,
  parseEventDef,
  pointInsideRect,
  preventContextMenu,
  preventSelection,
  rangeContainsRange,
  refineEventDef,
  removeElement,
  startOfDay,
  triggerDateSelect,
  whenTransitionDone
} from "./chunk-ACIWJR3J.js";
import "./chunk-DFKQJ226.js";

// node_modules/@fullcalendar/interaction/main.js
config.touchMouseIgnoreWait = 500;
var ignoreMouseDepth = 0;
var listenerCnt = 0;
var isWindowTouchMoveCancelled = false;
var PointerDragging = (
  /** @class */
  function() {
    function PointerDragging2(containerEl) {
      var _this = this;
      this.subjectEl = null;
      this.selector = "";
      this.handleSelector = "";
      this.shouldIgnoreMove = false;
      this.shouldWatchScroll = true;
      this.isDragging = false;
      this.isTouchDragging = false;
      this.wasTouchScroll = false;
      this.handleMouseDown = function(ev) {
        if (!_this.shouldIgnoreMouse() && isPrimaryMouseButton(ev) && _this.tryStart(ev)) {
          var pev = _this.createEventFromMouse(ev, true);
          _this.emitter.trigger("pointerdown", pev);
          _this.initScrollWatch(pev);
          if (!_this.shouldIgnoreMove) {
            document.addEventListener("mousemove", _this.handleMouseMove);
          }
          document.addEventListener("mouseup", _this.handleMouseUp);
        }
      };
      this.handleMouseMove = function(ev) {
        var pev = _this.createEventFromMouse(ev);
        _this.recordCoords(pev);
        _this.emitter.trigger("pointermove", pev);
      };
      this.handleMouseUp = function(ev) {
        document.removeEventListener("mousemove", _this.handleMouseMove);
        document.removeEventListener("mouseup", _this.handleMouseUp);
        _this.emitter.trigger("pointerup", _this.createEventFromMouse(ev));
        _this.cleanup();
      };
      this.handleTouchStart = function(ev) {
        if (_this.tryStart(ev)) {
          _this.isTouchDragging = true;
          var pev = _this.createEventFromTouch(ev, true);
          _this.emitter.trigger("pointerdown", pev);
          _this.initScrollWatch(pev);
          var targetEl = ev.target;
          if (!_this.shouldIgnoreMove) {
            targetEl.addEventListener("touchmove", _this.handleTouchMove);
          }
          targetEl.addEventListener("touchend", _this.handleTouchEnd);
          targetEl.addEventListener("touchcancel", _this.handleTouchEnd);
          window.addEventListener("scroll", _this.handleTouchScroll, true);
        }
      };
      this.handleTouchMove = function(ev) {
        var pev = _this.createEventFromTouch(ev);
        _this.recordCoords(pev);
        _this.emitter.trigger("pointermove", pev);
      };
      this.handleTouchEnd = function(ev) {
        if (_this.isDragging) {
          var targetEl = ev.target;
          targetEl.removeEventListener("touchmove", _this.handleTouchMove);
          targetEl.removeEventListener("touchend", _this.handleTouchEnd);
          targetEl.removeEventListener("touchcancel", _this.handleTouchEnd);
          window.removeEventListener("scroll", _this.handleTouchScroll, true);
          _this.emitter.trigger("pointerup", _this.createEventFromTouch(ev));
          _this.cleanup();
          _this.isTouchDragging = false;
          startIgnoringMouse();
        }
      };
      this.handleTouchScroll = function() {
        _this.wasTouchScroll = true;
      };
      this.handleScroll = function(ev) {
        if (!_this.shouldIgnoreMove) {
          var pageX = window.pageXOffset - _this.prevScrollX + _this.prevPageX;
          var pageY = window.pageYOffset - _this.prevScrollY + _this.prevPageY;
          _this.emitter.trigger("pointermove", {
            origEvent: ev,
            isTouch: _this.isTouchDragging,
            subjectEl: _this.subjectEl,
            pageX,
            pageY,
            deltaX: pageX - _this.origPageX,
            deltaY: pageY - _this.origPageY
          });
        }
      };
      this.containerEl = containerEl;
      this.emitter = new Emitter();
      containerEl.addEventListener("mousedown", this.handleMouseDown);
      containerEl.addEventListener("touchstart", this.handleTouchStart, { passive: true });
      listenerCreated();
    }
    PointerDragging2.prototype.destroy = function() {
      this.containerEl.removeEventListener("mousedown", this.handleMouseDown);
      this.containerEl.removeEventListener("touchstart", this.handleTouchStart, { passive: true });
      listenerDestroyed();
    };
    PointerDragging2.prototype.tryStart = function(ev) {
      var subjectEl = this.querySubjectEl(ev);
      var downEl = ev.target;
      if (subjectEl && (!this.handleSelector || elementClosest(downEl, this.handleSelector))) {
        this.subjectEl = subjectEl;
        this.isDragging = true;
        this.wasTouchScroll = false;
        return true;
      }
      return false;
    };
    PointerDragging2.prototype.cleanup = function() {
      isWindowTouchMoveCancelled = false;
      this.isDragging = false;
      this.subjectEl = null;
      this.destroyScrollWatch();
    };
    PointerDragging2.prototype.querySubjectEl = function(ev) {
      if (this.selector) {
        return elementClosest(ev.target, this.selector);
      }
      return this.containerEl;
    };
    PointerDragging2.prototype.shouldIgnoreMouse = function() {
      return ignoreMouseDepth || this.isTouchDragging;
    };
    PointerDragging2.prototype.cancelTouchScroll = function() {
      if (this.isDragging) {
        isWindowTouchMoveCancelled = true;
      }
    };
    PointerDragging2.prototype.initScrollWatch = function(ev) {
      if (this.shouldWatchScroll) {
        this.recordCoords(ev);
        window.addEventListener("scroll", this.handleScroll, true);
      }
    };
    PointerDragging2.prototype.recordCoords = function(ev) {
      if (this.shouldWatchScroll) {
        this.prevPageX = ev.pageX;
        this.prevPageY = ev.pageY;
        this.prevScrollX = window.pageXOffset;
        this.prevScrollY = window.pageYOffset;
      }
    };
    PointerDragging2.prototype.destroyScrollWatch = function() {
      if (this.shouldWatchScroll) {
        window.removeEventListener("scroll", this.handleScroll, true);
      }
    };
    PointerDragging2.prototype.createEventFromMouse = function(ev, isFirst) {
      var deltaX = 0;
      var deltaY = 0;
      if (isFirst) {
        this.origPageX = ev.pageX;
        this.origPageY = ev.pageY;
      } else {
        deltaX = ev.pageX - this.origPageX;
        deltaY = ev.pageY - this.origPageY;
      }
      return {
        origEvent: ev,
        isTouch: false,
        subjectEl: this.subjectEl,
        pageX: ev.pageX,
        pageY: ev.pageY,
        deltaX,
        deltaY
      };
    };
    PointerDragging2.prototype.createEventFromTouch = function(ev, isFirst) {
      var touches = ev.touches;
      var pageX;
      var pageY;
      var deltaX = 0;
      var deltaY = 0;
      if (touches && touches.length) {
        pageX = touches[0].pageX;
        pageY = touches[0].pageY;
      } else {
        pageX = ev.pageX;
        pageY = ev.pageY;
      }
      if (isFirst) {
        this.origPageX = pageX;
        this.origPageY = pageY;
      } else {
        deltaX = pageX - this.origPageX;
        deltaY = pageY - this.origPageY;
      }
      return {
        origEvent: ev,
        isTouch: true,
        subjectEl: this.subjectEl,
        pageX,
        pageY,
        deltaX,
        deltaY
      };
    };
    return PointerDragging2;
  }()
);
function isPrimaryMouseButton(ev) {
  return ev.button === 0 && !ev.ctrlKey;
}
function startIgnoringMouse() {
  ignoreMouseDepth += 1;
  setTimeout(function() {
    ignoreMouseDepth -= 1;
  }, config.touchMouseIgnoreWait);
}
function listenerCreated() {
  listenerCnt += 1;
  if (listenerCnt === 1) {
    window.addEventListener("touchmove", onWindowTouchMove, { passive: false });
  }
}
function listenerDestroyed() {
  listenerCnt -= 1;
  if (!listenerCnt) {
    window.removeEventListener("touchmove", onWindowTouchMove, { passive: false });
  }
}
function onWindowTouchMove(ev) {
  if (isWindowTouchMoveCancelled) {
    ev.preventDefault();
  }
}
var ElementMirror = (
  /** @class */
  function() {
    function ElementMirror2() {
      this.isVisible = false;
      this.sourceEl = null;
      this.mirrorEl = null;
      this.sourceElRect = null;
      this.parentNode = document.body;
      this.zIndex = 9999;
      this.revertDuration = 0;
    }
    ElementMirror2.prototype.start = function(sourceEl, pageX, pageY) {
      this.sourceEl = sourceEl;
      this.sourceElRect = this.sourceEl.getBoundingClientRect();
      this.origScreenX = pageX - window.pageXOffset;
      this.origScreenY = pageY - window.pageYOffset;
      this.deltaX = 0;
      this.deltaY = 0;
      this.updateElPosition();
    };
    ElementMirror2.prototype.handleMove = function(pageX, pageY) {
      this.deltaX = pageX - window.pageXOffset - this.origScreenX;
      this.deltaY = pageY - window.pageYOffset - this.origScreenY;
      this.updateElPosition();
    };
    ElementMirror2.prototype.setIsVisible = function(bool) {
      if (bool) {
        if (!this.isVisible) {
          if (this.mirrorEl) {
            this.mirrorEl.style.display = "";
          }
          this.isVisible = bool;
          this.updateElPosition();
        }
      } else if (this.isVisible) {
        if (this.mirrorEl) {
          this.mirrorEl.style.display = "none";
        }
        this.isVisible = bool;
      }
    };
    ElementMirror2.prototype.stop = function(needsRevertAnimation, callback) {
      var _this = this;
      var done = function() {
        _this.cleanup();
        callback();
      };
      if (needsRevertAnimation && this.mirrorEl && this.isVisible && this.revertDuration && // if 0, transition won't work
      (this.deltaX || this.deltaY)) {
        this.doRevertAnimation(done, this.revertDuration);
      } else {
        setTimeout(done, 0);
      }
    };
    ElementMirror2.prototype.doRevertAnimation = function(callback, revertDuration) {
      var mirrorEl = this.mirrorEl;
      var finalSourceElRect = this.sourceEl.getBoundingClientRect();
      mirrorEl.style.transition = "top " + revertDuration + "ms,left " + revertDuration + "ms";
      applyStyle(mirrorEl, {
        left: finalSourceElRect.left,
        top: finalSourceElRect.top
      });
      whenTransitionDone(mirrorEl, function() {
        mirrorEl.style.transition = "";
        callback();
      });
    };
    ElementMirror2.prototype.cleanup = function() {
      if (this.mirrorEl) {
        removeElement(this.mirrorEl);
        this.mirrorEl = null;
      }
      this.sourceEl = null;
    };
    ElementMirror2.prototype.updateElPosition = function() {
      if (this.sourceEl && this.isVisible) {
        applyStyle(this.getMirrorEl(), {
          left: this.sourceElRect.left + this.deltaX,
          top: this.sourceElRect.top + this.deltaY
        });
      }
    };
    ElementMirror2.prototype.getMirrorEl = function() {
      var sourceElRect = this.sourceElRect;
      var mirrorEl = this.mirrorEl;
      if (!mirrorEl) {
        mirrorEl = this.mirrorEl = this.sourceEl.cloneNode(true);
        mirrorEl.classList.add("fc-unselectable");
        mirrorEl.classList.add("fc-event-dragging");
        applyStyle(mirrorEl, {
          position: "fixed",
          zIndex: this.zIndex,
          visibility: "",
          boxSizing: "border-box",
          width: sourceElRect.right - sourceElRect.left,
          height: sourceElRect.bottom - sourceElRect.top,
          right: "auto",
          bottom: "auto",
          margin: 0
        });
        this.parentNode.appendChild(mirrorEl);
      }
      return mirrorEl;
    };
    return ElementMirror2;
  }()
);
var ScrollGeomCache = (
  /** @class */
  function(_super) {
    __extends(ScrollGeomCache2, _super);
    function ScrollGeomCache2(scrollController, doesListening) {
      var _this = _super.call(this) || this;
      _this.handleScroll = function() {
        _this.scrollTop = _this.scrollController.getScrollTop();
        _this.scrollLeft = _this.scrollController.getScrollLeft();
        _this.handleScrollChange();
      };
      _this.scrollController = scrollController;
      _this.doesListening = doesListening;
      _this.scrollTop = _this.origScrollTop = scrollController.getScrollTop();
      _this.scrollLeft = _this.origScrollLeft = scrollController.getScrollLeft();
      _this.scrollWidth = scrollController.getScrollWidth();
      _this.scrollHeight = scrollController.getScrollHeight();
      _this.clientWidth = scrollController.getClientWidth();
      _this.clientHeight = scrollController.getClientHeight();
      _this.clientRect = _this.computeClientRect();
      if (_this.doesListening) {
        _this.getEventTarget().addEventListener("scroll", _this.handleScroll);
      }
      return _this;
    }
    ScrollGeomCache2.prototype.destroy = function() {
      if (this.doesListening) {
        this.getEventTarget().removeEventListener("scroll", this.handleScroll);
      }
    };
    ScrollGeomCache2.prototype.getScrollTop = function() {
      return this.scrollTop;
    };
    ScrollGeomCache2.prototype.getScrollLeft = function() {
      return this.scrollLeft;
    };
    ScrollGeomCache2.prototype.setScrollTop = function(top) {
      this.scrollController.setScrollTop(top);
      if (!this.doesListening) {
        this.scrollTop = Math.max(Math.min(top, this.getMaxScrollTop()), 0);
        this.handleScrollChange();
      }
    };
    ScrollGeomCache2.prototype.setScrollLeft = function(top) {
      this.scrollController.setScrollLeft(top);
      if (!this.doesListening) {
        this.scrollLeft = Math.max(Math.min(top, this.getMaxScrollLeft()), 0);
        this.handleScrollChange();
      }
    };
    ScrollGeomCache2.prototype.getClientWidth = function() {
      return this.clientWidth;
    };
    ScrollGeomCache2.prototype.getClientHeight = function() {
      return this.clientHeight;
    };
    ScrollGeomCache2.prototype.getScrollWidth = function() {
      return this.scrollWidth;
    };
    ScrollGeomCache2.prototype.getScrollHeight = function() {
      return this.scrollHeight;
    };
    ScrollGeomCache2.prototype.handleScrollChange = function() {
    };
    return ScrollGeomCache2;
  }(ScrollController)
);
var ElementScrollGeomCache = (
  /** @class */
  function(_super) {
    __extends(ElementScrollGeomCache2, _super);
    function ElementScrollGeomCache2(el, doesListening) {
      return _super.call(this, new ElementScrollController(el), doesListening) || this;
    }
    ElementScrollGeomCache2.prototype.getEventTarget = function() {
      return this.scrollController.el;
    };
    ElementScrollGeomCache2.prototype.computeClientRect = function() {
      return computeInnerRect(this.scrollController.el);
    };
    return ElementScrollGeomCache2;
  }(ScrollGeomCache)
);
var WindowScrollGeomCache = (
  /** @class */
  function(_super) {
    __extends(WindowScrollGeomCache2, _super);
    function WindowScrollGeomCache2(doesListening) {
      return _super.call(this, new WindowScrollController(), doesListening) || this;
    }
    WindowScrollGeomCache2.prototype.getEventTarget = function() {
      return window;
    };
    WindowScrollGeomCache2.prototype.computeClientRect = function() {
      return {
        left: this.scrollLeft,
        right: this.scrollLeft + this.clientWidth,
        top: this.scrollTop,
        bottom: this.scrollTop + this.clientHeight
      };
    };
    WindowScrollGeomCache2.prototype.handleScrollChange = function() {
      this.clientRect = this.computeClientRect();
    };
    return WindowScrollGeomCache2;
  }(ScrollGeomCache)
);
var getTime = typeof performance === "function" ? performance.now : Date.now;
var AutoScroller = (
  /** @class */
  function() {
    function AutoScroller2() {
      var _this = this;
      this.isEnabled = true;
      this.scrollQuery = [window, ".fc-scroller"];
      this.edgeThreshold = 50;
      this.maxVelocity = 300;
      this.pointerScreenX = null;
      this.pointerScreenY = null;
      this.isAnimating = false;
      this.scrollCaches = null;
      this.everMovedUp = false;
      this.everMovedDown = false;
      this.everMovedLeft = false;
      this.everMovedRight = false;
      this.animate = function() {
        if (_this.isAnimating) {
          var edge = _this.computeBestEdge(_this.pointerScreenX + window.pageXOffset, _this.pointerScreenY + window.pageYOffset);
          if (edge) {
            var now = getTime();
            _this.handleSide(edge, (now - _this.msSinceRequest) / 1e3);
            _this.requestAnimation(now);
          } else {
            _this.isAnimating = false;
          }
        }
      };
    }
    AutoScroller2.prototype.start = function(pageX, pageY, scrollStartEl) {
      if (this.isEnabled) {
        this.scrollCaches = this.buildCaches(scrollStartEl);
        this.pointerScreenX = null;
        this.pointerScreenY = null;
        this.everMovedUp = false;
        this.everMovedDown = false;
        this.everMovedLeft = false;
        this.everMovedRight = false;
        this.handleMove(pageX, pageY);
      }
    };
    AutoScroller2.prototype.handleMove = function(pageX, pageY) {
      if (this.isEnabled) {
        var pointerScreenX = pageX - window.pageXOffset;
        var pointerScreenY = pageY - window.pageYOffset;
        var yDelta = this.pointerScreenY === null ? 0 : pointerScreenY - this.pointerScreenY;
        var xDelta = this.pointerScreenX === null ? 0 : pointerScreenX - this.pointerScreenX;
        if (yDelta < 0) {
          this.everMovedUp = true;
        } else if (yDelta > 0) {
          this.everMovedDown = true;
        }
        if (xDelta < 0) {
          this.everMovedLeft = true;
        } else if (xDelta > 0) {
          this.everMovedRight = true;
        }
        this.pointerScreenX = pointerScreenX;
        this.pointerScreenY = pointerScreenY;
        if (!this.isAnimating) {
          this.isAnimating = true;
          this.requestAnimation(getTime());
        }
      }
    };
    AutoScroller2.prototype.stop = function() {
      if (this.isEnabled) {
        this.isAnimating = false;
        for (var _i = 0, _a = this.scrollCaches; _i < _a.length; _i++) {
          var scrollCache = _a[_i];
          scrollCache.destroy();
        }
        this.scrollCaches = null;
      }
    };
    AutoScroller2.prototype.requestAnimation = function(now) {
      this.msSinceRequest = now;
      requestAnimationFrame(this.animate);
    };
    AutoScroller2.prototype.handleSide = function(edge, seconds) {
      var scrollCache = edge.scrollCache;
      var edgeThreshold = this.edgeThreshold;
      var invDistance = edgeThreshold - edge.distance;
      var velocity = (
        // the closer to the edge, the faster we scroll
        invDistance * invDistance / (edgeThreshold * edgeThreshold) * // quadratic
        this.maxVelocity * seconds
      );
      var sign = 1;
      switch (edge.name) {
        case "left":
          sign = -1;
        case "right":
          scrollCache.setScrollLeft(scrollCache.getScrollLeft() + velocity * sign);
          break;
        case "top":
          sign = -1;
        case "bottom":
          scrollCache.setScrollTop(scrollCache.getScrollTop() + velocity * sign);
          break;
      }
    };
    AutoScroller2.prototype.computeBestEdge = function(left, top) {
      var edgeThreshold = this.edgeThreshold;
      var bestSide = null;
      var scrollCaches = this.scrollCaches || [];
      for (var _i = 0, scrollCaches_1 = scrollCaches; _i < scrollCaches_1.length; _i++) {
        var scrollCache = scrollCaches_1[_i];
        var rect = scrollCache.clientRect;
        var leftDist = left - rect.left;
        var rightDist = rect.right - left;
        var topDist = top - rect.top;
        var bottomDist = rect.bottom - top;
        if (leftDist >= 0 && rightDist >= 0 && topDist >= 0 && bottomDist >= 0) {
          if (topDist <= edgeThreshold && this.everMovedUp && scrollCache.canScrollUp() && (!bestSide || bestSide.distance > topDist)) {
            bestSide = { scrollCache, name: "top", distance: topDist };
          }
          if (bottomDist <= edgeThreshold && this.everMovedDown && scrollCache.canScrollDown() && (!bestSide || bestSide.distance > bottomDist)) {
            bestSide = { scrollCache, name: "bottom", distance: bottomDist };
          }
          if (leftDist <= edgeThreshold && this.everMovedLeft && scrollCache.canScrollLeft() && (!bestSide || bestSide.distance > leftDist)) {
            bestSide = { scrollCache, name: "left", distance: leftDist };
          }
          if (rightDist <= edgeThreshold && this.everMovedRight && scrollCache.canScrollRight() && (!bestSide || bestSide.distance > rightDist)) {
            bestSide = { scrollCache, name: "right", distance: rightDist };
          }
        }
      }
      return bestSide;
    };
    AutoScroller2.prototype.buildCaches = function(scrollStartEl) {
      return this.queryScrollEls(scrollStartEl).map(function(el) {
        if (el === window) {
          return new WindowScrollGeomCache(false);
        }
        return new ElementScrollGeomCache(el, false);
      });
    };
    AutoScroller2.prototype.queryScrollEls = function(scrollStartEl) {
      var els = [];
      for (var _i = 0, _a = this.scrollQuery; _i < _a.length; _i++) {
        var query = _a[_i];
        if (typeof query === "object") {
          els.push(query);
        } else {
          els.push.apply(els, Array.prototype.slice.call(getElRoot(scrollStartEl).querySelectorAll(query)));
        }
      }
      return els;
    };
    return AutoScroller2;
  }()
);
var FeaturefulElementDragging = (
  /** @class */
  function(_super) {
    __extends(FeaturefulElementDragging2, _super);
    function FeaturefulElementDragging2(containerEl, selector) {
      var _this = _super.call(this, containerEl) || this;
      _this.containerEl = containerEl;
      _this.delay = null;
      _this.minDistance = 0;
      _this.touchScrollAllowed = true;
      _this.mirrorNeedsRevert = false;
      _this.isInteracting = false;
      _this.isDragging = false;
      _this.isDelayEnded = false;
      _this.isDistanceSurpassed = false;
      _this.delayTimeoutId = null;
      _this.onPointerDown = function(ev) {
        if (!_this.isDragging) {
          _this.isInteracting = true;
          _this.isDelayEnded = false;
          _this.isDistanceSurpassed = false;
          preventSelection(document.body);
          preventContextMenu(document.body);
          if (!ev.isTouch) {
            ev.origEvent.preventDefault();
          }
          _this.emitter.trigger("pointerdown", ev);
          if (_this.isInteracting && // not destroyed via pointerdown handler
          !_this.pointer.shouldIgnoreMove) {
            _this.mirror.setIsVisible(false);
            _this.mirror.start(ev.subjectEl, ev.pageX, ev.pageY);
            _this.startDelay(ev);
            if (!_this.minDistance) {
              _this.handleDistanceSurpassed(ev);
            }
          }
        }
      };
      _this.onPointerMove = function(ev) {
        if (_this.isInteracting) {
          _this.emitter.trigger("pointermove", ev);
          if (!_this.isDistanceSurpassed) {
            var minDistance = _this.minDistance;
            var distanceSq = void 0;
            var deltaX = ev.deltaX, deltaY = ev.deltaY;
            distanceSq = deltaX * deltaX + deltaY * deltaY;
            if (distanceSq >= minDistance * minDistance) {
              _this.handleDistanceSurpassed(ev);
            }
          }
          if (_this.isDragging) {
            if (ev.origEvent.type !== "scroll") {
              _this.mirror.handleMove(ev.pageX, ev.pageY);
              _this.autoScroller.handleMove(ev.pageX, ev.pageY);
            }
            _this.emitter.trigger("dragmove", ev);
          }
        }
      };
      _this.onPointerUp = function(ev) {
        if (_this.isInteracting) {
          _this.isInteracting = false;
          allowSelection(document.body);
          allowContextMenu(document.body);
          _this.emitter.trigger("pointerup", ev);
          if (_this.isDragging) {
            _this.autoScroller.stop();
            _this.tryStopDrag(ev);
          }
          if (_this.delayTimeoutId) {
            clearTimeout(_this.delayTimeoutId);
            _this.delayTimeoutId = null;
          }
        }
      };
      var pointer = _this.pointer = new PointerDragging(containerEl);
      pointer.emitter.on("pointerdown", _this.onPointerDown);
      pointer.emitter.on("pointermove", _this.onPointerMove);
      pointer.emitter.on("pointerup", _this.onPointerUp);
      if (selector) {
        pointer.selector = selector;
      }
      _this.mirror = new ElementMirror();
      _this.autoScroller = new AutoScroller();
      return _this;
    }
    FeaturefulElementDragging2.prototype.destroy = function() {
      this.pointer.destroy();
      this.onPointerUp({});
    };
    FeaturefulElementDragging2.prototype.startDelay = function(ev) {
      var _this = this;
      if (typeof this.delay === "number") {
        this.delayTimeoutId = setTimeout(function() {
          _this.delayTimeoutId = null;
          _this.handleDelayEnd(ev);
        }, this.delay);
      } else {
        this.handleDelayEnd(ev);
      }
    };
    FeaturefulElementDragging2.prototype.handleDelayEnd = function(ev) {
      this.isDelayEnded = true;
      this.tryStartDrag(ev);
    };
    FeaturefulElementDragging2.prototype.handleDistanceSurpassed = function(ev) {
      this.isDistanceSurpassed = true;
      this.tryStartDrag(ev);
    };
    FeaturefulElementDragging2.prototype.tryStartDrag = function(ev) {
      if (this.isDelayEnded && this.isDistanceSurpassed) {
        if (!this.pointer.wasTouchScroll || this.touchScrollAllowed) {
          this.isDragging = true;
          this.mirrorNeedsRevert = false;
          this.autoScroller.start(ev.pageX, ev.pageY, this.containerEl);
          this.emitter.trigger("dragstart", ev);
          if (this.touchScrollAllowed === false) {
            this.pointer.cancelTouchScroll();
          }
        }
      }
    };
    FeaturefulElementDragging2.prototype.tryStopDrag = function(ev) {
      this.mirror.stop(this.mirrorNeedsRevert, this.stopDrag.bind(this, ev));
    };
    FeaturefulElementDragging2.prototype.stopDrag = function(ev) {
      this.isDragging = false;
      this.emitter.trigger("dragend", ev);
    };
    FeaturefulElementDragging2.prototype.setIgnoreMove = function(bool) {
      this.pointer.shouldIgnoreMove = bool;
    };
    FeaturefulElementDragging2.prototype.setMirrorIsVisible = function(bool) {
      this.mirror.setIsVisible(bool);
    };
    FeaturefulElementDragging2.prototype.setMirrorNeedsRevert = function(bool) {
      this.mirrorNeedsRevert = bool;
    };
    FeaturefulElementDragging2.prototype.setAutoScrollEnabled = function(bool) {
      this.autoScroller.isEnabled = bool;
    };
    return FeaturefulElementDragging2;
  }(ElementDragging)
);
var OffsetTracker = (
  /** @class */
  function() {
    function OffsetTracker2(el) {
      this.origRect = computeRect(el);
      this.scrollCaches = getClippingParents(el).map(function(scrollEl) {
        return new ElementScrollGeomCache(scrollEl, true);
      });
    }
    OffsetTracker2.prototype.destroy = function() {
      for (var _i = 0, _a = this.scrollCaches; _i < _a.length; _i++) {
        var scrollCache = _a[_i];
        scrollCache.destroy();
      }
    };
    OffsetTracker2.prototype.computeLeft = function() {
      var left = this.origRect.left;
      for (var _i = 0, _a = this.scrollCaches; _i < _a.length; _i++) {
        var scrollCache = _a[_i];
        left += scrollCache.origScrollLeft - scrollCache.getScrollLeft();
      }
      return left;
    };
    OffsetTracker2.prototype.computeTop = function() {
      var top = this.origRect.top;
      for (var _i = 0, _a = this.scrollCaches; _i < _a.length; _i++) {
        var scrollCache = _a[_i];
        top += scrollCache.origScrollTop - scrollCache.getScrollTop();
      }
      return top;
    };
    OffsetTracker2.prototype.isWithinClipping = function(pageX, pageY) {
      var point = { left: pageX, top: pageY };
      for (var _i = 0, _a = this.scrollCaches; _i < _a.length; _i++) {
        var scrollCache = _a[_i];
        if (!isIgnoredClipping(scrollCache.getEventTarget()) && !pointInsideRect(point, scrollCache.clientRect)) {
          return false;
        }
      }
      return true;
    };
    return OffsetTracker2;
  }()
);
function isIgnoredClipping(node) {
  var tagName = node.tagName;
  return tagName === "HTML" || tagName === "BODY";
}
var HitDragging = (
  /** @class */
  function() {
    function HitDragging2(dragging, droppableStore) {
      var _this = this;
      this.useSubjectCenter = false;
      this.requireInitial = true;
      this.initialHit = null;
      this.movingHit = null;
      this.finalHit = null;
      this.handlePointerDown = function(ev) {
        var dragging2 = _this.dragging;
        _this.initialHit = null;
        _this.movingHit = null;
        _this.finalHit = null;
        _this.prepareHits();
        _this.processFirstCoord(ev);
        if (_this.initialHit || !_this.requireInitial) {
          dragging2.setIgnoreMove(false);
          _this.emitter.trigger("pointerdown", ev);
        } else {
          dragging2.setIgnoreMove(true);
        }
      };
      this.handleDragStart = function(ev) {
        _this.emitter.trigger("dragstart", ev);
        _this.handleMove(ev, true);
      };
      this.handleDragMove = function(ev) {
        _this.emitter.trigger("dragmove", ev);
        _this.handleMove(ev);
      };
      this.handlePointerUp = function(ev) {
        _this.releaseHits();
        _this.emitter.trigger("pointerup", ev);
      };
      this.handleDragEnd = function(ev) {
        if (_this.movingHit) {
          _this.emitter.trigger("hitupdate", null, true, ev);
        }
        _this.finalHit = _this.movingHit;
        _this.movingHit = null;
        _this.emitter.trigger("dragend", ev);
      };
      this.droppableStore = droppableStore;
      dragging.emitter.on("pointerdown", this.handlePointerDown);
      dragging.emitter.on("dragstart", this.handleDragStart);
      dragging.emitter.on("dragmove", this.handleDragMove);
      dragging.emitter.on("pointerup", this.handlePointerUp);
      dragging.emitter.on("dragend", this.handleDragEnd);
      this.dragging = dragging;
      this.emitter = new Emitter();
    }
    HitDragging2.prototype.processFirstCoord = function(ev) {
      var origPoint = { left: ev.pageX, top: ev.pageY };
      var adjustedPoint = origPoint;
      var subjectEl = ev.subjectEl;
      var subjectRect;
      if (subjectEl instanceof HTMLElement) {
        subjectRect = computeRect(subjectEl);
        adjustedPoint = constrainPoint(adjustedPoint, subjectRect);
      }
      var initialHit = this.initialHit = this.queryHitForOffset(adjustedPoint.left, adjustedPoint.top);
      if (initialHit) {
        if (this.useSubjectCenter && subjectRect) {
          var slicedSubjectRect = intersectRects(subjectRect, initialHit.rect);
          if (slicedSubjectRect) {
            adjustedPoint = getRectCenter(slicedSubjectRect);
          }
        }
        this.coordAdjust = diffPoints(adjustedPoint, origPoint);
      } else {
        this.coordAdjust = { left: 0, top: 0 };
      }
    };
    HitDragging2.prototype.handleMove = function(ev, forceHandle) {
      var hit = this.queryHitForOffset(ev.pageX + this.coordAdjust.left, ev.pageY + this.coordAdjust.top);
      if (forceHandle || !isHitsEqual(this.movingHit, hit)) {
        this.movingHit = hit;
        this.emitter.trigger("hitupdate", hit, false, ev);
      }
    };
    HitDragging2.prototype.prepareHits = function() {
      this.offsetTrackers = mapHash(this.droppableStore, function(interactionSettings) {
        interactionSettings.component.prepareHits();
        return new OffsetTracker(interactionSettings.el);
      });
    };
    HitDragging2.prototype.releaseHits = function() {
      var offsetTrackers = this.offsetTrackers;
      for (var id in offsetTrackers) {
        offsetTrackers[id].destroy();
      }
      this.offsetTrackers = {};
    };
    HitDragging2.prototype.queryHitForOffset = function(offsetLeft, offsetTop) {
      var _a = this, droppableStore = _a.droppableStore, offsetTrackers = _a.offsetTrackers;
      var bestHit = null;
      for (var id in droppableStore) {
        var component = droppableStore[id].component;
        var offsetTracker = offsetTrackers[id];
        if (offsetTracker && // wasn't destroyed mid-drag
        offsetTracker.isWithinClipping(offsetLeft, offsetTop)) {
          var originLeft = offsetTracker.computeLeft();
          var originTop = offsetTracker.computeTop();
          var positionLeft = offsetLeft - originLeft;
          var positionTop = offsetTop - originTop;
          var origRect = offsetTracker.origRect;
          var width = origRect.right - origRect.left;
          var height = origRect.bottom - origRect.top;
          if (
            // must be within the element's bounds
            positionLeft >= 0 && positionLeft < width && positionTop >= 0 && positionTop < height
          ) {
            var hit = component.queryHit(positionLeft, positionTop, width, height);
            if (hit && // make sure the hit is within activeRange, meaning it's not a dead cell
            rangeContainsRange(hit.dateProfile.activeRange, hit.dateSpan.range) && (!bestHit || hit.layer > bestHit.layer)) {
              hit.componentId = id;
              hit.context = component.context;
              hit.rect.left += originLeft;
              hit.rect.right += originLeft;
              hit.rect.top += originTop;
              hit.rect.bottom += originTop;
              bestHit = hit;
            }
          }
        }
      }
      return bestHit;
    };
    return HitDragging2;
  }()
);
function isHitsEqual(hit0, hit1) {
  if (!hit0 && !hit1) {
    return true;
  }
  if (Boolean(hit0) !== Boolean(hit1)) {
    return false;
  }
  return isDateSpansEqual(hit0.dateSpan, hit1.dateSpan);
}
function buildDatePointApiWithContext(dateSpan, context) {
  var props = {};
  for (var _i = 0, _a = context.pluginHooks.datePointTransforms; _i < _a.length; _i++) {
    var transform = _a[_i];
    __assign(props, transform(dateSpan, context));
  }
  __assign(props, buildDatePointApi(dateSpan, context.dateEnv));
  return props;
}
function buildDatePointApi(span, dateEnv) {
  return {
    date: dateEnv.toDate(span.range.start),
    dateStr: dateEnv.formatIso(span.range.start, { omitTime: span.allDay }),
    allDay: span.allDay
  };
}
var DateClicking = (
  /** @class */
  function(_super) {
    __extends(DateClicking2, _super);
    function DateClicking2(settings) {
      var _this = _super.call(this, settings) || this;
      _this.handlePointerDown = function(pev) {
        var dragging = _this.dragging;
        var downEl = pev.origEvent.target;
        dragging.setIgnoreMove(!_this.component.isValidDateDownEl(downEl));
      };
      _this.handleDragEnd = function(ev) {
        var component = _this.component;
        var pointer = _this.dragging.pointer;
        if (!pointer.wasTouchScroll) {
          var _a = _this.hitDragging, initialHit = _a.initialHit, finalHit = _a.finalHit;
          if (initialHit && finalHit && isHitsEqual(initialHit, finalHit)) {
            var context = component.context;
            var arg = __assign(__assign({}, buildDatePointApiWithContext(initialHit.dateSpan, context)), { dayEl: initialHit.dayEl, jsEvent: ev.origEvent, view: context.viewApi || context.calendarApi.view });
            context.emitter.trigger("dateClick", arg);
          }
        }
      };
      _this.dragging = new FeaturefulElementDragging(settings.el);
      _this.dragging.autoScroller.isEnabled = false;
      var hitDragging = _this.hitDragging = new HitDragging(_this.dragging, interactionSettingsToStore(settings));
      hitDragging.emitter.on("pointerdown", _this.handlePointerDown);
      hitDragging.emitter.on("dragend", _this.handleDragEnd);
      return _this;
    }
    DateClicking2.prototype.destroy = function() {
      this.dragging.destroy();
    };
    return DateClicking2;
  }(Interaction)
);
var DateSelecting = (
  /** @class */
  function(_super) {
    __extends(DateSelecting2, _super);
    function DateSelecting2(settings) {
      var _this = _super.call(this, settings) || this;
      _this.dragSelection = null;
      _this.handlePointerDown = function(ev) {
        var _a = _this, component2 = _a.component, dragging2 = _a.dragging;
        var options2 = component2.context.options;
        var canSelect = options2.selectable && component2.isValidDateDownEl(ev.origEvent.target);
        dragging2.setIgnoreMove(!canSelect);
        dragging2.delay = ev.isTouch ? getComponentTouchDelay$1(component2) : null;
      };
      _this.handleDragStart = function(ev) {
        _this.component.context.calendarApi.unselect(ev);
      };
      _this.handleHitUpdate = function(hit, isFinal) {
        var context = _this.component.context;
        var dragSelection = null;
        var isInvalid = false;
        if (hit) {
          var initialHit = _this.hitDragging.initialHit;
          var disallowed = hit.componentId === initialHit.componentId && _this.isHitComboAllowed && !_this.isHitComboAllowed(initialHit, hit);
          if (!disallowed) {
            dragSelection = joinHitsIntoSelection(initialHit, hit, context.pluginHooks.dateSelectionTransformers);
          }
          if (!dragSelection || !isDateSelectionValid(dragSelection, hit.dateProfile, context)) {
            isInvalid = true;
            dragSelection = null;
          }
        }
        if (dragSelection) {
          context.dispatch({ type: "SELECT_DATES", selection: dragSelection });
        } else if (!isFinal) {
          context.dispatch({ type: "UNSELECT_DATES" });
        }
        if (!isInvalid) {
          enableCursor();
        } else {
          disableCursor();
        }
        if (!isFinal) {
          _this.dragSelection = dragSelection;
        }
      };
      _this.handlePointerUp = function(pev) {
        if (_this.dragSelection) {
          triggerDateSelect(_this.dragSelection, pev, _this.component.context);
          _this.dragSelection = null;
        }
      };
      var component = settings.component;
      var options = component.context.options;
      var dragging = _this.dragging = new FeaturefulElementDragging(settings.el);
      dragging.touchScrollAllowed = false;
      dragging.minDistance = options.selectMinDistance || 0;
      dragging.autoScroller.isEnabled = options.dragScroll;
      var hitDragging = _this.hitDragging = new HitDragging(_this.dragging, interactionSettingsToStore(settings));
      hitDragging.emitter.on("pointerdown", _this.handlePointerDown);
      hitDragging.emitter.on("dragstart", _this.handleDragStart);
      hitDragging.emitter.on("hitupdate", _this.handleHitUpdate);
      hitDragging.emitter.on("pointerup", _this.handlePointerUp);
      return _this;
    }
    DateSelecting2.prototype.destroy = function() {
      this.dragging.destroy();
    };
    return DateSelecting2;
  }(Interaction)
);
function getComponentTouchDelay$1(component) {
  var options = component.context.options;
  var delay = options.selectLongPressDelay;
  if (delay == null) {
    delay = options.longPressDelay;
  }
  return delay;
}
function joinHitsIntoSelection(hit0, hit1, dateSelectionTransformers) {
  var dateSpan0 = hit0.dateSpan;
  var dateSpan1 = hit1.dateSpan;
  var ms = [
    dateSpan0.range.start,
    dateSpan0.range.end,
    dateSpan1.range.start,
    dateSpan1.range.end
  ];
  ms.sort(compareNumbers);
  var props = {};
  for (var _i = 0, dateSelectionTransformers_1 = dateSelectionTransformers; _i < dateSelectionTransformers_1.length; _i++) {
    var transformer = dateSelectionTransformers_1[_i];
    var res = transformer(hit0, hit1);
    if (res === false) {
      return null;
    }
    if (res) {
      __assign(props, res);
    }
  }
  props.range = { start: ms[0], end: ms[3] };
  props.allDay = dateSpan0.allDay;
  return props;
}
var EventDragging = (
  /** @class */
  function(_super) {
    __extends(EventDragging2, _super);
    function EventDragging2(settings) {
      var _this = _super.call(this, settings) || this;
      _this.subjectEl = null;
      _this.subjectSeg = null;
      _this.isDragging = false;
      _this.eventRange = null;
      _this.relevantEvents = null;
      _this.receivingContext = null;
      _this.validMutation = null;
      _this.mutatedRelevantEvents = null;
      _this.handlePointerDown = function(ev) {
        var origTarget = ev.origEvent.target;
        var _a = _this, component2 = _a.component, dragging2 = _a.dragging;
        var mirror = dragging2.mirror;
        var options2 = component2.context.options;
        var initialContext = component2.context;
        _this.subjectEl = ev.subjectEl;
        var subjectSeg = _this.subjectSeg = getElSeg(ev.subjectEl);
        var eventRange = _this.eventRange = subjectSeg.eventRange;
        var eventInstanceId = eventRange.instance.instanceId;
        _this.relevantEvents = getRelevantEvents(initialContext.getCurrentData().eventStore, eventInstanceId);
        dragging2.minDistance = ev.isTouch ? 0 : options2.eventDragMinDistance;
        dragging2.delay = // only do a touch delay if touch and this event hasn't been selected yet
        ev.isTouch && eventInstanceId !== component2.props.eventSelection ? getComponentTouchDelay(component2) : null;
        if (options2.fixedMirrorParent) {
          mirror.parentNode = options2.fixedMirrorParent;
        } else {
          mirror.parentNode = elementClosest(origTarget, ".fc");
        }
        mirror.revertDuration = options2.dragRevertDuration;
        var isValid = component2.isValidSegDownEl(origTarget) && !elementClosest(origTarget, ".fc-event-resizer");
        dragging2.setIgnoreMove(!isValid);
        _this.isDragging = isValid && ev.subjectEl.classList.contains("fc-event-draggable");
      };
      _this.handleDragStart = function(ev) {
        var initialContext = _this.component.context;
        var eventRange = _this.eventRange;
        var eventInstanceId = eventRange.instance.instanceId;
        if (ev.isTouch) {
          if (eventInstanceId !== _this.component.props.eventSelection) {
            initialContext.dispatch({ type: "SELECT_EVENT", eventInstanceId });
          }
        } else {
          initialContext.dispatch({ type: "UNSELECT_EVENT" });
        }
        if (_this.isDragging) {
          initialContext.calendarApi.unselect(ev);
          initialContext.emitter.trigger("eventDragStart", {
            el: _this.subjectEl,
            event: new EventApi(initialContext, eventRange.def, eventRange.instance),
            jsEvent: ev.origEvent,
            view: initialContext.viewApi
          });
        }
      };
      _this.handleHitUpdate = function(hit, isFinal) {
        if (!_this.isDragging) {
          return;
        }
        var relevantEvents = _this.relevantEvents;
        var initialHit = _this.hitDragging.initialHit;
        var initialContext = _this.component.context;
        var receivingContext = null;
        var mutation = null;
        var mutatedRelevantEvents = null;
        var isInvalid = false;
        var interaction = {
          affectedEvents: relevantEvents,
          mutatedEvents: createEmptyEventStore(),
          isEvent: true
        };
        if (hit) {
          receivingContext = hit.context;
          var receivingOptions = receivingContext.options;
          if (initialContext === receivingContext || receivingOptions.editable && receivingOptions.droppable) {
            mutation = computeEventMutation(initialHit, hit, receivingContext.getCurrentData().pluginHooks.eventDragMutationMassagers);
            if (mutation) {
              mutatedRelevantEvents = applyMutationToEventStore(relevantEvents, receivingContext.getCurrentData().eventUiBases, mutation, receivingContext);
              interaction.mutatedEvents = mutatedRelevantEvents;
              if (!isInteractionValid(interaction, hit.dateProfile, receivingContext)) {
                isInvalid = true;
                mutation = null;
                mutatedRelevantEvents = null;
                interaction.mutatedEvents = createEmptyEventStore();
              }
            }
          } else {
            receivingContext = null;
          }
        }
        _this.displayDrag(receivingContext, interaction);
        if (!isInvalid) {
          enableCursor();
        } else {
          disableCursor();
        }
        if (!isFinal) {
          if (initialContext === receivingContext && // TODO: write test for this
          isHitsEqual(initialHit, hit)) {
            mutation = null;
          }
          _this.dragging.setMirrorNeedsRevert(!mutation);
          _this.dragging.setMirrorIsVisible(!hit || !getElRoot(_this.subjectEl).querySelector(".fc-event-mirror"));
          _this.receivingContext = receivingContext;
          _this.validMutation = mutation;
          _this.mutatedRelevantEvents = mutatedRelevantEvents;
        }
      };
      _this.handlePointerUp = function() {
        if (!_this.isDragging) {
          _this.cleanup();
        }
      };
      _this.handleDragEnd = function(ev) {
        if (_this.isDragging) {
          var initialContext_1 = _this.component.context;
          var initialView = initialContext_1.viewApi;
          var _a = _this, receivingContext_1 = _a.receivingContext, validMutation = _a.validMutation;
          var eventDef = _this.eventRange.def;
          var eventInstance = _this.eventRange.instance;
          var eventApi = new EventApi(initialContext_1, eventDef, eventInstance);
          var relevantEvents_1 = _this.relevantEvents;
          var mutatedRelevantEvents_1 = _this.mutatedRelevantEvents;
          var finalHit = _this.hitDragging.finalHit;
          _this.clearDrag();
          initialContext_1.emitter.trigger("eventDragStop", {
            el: _this.subjectEl,
            event: eventApi,
            jsEvent: ev.origEvent,
            view: initialView
          });
          if (validMutation) {
            if (receivingContext_1 === initialContext_1) {
              var updatedEventApi = new EventApi(initialContext_1, mutatedRelevantEvents_1.defs[eventDef.defId], eventInstance ? mutatedRelevantEvents_1.instances[eventInstance.instanceId] : null);
              initialContext_1.dispatch({
                type: "MERGE_EVENTS",
                eventStore: mutatedRelevantEvents_1
              });
              var eventChangeArg = {
                oldEvent: eventApi,
                event: updatedEventApi,
                relatedEvents: buildEventApis(mutatedRelevantEvents_1, initialContext_1, eventInstance),
                revert: function() {
                  initialContext_1.dispatch({
                    type: "MERGE_EVENTS",
                    eventStore: relevantEvents_1
                    // the pre-change data
                  });
                }
              };
              var transformed = {};
              for (var _i = 0, _b = initialContext_1.getCurrentData().pluginHooks.eventDropTransformers; _i < _b.length; _i++) {
                var transformer = _b[_i];
                __assign(transformed, transformer(validMutation, initialContext_1));
              }
              initialContext_1.emitter.trigger("eventDrop", __assign(__assign(__assign({}, eventChangeArg), transformed), { el: ev.subjectEl, delta: validMutation.datesDelta, jsEvent: ev.origEvent, view: initialView }));
              initialContext_1.emitter.trigger("eventChange", eventChangeArg);
            } else if (receivingContext_1) {
              var eventRemoveArg = {
                event: eventApi,
                relatedEvents: buildEventApis(relevantEvents_1, initialContext_1, eventInstance),
                revert: function() {
                  initialContext_1.dispatch({
                    type: "MERGE_EVENTS",
                    eventStore: relevantEvents_1
                  });
                }
              };
              initialContext_1.emitter.trigger("eventLeave", __assign(__assign({}, eventRemoveArg), { draggedEl: ev.subjectEl, view: initialView }));
              initialContext_1.dispatch({
                type: "REMOVE_EVENTS",
                eventStore: relevantEvents_1
              });
              initialContext_1.emitter.trigger("eventRemove", eventRemoveArg);
              var addedEventDef = mutatedRelevantEvents_1.defs[eventDef.defId];
              var addedEventInstance = mutatedRelevantEvents_1.instances[eventInstance.instanceId];
              var addedEventApi = new EventApi(receivingContext_1, addedEventDef, addedEventInstance);
              receivingContext_1.dispatch({
                type: "MERGE_EVENTS",
                eventStore: mutatedRelevantEvents_1
              });
              var eventAddArg = {
                event: addedEventApi,
                relatedEvents: buildEventApis(mutatedRelevantEvents_1, receivingContext_1, addedEventInstance),
                revert: function() {
                  receivingContext_1.dispatch({
                    type: "REMOVE_EVENTS",
                    eventStore: mutatedRelevantEvents_1
                  });
                }
              };
              receivingContext_1.emitter.trigger("eventAdd", eventAddArg);
              if (ev.isTouch) {
                receivingContext_1.dispatch({
                  type: "SELECT_EVENT",
                  eventInstanceId: eventInstance.instanceId
                });
              }
              receivingContext_1.emitter.trigger("drop", __assign(__assign({}, buildDatePointApiWithContext(finalHit.dateSpan, receivingContext_1)), { draggedEl: ev.subjectEl, jsEvent: ev.origEvent, view: finalHit.context.viewApi }));
              receivingContext_1.emitter.trigger("eventReceive", __assign(__assign({}, eventAddArg), { draggedEl: ev.subjectEl, view: finalHit.context.viewApi }));
            }
          } else {
            initialContext_1.emitter.trigger("_noEventDrop");
          }
        }
        _this.cleanup();
      };
      var component = _this.component;
      var options = component.context.options;
      var dragging = _this.dragging = new FeaturefulElementDragging(settings.el);
      dragging.pointer.selector = EventDragging2.SELECTOR;
      dragging.touchScrollAllowed = false;
      dragging.autoScroller.isEnabled = options.dragScroll;
      var hitDragging = _this.hitDragging = new HitDragging(_this.dragging, interactionSettingsStore);
      hitDragging.useSubjectCenter = settings.useEventCenter;
      hitDragging.emitter.on("pointerdown", _this.handlePointerDown);
      hitDragging.emitter.on("dragstart", _this.handleDragStart);
      hitDragging.emitter.on("hitupdate", _this.handleHitUpdate);
      hitDragging.emitter.on("pointerup", _this.handlePointerUp);
      hitDragging.emitter.on("dragend", _this.handleDragEnd);
      return _this;
    }
    EventDragging2.prototype.destroy = function() {
      this.dragging.destroy();
    };
    EventDragging2.prototype.displayDrag = function(nextContext, state) {
      var initialContext = this.component.context;
      var prevContext = this.receivingContext;
      if (prevContext && prevContext !== nextContext) {
        if (prevContext === initialContext) {
          prevContext.dispatch({
            type: "SET_EVENT_DRAG",
            state: {
              affectedEvents: state.affectedEvents,
              mutatedEvents: createEmptyEventStore(),
              isEvent: true
            }
          });
        } else {
          prevContext.dispatch({ type: "UNSET_EVENT_DRAG" });
        }
      }
      if (nextContext) {
        nextContext.dispatch({ type: "SET_EVENT_DRAG", state });
      }
    };
    EventDragging2.prototype.clearDrag = function() {
      var initialCalendar = this.component.context;
      var receivingContext = this.receivingContext;
      if (receivingContext) {
        receivingContext.dispatch({ type: "UNSET_EVENT_DRAG" });
      }
      if (initialCalendar !== receivingContext) {
        initialCalendar.dispatch({ type: "UNSET_EVENT_DRAG" });
      }
    };
    EventDragging2.prototype.cleanup = function() {
      this.subjectSeg = null;
      this.isDragging = false;
      this.eventRange = null;
      this.relevantEvents = null;
      this.receivingContext = null;
      this.validMutation = null;
      this.mutatedRelevantEvents = null;
    };
    EventDragging2.SELECTOR = ".fc-event-draggable, .fc-event-resizable";
    return EventDragging2;
  }(Interaction)
);
function computeEventMutation(hit0, hit1, massagers) {
  var dateSpan0 = hit0.dateSpan;
  var dateSpan1 = hit1.dateSpan;
  var date0 = dateSpan0.range.start;
  var date1 = dateSpan1.range.start;
  var standardProps = {};
  if (dateSpan0.allDay !== dateSpan1.allDay) {
    standardProps.allDay = dateSpan1.allDay;
    standardProps.hasEnd = hit1.context.options.allDayMaintainDuration;
    if (dateSpan1.allDay) {
      date0 = startOfDay(date0);
    }
  }
  var delta = diffDates(date0, date1, hit0.context.dateEnv, hit0.componentId === hit1.componentId ? hit0.largeUnit : null);
  if (delta.milliseconds) {
    standardProps.allDay = false;
  }
  var mutation = {
    datesDelta: delta,
    standardProps
  };
  for (var _i = 0, massagers_1 = massagers; _i < massagers_1.length; _i++) {
    var massager = massagers_1[_i];
    massager(mutation, hit0, hit1);
  }
  return mutation;
}
function getComponentTouchDelay(component) {
  var options = component.context.options;
  var delay = options.eventLongPressDelay;
  if (delay == null) {
    delay = options.longPressDelay;
  }
  return delay;
}
var EventResizing = (
  /** @class */
  function(_super) {
    __extends(EventResizing2, _super);
    function EventResizing2(settings) {
      var _this = _super.call(this, settings) || this;
      _this.draggingSegEl = null;
      _this.draggingSeg = null;
      _this.eventRange = null;
      _this.relevantEvents = null;
      _this.validMutation = null;
      _this.mutatedRelevantEvents = null;
      _this.handlePointerDown = function(ev) {
        var component2 = _this.component;
        var segEl = _this.querySegEl(ev);
        var seg = getElSeg(segEl);
        var eventRange = _this.eventRange = seg.eventRange;
        _this.dragging.minDistance = component2.context.options.eventDragMinDistance;
        _this.dragging.setIgnoreMove(!_this.component.isValidSegDownEl(ev.origEvent.target) || ev.isTouch && _this.component.props.eventSelection !== eventRange.instance.instanceId);
      };
      _this.handleDragStart = function(ev) {
        var context = _this.component.context;
        var eventRange = _this.eventRange;
        _this.relevantEvents = getRelevantEvents(context.getCurrentData().eventStore, _this.eventRange.instance.instanceId);
        var segEl = _this.querySegEl(ev);
        _this.draggingSegEl = segEl;
        _this.draggingSeg = getElSeg(segEl);
        context.calendarApi.unselect();
        context.emitter.trigger("eventResizeStart", {
          el: segEl,
          event: new EventApi(context, eventRange.def, eventRange.instance),
          jsEvent: ev.origEvent,
          view: context.viewApi
        });
      };
      _this.handleHitUpdate = function(hit, isFinal, ev) {
        var context = _this.component.context;
        var relevantEvents = _this.relevantEvents;
        var initialHit = _this.hitDragging.initialHit;
        var eventInstance = _this.eventRange.instance;
        var mutation = null;
        var mutatedRelevantEvents = null;
        var isInvalid = false;
        var interaction = {
          affectedEvents: relevantEvents,
          mutatedEvents: createEmptyEventStore(),
          isEvent: true
        };
        if (hit) {
          var disallowed = hit.componentId === initialHit.componentId && _this.isHitComboAllowed && !_this.isHitComboAllowed(initialHit, hit);
          if (!disallowed) {
            mutation = computeMutation(initialHit, hit, ev.subjectEl.classList.contains("fc-event-resizer-start"), eventInstance.range);
          }
        }
        if (mutation) {
          mutatedRelevantEvents = applyMutationToEventStore(relevantEvents, context.getCurrentData().eventUiBases, mutation, context);
          interaction.mutatedEvents = mutatedRelevantEvents;
          if (!isInteractionValid(interaction, hit.dateProfile, context)) {
            isInvalid = true;
            mutation = null;
            mutatedRelevantEvents = null;
            interaction.mutatedEvents = null;
          }
        }
        if (mutatedRelevantEvents) {
          context.dispatch({
            type: "SET_EVENT_RESIZE",
            state: interaction
          });
        } else {
          context.dispatch({ type: "UNSET_EVENT_RESIZE" });
        }
        if (!isInvalid) {
          enableCursor();
        } else {
          disableCursor();
        }
        if (!isFinal) {
          if (mutation && isHitsEqual(initialHit, hit)) {
            mutation = null;
          }
          _this.validMutation = mutation;
          _this.mutatedRelevantEvents = mutatedRelevantEvents;
        }
      };
      _this.handleDragEnd = function(ev) {
        var context = _this.component.context;
        var eventDef = _this.eventRange.def;
        var eventInstance = _this.eventRange.instance;
        var eventApi = new EventApi(context, eventDef, eventInstance);
        var relevantEvents = _this.relevantEvents;
        var mutatedRelevantEvents = _this.mutatedRelevantEvents;
        context.emitter.trigger("eventResizeStop", {
          el: _this.draggingSegEl,
          event: eventApi,
          jsEvent: ev.origEvent,
          view: context.viewApi
        });
        if (_this.validMutation) {
          var updatedEventApi = new EventApi(context, mutatedRelevantEvents.defs[eventDef.defId], eventInstance ? mutatedRelevantEvents.instances[eventInstance.instanceId] : null);
          context.dispatch({
            type: "MERGE_EVENTS",
            eventStore: mutatedRelevantEvents
          });
          var eventChangeArg = {
            oldEvent: eventApi,
            event: updatedEventApi,
            relatedEvents: buildEventApis(mutatedRelevantEvents, context, eventInstance),
            revert: function() {
              context.dispatch({
                type: "MERGE_EVENTS",
                eventStore: relevantEvents
                // the pre-change events
              });
            }
          };
          context.emitter.trigger("eventResize", __assign(__assign({}, eventChangeArg), { el: _this.draggingSegEl, startDelta: _this.validMutation.startDelta || createDuration(0), endDelta: _this.validMutation.endDelta || createDuration(0), jsEvent: ev.origEvent, view: context.viewApi }));
          context.emitter.trigger("eventChange", eventChangeArg);
        } else {
          context.emitter.trigger("_noEventResize");
        }
        _this.draggingSeg = null;
        _this.relevantEvents = null;
        _this.validMutation = null;
      };
      var component = settings.component;
      var dragging = _this.dragging = new FeaturefulElementDragging(settings.el);
      dragging.pointer.selector = ".fc-event-resizer";
      dragging.touchScrollAllowed = false;
      dragging.autoScroller.isEnabled = component.context.options.dragScroll;
      var hitDragging = _this.hitDragging = new HitDragging(_this.dragging, interactionSettingsToStore(settings));
      hitDragging.emitter.on("pointerdown", _this.handlePointerDown);
      hitDragging.emitter.on("dragstart", _this.handleDragStart);
      hitDragging.emitter.on("hitupdate", _this.handleHitUpdate);
      hitDragging.emitter.on("dragend", _this.handleDragEnd);
      return _this;
    }
    EventResizing2.prototype.destroy = function() {
      this.dragging.destroy();
    };
    EventResizing2.prototype.querySegEl = function(ev) {
      return elementClosest(ev.subjectEl, ".fc-event");
    };
    return EventResizing2;
  }(Interaction)
);
function computeMutation(hit0, hit1, isFromStart, instanceRange) {
  var dateEnv = hit0.context.dateEnv;
  var date0 = hit0.dateSpan.range.start;
  var date1 = hit1.dateSpan.range.start;
  var delta = diffDates(date0, date1, dateEnv, hit0.largeUnit);
  if (isFromStart) {
    if (dateEnv.add(instanceRange.start, delta) < instanceRange.end) {
      return { startDelta: delta };
    }
  } else if (dateEnv.add(instanceRange.end, delta) > instanceRange.start) {
    return { endDelta: delta };
  }
  return null;
}
var UnselectAuto = (
  /** @class */
  function() {
    function UnselectAuto2(context) {
      var _this = this;
      this.context = context;
      this.isRecentPointerDateSelect = false;
      this.matchesCancel = false;
      this.matchesEvent = false;
      this.onSelect = function(selectInfo) {
        if (selectInfo.jsEvent) {
          _this.isRecentPointerDateSelect = true;
        }
      };
      this.onDocumentPointerDown = function(pev) {
        var unselectCancel = _this.context.options.unselectCancel;
        var downEl = getEventTargetViaRoot(pev.origEvent);
        _this.matchesCancel = !!elementClosest(downEl, unselectCancel);
        _this.matchesEvent = !!elementClosest(downEl, EventDragging.SELECTOR);
      };
      this.onDocumentPointerUp = function(pev) {
        var context2 = _this.context;
        var documentPointer2 = _this.documentPointer;
        var calendarState = context2.getCurrentData();
        if (!documentPointer2.wasTouchScroll) {
          if (calendarState.dateSelection && // an existing date selection?
          !_this.isRecentPointerDateSelect) {
            var unselectAuto = context2.options.unselectAuto;
            if (unselectAuto && (!unselectAuto || !_this.matchesCancel)) {
              context2.calendarApi.unselect(pev);
            }
          }
          if (calendarState.eventSelection && // an existing event selected?
          !_this.matchesEvent) {
            context2.dispatch({ type: "UNSELECT_EVENT" });
          }
        }
        _this.isRecentPointerDateSelect = false;
      };
      var documentPointer = this.documentPointer = new PointerDragging(document);
      documentPointer.shouldIgnoreMove = true;
      documentPointer.shouldWatchScroll = false;
      documentPointer.emitter.on("pointerdown", this.onDocumentPointerDown);
      documentPointer.emitter.on("pointerup", this.onDocumentPointerUp);
      context.emitter.on("select", this.onSelect);
    }
    UnselectAuto2.prototype.destroy = function() {
      this.context.emitter.off("select", this.onSelect);
      this.documentPointer.destroy();
    };
    return UnselectAuto2;
  }()
);
var OPTION_REFINERS = {
  fixedMirrorParent: identity
};
var LISTENER_REFINERS = {
  dateClick: identity,
  eventDragStart: identity,
  eventDragStop: identity,
  eventDrop: identity,
  eventResizeStart: identity,
  eventResizeStop: identity,
  eventResize: identity,
  drop: identity,
  eventReceive: identity,
  eventLeave: identity
};
var ExternalElementDragging = (
  /** @class */
  function() {
    function ExternalElementDragging2(dragging, suppliedDragMeta) {
      var _this = this;
      this.receivingContext = null;
      this.droppableEvent = null;
      this.suppliedDragMeta = null;
      this.dragMeta = null;
      this.handleDragStart = function(ev) {
        _this.dragMeta = _this.buildDragMeta(ev.subjectEl);
      };
      this.handleHitUpdate = function(hit, isFinal, ev) {
        var dragging2 = _this.hitDragging.dragging;
        var receivingContext = null;
        var droppableEvent = null;
        var isInvalid = false;
        var interaction = {
          affectedEvents: createEmptyEventStore(),
          mutatedEvents: createEmptyEventStore(),
          isEvent: _this.dragMeta.create
        };
        if (hit) {
          receivingContext = hit.context;
          if (_this.canDropElOnCalendar(ev.subjectEl, receivingContext)) {
            droppableEvent = computeEventForDateSpan(hit.dateSpan, _this.dragMeta, receivingContext);
            interaction.mutatedEvents = eventTupleToStore(droppableEvent);
            isInvalid = !isInteractionValid(interaction, hit.dateProfile, receivingContext);
            if (isInvalid) {
              interaction.mutatedEvents = createEmptyEventStore();
              droppableEvent = null;
            }
          }
        }
        _this.displayDrag(receivingContext, interaction);
        dragging2.setMirrorIsVisible(isFinal || !droppableEvent || !document.querySelector(".fc-event-mirror"));
        if (!isInvalid) {
          enableCursor();
        } else {
          disableCursor();
        }
        if (!isFinal) {
          dragging2.setMirrorNeedsRevert(!droppableEvent);
          _this.receivingContext = receivingContext;
          _this.droppableEvent = droppableEvent;
        }
      };
      this.handleDragEnd = function(pev) {
        var _a = _this, receivingContext = _a.receivingContext, droppableEvent = _a.droppableEvent;
        _this.clearDrag();
        if (receivingContext && droppableEvent) {
          var finalHit = _this.hitDragging.finalHit;
          var finalView = finalHit.context.viewApi;
          var dragMeta = _this.dragMeta;
          receivingContext.emitter.trigger("drop", __assign(__assign({}, buildDatePointApiWithContext(finalHit.dateSpan, receivingContext)), { draggedEl: pev.subjectEl, jsEvent: pev.origEvent, view: finalView }));
          if (dragMeta.create) {
            var addingEvents_1 = eventTupleToStore(droppableEvent);
            receivingContext.dispatch({
              type: "MERGE_EVENTS",
              eventStore: addingEvents_1
            });
            if (pev.isTouch) {
              receivingContext.dispatch({
                type: "SELECT_EVENT",
                eventInstanceId: droppableEvent.instance.instanceId
              });
            }
            receivingContext.emitter.trigger("eventReceive", {
              event: new EventApi(receivingContext, droppableEvent.def, droppableEvent.instance),
              relatedEvents: [],
              revert: function() {
                receivingContext.dispatch({
                  type: "REMOVE_EVENTS",
                  eventStore: addingEvents_1
                });
              },
              draggedEl: pev.subjectEl,
              view: finalView
            });
          }
        }
        _this.receivingContext = null;
        _this.droppableEvent = null;
      };
      var hitDragging = this.hitDragging = new HitDragging(dragging, interactionSettingsStore);
      hitDragging.requireInitial = false;
      hitDragging.emitter.on("dragstart", this.handleDragStart);
      hitDragging.emitter.on("hitupdate", this.handleHitUpdate);
      hitDragging.emitter.on("dragend", this.handleDragEnd);
      this.suppliedDragMeta = suppliedDragMeta;
    }
    ExternalElementDragging2.prototype.buildDragMeta = function(subjectEl) {
      if (typeof this.suppliedDragMeta === "object") {
        return parseDragMeta(this.suppliedDragMeta);
      }
      if (typeof this.suppliedDragMeta === "function") {
        return parseDragMeta(this.suppliedDragMeta(subjectEl));
      }
      return getDragMetaFromEl(subjectEl);
    };
    ExternalElementDragging2.prototype.displayDrag = function(nextContext, state) {
      var prevContext = this.receivingContext;
      if (prevContext && prevContext !== nextContext) {
        prevContext.dispatch({ type: "UNSET_EVENT_DRAG" });
      }
      if (nextContext) {
        nextContext.dispatch({ type: "SET_EVENT_DRAG", state });
      }
    };
    ExternalElementDragging2.prototype.clearDrag = function() {
      if (this.receivingContext) {
        this.receivingContext.dispatch({ type: "UNSET_EVENT_DRAG" });
      }
    };
    ExternalElementDragging2.prototype.canDropElOnCalendar = function(el, receivingContext) {
      var dropAccept = receivingContext.options.dropAccept;
      if (typeof dropAccept === "function") {
        return dropAccept.call(receivingContext.calendarApi, el);
      }
      if (typeof dropAccept === "string" && dropAccept) {
        return Boolean(elementMatches(el, dropAccept));
      }
      return true;
    };
    return ExternalElementDragging2;
  }()
);
function computeEventForDateSpan(dateSpan, dragMeta, context) {
  var defProps = __assign({}, dragMeta.leftoverProps);
  for (var _i = 0, _a = context.pluginHooks.externalDefTransforms; _i < _a.length; _i++) {
    var transform = _a[_i];
    __assign(defProps, transform(dateSpan, dragMeta));
  }
  var _b = refineEventDef(defProps, context), refined = _b.refined, extra = _b.extra;
  var def = parseEventDef(
    refined,
    extra,
    dragMeta.sourceId,
    dateSpan.allDay,
    context.options.forceEventDuration || Boolean(dragMeta.duration),
    // hasEnd
    context
  );
  var start = dateSpan.range.start;
  if (dateSpan.allDay && dragMeta.startTime) {
    start = context.dateEnv.add(start, dragMeta.startTime);
  }
  var end = dragMeta.duration ? context.dateEnv.add(start, dragMeta.duration) : getDefaultEventEnd(dateSpan.allDay, start, context);
  var instance = createEventInstance(def.defId, { start, end });
  return { def, instance };
}
function getDragMetaFromEl(el) {
  var str = getEmbeddedElData(el, "event");
  var obj = str ? JSON.parse(str) : { create: false };
  return parseDragMeta(obj);
}
config.dataAttrPrefix = "";
function getEmbeddedElData(el, name) {
  var prefix = config.dataAttrPrefix;
  var prefixedName = (prefix ? prefix + "-" : "") + name;
  return el.getAttribute("data-" + prefixedName) || "";
}
var ExternalDraggable = (
  /** @class */
  function() {
    function ExternalDraggable2(el, settings) {
      var _this = this;
      if (settings === void 0) {
        settings = {};
      }
      this.handlePointerDown = function(ev) {
        var dragging2 = _this.dragging;
        var _a = _this.settings, minDistance = _a.minDistance, longPressDelay = _a.longPressDelay;
        dragging2.minDistance = minDistance != null ? minDistance : ev.isTouch ? 0 : BASE_OPTION_DEFAULTS.eventDragMinDistance;
        dragging2.delay = ev.isTouch ? (
          // TODO: eventually read eventLongPressDelay instead vvv
          longPressDelay != null ? longPressDelay : BASE_OPTION_DEFAULTS.longPressDelay
        ) : 0;
      };
      this.handleDragStart = function(ev) {
        if (ev.isTouch && _this.dragging.delay && ev.subjectEl.classList.contains("fc-event")) {
          _this.dragging.mirror.getMirrorEl().classList.add("fc-event-selected");
        }
      };
      this.settings = settings;
      var dragging = this.dragging = new FeaturefulElementDragging(el);
      dragging.touchScrollAllowed = false;
      if (settings.itemSelector != null) {
        dragging.pointer.selector = settings.itemSelector;
      }
      if (settings.appendTo != null) {
        dragging.mirror.parentNode = settings.appendTo;
      }
      dragging.emitter.on("pointerdown", this.handlePointerDown);
      dragging.emitter.on("dragstart", this.handleDragStart);
      new ExternalElementDragging(dragging, settings.eventData);
    }
    ExternalDraggable2.prototype.destroy = function() {
      this.dragging.destroy();
    };
    return ExternalDraggable2;
  }()
);
var InferredElementDragging = (
  /** @class */
  function(_super) {
    __extends(InferredElementDragging2, _super);
    function InferredElementDragging2(containerEl) {
      var _this = _super.call(this, containerEl) || this;
      _this.shouldIgnoreMove = false;
      _this.mirrorSelector = "";
      _this.currentMirrorEl = null;
      _this.handlePointerDown = function(ev) {
        _this.emitter.trigger("pointerdown", ev);
        if (!_this.shouldIgnoreMove) {
          _this.emitter.trigger("dragstart", ev);
        }
      };
      _this.handlePointerMove = function(ev) {
        if (!_this.shouldIgnoreMove) {
          _this.emitter.trigger("dragmove", ev);
        }
      };
      _this.handlePointerUp = function(ev) {
        _this.emitter.trigger("pointerup", ev);
        if (!_this.shouldIgnoreMove) {
          _this.emitter.trigger("dragend", ev);
        }
      };
      var pointer = _this.pointer = new PointerDragging(containerEl);
      pointer.emitter.on("pointerdown", _this.handlePointerDown);
      pointer.emitter.on("pointermove", _this.handlePointerMove);
      pointer.emitter.on("pointerup", _this.handlePointerUp);
      return _this;
    }
    InferredElementDragging2.prototype.destroy = function() {
      this.pointer.destroy();
    };
    InferredElementDragging2.prototype.setIgnoreMove = function(bool) {
      this.shouldIgnoreMove = bool;
    };
    InferredElementDragging2.prototype.setMirrorIsVisible = function(bool) {
      if (bool) {
        if (this.currentMirrorEl) {
          this.currentMirrorEl.style.visibility = "";
          this.currentMirrorEl = null;
        }
      } else {
        var mirrorEl = this.mirrorSelector ? document.querySelector(this.mirrorSelector) : null;
        if (mirrorEl) {
          this.currentMirrorEl = mirrorEl;
          mirrorEl.style.visibility = "hidden";
        }
      }
    };
    return InferredElementDragging2;
  }(ElementDragging)
);
var ThirdPartyDraggable = (
  /** @class */
  function() {
    function ThirdPartyDraggable2(containerOrSettings, settings) {
      var containerEl = document;
      if (
        // wish we could just test instanceof EventTarget, but doesn't work in IE11
        containerOrSettings === document || containerOrSettings instanceof Element
      ) {
        containerEl = containerOrSettings;
        settings = settings || {};
      } else {
        settings = containerOrSettings || {};
      }
      var dragging = this.dragging = new InferredElementDragging(containerEl);
      if (typeof settings.itemSelector === "string") {
        dragging.pointer.selector = settings.itemSelector;
      } else if (containerEl === document) {
        dragging.pointer.selector = "[data-event]";
      }
      if (typeof settings.mirrorSelector === "string") {
        dragging.mirrorSelector = settings.mirrorSelector;
      }
      new ExternalElementDragging(dragging, settings.eventData);
    }
    ThirdPartyDraggable2.prototype.destroy = function() {
      this.dragging.destroy();
    };
    return ThirdPartyDraggable2;
  }()
);
var main = createPlugin({
  componentInteractions: [DateClicking, DateSelecting, EventDragging, EventResizing],
  calendarInteractions: [UnselectAuto],
  elementDraggingImpl: FeaturefulElementDragging,
  optionRefiners: OPTION_REFINERS,
  listenerRefiners: LISTENER_REFINERS
});
var main_default = main;
export {
  ExternalDraggable as Draggable,
  FeaturefulElementDragging,
  PointerDragging,
  ThirdPartyDraggable,
  main_default as default
};
/*! Bundled license information:

@fullcalendar/interaction/main.js:
  (*!
  FullCalendar v5.11.2
  Docs & License: https://fullcalendar.io/
  (c) 2022 Adam Shaw
  *)
*/
//# sourceMappingURL=@fullcalendar_interaction.js.map
