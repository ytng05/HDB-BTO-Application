FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY notification_service.py .

EXPOSE 5013

CMD ["python", "notification_service.py"]
