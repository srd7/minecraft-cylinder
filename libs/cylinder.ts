export class Vector {
  readonly x: number[];
  private readonly size: number;
  constructor(...x: number[]) {
    this.x = x;
    this.size = x.length;
  }

  private assertSize(that: Vector) {
    if (this.size !== that.size) {
      throw Error(
        `The vector size is different (${this.size} vs ${that.size})`
      );
    }
  }

  public add(that: Vector): Vector {
    this.assertSize(that);
    return new Vector(...this.x.map((v, i) => v + that.x[i]));
  }

  public times(num: number): Vector {
    return new Vector(...this.x.map((v) => v * num));
  }

  public get minus(): Vector {
    return this.times(-1);
  }

  public sub(that: Vector): Vector {
    return this.add(that.minus);
  }

  public dot(that: Vector): number {
    this.assertSize(that);
    return this.x.reduce((prev, x, i) => prev + x * that.x[i], 0);
  }

  public get len(): number {
    return Math.sqrt(this.dot(this));
  }
}

export class Cylinder {
  private readonly emptyCache: Record<string, boolean> = {};
  private readonly pavementCache: Record<string, boolean> = {};

  public constructor(
    private readonly start: Vector,
    private readonly end: Vector,
    private readonly raidus: number,
    private readonly isSphere: boolean
  ) {}

  // 引数の点から、円柱の中心の方向ベクトルへの垂線ベクトルを算出する
  public perpendicular(pos: Vector): Vector {
    // P = L - X
    // L = t A + (1 - t) B
    // (X - L) * (B - A) = 0
    // t = (B - X) * (B - A) / |B - A|^2
    const direction = this.end.sub(this.start); // B - A
    const t = this.normalize(this.end.sub(pos).dot(direction) / direction.dot(direction));
    const leg = this.start.times(t).add(this.end.times(1 - t));
    return leg.sub(pos);
  }

  public normalize(t: number) {
    if (!this.isSphere) {
      return t
    }
    if (t < 0) {
      return 0
    }
    if (t > 1) {
      return 1
    }
    return t
  }

  public distance(pos: Vector): number {
    // r = |H - X|
    const perpendicular = this.perpendicular(pos);
    return perpendicular.sub(pos).len;
  }

  public isEmpty(pos: Vector): boolean {
    const key = JSON.stringify(pos.x);
    if (this.emptyCache[key] === undefined) {
      this.emptyCache[key] = this.isEmptyNoCache(pos);
    }
    return this.emptyCache[key];
  }

  public isEmptyNoCache(pos: Vector): boolean {
    // lc: ブロックの中心基準の距離
    // lmax: ブロックの最遠頂点基準の距離
    // lmin: ブロックの最近頂点基準の距離
    // 壊す条件は、 lmin < r

    // 三角不等式より
    // |lc - sqrt(3)/2| <= lmin <= lmax <= lc + sqrt(3)/2
    // Lc + sqrt(3)/2 < r の場合、最遠頂点（つまり一つ外のブロック）が壊す対象確定なので、壊れる
    // Lc - sqrt(3)/2 >= r の場合、最近頂点が確実に r 以上なので、壊さない確定。なお r >= 1 が想定されるので、絶対値は外してよい。
    const sqrt3_2 = Math.sqrt(3) / 2;
    const center = pos.add(new Vector(0.5, 0.5, 0.5));
    const perpendicular = this.perpendicular(center);
    const lc = perpendicular.len;
    if (lc + sqrt3_2 < this.raidus) {
      return true;
    }
    if (lc - sqrt3_2 >= this.raidus) {
      return false;
    }
    // 中心基準の概算では不明だったため、最近頂点を割り出す
    // 中心から垂線ベクトルの正負方向に 0.5 ずつ移動したところが最近頂点
    const nearest = center.add(
      new Vector(...perpendicular.x.map((v) => (v > 0 ? 0.5 : -0.5)))
    );
    const lmin = this.perpendicular(nearest).len;
    return lmin < this.raidus;
  }

  public isPavement(pos: Vector): boolean {
    const key = JSON.stringify(pos.x);
    if (this.pavementCache[key] === undefined) {
      this.pavementCache[key] = this.isPavementNoCache(pos);
    }
    return this.pavementCache[key];
  }

  public isPavementNoCache(pos: Vector): boolean {
    // 自信が壊されず、かつ前後左右上下のいずれかが壊される場合に true
    if (this.isEmpty(pos)) {
      return false;
    }
    return [
      [1, 0, 0],
      [-1, 0, 0],
      [0, 1, 0],
      [0, -1, 0],
      [0, 0, 1],
      [0, 0, -1],
    ].some((diff) => {
      const next = pos.add(new Vector(...diff));
      return this.isEmpty(next);
    });
  }
}
