const MAX_POOL = 1; // 控制同时渲染的组件数量

interface IRegister {
  callback: Function | null;
  sort: number; // 记录每个节点的顺序
}
export class ChartRenderSingleton {
  private charts: number[]; // 存放首屏渲染的chart id

  private visibleCharts: Set<number>; // 记录在可视窗口内chart id

  private register: Record<number, IRegister>; // 存放渲染组件的回调

  private renderPool: number; // 渲染状态

  private static instance: ChartRenderSingleton;

  private constructor() {
    this.charts = [];
    this.visibleCharts = new Set();
    this.register = {};
    this.renderPool = MAX_POOL;
  }

  init() {
    this.charts = [];
    this.visibleCharts = new Set();
    this.renderPool = MAX_POOL;
  }

  // 注册组件渲染的回调

  registe(chartId: number, callback: Function) {
    if (this.register[chartId]) {
      return;
    }
    this.charts.push(chartId);
    this.register[chartId] = {
      callback,
      sort: this.charts.length - 1,
    };
  }

  // 当前渲染的组件完成渲染时开始渲染下一个组件
  completeRender(chartId: number) {
    if (!this.visibleCharts.has(chartId) || !this.charts.includes(chartId)) {
      return;
    }
    if (this.renderPool < MAX_POOL) {
      this.renderPool += 1;
    }
    // 渲染完成后把chartid从可见窗口中删除
    this.visibleCharts.delete(chartId);
    this.startRender();
  }

  // 添加可视节点，如果处于非渲染状态则开始渲染

  addVisible(chartId: number) {
    this.visibleCharts.add(chartId);
    if (this.renderPool > 0) {
      this.startRender();
    }
  }

  removeVisible(chartId: number) {
    this.visibleCharts.delete(chartId);
  }

  private startRender() {
    if (!this.visibleCharts.size || this.renderPool <= 0) {
      return;
    }
    this.renderPool -= 1;
    requestAnimationFrame(() => {
      let callIndex = this.charts.length;
      // 按注册顺序寻找第一个可视节点渲染
      this.visibleCharts.forEach(ele => {
        if (
          this.register[ele].callback &&
          this.register[ele].sort < callIndex
        ) {
          callIndex = this.register[ele].sort;
        }
      });
      const { callback } = this.register[this.charts[callIndex]];
      if (callback) {
        // 执行完设为null，防止重复执行
        this.register[this.charts[callIndex]].callback = null;
        callback();
      } else {
        this.renderPool += 1;
      }
    });
  }

  static getInstance() {
    if (!ChartRenderSingleton.instance) {
      ChartRenderSingleton.instance = new ChartRenderSingleton();
    }
    return ChartRenderSingleton.instance;
  }
}
const instance = ChartRenderSingleton.getInstance();
export default instance;
