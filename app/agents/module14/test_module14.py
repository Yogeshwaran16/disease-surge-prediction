import asyncio

from ..base.base_agent import BaseAgent
from .registry import AgentRegistry


class TestAgent(BaseAgent):
    """
    Simple test agent for Module 14.
    """

    def __init__(self):
        super().__init__("test_agent")

    async def execute(self, context):
        return {
            "message": "Module 14 BaseAgent is working",
            "context_received": context,
        }


async def main():
    print("=" * 60)
    print("MODULE 14 - BASE AGENT TEST")
    print("=" * 60)

    registry = AgentRegistry()

    agent = TestAgent()

    registry.register(agent)

    print("\nREGISTERED AGENTS:")
    print(registry.list_agents())

    result = await agent.run({
        "test": True
    })

    print("\nAGENT RESULT:")
    print(result)

    print("\nAGENT STATUS:")
    print(agent.get_status())

    print("\n" + "=" * 60)
    print("MODULE 14 BASE AGENT TEST COMPLETED")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())