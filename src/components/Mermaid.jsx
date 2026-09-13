import { useCallback, useEffect, useRef } from 'react';
import mermaid from 'mermaid';

let initialized = false;
let renderCounter = 0;

const MIN_SCALE = 0.3;
const MAX_SCALE = 4;

export default function Mermaid({ chart, height = 480 }) {
  const viewportRef = useRef(null);
  const surfaceRef = useRef(null);
  const view = useRef({ scale: 1, x: 0, y: 0 });
  const dragRef = useRef(null);

  const applyTransform = () => {
    if (surfaceRef.current) {
      const { scale, x, y } = view.current;
      surfaceRef.current.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    }
  };

  const zoomBy = useCallback((factor, clientPoint) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const rect = viewport.getBoundingClientRect();
    const cx = clientPoint ? clientPoint.x - rect.left : rect.width / 2;
    const cy = clientPoint ? clientPoint.y - rect.top : rect.height / 2;
    const v = view.current;
    const nextScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, v.scale * factor));
    v.x = cx - ((cx - v.x) / v.scale) * nextScale;
    v.y = cy - ((cy - v.y) / v.scale) * nextScale;
    v.scale = nextScale;
    applyTransform();
  }, []);

  const fitToView = useCallback(() => {
    const viewport = viewportRef.current;
    const svg = surfaceRef.current?.querySelector('svg');
    if (!viewport || !svg) return;
    const bbox = svg.getBBox();
    if (!bbox.width || !bbox.height) return;
    const scale = Math.min((viewport.clientWidth * 0.94) / bbox.width, (viewport.clientHeight * 0.94) / bbox.height, 1.4);
    view.current.scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
    view.current.x = (viewport.clientWidth - bbox.width * view.current.scale) / 2 - bbox.x * view.current.scale;
    view.current.y = (viewport.clientHeight - bbox.height * view.current.scale) / 2 - bbox.y * view.current.scale;
    applyTransform();
  }, []);

  useEffect(() => {
    if (!initialized) {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'base',
        securityLevel: 'loose',
        themeVariables: { fontFamily: 'IBM Plex Mono, monospace' },
      });
      initialized = true;
    }
    let cancelled = false;
    const id = `mermaid-diagram-${++renderCounter}`;
    mermaid.render(id, chart).then(({ svg }) => {
      if (cancelled || !surfaceRef.current) return;
      surfaceRef.current.innerHTML = svg;
      // Mermaid's own SVG ships with a responsive `max-width` style that scales it
      // to its container; that fights with our own transform-based zoom, so pin it
      // to its natural viewBox size and let the transform be the only scale in play.
      const svgEl = surfaceRef.current.querySelector('svg');
      if (svgEl) {
        const vb = svgEl.viewBox.baseVal;
        svgEl.style.maxWidth = 'none';
        svgEl.style.width = `${vb.width}px`;
        svgEl.style.height = `${vb.height}px`;
      }
      fitToView();
    });
    return () => {
      cancelled = true;
    };
  }, [chart, fitToView]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const onWheel = (e) => {
      e.preventDefault();
      zoomBy(e.deltaY < 0 ? 1.12 : 1 / 1.12, { x: e.clientX, y: e.clientY });
    };
    viewport.addEventListener('wheel', onWheel, { passive: false });
    return () => viewport.removeEventListener('wheel', onWheel);
  }, [zoomBy]);

  const onPointerDown = (e) => {
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: view.current.x, origY: view.current.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    const d = dragRef.current;
    if (!d) return;
    view.current.x = d.origX + (e.clientX - d.startX);
    view.current.y = d.origY + (e.clientY - d.startY);
    applyTransform();
  };
  const onPointerUp = () => {
    dragRef.current = null;
  };

  return (
    <div className="diagram-wrap diagram-zoomable">
      <div className="diagram-zoom-controls">
        <button type="button" onClick={() => zoomBy(1.25)} aria-label="Zoom in" title="Zoom in">+</button>
        <button type="button" onClick={() => zoomBy(1 / 1.25)} aria-label="Zoom out" title="Zoom out">−</button>
        <button type="button" className="reset" onClick={fitToView} title="Fit diagram to view">Fit</button>
      </div>
      <div
        className="diagram-zoom-viewport"
        style={{ height }}
        ref={viewportRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onDoubleClick={fitToView}
      >
        <div className="diagram-zoom-surface" ref={surfaceRef} />
      </div>
      <div className="diagram-zoom-hint">scroll to zoom · drag to pan · double-click to fit</div>
    </div>
  );
}
