/**
 * Pre-set mock responses for AI-A and AI-B.
 * Each topic has alternating responses that simulate a multi-round discussion.
 */

export interface MockTopic {
  aiA: string[]
  aiB: string[]
}

const defaultTopic: MockTopic = {
  aiA: [
    `从技术架构来看，这是一个很有意思的话题。我认为需要从以下几个方面分析：

1. **性能层面**：现代框架在虚拟 DOM diff 算法上有很大差异
2. **开发体验**：工具链的成熟度直接影响团队效率
3. **生态系统**：社区规模决定了第三方库的丰富程度

总的来说，没有银弹，选型需要结合具体的业务场景。`,

    `你说得有道理，不过我想补充一点关于**长期维护性**的考虑：

\`\`\`typescript
// 类型安全在大型项目中至关重要
interface ComponentProps {
  data: readonly DataItem[]
  onUpdate: (id: string) => void
}
\`\`\`

强类型系统能显著降低重构成本，这在 6 个月后的项目维护中体现得尤为明显。`,

    `让我做个总结。经过讨论，我们在以下几点达成了共识：

- 性能差异在多数场景下可忽略
- 开发体验和团队熟悉度更重要
- 类型安全是长期项目的关键需求
- 生态系统的成熟度影响交付速度

感谢这次有深度的讨论！`,
  ],
  aiB: [
    `我有不同的看法。虽然你提到的点都很重要，但我认为最关键的因素是**渐进式采用能力**：

- 能否逐步引入而不是全量重写？
- 是否与现有技术栈兼容？
- 学习曲线是否平缓？

> "The best framework is the one your team can ship with."

实际项目中，团队熟悉度往往比技术优势更重要。`,

    `关于类型安全，我完全同意。不过我想强调**运行时验证**同样重要：

\`\`\`typescript
// 编译时类型 + 运行时验证 = 真正的安全
import { z } from 'zod'

const UserSchema = z.object({
  name: z.string(),
  age: z.number().min(0),
})

type User = z.infer<typeof UserSchema>
\`\`\`

光靠 TypeScript 的编译时检查是不够的，API 边界处的数据验证不可或缺。`,

    `很好的总结！我再补充一个实际建议：

在做技术选型前，先花 **2-3 天做一个 PoC**（概念验证），用真实的业务场景去测试，而不是仅凭理论分析。

这比任何 benchmark 都更有参考价值。`,
  ],
}

let aiAIndex = 0
let aiBIndex = 0

export function getNextAiAResponse(): string {
  const response = defaultTopic.aiA[aiAIndex % defaultTopic.aiA.length]
  aiAIndex++
  return response
}

export function getNextAiBResponse(): string {
  const response = defaultTopic.aiB[aiBIndex % defaultTopic.aiB.length]
  aiBIndex++
  return response
}

export function resetMockIndices(): void {
  aiAIndex = 0
  aiBIndex = 0
}
