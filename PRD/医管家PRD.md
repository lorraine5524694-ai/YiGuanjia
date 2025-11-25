# **<font style="color:#1f1f1f;">产品需求文档 (PRD) - "医管家" (暂定名) 小程序</font>**
| **<font style="color:#1f1f1f;">文档版本</font>** | **<font style="color:#1f1f1f;">修改日期</font>** | **<font style="color:#1f1f1f;">修改人</font>** | **<font style="color:#1f1f1f;">修改内容</font>** |
| --- | --- | --- | --- |
| **<font style="color:#1f1f1f;">V1.0</font>** | **<font style="color:#1f1f1f;">2025-10-27</font>** | **<font style="color:#1f1f1f;">产品经理</font>** | **<font style="color:#1f1f1f;">初始版本创建，包含5大核心模块定义</font>** |


## **<font style="color:#1f1f1f;">1. 项目背景与目标</font>**
### **<font style="color:#1f1f1f;">1.1 项目背景</font>**
**<font style="color:#1f1f1f;">在就医过程中，患者常面临病历丢失、检查报告难懂、忘记吃药、错过挂号时间以及医疗费用统计混乱等痛点。为了帮助用户更高效地管理个人及家庭的就医全流程数据，开发此款医疗管理小程序。</font>**

### **<font style="color:#1f1f1f;">1.2 产品目标</font>**
**<font style="color:#1f1f1f;">打造一款集“诊前提醒、诊中记录、诊后管理”于一体的个人医疗助手。核心亮点在于利用 </font>****<font style="color:#1f1f1f;">OCR 识别</font>****<font style="color:#1f1f1f;"> 和 </font>****<font style="color:#1f1f1f;">AI 大模型能力</font>****<font style="color:#1f1f1f;">，降低用户录入成本，提供智能化的解读与分析。</font>**

## **<font style="color:#1f1f1f;">2. 产品范围 (Scope)</font>**
**<font style="color:#1f1f1f;">本期版本 (V1.0) 包含以下五个核心功能模块：</font>**

1. **<font style="color:#1f1f1f;">用药管理</font>****<font style="color:#1f1f1f;">：OCR/搜索录入，智能提醒。</font>**
2. **<font style="color:#1f1f1f;">抢号提醒</font>****<font style="color:#1f1f1f;">：自定义抢号计划，强提醒。</font>**
3. **<font style="color:#1f1f1f;">病历管理</font>****<font style="color:#1f1f1f;">：电子化存档，AI 辅助解读。</font>**
4. **<font style="color:#1f1f1f;">检查报告管理：电子化存档，指标分析，AI 趋势解读。</font>**
5. **<font style="color:#1f1f1f;">费用票据管理：电子化存档，记账统计，图表分析。</font>**

## **<font style="color:#1f1f1f;">3. 功能需求详情</font>**
### **<font style="color:#1f1f1f;">3.1 模块一：用药管理</font>**
**<font style="color:#1f1f1f;">用户故事</font>****<font style="color:#1f1f1f;">：作为一名慢病患者，我希望快速录入药品并设置提醒，以免漏服或吃错药。</font>**

| **<font style="color:#1f1f1f;">功能点</font>** | **<font style="color:#1f1f1f;">详细描述</font>** | **<font style="color:#1f1f1f;">优先级</font>** |
| --- | --- | --- |
| **<font style="color:#1f1f1f;">药品录入-拍照识别</font>** | **<font style="color:#1f1f1f;">调用相机/相册，拍摄药盒或处方单。系统通过 OCR 自动识别药品名称、规格。</font>** | **<font style="color:#1f1f1f;">P0</font>** |
| **<font style="color:#1f1f1f;">药品录入-模糊搜索</font>** | **<font style="color:#1f1f1f;">提供药品数据库检索，用户输入关键词（如“阿莫西林”）下拉联想选择标准药品。</font>** | **<font style="color:#1f1f1f;">P0</font>** |
| **<font style="color:#1f1f1f;">服用计划设置</font>** | **<font style="color:#1f1f1f;">设置服用频率（如：一日三次）、单次剂量、服用时间（饭前/饭后）。支持“循环提醒”设置。</font>** | **<font style="color:#1f1f1f;">P0</font>** |
| **<font style="color:#1f1f1f;">用药提醒</font>** | **<font style="color:#1f1f1f;">到达设定时间，通过小程序订阅消息或系统通知提醒用户。需包含“确认服药”或“推迟提醒”操作。</font>** | **<font style="color:#1f1f1f;">P0</font>** |
| **<font style="color:#1f1f1f;">药品库存预警</font>** | **<font style="color:#1f1f1f;">(可选) 根据剩余药量和服用计划，在余量不足时提醒复购。</font>** | **<font style="color:#1f1f1f;">P2</font>** |


### **<font style="color:#1f1f1f;">3.2 模块二：抢号提醒</font>**
**<font style="color:#1f1f1f;">用户故事</font>****<font style="color:#1f1f1f;">：作为一名需要复诊的患者，我希望设定特定日期的抢号闹钟，防止因为忘记时间而挂不上专家号。</font>**

| **<font style="color:#1f1f1f;">功能点</font>** | **<font style="color:#1f1f1f;">详细描述</font>** | **<font style="color:#1f1f1f;">优先级</font>** |
| --- | --- | --- |
| **<font style="color:#1f1f1f;">抢号任务创建</font>** | **<font style="color:#1f1f1f;">用户填写：目标医院、科室/医生、抢号平台（备注）、抢号目标日期、具体开抢时间。</font>** | **<font style="color:#1f1f1f;">P0</font>** |
| **<font style="color:#1f1f1f;">提醒策略</font>** | **<font style="color:#1f1f1f;">支持多重提醒设置：开抢前 1 天、前 30 分钟、前 5 分钟。</font>** | **<font style="color:#1f1f1f;">P0</font>** |
| **<font style="color:#1f1f1f;">快捷跳转</font>** | **<font style="color:#1f1f1f;">(可选) 允许用户在备注中粘贴挂号链接，提醒触发时点击可复制或尝试跳转（受限于小程序外链规则）。</font>** | **<font style="color:#1f1f1f;">P2</font>** |


### **<font style="color:#1f1f1f;">3.3 模块三：病历管理</font>**
**<font style="color:#1f1f1f;">用户故事</font>****<font style="color:#1f1f1f;">：作为用户，我希望将纸质病历电子化，并能看懂医生写的专业术语。</font>**

| **<font style="color:#1f1f1f;">功能点</font>** | **<font style="color:#1f1f1f;">详细描述</font>** | **<font style="color:#1f1f1f;">优先级</font>** |
| --- | --- | --- |
| **<font style="color:#1f1f1f;">病历归档</font>** | **<font style="color:#1f1f1f;">支持按“就诊日期”、“医院”、“科室”创建档案。上传病历照片（支持多图）。</font>** | **<font style="color:#1f1f1f;">P0</font>** |
| **<font style="color:#1f1f1f;">OCR 文字提取</font>** | **<font style="color:#1f1f1f;">自动提取图片中的关键信息（主诉、现病史、诊断结果）并自动填入文本框，支持用户手动修正。</font>** | **<font style="color:#1f1f1f;">P0</font>** |
| **<font style="color:#1f1f1f;">AI 病历解读</font>** | **<font style="color:#1f1f1f;">核心亮点</font>****<font style="color:#1f1f1f;">：调用 LLM（大语言模型）接口，将晦涩的医学术语翻译成通俗易懂的语言，解释病情严重程度及医生建议。</font>** | **<font style="color:#1f1f1f;">P0</font>** |
| **<font style="color:#1f1f1f;">时间轴视图</font>** | **<font style="color:#1f1f1f;">以时间轴形式展示过往病历，方便追溯病情发展。</font>** | **<font style="color:#1f1f1f;">P0</font>** |


### **<font style="color:#1f1f1f;">3.4 模块四：检查报告管理</font>**
**<font style="color:#1f1f1f;">用户故事</font>****<font style="color:#1f1f1f;">：我刚拿到血液检查单，看不懂上面的箭头是什么意思，希望有 AI 帮我分析。</font>**

| **<font style="color:#1f1f1f;">功能点</font>** | **<font style="color:#1f1f1f;">详细描述</font>** | **<font style="color:#1f1f1f;">优先级</font>** |
| --- | --- | --- |
| **<font style="color:#1f1f1f;">报告上传</font>** | **<font style="color:#1f1f1f;">支持上传各类检查单（血常规、CT、B超等）。</font>** | **<font style="color:#1f1f1f;">P0</font>** |
| **<font style="color:#1f1f1f;">异常指标识别</font>** | **<font style="color:#1f1f1f;">系统自动高亮识别出的异常指标（如：↑ 偏高，↓ 偏低）。</font>** | **<font style="color:#1f1f1f;">P0</font>** |
| **<font style="color:#1f1f1f;">AI 报告解读</font>** | **<font style="color:#1f1f1f;">核心亮点</font>****<font style="color:#1f1f1f;">：AI 分析异常指标可能关联的疾病，给出饮食或复查建议（需标注：</font>**_**<font style="color:#1f1f1f;">AI建议仅供参考，不作为医疗诊断依据</font>**_**<font style="color:#1f1f1f;">）。</font>** | **<font style="color:#1f1f1f;">P0</font>** |
| **<font style="color:#1f1f1f;">趋势对比</font>** | **<font style="color:#1f1f1f;">(进阶) 对于同类检查（如多次血常规），AI 自动生成关键指标（如白细胞计数）的变化折线图。</font>** | **<font style="color:#1f1f1f;">P1</font>** |


### **<font style="color:#1f1f1f;">3.5 模块五：费用票据管理</font>**
**<font style="color:#1f1f1f;">用户故事</font>****<font style="color:#1f1f1f;">：我想知道今年看病总共花了多少钱，分别花在了药费还是检查费上。</font>**

| **<font style="color:#1f1f1f;">功能点</font>** | **<font style="color:#1f1f1f;">详细描述</font>** | **<font style="color:#1f1f1f;">优先级</font>** |
| --- | --- | --- |
| **<font style="color:#1f1f1f;">票据识别</font>** | **<font style="color:#1f1f1f;">拍摄发票或结算单，OCR 识别：金额、日期、医院名称。</font>** | **<font style="color:#1f1f1f;">P0</font>** |
| **<font style="color:#1f1f1f;">费用归类</font>** | **<font style="color:#1f1f1f;">自动或手动归类：药品费、检查费、挂号费、治疗费、手术费等。</font>** | **<font style="color:#1f1f1f;">P0</font>** |
| **<font style="color:#1f1f1f;">统计报表</font>** | **<font style="color:#1f1f1f;">生成月度/年度账单。提供饼图（展示费用构成）和柱状图（展示每月花费趋势）。</font>** | **<font style="color:#1f1f1f;">P0</font>** |
| **<font style="color:#1f1f1f;">医保/自费区分</font>** | **<font style="color:#1f1f1f;">记录时区分统筹支付、个人账户支付和现金支付，统计实际自掏腰包的金额。</font>** | **<font style="color:#1f1f1f;">P1</font>** |




### <font style="color:rgb(95, 99, 104);">3.6 模块六：我的 (User Center)</font>
**<font style="color:rgb(95, 99, 104);">核心价值</font>**<font style="color:rgb(95, 99, 104);">：多家庭成员管理（核心）、个性化偏好设置、数据安全与导出。</font>

| <font style="color:rgb(95, 99, 104);">功能点</font> | <font style="color:rgb(95, 99, 104);">优先级</font> | <font style="color:rgb(95, 99, 104);">功能描述</font> | <font style="color:rgb(95, 99, 104);">逻辑/规则</font> |
| --- | --- | --- | --- |
| **<font style="color:rgb(95, 99, 104);">多家庭成员管理</font>** | **<font style="color:rgb(95, 99, 104);">P0</font>** | <font style="color:rgb(95, 99, 104);">支持添加、编辑、切换不同的家庭成员（如：本人、父亲、母亲、孩子）。</font> | <font style="color:rgb(95, 99, 104);">1. 首页数据（用药、病历、费用）随当前选中的成员切换展示。   </font><font style="color:rgb(95, 99, 104);">2. [cite_start] [cite_start] 。</font> |
| **<font style="color:rgb(95, 99, 104);">健康档案卡片</font>** | **<font style="color:rgb(95, 99, 104);">P1</font>** | <font style="color:rgb(95, 99, 104);">记录每个成员的基础健康信息：血型、过敏史、既往慢性病史。</font> | <font style="color:rgb(95, 99, 104);">1.</font><font style="color:rgb(95, 99, 104);"> </font>**<font style="color:rgb(95, 99, 104);">关键逻辑</font>**<font style="color:rgb(95, 99, 104);">：在此处录入的“过敏史”，需联动“用药管理”模块，当 OCR 识别药物说明书包含过敏源时触发警告。   </font><font style="color:rgb(95, 99, 104);">2. 供 AI 解读报告时作为上下文参考。</font> |
| **<font style="color:rgb(95, 99, 104);">适老化/显示设置</font>** | **<font style="color:rgb(95, 99, 104);">P0</font>** | <font style="color:rgb(95, 99, 104);">提供“标准模式”与“长辈模式”切换，或字体大小无级调节。</font> | <font style="color:rgb(95, 99, 104);">1. 默认跟随系统设置。   </font><font style="color:rgb(95, 99, 104);">2. [cite_start] ，长辈模式下隐藏非核心功能，放大按钮触控区。</font> |
| **<font style="color:rgb(95, 99, 104);">消息通知管理</font>** | **<font style="color:rgb(95, 99, 104);">P0</font>** | <font style="color:rgb(95, 99, 104);">管理微信订阅消息授权状态（服药提醒、抢号提醒）。</font> | <font style="color:rgb(95, 99, 104);">1. 展示已授权的长期/一次性模板。   </font><font style="color:rgb(95, 99, 104);">2. [cite_start] ）。</font> |
| **<font style="color:rgb(95, 99, 104);">数据导出与备份</font>** | **<font style="color:rgb(95, 99, 104);">P2</font>** | <font style="color:rgb(95, 99, 104);">将选定成员的病历、报告、消费记录打包导出为 PDF 或 Excel。</font> | <font style="color:rgb(95, 99, 104);">1. [cite_start] 。   </font><font style="color:rgb(95, 99, 104);">2. 导出文件需加水印或密码保护以符合隐私规范。</font> |
| **<font style="color:rgb(95, 99, 104);">隐私与免责声明</font>** | **<font style="color:rgb(95, 99, 104);">P0</font>** | <font style="color:rgb(95, 99, 104);">展示用户协议、隐私政策及 AI 医疗免责声明。</font> | <font style="color:rgb(95, 99, 104);">1. [cite_start] 。   </font><font style="color:rgb(95, 99, 104);">2. 提供“清除本地缓存”功能。</font> |


---

### <font style="color:rgb(95, 99, 104);">补充：针对“我的”模块的 UI/UX 设计建议</font>
<font style="color:rgb(95, 99, 104);">[cite_start] )*</font>

1. **<font style="color:rgb(95, 99, 104);">顶部区域 - 身份切换栏</font>**<font style="color:rgb(95, 99, 104);">：</font>
    - <font style="color:rgb(95, 99, 104);">采用</font>**<font style="color:rgb(95, 99, 104);">横向卡片滑动</font>**<font style="color:rgb(95, 99, 104);">设计。第一张卡片为“当前用户”，左滑可切换查看“父亲”、“母亲”的概览。</font>
    - <font style="color:rgb(95, 99, 104);">卡片上显著展示该成员的</font>**<font style="color:rgb(95, 99, 104);">关键待办</font>**<font style="color:rgb(95, 99, 104);">（如：今日还有 1 次服药）。</font>
2. **<font style="color:rgb(95, 99, 104);">功能列表 - 极简大号字体</font>**<font style="color:rgb(95, 99, 104);">：</font>
    - <font style="color:rgb(95, 99, 104);">列表项不要过多，建议使用图标 + 大号文字。</font>
    - <font style="color:rgb(95, 99, 104);">对于老年用户，将“客服/反馈”或“怎么用（视频教程）”放在显眼位置。</font>

### <font style="color:rgb(95, 99, 104);">补充：用户路径流程 (User Path)</font>
<font style="color:rgb(95, 99, 104);">[cite_start] )*</font>

**<font style="color:rgb(95, 99, 104);">场景：为年迈父亲上传体检报告</font>**

1. <font style="color:rgb(95, 99, 104);">进入小程序，点击底部导航栏“我的”。</font>
2. <font style="color:rgb(95, 99, 104);">点击“家庭成员管理” -> “添加成员” -> 输入父亲姓名、年龄。</font>
3. **<font style="color:rgb(95, 99, 104);">切换当前视角</font>**<font style="color:rgb(95, 99, 104);">至“父亲”。</font>
4. <font style="color:rgb(95, 99, 104);">返回首页（此时首页仅展示父亲的数据）。</font>
5. <font style="color:rgb(95, 99, 104);">[cite_start] 。</font>
6. <font style="color:rgb(95, 99, 104);">[cite_start] 。</font>

## **<font style="color:#1f1f1f;">4. 非功能性需求 (NFR)</font>**
### **<font style="color:#1f1f1f;">4.1 数据隐私与安全 (Critical)</font>**
+ **<font style="color:#1f1f1f;">敏感数据脱敏</font>****<font style="color:#1f1f1f;">：OCR 识别过程中的身份证号、医保卡号需进行前端脱敏处理。</font>**
+ **<font style="color:#1f1f1f;">数据加密</font>****<font style="color:#1f1f1f;">：所有医疗图片和识别后的文本数据必须加密传输（HTTPS）并加密存储。</font>**
+ **<font style="color:#1f1f1f;">访问控制</font>****<font style="color:#1f1f1f;">：进入“病历”和“报告”模块建议增加二次生物认证（指纹/面容 ID）。</font>**
+ **<font style="color:#1f1f1f;">免责声明</font>****<font style="color:#1f1f1f;">：在 AI 解读功能处，必须醒目展示“AI 内容仅供参考，具体诊疗请遵循医嘱”的免责声明。</font>**

### **<font style="color:#1f1f1f;">4.2 性能需求</font>**
+ **<font style="color:#1f1f1f;">OCR 响应速度</font>****<font style="color:#1f1f1f;">：图片上传后识别时间不超过 3 秒。</font>**
+ **<font style="color:#1f1f1f;">AI 生成速度</font>****<font style="color:#1f1f1f;">：AI 解读生成时间建议采用流式输出（Streaming），首字响应不超过 2 秒。</font>**

### **<font style="color:#1f1f1f;">4.3 交互体验</font>**
+ **<font style="color:#1f1f1f;">考虑到部分用户为中老年人，UI 设计应遵循</font>****<font style="color:#1f1f1f;">大字体、高对比度、操作流程扁平化</font>****<font style="color:#1f1f1f;">的原则。</font>**

## **<font style="color:#1f1f1f;">5. 信息架构图 (IA)</font>**
+ **<font style="color:#1f1f1f;">首页 (Dashboard)</font>**
+ **<font style="color:#1f1f1f;">今日用药任务（列表+打卡）</font>**
+ **<font style="color:#1f1f1f;">近期抢号提醒（倒计时）</font>**
+ **<font style="color:#1f1f1f;">快捷入口：记病历、存报告、记账</font>**
+ **<font style="color:#1f1f1f;">健康档案 (Files)</font>**
+ **<font style="color:#1f1f1f;">病历夹（时间轴展示）</font>**
+ **<font style="color:#1f1f1f;">检查报告库</font>**
+ **<font style="color:#1f1f1f;">家庭成员切换（管理老人/小孩）</font>**
+ **<font style="color:#1f1f1f;">统计分析 (Stats)</font>**
+ **<font style="color:#1f1f1f;">费用统计图表</font>**
+ **<font style="color:#1f1f1f;">健康指标趋势（基于检查报告）</font>**
+ **<font style="color:#1f1f1f;">我的 (Profile)</font>**
+ **<font style="color:#1f1f1f;">个人信息</font>**
+ **<font style="color:#1f1f1f;">隐私设置</font>**
+ **<font style="color:#1f1f1f;">用药提醒设置</font>**
+ **<font style="color:#1f1f1f;">数据导出</font>**

## **<font style="color:#1f1f1f;">6. 技术风险评估</font>**
1. **<font style="color:#1f1f1f;">OCR 识别准确率</font>****<font style="color:#1f1f1f;">：手写病历（医生字体潦草）识别率极低。</font>**
+ _**<font style="color:#1f1f1f;">对策</font>**_**<font style="color:#1f1f1f;">：仅对打印体病历做强承诺，手写体提供“手动备注”功能，或引导用户使用语音输入辅助记录。</font>**
1. **<font style="color:#1f1f1f;">AI 幻觉风险</font>****<font style="color:#1f1f1f;">：AI 可能对医学指标胡乱解释。</font>**
+ _**<font style="color:#1f1f1f;">对策</font>**_**<font style="color:#1f1f1f;">：调整 Prompt（提示词），限制 AI 仅解释名词含义，不做确诊性判断；接入专业的医疗垂类大模型 API。</font>**

