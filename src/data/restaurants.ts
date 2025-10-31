export interface Restaurant {
  id: string;
  name: string;
  address: string;
  category: string;
}

export const presetRestaurants: Restaurant[] = [
  { id: "1", name: "食堂一楼", address: "学校食堂一楼东区", category: "中餐" },
  { id: "2", name: "食堂二楼", address: "学校食堂二楼西区", category: "中餐" },
  { id: "3", name: "学校西门麻辣烫", address: "西门美食街03号", category: "麻辣烫" },
  { id: "4", name: "东门米线", address: "东门商业街12号", category: "米线" },
  { id: "5", name: "北门炒饭", address: "北门小吃街05号", category: "炒饭" },
  { id: "6", name: "南门烧烤", address: "南门夜市08号", category: "烧烤" },
  { id: "7", name: "校园咖啡厅", address: "图书馆一楼", category: "咖啡" },
  { id: "8", name: "快乐奶茶店", address: "西门商业街15号", category: "奶茶" },
  { id: "9", name: "兰州拉面", address: "东门美食城2F-06", category: "面食" },
  { id: "10", name: "黄焖鸡米饭", address: "北门商业街22号", category: "盖饭" },
  { id: "11", name: "沙县小吃", address: "南门小吃街16号", category: "小吃" },
  { id: "12", name: "麦当劳", address: "东门购物中心1F", category: "快餐" },
  { id: "13", name: "肯德基", address: "西门广场2F", category: "快餐" },
  { id: "14", name: "必胜客", address: "北门商业中心3F", category: "西餐" },
  { id: "15", name: "星巴克", address: "图书馆旁", category: "咖啡" },
  { id: "16", name: "日式料理", address: "东门美食街25号", category: "日料" },
  { id: "17", name: "韩式炸鸡", address: "西门夜市10号", category: "韩餐" },
  { id: "18", name: "重庆小面", address: "南门美食街07号", category: "面食" },
  { id: "19", name: "火锅店", address: "北门商业街18号", category: "火锅" },
  { id: "20", name: "烤肉店", address: "东门美食城3F-12", category: "烤肉" },
];
