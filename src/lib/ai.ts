import OpenAI from 'openai';
import {
  TestCaseGenerationConfig,
  GeneratedTestCase,
  FuzzActionDetail,
  AIAnalysisResult
} from '@/types/ai';

export class TestCaseGenerator {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string = 'glm-4.7') {
    this.client = new OpenAI({
      apiKey,
      baseURL: 'https://open.bigmodel.cn/api/paas/v4',
    });
    this.model = model;
  }

  async generateUITestCases(config: TestCaseGenerationConfig): Promise<GeneratedTestCase[]> {
    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildUserPrompt(config);

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('AI未返回内容');
    }

    const result = JSON.parse(content);
    return result.testCases || [];
  }

  async analyzeTestResults(
    appName: string,
    testCases: GeneratedTestCase[],
    executionResults: any[]
  ): Promise<AIAnalysisResult> {
    const prompt = `
请分析以下Fuzz测试结果，找出缺陷模式并提供建议。

应用名称: ${appName}

测试用例数量: ${testCases.length}
执行结果: ${JSON.stringify(executionResults.slice(0, 10), null, 2)}

请返回JSON格式的分析报告，包含:
1. summary: 测试执行概况
2. crashPatterns: 识别出的崩溃模式
3. recommendations: 改进建议
`;

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: '你是一个专业的软件测试专家，擅长分析Fuzz测试结果。'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('AI未返回内容');
    }

    return JSON.parse(content);
  }

  private buildSystemPrompt(): string {
    return `你是一个专业的鸿蒙应用(HarmonyOS App) Fuzz测试专家。你的任务是为鸿蒙应用生成UI交互Fuzz测试用例。

请严格按照JSON格式返回，结构如下：
{
  "testCases": [
    {
      "id": "唯一标识符",
      "description": "测试用例的简短描述",
      "category": "功能类别（如：登录、浏览、支付等）",
      "actions": [
        {
          "action": "Launch|Tap|Type|Swipe|Back|Home|LongPress|Wait",
          "description": "动作描述",
          "params": {
            "app": "应用Bundle Name",
            "element": "元素描述或 Ability 名 或 坐标(x y)",
            "text": "输入的文本",
            "direction": "滑动方向",
            "duration": "长按时间(ms)"
          }
        }
      ],
      "expectedBehavior": "预期行为描述",
      "crashProbability": "high|medium|low"
    }
  ]
}

可用的动作类型：
- Launch: 启动应用（params.app填BundleName，params.element填AbilityName 如 EntryAbility）
- Tap: 点击屏幕元素（params.element建议填"x y"坐标，或组件ID）
- Type: 输入文本（需要text参数）
- Swipe: 滑动屏幕（需要direction参数：up/down/left/right，或 element="x1 y1 x2 y2"）
- Back: 返回上一页
- Home: 返回桌面
- LongPress: 长按（需要element="x y"参数和duration参数）
- Wait: 等待指定时间（需要duration参数）`;
  }

  private buildUserPrompt(config: TestCaseGenerationConfig): string {
    return `请为以下鸿蒙应用生成 ${config.testDepth} 个UI交互Fuzz测试用例：

应用Bundle Name: ${config.targetApp}
应用描述: ${config.appDescription}

重点关注区域: ${config.focusAreas.join(', ')}

要求：
1. 生成多样化的测试场景，覆盖正常和边界情况
2. 包含一些可能导致崩溃的压力测试场景
3. 每个测试用例应该是一个完整的操作序列
4. 评估每个用例导致崩溃的可能性
5. 动作参数请尽量精确，点击操作优先预估坐标

请以JSON格式返回测试用例。`;
  }
}
