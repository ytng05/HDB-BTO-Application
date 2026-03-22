FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY document_service_wrapper.py .

EXPOSE 5012

CMD ["python", "document_service_wrapper.py"]
