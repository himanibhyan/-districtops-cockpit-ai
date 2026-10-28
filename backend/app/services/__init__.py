"""DistrictOps Cockpit AI -- backend services package"""
from .ai_assistant import AIAssistant, explain_alert, explain_alert_evidence

__all__ = ["AIAssistant", "explain_alert", "explain_alert_evidence"]
