from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError, SQLAlchemyError


class AppError(Exception):
    def __init__(self, status_code: int, code: str, message: str):
        self.status_code = status_code
        self.code = code
        self.message = message


def error_body(code: str, message: str) -> dict:
    return {"error": {"code": code, "message": message}}


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def app_error(_: Request, exc: AppError) -> JSONResponse:
        return JSONResponse(status_code=exc.status_code, content=error_body(exc.code, exc.message))

    @app.exception_handler(RequestValidationError)
    async def validation(_: Request, exc: RequestValidationError) -> JSONResponse:
        return JSONResponse(
            status_code=422,
            content=error_body("validation_error", "Request validation failed"),
        )

    @app.exception_handler(IntegrityError)
    async def integrity(_: Request, __: IntegrityError) -> JSONResponse:
        return JSONResponse(status_code=409, content=error_body("conflict", "Resource conflict"))

    @app.exception_handler(SQLAlchemyError)
    async def db_err(_: Request, __: SQLAlchemyError) -> JSONResponse:
        return JSONResponse(status_code=500, content=error_body("database_error", "Database error"))
