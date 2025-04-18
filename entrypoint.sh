#!/bin/sh

exec uvicorn --host 0.0.0.0 --port 5024 --reload --workers 1 --factory 'web:make_app'