from typing import Dict

from .base_agent import BaseAgent


class AgentRegistry:
    """
    Central registry for Module 14 agents.
    """

    def __init__(self):
        self._agents: Dict[str, BaseAgent] = {}

    def register(self, agent: BaseAgent) -> None:
        """
        Register an agent.
        """
        if agent.name in self._agents:
            raise ValueError(
                f"Agent '{agent.name}' is already registered."
            )

        self._agents[agent.name] = agent

    def get(self, name: str) -> BaseAgent:
        """
        Retrieve an agent by name.
        """
        if name not in self._agents:
            raise KeyError(
                f"Agent '{name}' is not registered."
            )

        return self._agents[name]

    def get_all(self) -> Dict[str, BaseAgent]:
        """
        Return all registered agents.
        """
        return self._agents.copy()

    def list_agents(self):
        """
        Return registered agent names.
        """
        return list(self._agents.keys())

    def remove(self, name: str) -> None:
        """
        Remove an agent from registry.
        """
        self._agents.pop(name, None)

    def clear(self) -> None:
        """
        Remove all registered agents.
        """
        self._agents.clear()