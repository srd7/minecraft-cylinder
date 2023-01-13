import { useMemo, Fragment } from "react";
import { useForm } from "react-hook-form";
import styles from "../styles/Home.module.css";

import { Cylinder, Vector } from "../libs/cylinder";
import { range } from "../libs/range";

type Form = {
  start: {
    x: number;
    y: number;
    z: number;
  };
  end: {
    x: number;
    y: number;
    z: number;
  };
  radius: number;
  display: {
    x: number;
    y: number;
    z: number;
    xlen: number;
    zlen: number;
    size: number;
  };
  isSphere: boolean
};
export default function Home() {
  const { register, watch } = useForm<Form>({
    defaultValues: {
      start: {
        x: -152,
        y: 48,
        z: -152,
      },
      end: {
        x: 88,
        y: 118,
        z: -72,
      },
      radius: 11.322,
      display: {
        x: 88,
        y: 118,
        z: -72,
        xlen: 32,
        zlen: 32,
        size: 16,
      },
      isSphere: false
    },
  });

  const value = watch();

  const cylinder = useMemo(
    () =>
      new Cylinder(
        new Vector(value.start.x, value.start.y, value.start.z),
        new Vector(value.end.x, value.end.y, value.end.z),
        value.radius,
        value.isSphere,
      ),
    [
      value.start.x,
      value.start.y,
      value.start.z,
      value.end.x,
      value.end.y,
      value.end.z,
      value.radius,
      value.isSphere
    ]
  );
  const xs = range(
    value.display.x - value.display.xlen / 2,
    value.display.x + value.display.xlen / 2
  );
  const zs = range(
    value.display.z - value.display.zlen / 2,
    value.display.z + value.display.zlen / 2
  );

  const y = value.display.y;
  const size = value.display.size;

  return (
    <div className={styles.container}>
      <div>
        <div>
          START X
          <input
            type="number"
            {...register("start.x", { valueAsNumber: true })}
          />
          Y
          <input
            type="number"
            {...register("start.y", { valueAsNumber: true })}
          />
          Z
          <input
            type="number"
            {...register("start.z", { valueAsNumber: true })}
          />
        </div>
        <div>
          END X
          <input
            type="number"
            {...register("end.x", { valueAsNumber: true })}
          />
          Y
          <input
            type="number"
            {...register("end.y", { valueAsNumber: true })}
          />
          Z
          <input
            type="number"
            {...register("end.z", { valueAsNumber: true })}
          />
        </div>
        <div>
          Radius
          <input
            type="number"
            step="0.01"
            {...register("radius", { valueAsNumber: true })}
          />
        </div>
        <div>
          Sphere
          <input type="checkbox" {...register("isSphere")} />
        </div>
        <div>
          Display X
          <input
            type="number"
            {...register("display.x", { valueAsNumber: true })}
          />
          Y
          <input
            type="number"
            {...register("display.y", { valueAsNumber: true })}
          />
          Z
          <input
            type="number"
            {...register("display.z", { valueAsNumber: true })}
          />
        </div>
        <div>
          Display Range X
          <input
            type="number"
            {...register("display.xlen", { valueAsNumber: true })}
          />
          Z
          <input
            type="number"
            {...register("display.zlen", { valueAsNumber: true })}
          />
        </div>
        <div>
          Display size
          <input
            type="number"
            {...register("display.size", { valueAsNumber: true })}
          />
        </div>
      </div>

      <svg width={xs.length * size} height={zs.length * size}>
        {xs.map((x, i) => {
          const px = i * size;
          return (
            <Fragment key={x}>
              {zs.map((z, j) => {
                const py = j * size;
                const pos1 = new Vector(x, y, z);
                const pos2 = new Vector(x, y + 1, z);
                const fill1 = cylinder.isEmpty(pos1)
                  ? "gray"
                  : cylinder.isPavement(pos1)
                  ? "white"
                  : "pink";
                const fill2 = cylinder.isEmpty(pos2)
                  ? "gray"
                  : cylinder.isPavement(pos2)
                  ? "white"
                  : "pink";
                return (
                  <Fragment key={z}>
                    <rect
                      x={px}
                      y={py}
                      width={size}
                      height={size / 2}
                      fill={fill2}
                      data-coord={`(${x},${y + 1},${z})`}
                    />
                    <rect
                      x={px}
                      y={py + size / 2}
                      width={size}
                      height={size / 2}
                      fill={fill1}
                      data-coord={`(${x},${y},${z})`}
                    />
                  </Fragment>
                );
              })}
            </Fragment>
          );
        })}
        {xs.map((x, i) => {
          const px = i * size;
          const isBorder = x % 16 === 0;
          return (
            <Fragment key={x}>
              <line
                x1={px}
                x2={px}
                y1={0}
                y2={zs.length * size}
                stroke={isBorder ? "yellow" : "black"}
                strokeWidth={1}
              />
              {!isBorder ? null : (
                <text
                  x={px + 3}
                  y={zs.length * size - 3}
                  fontSize={16}
                  fill="yellow"
                >
                  {x}
                </text>
              )}
            </Fragment>
          );
        })}
        {zs.map((z, j) => {
          const py = j * size;
          const isBorder = z % 16 === 0;
          return (
            <Fragment key={z}>
              <line
                x1={0}
                x2={xs.length * size}
                y1={py}
                y2={py}
                stroke={isBorder ? "red" : "black"}
                strokeWidth={1}
              />
              {!isBorder ? null : (
                <text x={3} y={py + size - 3} fontSize={16} fill="red">
                  {z}
                </text>
              )}
            </Fragment>
          );
        })}
      </svg>
    </div>
  );
}
