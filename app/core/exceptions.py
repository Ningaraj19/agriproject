"""Custom exception classes for AgriAI."""

from fastapi import HTTPException, status


class AgriAIException(Exception):
    """Base exception for the application."""

    def __init__(self, message: str = "An unexpected error occurred", status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class ModelNotLoadedError(AgriAIException):
    """Raised when an ML model is not available."""

    def __init__(self, model_name: str):
        super().__init__(
            message=f"Model '{model_name}' is not loaded. Please check the model path.",
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        )


class ExternalServiceError(AgriAIException):
    """Raised when an external API call fails."""

    def __init__(self, service: str, detail: str = ""):
        super().__init__(
            message=f"External service '{service}' is unavailable. {detail}",
            status_code=status.HTTP_502_BAD_GATEWAY,
        )


class TranslationError(AgriAIException):
    """Raised when translation fails."""

    def __init__(self, detail: str = ""):
        super().__init__(
            message=f"Translation failed. {detail}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


class RAGPipelineError(AgriAIException):
    """Raised when the RAG pipeline fails."""

    def __init__(self, detail: str = ""):
        super().__init__(
            message=f"RAG pipeline error. {detail}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


class InvalidImageError(HTTPException):
    """Raised when an uploaded image is invalid."""

    def __init__(self, detail: str = "Invalid or corrupted image file"):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail,
        )
