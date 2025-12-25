"""
Provider configuration settings for monitoring
"""

from typing import List, Dict, Any


# Default provider configurations
DEFAULT_PROVIDERS = [
    {
        "name": "openai",
        "api_key": "OPENAI_API_KEY",
        "base_url": "https://api.openai.com/v1",
        "models": ["gpt-4", "gpt-3.5-turbo"],
        "enabled": True,
    },
    {
        "name": "anthropic",
        "api_key": "ANTHROPIC_API_KEY",
        "base_url": "https://api.anthropic.com",
        "models": ["claude-3-opus", "claude-3-sonnet"],
        "enabled": True,
    },
    {
        "name": "google",
        "api_key": "GOOGLE_API_KEY",
        "base_url": "https://generativelanguage.googleapis.com/v1",
        "models": ["gemini-pro", "gemini-ultra"],
        "enabled": True,
    },
    {
        "name": "ollama",
        "api_key": None,
        "base_url": "http://localhost:11434/v1",
        "models": ["llama2", "codellama", "mistral"],
        "enabled": True,
    },
]

# Default model configurations
DEFAULT_MODELS = {
    "gpt-4": {
        "provider": "openai",
        "max_tokens": 8000,
        "temperature": 0.7,
        "supports_streaming": True,
    },
    "gpt-3.5-turbo": {
        "provider": "openai",
        "max_tokens": 4000,
        "temperature": 0.7,
        "supports_streaming": True,
    },
    "claude-3-opus": {
        "provider": "anthropic",
        "max_tokens": 100000,
        "temperature": 0.7,
        "supports_streaming": True,
    },
    "llama2": {
        "provider": "ollama",
        "max_tokens": 4000,
        "temperature": 0.8,
        "supports_streaming": True,
    },
}


def get_provider_settings() -> List[Dict[str, Any]]:
    """Get provider settings for monitoring"""
    return DEFAULT_PROVIDERS


def get_provider_config() -> Dict[str, Any]:
    """Get overall provider configuration"""
    return {
        "health_check_interval": 60,
        "timeout": 10,
        "retry_attempts": 3,
    }


def get_model_config(model_name: str) -> Dict[str, Any]:
    """Get configuration for a specific model"""
    return DEFAULT_MODELS.get(model_name, {})
