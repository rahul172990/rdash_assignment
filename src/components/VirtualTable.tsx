/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState, useEffect } from "react";
import { FixedSizeGrid as Grid } from "react-window";

const ROW_COUNT = 1000;
const COL_COUNT = 50;
const ROW_H = 60;
const COL_W = 120;
const FROZEN = 2;

const data = Array.from({ length: ROW_COUNT }, (_, r) =>
  Array.from({ length: COL_COUNT }, (_, c) => `R${r}C${c}`)
);

const useWindowSize = () => {
  const [size, set] = useState([window.innerWidth, window.innerHeight]);
  useEffect(() => {
    const fn = () => set([window.innerWidth, window.innerHeight]);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return size;
};

export default function VirtualizedFrozenTable() {
  const [winW, winH] = useWindowSize();

  const mainRef = useRef<Grid>(null);
  const leftRef = useRef<Grid>(null);
  const rightRef = useRef<Grid>(null);
  const headerRef = useRef<Grid>(null);

  const handleBodyScroll = ({
    scrollLeft,
    scrollTop,
  }: {
    scrollLeft: number;
    scrollTop: number;
  }) => {
    leftRef.current?.scrollTo({ scrollTop });
    rightRef.current?.scrollTo({ scrollTop });
    headerRef.current?.scrollTo({ scrollLeft });
  };

  const handleHeaderScroll = ({
    scrollLeft,
  }: {
    scrollLeft: number;
    scrollTop: number;
  }) => {
    mainRef.current?.scrollTo({ scrollLeft });
  };

  const frozenW = FROZEN * COL_W;
  const mainW = winW - frozenW * 2;

  const Cell =
    (offset = 0) =>
    ({ columnIndex, rowIndex, style }: any) =>
      (
        <div className="cell" style={style}>
          {data[rowIndex][columnIndex + offset]}
        </div>
      );

  const Header =
    (offset = 0) =>
    ({ columnIndex, style }: any) =>
      (
        <div className="cell header" style={style}>
          Col&nbsp;{columnIndex + offset}
        </div>
      );

  return (
    <div className="wrapper" style={{ width: winW, height: winH }}>
      <div className="frozen left" style={{ width: frozenW }}>
        <Grid
          ref={leftRef}
          columnCount={FROZEN}
          columnWidth={COL_W}
          height={ROW_H}
          rowCount={1}
          rowHeight={ROW_H}
          width={frozenW}
        >
          {Header()}
        </Grid>
        <Grid
          ref={leftRef}
          columnCount={FROZEN}
          columnWidth={COL_W}
          height={winH - ROW_H}
          rowCount={ROW_COUNT}
          rowHeight={ROW_H}
          width={frozenW}
          itemKey={({ rowIndex, columnIndex }) =>
            `L-${rowIndex}-${columnIndex}`
          }
        >
          {Cell()}
        </Grid>
      </div>

      <div className="main" style={{ width: mainW }}>
        <Grid
          ref={headerRef}
          onScroll={handleHeaderScroll}
          columnCount={COL_COUNT - FROZEN * 2}
          columnWidth={COL_W}
          height={ROW_H}
          rowCount={1}
          rowHeight={ROW_H}
          width={mainW}
        >
          {Header(FROZEN)}
        </Grid>

        <Grid
          ref={mainRef}
          onScroll={handleBodyScroll}
          columnCount={COL_COUNT - FROZEN * 2}
          columnWidth={COL_W}
          height={winH - ROW_H}
          rowCount={ROW_COUNT}
          rowHeight={ROW_H}
          width={mainW}
          itemKey={({ rowIndex, columnIndex }) =>
            `M-${rowIndex}-${columnIndex + FROZEN}`
          }
        >
          {Cell(FROZEN)}
        </Grid>
      </div>

      <div className="frozen right" style={{ width: frozenW }}>
        <Grid
          columnCount={FROZEN}
          columnWidth={COL_W}
          height={ROW_H}
          rowCount={1}
          rowHeight={ROW_H}
          width={frozenW}
        >
          {Header(COL_COUNT - FROZEN)}
        </Grid>
        <Grid
          ref={rightRef}
          columnCount={FROZEN}
          columnWidth={COL_W}
          height={winH - ROW_H}
          rowCount={ROW_COUNT}
          rowHeight={ROW_H}
          width={frozenW}
          itemKey={({ rowIndex, columnIndex }) =>
            `R-${rowIndex}-${columnIndex + COL_COUNT - FROZEN}`
          }
        >
          {Cell(COL_COUNT - FROZEN)}
        </Grid>
      </div>
    </div>
  );
}
